const { test, expect } = require('./fixtures');
const fs = require('fs');
const path = require('path');
const { baseURL, credentials } = require('./config');

const salesFunnelEnvironment = process.env.ENV || process.env.NODE_ENV || 'stg';
const salesFunnelHistoryFile = path.resolve(__dirname, `../test-state/home-sales-funnel-${salesFunnelEnvironment}.json`);

const menuRoutes = [
  { href: '/home', routeName: 'Home', expectedText: /Home|ADD NEW LEAD/i, dataSelector: '.sale-funnel, .activity-list__item, .activity-item' },
  { href: '/calendar/all', routeName: 'Calendar', expectedText: /Calendar|All/i, dataSelector: '.cal-day-headers .cal-header' },
  {
    href: '/inquiry',
    routeName: 'Inquiry',
    expectedText: /Inquiry|Inquiries/i,
    dataSelector: 'table tbody tr, .lead-item, [class*="inquiry-item"]',
    afterDealerSelection: async (content) => {
      const allTab = content.getByText('All', { exact: true });
      await expect(allTab).toBeVisible();
      await allTab.click();
      await expect(allTab).toHaveClass(/active/);
    },
  },
  { href: '/reservation', routeName: 'Reservation', expectedText: /Reservation|Reservations/i, dataSelector: 'table tbody tr, .reservation-item, [class*="reservation-item"]' },
  { href: '/quote-list', routeName: 'Lists of Quotes', expectedText: /Lists of Quotes|Quotes/i, dataSelector: 'table tbody tr, .quote-item, [class*="quote-item"]' },
  {
    href: '/marketing-collateral/vehicle-materials',
    routeName: 'Marketing Collaterals',
    expectedText: /Marketing Collaterals|Vehicle Materials/i,
    openPage: async (content) => {
      await content.locator('app-marketing-info').getByRole('link', { name: 'Vehicle Materials' }).click();
    },
    hasData: async (content) => {
      return await content.getByText('2024', { exact: true }).isVisible()
        && await content.getByText('2025', { exact: true }).isVisible();
    },
  },
  { href: '/dashboard', routeName: 'Dashboard', expectedText: /Dashboard/i, dataSelector: '.mat-mdc-card, [class*="dashboard-widget"]' },
  { href: '/notes', routeName: 'Notes', expectedText: /Notes/i, dataSelector: '.note-list__item' },
  { href: '/model-inventory', routeName: 'Model Inventory', expectedText: /Model Inventory|Inventory/i, dataSelector: '.widget-block__item, .model-list__item' },
  {
    href: '/lead-import',
    routeName: 'Lead Import',
    expectedText: /Lead Import/i,
    hasData: async (content) => await content.getByText('Download Template', { exact: true }).isVisible(),
  },
  {
    href: '/lead-migration',
    routeName: 'Lead Migration',
    expectedText: /Lead Migration/i,
    hasData: async (content) => await content.getByText('Download Template', { exact: true }).isVisible(),
  },
  { href: '/release-management', routeName: 'Release Management', expectedText: /Release Management/i, dataSelector: '.mat-mdc-row:not(.mat-mdc-header-row)' },
  { href: '/customer', routeName: 'Customer 360', expectedText: /Customer 360|Customer/i, dataSelector: 'table tbody tr, .customer-item, [class*="customer-item"]' },
];

const emptyStateText = /data not found|no data(?: available| found| to display)|no existing .* found|no files uploaded|no note added yet|no (?:events|records|results|notes|items) (?:found|available)/i;
const emptyStateElements = '.no-data:visible, .no-file:visible, [class*="empty-state"]:visible, [class*="empty-message"]:visible, p:visible';
const errorNotifications = '[role="alert"]:visible, mat-error:visible, [class*="toast"]:visible, [class*="snackbar"]:visible, [class*="error-message"]:visible';
const profileRoute = {
  expectedText: /My Profile|Profile/i,
  hasData: async (content) => content.locator('table tr').evaluateAll((rows) => rows.some((row) => {
    const values = [...row.querySelectorAll('td')].slice(1).map((cell) => cell.innerText.trim());
    return values.some((value) => value && !/^[-–—]$/.test(value));
  })),
};

