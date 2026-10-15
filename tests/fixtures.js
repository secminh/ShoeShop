const fs = require('fs');
const path = require('path');
const { test: baseTest, expect } = require('@playwright/test');

const test = baseTest.extend({});

test.beforeEach(async ({ page }) => {
  const sessionFile = path.resolve(__dirname, '../test-results/.session-storage.json');
  const { origin, entries } = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
  await page.addInitScript(({ sessionOrigin, sessionEntries }) => {
    if (window.location.origin !== sessionOrigin) {
      return;
    }
    for (const [key, value] of Object.entries(sessionEntries)) {
      window.sessionStorage.setItem(key, value);
    }
  }, { sessionOrigin: origin, sessionEntries: entries });
});

module.exports = { test, expect };