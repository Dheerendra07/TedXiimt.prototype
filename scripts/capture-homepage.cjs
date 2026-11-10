const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const BASE_URL = process.env.HOMEPAGE_PREVIEW_URL || 'http://127.0.0.1:4173/';
const OUTPUT_DIR = process.env.HOMEPAGE_ARTIFACT_DIR || 'artifacts/homepage';
const storyProgress = [0.27, 0.61, 0.95];
const sectionCaptures = [
  ['#featured-speakers', 'speakers'],
  ['#discover', 'discover'],
  ['.home-section--benefits', 'benefits'],
  ['.home-section--social', 'highlights'],
  ['.home-section--partners', 'partners'],
  ['.home-section--journal', 'journal'],
  ['.home-finale', 'finale'],
];

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

async function captureViewport(label, width, height) {
  const pageErrors = [];
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    isMobile: width < 600,
    hasTouch: width < 600,
  });
  const page = await context.newPage();
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(OUTPUT_DIR, `${label}-hero.png`) });

  const story = page.locator('#what-is-tedx');
  if (await story.count()) {
    for (let i = 0; i < storyProgress.length; i += 1) {
      const progress = storyProgress[i];
      const targetY = await story.evaluate((element, p) => (
        element.getBoundingClientRect().top
        + window.scrollY
        + Math.max(0, element.offsetHeight - window.innerHeight) * p
      ), progress);
      await page.evaluate((y) => window.scrollTo(0, y), targetY);
      await page.waitForTimeout(850);
      await page.screenshot({
        path: path.join(OUTPUT_DIR, `${label}-story-0${i + 1}.png`),
      });
    }
  }

  const sections = [];
  for (const [selector, name] of sectionCaptures) {
    const section = page.locator(selector).first();
    if (!(await section.count())) {
      sections.push({ name, present: false });
      continue;
    }

    await section.evaluate((element) => {
      const top = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, top - Math.min(100, window.innerHeight * 0.12));
    });
    await page.waitForTimeout(850);
    await page.screenshot({ path: path.join(OUTPUT_DIR, `${label}-${name}.png`) });
    sections.push({ name, present: true });
  }

  const metrics = await page.evaluate(() => ({
    viewportWidth: document.documentElement.clientWidth,
    documentWidth: document.documentElement.scrollWidth,
    documentHeight: document.documentElement.scrollHeight,
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
    storyFrames: document.querySelectorAll('.home-story__frame').length,
    sectionCount: document.querySelectorAll('main .home-section').length,
    navPosition: getComputedStyle(document.querySelector('header')).position,
    overflowingElements: [...document.querySelectorAll('body *')]
      .map((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return {
          tag: element.tagName.toLowerCase(),
          className: typeof element.className === 'string' ? element.className.slice(0, 120) : '',
          id: element.id || '',
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
          position: style.position,
          overflow: style.overflow,
        };
      })
      .filter((element) => element.width > 0 && (element.left < -1 || element.right > document.documentElement.clientWidth + 1))
      .slice(0, 24),
  }));

  await context.close();
  await browser.close();

  return { viewport: { width, height }, metrics, sections, pageErrors };
}

(async () => {
  const desktop = await captureViewport('desktop', 1440, 900);
  const mobile = await captureViewport('mobile', 390, 844);
  const report = { desktop, mobile };
  fs.writeFileSync(path.join(OUTPUT_DIR, 'qa-report.json'), JSON.stringify(report, null, 2));

  const overflows = [desktop, mobile].filter((entry) => entry.metrics.horizontalOverflow);
  const pageErrors = [...desktop.pageErrors, ...mobile.pageErrors];
  if (overflows.length || pageErrors.length) {
    console.error(JSON.stringify({ overflows, pageErrors }, null, 2));
    process.exitCode = 1;
  }

  console.log(JSON.stringify({
    desktop: desktop.metrics,
    mobile: mobile.metrics,
    screenshots: fs.readdirSync(OUTPUT_DIR).filter((name) => name.endsWith('.png')).length,
  }));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