async function login(page) {
  await page.goto(`${baseURL}/home`);
  await expect(page).toHaveURL(/\/home/i);
}

async function expandMenu(page) {
  await page.locator('a:has(mat-icon[data-mat-icon-name="ic-menu-bar"])').click();
}

async function selectFirstDealerOptionIfPresent(page, content) {
  const dealerDropdown = content.locator('.dealer-block [role="combobox"]');
  await dealerDropdown.first().waitFor({ state: 'attached', timeout: 2_000 }).catch(() => {});
  if (!(await dealerDropdown.count())) {
    return;
  }

  await dealerDropdown.first().click();
  const baguioOption = page.getByRole('option').filter({ hasText: /BAGUIO/i }).first();
  await expect(baguioOption).toBeVisible();
  await baguioOption.click();
}

async function expectPageDataOrEmptyState(page, route) {
  const content = page.locator('.app-content app-container-view').last();
  await expect(content).toBeVisible();
  await expect(content).toContainText(route.expectedText);
  if (route.openPage) {
    await route.openPage(content);
  }
  await expect(page.locator('app-loading .spinner:visible')).toHaveCount(0, { timeout: 15_000 });
  await selectFirstDealerOptionIfPresent(page, content);
  await expect(page.locator('app-loading .spinner:visible')).toHaveCount(0, { timeout: 15_000 });
  if (route.afterDealerSelection) {
    await route.afterDealerSelection(content);
    await expect(page.locator('app-loading .spinner:visible')).toHaveCount(0, { timeout: 15_000 });
  }

  await expect.poll(async () => {
    const hasEmptyState = (await content.locator(emptyStateElements).filter({ hasText: emptyStateText }).count()) > 0;
    const hasData = route.hasData
      ? await route.hasData(content)
      : (await content.locator(route.dataSelector).count()) > 0;
    return hasData || hasEmptyState;
  }, { timeout: 10_000 }).toBe(true);

  const visibleErrors = page
    .locator(errorNotifications)
    .filter({ hasText: /error|failed|invalid|unable|something went wrong/i });
  await expect(visibleErrors).toHaveCount(0);
}

async function applyDealerNetworkFilterAndCheckData(page, checkAllDealerNetwork = false) {
  const content = page.locator('.app-content app-container-view').last();
  await expect(content).toBeVisible();
  await expect(page.getByRole('button', { name: 'Filter', exact: true })).toBeVisible();
  const dataBeforeFilter = await content.innerText();

  await page.getByRole('button', { name: 'Filter', exact: true }).click();
  const filter = page.locator('app-filter');
  const dealerDropdown = filter.getByRole('combobox').first();
  await dealerDropdown.click();
  const baguioOption = page.getByRole('option').filter({ hasText: /BAGUIO/i }).first();
  await expect(baguioOption).toBeVisible();
  await baguioOption.click();

  const allDealerNetwork = filter.getByRole('checkbox', { name: 'All dealer network' });
  if (checkAllDealerNetwork) {
    if (!(await allDealerNetwork.isChecked())) {
      await allDealerNetwork.check();
    }
  } else {
    if (await allDealerNetwork.isChecked()) {
      await allDealerNetwork.uncheck();
    }

    const networkDropdown = filter.locator('app-multi-select');
    await networkDropdown.getByRole('button').click();
    const firstNetwork = networkDropdown.locator('.multi-select__dropdown li:not(.search)').filter({ hasText: /\S/ }).first();
    await expect(firstNetwork).toBeVisible();
    const firstNetworkName = (await firstNetwork.innerText()).trim();
    await firstNetwork.click();
    expect(firstNetworkName).not.toBe('');
  }

  await filter.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(page.locator('app-loading .spinner:visible')).toHaveCount(0, { timeout: 15_000 });

  await expect.poll(async () => (await content.innerText()) !== dataBeforeFilter, { timeout: 15_000 }).toBe(true);
  const visibleErrors = page
    .locator(errorNotifications)
    .filter({ hasText: /error|failed|invalid|unable|something went wrong/i });
  await expect(visibleErrors).toHaveCount(0);
}

