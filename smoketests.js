const { chromium } = require('playwright');
const { baseURL, credentials } = require('./tests/config');

(async () => {
  const browser = await chromium.launch({
    headless: false
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(`${baseURL}/login`);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: /Enter your email, phone, or/i }).fill(credentials.superUser);
  await page.getByRole('button', { name: 'Next' }).click();
  await page.locator('#i0118').fill(credentials.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  const staySignedInCheckbox = page.getByRole('checkbox', { name: "Don't show this again" });
  if (await staySignedInCheckbox.isVisible().catch(() => false)) {
    await staySignedInCheckbox.check();
    await page.getByRole('button', { name: 'Yes' }).click();
  }
  await page.locator('body').press('ControlOrMeta+r');
  await page.getByRole('img').click();
  await page.locator('a').filter({ hasText: 'Menu' }).click();
  await page.getByRole('button', { name: 'Account Settings' }).click();
  await page.getByRole('link', { name: 'My Profile' }).click();
  // await expect(page.locator('#avatarInfo')).toContainText('HIEU TEST ACCOUNT 4hieutestsaidigital4@tdims.toyota.com.ph');
  await page.close();

  // ---------------------
  await context.close();
  await browser.close();
})();