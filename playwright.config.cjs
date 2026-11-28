const { defineConfig } = require('@playwright/test');

const localUrl = 'http://127.0.0.1:4173/';
const baseURL = process.env.YEYU_URL || localUrl;
const shouldStartLocalServer = !process.env.YEYU_URL || new URL(process.env.YEYU_URL).origin === new URL(localUrl).origin;

module.exports = defineConfig({
  testDir: './tests',
  testMatch: 'regression.spec.js',
  use: {
    baseURL,
    browserName: 'chromium',
    headless: true,
  },
  webServer: shouldStartLocalServer ? {
    command: 'node tests/static-server.js',
    url: localUrl,
    reuseExistingServer: false,
    timeout: 10_000,
  } : undefined,
  reporter: 'list',
});
