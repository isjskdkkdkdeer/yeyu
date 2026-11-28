// 夜语固定回归脚本（Playwright）
// 跑法（第一次）：
//   npm i -D @playwright/test
//   npx playwright install chromium
//   npx playwright test tests/regression.spec.js
// 测的是 Stage Q 同传链 + 设计整改后的关键状态：
//   点金键 → 弹输入框 → 点预设 → 出译文 → 出现毫秒徽标 → 金键亮呼吸灯
//   方向切换 → 预设变越语；清空 → 两半都空
// 注意：翻译走真后端（智谱 GLM），慢的时候要等 25 秒；
//   后端过载/限流时预设会失败，这是后端问题，不是页面问题（见 DESIGN.md）。
//   云端无麦克风，所以只测“点金键弹输入框”这条路，不测语音识别。
const { test, expect } = require('@playwright/test');

const BASE = process.env.YEYU_URL || 'https://isjskdkkdkdeer.github.io/yeyu/?v=regression';

test.beforeEach(async ({ page }) => {
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('[console.error]', msg.text());
  });
  page.on('pageerror', err => console.log('[pageerror]', String(err)));
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  // 身份握手弹窗（全新浏览器才有）：点“建立安全握手”进主页
  const handshake = page.getByRole('button', { name: /建立安全握手/ });
  if (await handshake.isVisible().catch(() => false)) {
    await handshake.click();
  }
  await expect(page.getByText(/新加坡边缘网关已连接/)).toBeVisible();
});

test('同传：点金键 → 预设 → 出译文 + 毫秒徽标 + 金键亮灯', async ({ page }) => {
  // 进同传页
  await page.getByRole('button', { name: '同传' }).click();
  await expect(page.getByText(/面对面双向/)).toBeVisible();

  // 空状态可见（设计整改后字是亮灰，不是暗灰）
  await expect(page.getByText(/轻触收音，即刻双向神经同传/)).toBeVisible();

  // 点金键 → 弹暗金输入框
  await page.locator('.translate-mic-btn').click();
  await expect(page.locator('.neo-type')).toBeVisible();
  await expect(page.locator('[data-interpret-type-preset]')).toHaveText(/你好，很高兴认识你/);

  // 点预设 → 原文出现 → 正在翻译 → 译文 + 毫秒徽标
  await page.locator('[data-interpret-type-preset]').click();
  await expect(page.locator('.neo-mine .neo-src')).toHaveText(/你好，很高兴认识你/);
  await expect(page.locator('.neo-trans'), { timeout: 30000 }).toBeVisible();
  await expect(page.locator('.neo-ms'), { timeout: 30000 }).toHaveText(/\d+ ms/);

  // 译文 16px（比 20px 原文小一档），金键带 is-speaking（呼吸灯 + 边框光点）
  const transSize = await page.locator('.neo-latest .neo-trans').evaluate(el => getComputedStyle(el).fontSize);
  expect(transSize).toBe('16px');
  await expect(page.locator('.translate-mic-btn.is-speaking')).toBeVisible({ timeout: 5000 });

  // 方向切换 → 预设变越语
  await page.locator('[data-interpret-dir]').first().click();
  await page.locator('.translate-mic-btn').click();
  await expect(page.locator('[data-interpret-type-preset]')).toHaveText(/Xin chào/);

  // 清空 → 两半都空，空状态回来
  await page.locator('[data-clear-interpret]').click();
  await expect(page.getByText(/轻触收音，即刻双向神经同传/)).toBeVisible();
});

test('设计令牌：小字对比度与字号档位', async ({ page }) => {
  await page.getByRole('button', { name: '同传' }).click();
  // 空状态字色是亮灰（#A4A6A5），不是暗灰 #4B5563
  const emptyColor = await page.locator('.neo-empty-state p').first().evaluate(el => getComputedStyle(el).color);
  expect(emptyColor).toBe('rgb(164, 166, 165)');
  // 金键 56px，方向胶囊触区 44px
  const mic = await page.locator('.neo-mic').boundingBox();
  expect(mic.width).toBeGreaterThanOrEqual(56);
  expect(mic.height).toBeGreaterThanOrEqual(56);
  const dir = await page.locator('.neo-dir').first().boundingBox();
  expect(dir.height).toBeGreaterThanOrEqual(44);
});
