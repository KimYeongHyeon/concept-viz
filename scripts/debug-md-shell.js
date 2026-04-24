const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => console.log(`[${msg.type()}]`, msg.text()));
  page.on('pageerror', err => console.log('[PAGEERROR]', err.message));
  page.on('response', r => {
    if (!r.ok() && r.status() !== 304) console.log(`[${r.status()}] ${r.url()}`);
  });

  console.log('→ Load shell');
  await page.goto('https://kimyeonghyeon.github.io/concept-viz/docs/proposal_v2_visualization_focus.html', {
    waitUntil: 'networkidle',
    timeout: 30000,
  });
  await page.waitForTimeout(4000);

  const state = await page.evaluate(() => {
    const content = document.getElementById('content');
    return {
      hasContent: !!content,
      contentHTML: content ? content.innerHTML.slice(0, 500) : null,
      contentText: content ? content.textContent.trim().slice(0, 200) : null,
      markedLoaded: typeof window.marked !== 'undefined',
      markedVersion: window.marked?.getDefaults ? Object.keys(window.marked).slice(0, 10) : 'n/a',
      title: document.title,
    };
  });

  console.log('\n=== PAGE STATE ===');
  console.log('title:', state.title);
  console.log('marked loaded:', state.markedLoaded);
  console.log('marked api:', state.markedVersion);
  console.log('content length:', state.contentText?.length);
  console.log('content text:', state.contentText);
  console.log('content HTML head:', state.contentHTML);

  await page.screenshot({ path: '/Users/kyh/Workspace/Broadsea/concept-viz/scripts/md-shell-debug.png', fullPage: false });
  await browser.close();
})();
