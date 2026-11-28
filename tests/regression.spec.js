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

test('legacy external avatar values are discarded without external image requests', async ({ page }) => {
  const externalRequests = [];
  const appOrigin = new URL(BASE).origin;
  page.on('request', request => {
    const requestUrl = new URL(request.url());
    if (requestUrl.origin !== appOrigin && requestUrl.hostname !== RELAY_HOST) {
      externalRequests.push(request.url());
    }
  });

  await page.evaluate(() => {
    localStorage.setItem('noiloi-my-profile', JSON.stringify({
      avatarUrl: 'https://view-link.cx/LujXnMs5NbT',
    }));
    localStorage.setItem('noiloi-friend-overrides', JSON.stringify({
      linh: { avatarUrl: 'https://legacy.example/avatar.jpg' },
    }));
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('.node-status')).toBeVisible();

  expect(externalRequests).toEqual([]);
  const storedAvatar = await page.evaluate(() => JSON.parse(localStorage.getItem('noiloi-my-profile')).avatarUrl);
  expect(storedAvatar).not.toMatch(/^https?:/i);
  const friendAvatars = await page.locator('.thread-item .avatar img').evaluateAll(images =>
    images.map(image => new URL(image.src).pathname),
  );
  expect(friendAvatars).toEqual(expect.arrayContaining([
    '/assets/avatars/linh.jpg',
    '/assets/avatars/an.jpg',
    '/assets/avatars/mai.jpg',
  ]));
});

test('uploaded avatar is resized to local JPEG data and persists after reload', async ({ page }) => {
  const externalRequests = [];
  const appOrigin = new URL(BASE).origin;
  page.on('request', request => {
    const requestUrl = new URL(request.url());
    if (requestUrl.origin !== appOrigin && requestUrl.hostname !== RELAY_HOST) {
      externalRequests.push(request.url());
    }
  });

  await page.locator('[data-tab="me"]').click();
  await page.locator('.titanium-avatar[data-profile-page="details"]').click();
  const avatarButton = page.locator('.pf-avatar-btn[data-change-avatar="me"]');
  await expect(avatarButton).toBeVisible();
  await avatarButton.click();

  const pngBase64 = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 8;
    canvas.height = 8;
    const context = canvas.getContext('2d');
    context.fillStyle = '#d8b56d';
    context.fillRect(0, 0, 8, 8);
    return canvas.toDataURL('image/png').split(',')[1];
  });
  await page.locator('#avatar-picker').setInputFiles({
    name: 'test-avatar.png',
    mimeType: 'image/png',
    buffer: Buffer.from(pngBase64, 'base64'),
  });

  const uploadedAvatar = page.locator('.pf-avatar-btn img');
  await expect(uploadedAvatar).toHaveAttribute('src', /^data:image\/jpeg;base64,/);
  const savedAvatar = await page.evaluate(() => JSON.parse(localStorage.getItem('noiloi-my-profile')).avatarUrl);
  expect(savedAvatar).toMatch(/^data:image\/jpeg;base64,/);

  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('.node-status')).toBeVisible();
  await page.locator('[data-tab="me"]').click();
  await page.locator('.titanium-avatar[data-profile-page="details"]').click();
  await expect(page.locator('.pf-avatar-btn img')).toHaveAttribute('src', savedAvatar);
  expect(externalRequests).toEqual([]);
});

test('daily sentence changes on the next calendar day without a Tatoeba request', async ({ page }) => {
  const tatoebaRequests = [];
  page.on('request', request => {
    const url = new URL(request.url());
    if (url.hostname === RELAY_HOST && url.pathname.endsWith('/tatoeba')) {
      tatoebaRequests.push(request.url());
    }
  });

  const sentenceFor = async isoDate => {
    await page.addInitScript(date => {
      const NativeDate = Date;
      const fixedTime = NativeDate.parse(date);
      class FixedDate extends NativeDate {
        constructor(...args) {
          super(...(args.length ? args : [fixedTime]));
        }
        static now() { return fixedTime; }
      }
      globalThis.Date = FixedDate;
    }, isoDate);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('.node-status')).toBeVisible();
    await page.locator('[data-tab="learn"]').click();
    const sentence = page.locator('[data-learn-daily-flip] .learn-daily-main');
    await expect(sentence).toBeVisible();
    return { text: await sentence.textContent(), lang: await sentence.getAttribute('lang') };
  };

  const firstDay = await sentenceFor('2025-01-01T12:00:00');
  const secondDay = await sentenceFor('2025-01-02T12:00:00');
  expect(firstDay.lang).toBe('vi');
  expect(secondDay.lang).toBe('vi');
  expect(secondDay.text).not.toBe(firstDay.text);
  expect(tatoebaRequests).toEqual([]);
});

test('chat repair phrases have local translations while offline', async ({ page }) => {
  await page.evaluate(() => Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => false }));
  const relayRequests = [];
  page.on('request', request => {
    if (new URL(request.url()).hostname === RELAY_HOST) relayRequests.push(request.url());
  });
  const phrases = [
    ['晚安', 'Chúc ngủ ngon'],
    ['到家告诉我', 'Về đến nhà thì nói cho mình biết nhé'],
    ['我没听懂', 'Mình chưa hiểu'],
    ['请再说一遍', 'Bạn nói lại giúp mình nhé'],
    ['可以说慢一点吗', 'Bạn có thể nói chậm hơn một chút không'],
    ['你是说这个吗', 'Ý bạn là điều này phải không'],
  ];

  for (const [source, translation] of phrases) {
    await page.locator(`[data-quick-phrase="${source}"]`).click();
    const message = page.locator('article.message.own').filter({ hasText: source }).last();
    await expect(message.locator('.message-original')).toHaveText(source);
    await expect(message.locator('.translation span')).toHaveText(translation);
  }
  expect(relayRequests).toEqual([]);
});

test('privacy disclosure matches the visible data flow and removes mock security claims', async ({ page }) => {
  await expect(page.locator('.node-status')).toContainText('本机演示');
  await expect(page.locator('.node-status')).toContainText('最近 10 条消息');
  await page.locator('[data-tab="me"]').click();
  await expect(page.locator('.titanium-profile')).not.toContainText(/18 ms|无日志存储|端到端动态密钥|终身特权/);
  await expect(page.locator('[data-profile-page="policy"]')).toHaveCount(0);
  await page.locator('[data-open-privacy]').click();
  await expect(page.locator('.section-content')).toContainText('Cloudflare Worker');
  await expect(page.locator('.section-content')).toContainText('最近 10 条消息');
  await expect(page.locator('.section-content')).toContainText('数据保留策略未知');
});