async function expectNoVisibleErrors(page) {
  const visibleErrors = page
    .locator(errorNotifications)
    .filter({ hasText: /error|failed|invalid|unable|something went wrong/i });
  await expect(visibleErrors).toHaveCount(0);
}

async function verifyContactFieldWithoutError(page, contactField) {
  await contactField.getByRole('button', { name: 'Verify', exact: true }).click();
  await expect(page.locator('app-loading .spinner:visible')).toHaveCount(0, { timeout: 15_000 });

  const visibleErrors = page
    .locator(errorNotifications)
    .filter({ hasText: /error|failed|invalid|unable/i });
  await expect(visibleErrors).toHaveCount(0);
}

async function inspectHomeLeadActivityTabs(page) {
  const content = page.locator('.app-content app-container-view').last();
  const tasksCard = content.locator('.mat-mdc-card').filter({ hasText: /MY TASKS\s*&\s*ACTIVITIES/i });
  const tabs = tasksCard.locator('.nav-tab__item');
  await expect(tabs).toHaveCount(2);

  for (const tabIndex of [0, 1]) {
    const tab = tabs.nth(tabIndex);
    await tab.click();
    await expect(tab).toHaveClass(/active/);
    await expect(page.locator('app-loading .spinner:visible')).toHaveCount(0, { timeout: 15_000 });

    const activityItems = tasksCard.locator('.activity-list > *');
    await expect(activityItems.first()).toBeVisible();
    await expectNoVisibleErrors(page);
  }
}

async function verifyHomeSalesFunnelProgress(page) {
  const funnel = page.locator('.sale-funnel');
  await expect(funnel).toBeVisible();
  const period = (await funnel.locator('.date').innerText()).trim();
  const counts = Object.fromEntries(await funnel.locator('.progress').evaluateAll((progressItems) => progressItems.map((item) => {
    const label = (item.querySelector('.left')?.innerText || '').trim().toLowerCase();
    const valueText = item.querySelector('.right')?.innerText || '';
    const currentCount = /([\d,]+)\s+of\b/i.exec(valueText)?.[1]?.replace(/,/g, '');
    return [label, currentCount === undefined ? null : Number(currentCount)];
  })));

  const metricNames = ['leads', 'reservations', 'releases'];
  for (const name of metricNames) {
    expect(counts[name], `Sales Funnel metric "${name}" should be present`).not.toBeNull();
  }

  const checkedOn = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila' }).format(new Date());
  fs.mkdirSync(path.dirname(salesFunnelHistoryFile), { recursive: true });
  const previous = fs.existsSync(salesFunnelHistoryFile)
    ? JSON.parse(fs.readFileSync(salesFunnelHistoryFile, 'utf8'))
    : null;
  const hasIncrease = previous && metricNames.some((name) => counts[name] > previous.counts[name]);
  const sameCounts = previous && metricNames.every((name) => counts[name] === previous.counts[name]);
  let unchangedDays = previous?.unchangedDays ?? 1;

  if (!previous) {
    unchangedDays = 1;
  } else if (checkedOn === previous.checkedOn) {
    unchangedDays = sameCounts ? previous.unchangedDays : 0;
  } else if (hasIncrease) {
    unchangedDays = 0;
  } else if (sameCounts) {
    const daysSinceLastCheck = Math.round((Date.parse(`${checkedOn}T00:00:00Z`) - Date.parse(`${previous.checkedOn}T00:00:00Z`)) / 86_400_000);
    unchangedDays = daysSinceLastCheck === 1 ? previous.unchangedDays + 1 : 1;
  } else {
    unchangedDays = 1;
  }

  const snapshot = { checkedOn, period, counts, unchangedDays };
  fs.writeFileSync(salesFunnelHistoryFile, `${JSON.stringify(snapshot, null, 2)}\n`);
  test.info().annotations.push({ type: 'sales-funnel', description: JSON.stringify(snapshot) });

  if (previous && checkedOn !== previous.checkedOn && sameCounts && unchangedDays >= 5) {
    throw new Error(`Home Sales Funnel counts have been unchanged for ${unchangedDays} consecutive days: ${JSON.stringify(counts)}`);
  }
}

