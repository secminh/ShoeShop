const fs = require('fs');
const path = require('path');
const { chromium, expect } = require('@playwright/test');
const { baseURL, credentials } = require('./tests/config');

const authFile = path.resolve(__dirname, 'test-results/.auth-state.json');
const sessionFile = path.resolve(__dirname, 'test-results/.session-storage.json');

module.exports = async () => {
  fs.mkdirSync(path.dirname(authFile), { recursive: true });
  const browser = await chromium.launch();

  try {
    const page = await browser.newPage();
    const emailInput = page.getByRole('textbox', { name: /Enter your email, phone, or/i });
    let emailFormVisible = false;

    for (let attempt = 0; attempt < 4 && !emailFormVisible; attempt++) {
      await page.goto(`${baseURL}/login`);
      await page.getByRole('button', { name: 'Sign In' }).click();
      try {
        await emailInput.waitFor({ state: 'visible', timeout: 8_000 });
        emailFormVisible = true;
      } catch {
        if (attempt === 3) {
          throw new Error(`Microsoft sign-in email form did not load. Current URL: ${page.url()}`);
        }
      }
    }

    await emailInput.fill(credentials.superUser);
    await page.getByRole('button', { name: 'Next' }).click();
    await page.locator('#i0118').fill(credentials.password);
    await page.getByRole('button', { name: 'Sign in' }).click();

    const staySignedInCheckbox = page.getByRole('checkbox', { name: "Don't show this again" });
    await expect.poll(async () => await staySignedInCheckbox.isVisible() || /\/home/i.test(page.url()), { timeout: 60_000 }).toBe(true);
    if (await staySignedInCheckbox.isVisible()) {
      await staySignedInCheckbox.check();
      await page.getByRole('button', { name: 'Yes' }).click();
    }

    await expect(page).toHaveURL(/\/home/i, { timeout: 60_000 });
    await page.context().storageState({ path: authFile });
    const sessionStorage = await page.evaluate(() => ({
      origin: location.origin,
      entries: Object.fromEntries(Array.from({ length: window.sessionStorage.length }, (_, index) => {
        const key = window.sessionStorage.key(index);
        return [key, key === null ? '' : window.sessionStorage.getItem(key)];
      })),
    }));
    fs.writeFileSync(sessionFile, JSON.stringify(sessionStorage));
  } finally {
    await browser.close();
  }
};