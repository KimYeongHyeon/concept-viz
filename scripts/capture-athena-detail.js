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
    console.log(`  ✓ ${name}  (${(fs.statSync(p).size / 1024).toFixed(0)} KB)`);
  };

  // Direct concept URL: concept_id 201826 = Type 2 diabetes mellitus
  await page.goto('https://athena.ohdsi.org/search-terms/terms/201826', {
    waitUntil: 'domcontentloaded', timeout: 45000,
  });
  await page.waitForTimeout(6000);

  // Accept modal
  try {
    await page.getByRole('button', { name: /accept/i }).first().click({ timeout: 2500 });
    await page.waitForTimeout(1000);
  } catch (e) {}

  await shot('athena-03-concept-detail.png');
  await shot('athena-03-concept-detail-full.png', { fullPage: true });
  console.log(`  URL: ${page.url()}`);

  // Try clicking "Hierarchy" tab (standard Athena concept page tabs)
  const tabDiagnose = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('a, button, [role="tab"], li, .tab'))
      .filter(e => e.offsetParent !== null && e.textContent.trim().length < 40)
      .map(e => e.textContent.trim())
      .filter(t => t.length > 0 && !/^[0-9]+$/.test(t));
    return [...new Set(all)].slice(0, 40);
  });
  console.log('Clickable labels:', tabDiagnose);

  // Try to click hierarchy link/tab
  for (const txt of ['Hierarchy', 'HIERARCHY', 'Tree', 'Relationships']) {
    try {
      await page.locator(`text=${txt}`).first().click({ timeout: 2500 });
      await page.waitForTimeout(3000);
      const fn = txt.toLowerCase().includes('relation') ? 'athena-05-relationships.png' : 'athena-04-hierarchy.png';
      await shot(fn);
      await shot(fn.replace('.png', '-full.png'), { fullPage: true });
    } catch (e) { /* skip */ }
  }

  await browser.close();
  console.log(`\n📁 Files:`);
  for (const f of fs.readdirSync(OUTPUT_DIR).sort()) console.log(`  ${f}`);
})();