test('Login smoke test', async ({ page }) => {
  await login(page);

  await expect(page).toHaveURL(/\/home|\/dashboard/i);
  await expect(page.locator('body')).toContainText(/Home|Dashboard/i);
});

test('Menu panel is accessible after login', async ({ page }) => {
  await login(page);

  const menuLink = page.locator('a[href="/home"]');
  await expect(menuLink).toBeVisible();
  await expect(page.locator('body')).toContainText(/Home|ADD NEW LEAD/i);
});

test('Home > Filter by Baguio and all dealer network, inspect lead/activity tabs', async ({ page }) => {
  test.setTimeout(60_000);
  await login(page);
  await applyDealerNetworkFilterAndCheckData(page, true);
  await verifyHomeSalesFunnelProgress(page);
  await inspectHomeLeadActivityTabs(page);
});

test('Dashboard > Filter by first dealer network updates data without errors', async ({ page }) => {
  test.setTimeout(60_000);
  await login(page);
  await page.goto(`${baseURL}/dashboard`);
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  await applyDealerNetworkFilterAndCheckData(page);
});

test('Inquiry > Add New Lead > verify email and mobile without error toast', async ({ page }) => {
  test.setTimeout(60_000);
  await login(page);
  await page.locator('a[href="/inquiry"]').click();
  await expect(page).toHaveURL(/\/inquiry/);

  const content = page.locator('.app-content app-container-view').last();
  await selectFirstDealerOptionIfPresent(page, content);
  const allTab = content.getByText('All', { exact: true });
  await expect(allTab).toBeVisible();
  await allTab.click();
  await expect(allTab).toHaveClass(/active/);

  await page.getByRole('button', { name: /ADD NEW LEAD/i }).click();
  await page.getByRole('combobox').nth(1).click();
  await page.getByRole('option', { name: 'Email' }).click();
  await page.getByPlaceholder('eg.name@mail.com').fill('nguyenhuuhieu7@gmail.com');
  await page.getByPlaceholder('eg.xxx xxx xxx').fill('9566207190');

  const emailField = page.locator('.form-item').filter({ has: page.getByPlaceholder('eg.name@mail.com') });
  const phoneField = page.locator('.form-item').filter({ has: page.getByPlaceholder('eg.xxx xxx xxx') });
  await expect(emailField.getByRole('button', { name: 'Verify', exact: true })).toBeVisible();
  await expect(phoneField.getByRole('button', { name: 'Verify', exact: true })).toBeVisible();
  await verifyContactFieldWithoutError(page, emailField);

  await page.getByRole('combobox').nth(1).click();
  await page.getByRole('option', { name: 'Phone Number' }).click();
  await verifyContactFieldWithoutError(page, phoneField);
});

