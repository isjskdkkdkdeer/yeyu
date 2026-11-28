const { defineConfig } = require('@playwright/test');

const localUrl = 'http://127.0.0.1:4173/';
const baseURL = process.env.YEYU_URL || localUrl;

module.exports = defineConfig({
  testDir: './tests',
  testMatch: 'regression.spec.js',
  use: {
    baseURL,
    browserName: 'chromium',
    headless: true,
  },
  webServer: process.env.YEYU_URL ? undefined : {
    command: 'node tests/static-server.js',
    url: localUrl,
    reuseExistingServer: false,
    timeout: 10_000,
  },
  reporter: 'list',
});
