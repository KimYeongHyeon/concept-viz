const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('pageerror', err => console.log('[PAGEERROR]', err.message));

  await page.goto('https://kimyeonghyeon.github.io/concept-viz/docs/clinician_in_the_loop_omop_criteria_mapper.html', {
    waitUntil: 'networkidle', timeout: 30000,
  });
  await page.waitForTimeout(3500);

  const state = await page.evaluate(() => {
    const pre = document.querySelector('main.reader pre');
    const code = pre?.querySelector('code');
    return {
      hasPre: !!pre,
      preCount: document.querySelectorAll('main.reader pre').length,
      firstCodeText: code ? code.textContent.slice(0, 300) : null,
      computedFont: pre ? getComputedStyle(pre).fontFamily : null,
      computedWhiteSpace: pre ? getComputedStyle(pre).whiteSpace : null,
      computedWordBreak: pre ? getComputedStyle(pre).wordBreak : null,
      codeFont: code ? getComputedStyle(code).fontFamily : null,
    };
  });
  console.log(JSON.stringify(state, null, 2));

  await page.screenshot({ path: '/Users/kyh/Workspace/Broadsea/concept-viz/scripts/clinician-render.png', fullPage: true });
  await browser.close();
})();