test('Inquiry > Online leads created yesterday returns at least one lead', async ({ page }) => {
  test.setTimeout(60_000);
  await login(page);
  await page.locator('a[href="/inquiry"]').click();
  await expect(page).toHaveURL(/\/inquiry/);

  const content = page.locator('.app-content app-container-view').last();
  await selectFirstDealerOptionIfPresent(page, content);
  const onlineTab = content.locator('.nav-tab__item').filter({ hasText: /Online/i }).first();
  await expect(onlineTab).toBeVisible();
  await onlineTab.click();
  await expect(onlineTab).toHaveClass(/active/);
  await expect(page.locator('app-loading .spinner:visible')).toHaveCount(0, { timeout: 15_000 });

  await page.getByRole('button', { name: 'Filter', exact: true }).click();
  const filter = page.locator('app-filter');
  const yesterday = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayValue = `${yesterday.getMonth() + 1}/${yesterday.getDate()}/${yesterday.getFullYear()}`;
  const startDate = filter.getByPlaceholder('Start date');
  const endDate = filter.getByPlaceholder('End date');
  await startDate.fill(yesterdayValue);
  await endDate.fill(yesterdayValue);
  await endDate.press('Tab');
  await filter.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(page.locator('app-loading .spinner:visible')).toHaveCount(0, { timeout: 15_000 });

  const leads = content.locator('table tbody tr');
  await expect(leads.first()).toBeVisible({ timeout: 15_000 });
  expect(await leads.count()).toBeGreaterThan(0);
  await expectNoVisibleErrors(page);
});

test('Inquiry > WON lead tabs and reservation load without errors', async ({ page }) => {
  test.setTimeout(120_000);
  await login(page);
  await page.locator('a[href="/inquiry"]').click();
  await expect(page).toHaveURL(/\/inquiry/);

  const content = page.locator('.app-content app-container-view').last();
  await selectFirstDealerOptionIfPresent(page, content);
  const allTab = content.getByText('All', { exact: true });
  await expect(allTab).toBeVisible();
  await allTab.click();
  await expect(allTab).toHaveClass(/active/);

  await page.getByRole('button', { name: 'Filter', exact: true }).click();
  const filter = page.locator('app-filter');
  const leadStatus = filter.locator('.form-item').filter({ hasText: /Lead Status/ });
  const statusDropdown = leadStatus.locator('app-multi-select button');
  await statusDropdown.scrollIntoViewIfNeeded();
  await statusDropdown.click();
  const wonOption = leadStatus.locator('.multi-select__dropdown li').filter({ hasText: /^\s*Won\s*$/i });
  await expect(wonOption).toBeVisible();
  await wonOption.click();
  await filter.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(page.locator('app-loading .spinner:visible')).toHaveCount(0, { timeout: 15_000 });

  const firstLead = content.getByRole('row').nth(1);
  await expect(firstLead).toBeVisible({ timeout: 15_000 });
  await firstLead.click();

  for (const tabName of ['Lead Details', 'Product Presentation', 'FAR Survey', 'Test Drive', 'Trade-in', 'activities', 'Quote']) {
    const tab = page.getByText(tabName, { exact: true }).last();
    await expect(tab).toBeVisible();
    await tab.click();
    await expect(page.locator('app-loading .spinner:visible')).toHaveCount(0, { timeout: 15_000 });
    await expectNoVisibleErrors(page);
  }

  await page.getByRole('button', { name: /VIEW RESERVATION/i }).click();
  await expect(page).toHaveURL(/\/reservation/i);
  await expect(page.locator('app-loading .spinner:visible')).toHaveCount(0, { timeout: 15_000 });
  const reservationDetails = page.locator('.app-content app-container-view').last();
  await expect(reservationDetails).toContainText(/Customer Information/);
  await expect(reservationDetails).toContainText(/Vehicle Information/);
  await expectNoVisibleErrors(page);
});

