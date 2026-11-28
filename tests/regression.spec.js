const { test, expect } = require('@playwright/test');

const BASE = process.env.YEYU_URL || 'http://127.0.0.1:4173/?v=regression';
const RELAY_HOST = 'yeyu-translate.jameswilson199079.workers.dev';
const SOURCE_TEXT = '\u4f60\u597d\uff0c\u5f88\u9ad8\u5174\u8ba4\u8bc6\u4f60';
const MOCK_TRANSLATION = 'LOCAL_MOCK_TRANSLATION';

test.beforeEach(async ({ page }) => {
  const allowedOrigin = new URL(BASE).origin;
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.hostname === RELAY_HOST) {
      const data = url.pathname.endsWith('/assistant')
        ? { reply: 'LOCAL_MOCK_ASSISTANT_REPLY' }
        : { translation: MOCK_TRANSLATION };
      await route.fulfill({
        status: 200,
        contentType: 'application/json; charset=utf-8',
        body: JSON.stringify(data),
      });
      return;
    }
    if (url.origin === allowedOrigin) {
      await route.continue();
      return;
    }
    await route.abort('blockedbyclient');
  });

  page.on('console', msg => {
    if (msg.type() === 'error') console.log('[console.error]', msg.text());
  });
  page.on('pageerror', err => console.log('[pageerror]', String(err)));
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });

  const handshake = page.locator('[data-handshake-connect]');
  if (await handshake.isVisible().catch(() => false)) {
    await page.locator('#handshake-input').fill('playwright@example.test');
    await handshake.click();
    await expect(page.locator('.handshake-backdrop')).toBeHidden();
  }
  await expect(page.locator('.node-status')).toBeVisible();
});

test('chat submits a message and renders the locally mocked translation', async ({ page }) => {
  const input = page.locator('#message-form input[name="message"]');
  await expect(input).toBeVisible();
  await input.fill(SOURCE_TEXT);
  await input.press('Enter');

  const sentMessage = page.locator('article.message.own').filter({ hasText: SOURCE_TEXT }).last();
  await expect(sentMessage.locator('.message-original')).toHaveText(SOURCE_TEXT);
  await expect(sentMessage.locator('.translation span')).toHaveText(MOCK_TRANSLATION);
  await expect(sentMessage.locator('.translation-latency')).toHaveText(/\d+ms/);
  await expect(sentMessage).toContainText(/已送达|已读/);
});

test('learning daily card flips language and keeps the design tokens', async ({ page }) => {
  await page.locator('[data-tab="learn"]').click();
  const dailyCard = page.locator('[data-learn-daily-flip]');
  const dailyText = dailyCard.locator('.learn-daily-main');

  await expect(dailyCard).toBeVisible();
  const frontText = await dailyText.textContent();
  const frontLanguage = await dailyText.getAttribute('lang');
  await dailyCard.click();
  await expect(dailyCard).toHaveClass(/learn-flipped/);
  await expect(dailyText).not.toHaveText(frontText);
  expect(await dailyText.getAttribute('lang')).not.toBe(frontLanguage);
  expect(['zh-CN', 'vi']).toContain(await dailyText.getAttribute('lang'));

  const tokens = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement);
    return {
      gold: style.getPropertyValue('--gold').trim().toLowerCase(),
      muted: style.getPropertyValue('--muted').trim().toLowerCase(),
      navMinHeight: getComputedStyle(document.querySelector('.nav button')).minHeight,
    };
  });
  expect(tokens.gold).toBe('#d8b56d');
  expect(tokens.muted).toBe('#a4a6a5');
  expect(parseFloat(tokens.navMinHeight)).toBeGreaterThanOrEqual(44);
});
