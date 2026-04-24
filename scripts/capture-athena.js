const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUTPUT_DIR = '/Users/kyh/Workspace/Broadsea/concept-viz/public/landscape';
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  const page = await ctx.newPage();

  const shot = async (name, opts = {}) => {
    const p = path.join(OUTPUT_DIR, name);
    await page.screenshot({ path: p, ...opts });
    console.log(`  ✓ ${name}`);
  };

  await page.goto('https://athena.ohdsi.org/search-terms/terms', {
    waitUntil: 'domcontentloaded', timeout: 45000,
  });
  await page.waitForTimeout(5000);

  // Dismiss Accept (cookie/terms) modal first if present
  try {
    await page.getByRole('button', { name: /accept/i }).first().click({ timeout: 3000 });
    console.log('  dismissed Accept modal');
    await page.waitForTimeout(1000);
  } catch (e) {}

  await shot('athena-01-landing.png');

  // Type search
  const input = page.locator('input[name="searchString"]');
  await input.fill('type 2 diabetes');
  await input.press('Enter');
  await page.waitForTimeout(8000);

  // Check total
  const bodyText = await page.locator('body').innerText();
  const total = bodyText.match(/Total\s+(\d+)/i);
  console.log(`  Total items: ${total ? total[1] : '?'}`);

  await shot('athena-02-search-results.png');
  await shot('athena-02-search-results-full.png', { fullPage: true });

  // Diagnose row structure
  const rowInfo = await page.evaluate(() => {
    // Look for repeating result rows
    const candidates = [
      'table tbody tr', 'tbody tr',
      '.ant-table-row', '.MuiDataGrid-row',
      '[class*="row"]', '[class*="Row"]',
      '.at-list__row', '.ac-table__row',
      'tr[data-row-key]',
    ];
    const results = {};
    for (const sel of candidates) {
      const els = document.querySelectorAll(sel);
      if (els.length > 0) results[sel] = els.length;
    }
    return results;
  });
  console.log('  Row selectors:', rowInfo);

  // Click first result — try various selectors
  let rowClicked = false;
  for (const sel of [
    '.at-list__row',
    '.ac-table__row',
    'tr[data-row-key]',
    'table tbody tr',
    'tbody tr',
    '[class*="row"]:has(td)',
  ]) {
    try {
      await page.locator(sel).first().click({ timeout: 2500 });
      rowClicked = true;
      console.log(`  clicked via: ${sel}`);
      break;
    } catch (e) { /* try next */ }
  }

  if (rowClicked) {
    await page.waitForTimeout(6000);
    await shot('athena-03-concept-detail.png');
    await shot('athena-03-concept-detail-full.png', { fullPage: true });
    console.log(`  detail URL: ${page.url()}`);

    // Look for HIERARCHY button/tab
    try {
      await page.getByText(/hierarchy/i).first().click({ timeout: 3000 });
      await page.waitForTimeout(3500);
      await shot('athena-04-hierarchy.png');
    } catch (e) { console.log('  no hierarchy tab'); }

    // RELATIONSHIPS
    try {
      await page.getByText(/relationships/i).first().click({ timeout: 3000 });
      await page.waitForTimeout(3500);
      await shot('athena-05-relationships.png');
    } catch (e) { console.log('  no relationships tab'); }
  } else {
    console.log('  ✗ no row could be clicked');
  }

  await browser.close();
  console.log(`\n📁 Files:`);
  for (const f of fs.readdirSync(OUTPUT_DIR).sort()) console.log(`  ${f}`);
})();