test('Reservation > Approved item Details, Status, and Post-Order tabs load without errors', async ({ page }) => {
  test.setTimeout(120_000);
  await login(page);
  await page.locator('a[href="/reservation"]').click();
  await expect(page).toHaveURL(/\/reservation/);

  const content = page.locator('.app-content app-container-view').last();
  await selectFirstDealerOptionIfPresent(page, content);
  await expect(page.locator('app-loading .spinner:visible')).toHaveCount(0, { timeout: 15_000 });

  await page.getByRole('button', { name: 'Filter', exact: true }).click();
  const filter = page.locator('app-filter');
  const statusField = filter.locator('.form-item').filter({ has: page.getByText('Status', { exact: true }) });
  const statusDropdown = statusField.locator('app-multi-select button');
  await statusDropdown.scrollIntoViewIfNeeded();
  await statusDropdown.click();
  const approvedOption = statusField.locator('.multi-select__dropdown li').filter({ hasText: /^\s*Approved\s*$/i });
  await expect(approvedOption).toBeVisible({ timeout: 10_000 });
  await approvedOption.click();
  await filter.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(page.locator('app-loading .spinner:visible')).toHaveCount(0, { timeout: 15_000 });

  const firstReservation = content.getByRole('row').nth(1);
  await expect(firstReservation).toBeVisible({ timeout: 15_000 });
  await firstReservation.click();
  await expect(page.locator('app-loading .spinner:visible')).toHaveCount(0, { timeout: 15_000 });

  for (const tabName of ['Details', 'Status', 'Post-Order']) {
    const tab = page.getByText(tabName, { exact: true }).last();
    await expect(tab).toBeVisible();
    await tab.click();
    await expect(page.locator('app-loading .spinner:visible')).toHaveCount(0, { timeout: 15_000 });
    await expectNoVisibleErrors(page);
  }
});

test('Reservation > Approved item Preview opens PDF and Download succeeds', async ({ page }) => {
  test.setTimeout(120_000);
  await login(page);
  await page.locator('a[href="/reservation"]').click();
  await expect(page).toHaveURL(/\/reservation/);

  const content = page.locator('.app-content app-container-view').last();
  await selectFirstDealerOptionIfPresent(page, content);
  await expect(page.locator('app-loading .spinner:visible')).toHaveCount(0, { timeout: 15_000 });

  await page.getByRole('button', { name: 'Filter', exact: true }).click();
  const filter = page.locator('app-filter');
  const statusField = filter.locator('.form-item').filter({ has: page.getByText('Status', { exact: true }) });
  const statusDropdown = statusField.locator('app-multi-select button');
  await statusDropdown.scrollIntoViewIfNeeded();
  await statusDropdown.click();
  const approvedOption = statusField.locator('.multi-select__dropdown li').filter({ hasText: /^\s*Approved\s*$/i });
  await expect(approvedOption).toBeVisible({ timeout: 10_000 });
  await approvedOption.click();
  await filter.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(page.locator('app-loading .spinner:visible')).toHaveCount(0, { timeout: 15_000 });

  const firstReservation = content.getByRole('row').nth(1);
  await expect(firstReservation).toBeVisible({ timeout: 15_000 });
  await firstReservation.click();
  await expect(page.locator('app-loading .spinner:visible')).toHaveCount(0, { timeout: 15_000 });

  const previewButton = page.getByRole('button', { name: /^Preview$/i });
  await expect(previewButton).toBeVisible();
  await previewButton.click();
  await expect(page.getByText('VEHICLE SALES PROPOSAL', { exact: false })).toBeVisible({ timeout: 30_000 });

  const downloadButton = page.getByRole('button', { name: /^Download$/i });
  await expect(downloadButton).toBeVisible();
  const downloadPromise = page.waitForEvent('download');
  await downloadButton.click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
  expect(await download.failure()).toBeNull();
  await expectNoVisibleErrors(page);
});

for (const route of [
  { href: '/lead-import', pageName: 'Lead Import' },
  { href: '/lead-migration', pageName: 'Lead Migration' },
]) {
  test(`Menu > ${route.pageName} > Download Template downloads successfully`, async ({ page }) => {
    test.setTimeout(60_000);
    await login(page);
    await expandMenu(page);
    await page.locator(`a[href="${route.href}"]`).click();
    await expect(page).toHaveURL(new RegExp(route.href.replace(/\//g, '\\/')));

    const templateLink = page.getByText('Download Template', { exact: true });
    await expect(templateLink).toBeVisible();
    const downloadPromise = page.waitForEvent('download');
    await templateLink.click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.xlsx$/i);
    expect(await download.failure()).toBeNull();
    expect(await download.path()).toBeTruthy();
  });
}

test('Menu > Customer 360 > customer tabs and first available items load without errors', async ({ page }) => {
  test.setTimeout(180_000);
  await login(page);
  await expandMenu(page);
  await page.locator('a[href="/customer"]').click();
  await expect(page).toHaveURL(/\/customer/);

  let content = page.locator('.app-content app-container-view').last();
  await selectFirstDealerOptionIfPresent(page, content);
  await expect(page.locator('app-loading .spinner:visible')).toHaveCount(0, { timeout: 15_000 });

  const firstCustomer = content.locator('table tbody tr, .customer-item, [class*="customer-item"]').first();
  await expect(firstCustomer).toBeVisible({ timeout: 15_000 });
  await firstCustomer.click();
  await expect(page.locator('app-loading .spinner:visible')).toHaveCount(0, { timeout: 15_000 });
  await expectNoVisibleErrors(page);

  const tabNames = ['basic profile', 'Leads', 'activities', 'VSQ', 'reservations', 'release vehicles'];
  const tabItemSelector = 'table tbody tr, .lead-item, .activity-item, .vsq-item, .reservation-item, .release-vehicle-item, [class*="lead-item"], [class*="activity-item"], [class*="vsq-item"], [class*="reservation-item"], [class*="release-vehicle-item"]';

  for (const tabName of tabNames) {
    const tab = content.locator('.nav-tab__item').filter({ hasText: new RegExp(tabName, 'i') }).first();
    await expect(tab).toBeVisible();
    await tab.click();
    await expect(page.locator('app-loading .spinner:visible')).toHaveCount(0, { timeout: 15_000 });
    await expectNoVisibleErrors(page);

    if (tabName === 'Basic Profile') {
      continue;
    }

    content = page.locator('.app-content app-container-view').last();
    const firstItem = content.locator(tabItemSelector).first();
    if (await firstItem.count() && await firstItem.isVisible().catch(() => false)) {
      const detailUrl = page.url();
      await firstItem.click();
      await expect(page.locator('app-loading .spinner:visible')).toHaveCount(0, { timeout: 15_000 });
      await expectNoVisibleErrors(page);

      if (page.url() !== detailUrl) {
        await page.goBack();
        await expect(page).toHaveURL(detailUrl);
      } else {
        await page.keyboard.press('Escape');
      }
    }
  }
});

for (const route of menuRoutes) {
  test(`Menu > ${route.routeName} page accessibility`, async ({ page }) => {
    test.setTimeout(45_000);
    await login(page);
    await expandMenu(page);

    const navLink = page.locator(`a[href="${route.href}"]`);
    await expect(navLink).toBeVisible();
    await navLink.click();
    await expect(page).toHaveURL(new RegExp(route.href.replace(/\//g, '\\/')));
    await expectPageDataOrEmptyState(page, route);
    if (route.routeName === 'Calendar') {
      await expect(page.locator('.cal-day-headers .cal-header')).toHaveCount(7);
    }
  });
}

test('Menu > Account Settings menu accessibility', async ({ page }) => {
  await login(page);
  await expandMenu(page);

  await page.getByRole('button', { name: 'Account Settings' }).click();
  await expect(page.locator('a[href="/profile"]')).toBeVisible();
});

test('Menu > Account Settings > My Profile page accessibility', async ({ page }) => {
  await login(page);
  await expandMenu(page);
  await page.getByRole('button', { name: 'Account Settings' }).click();

  const profileLink = page.locator('a[href="/profile"]');
  await expect(profileLink).toBeVisible();
  await profileLink.click();
  await expect(page).toHaveURL(/\/profile/);
  await expectPageDataOrEmptyState(page, profileRoute);
});
