const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const BASE_URL = process.env.HOMEPAGE_PREVIEW_URL || 'http://127.0.0.1:4173/';
const OUTPUT_DIR = process.env.HOMEPAGE_ARTIFACT_DIR || 'artifacts/homepage';
const storyProgress = [0.33, 0.66, 0.99];
const sectionCaptures = [
  ['#featured-speakers', 'speakers'],
  ['#discover', 'discover'],
  ['.home-section--benefits', 'why-attend'],
  ['#home-highlights', 'highlights'],
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

  const hero = page.locator('.tedx-hero');
  const heroBounds = await hero.boundingBox();
  let mosaicInteraction = { attempted: false, trailAppeared: false, trailFaded: false };

  if (heroBounds && width >= 600) {
    mosaicInteraction.attempted = true;
    await page.mouse.move(
      heroBounds.x + heroBounds.width * 0.43,
      heroBounds.y + heroBounds.height * 0.52,
    );
    await page.waitForTimeout(70);
    mosaicInteraction.trailAppeared = (await hero.locator('.tedx-hero__cell.is-trailing').count()) > 0;
    await page.mouse.move(
      heroBounds.x + heroBounds.width * 0.46,
      heroBounds.y + heroBounds.height * 0.54,
    );
    await page.waitForTimeout(760);
    mosaicInteraction.trailFaded = (await hero.locator('.tedx-hero__cell.is-trailing').count()) === 0;
  } else if (heroBounds && width < 600) {
    mosaicInteraction.attempted = true;
    await page.touchscreen.tap(
      heroBounds.x + heroBounds.width * 0.46,
      heroBounds.y + heroBounds.height * 0.52,
    );
    await page.waitForTimeout(70);
    mosaicInteraction.trailAppeared = (await hero.locator('.tedx-hero__cell.is-trailing').count()) > 0;
    await page.waitForTimeout(760);
    mosaicInteraction.trailFaded = (await hero.locator('.tedx-hero__cell.is-trailing').count()) === 0;
  }

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
    heroArtworkLoaded: Boolean(document.querySelector('.tedx-hero__art-image')?.naturalWidth),
    heroArtworkNaturalWidth: document.querySelector('.tedx-hero__art-image')?.naturalWidth || 0,
    loadedContentImages: [...document.querySelectorAll('main img')].filter((image) => image.complete && image.naturalWidth > 0).length,
    brokenContentImages: [...document.querySelectorAll('main img')].filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.src),
    exploreCards: document.querySelectorAll('.home-discover-card').length,
    highlightVideos: document.querySelectorAll('#home-highlights video').length,
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

  const responsiveChecks = [];
  for (const probeWidth of [320, 360, 768, 1024]) {
    if (probeWidth === width) continue;
    await page.setViewportSize({ width: probeWidth, height: probeWidth < 600 ? 740 : 900 });
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    const probe = await page.evaluate(() => ({
      viewportWidth: document.documentElement.clientWidth,
      documentWidth: document.documentElement.scrollWidth,
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
      heroArtworkLoaded: Boolean(document.querySelector('.tedx-hero__art-image')?.naturalWidth),
      heroCopyWidth: Math.round(document.querySelector('.tedx-hero__copy')?.getBoundingClientRect().width || 0),
    }));
    responsiveChecks.push({ width: probeWidth, ...probe });
    await page.screenshot({ path: path.join(OUTPUT_DIR, `${label}-responsive-${probeWidth}.png`) });
  }

  await context.close();
  await browser.close();

  return { viewport: { width, height }, metrics, mosaicInteraction, sections, responsiveChecks, pageErrors };
}

(async () => {
  const desktop = await captureViewport('desktop', 1440, 900);
  const mobile = await captureViewport('mobile', 390, 844);
  const report = { desktop, mobile };
  fs.writeFileSync(path.join(OUTPUT_DIR, 'qa-report.json'), JSON.stringify(report, null, 2));

  const overflows = [
    ...[desktop, mobile].filter((entry) => entry.metrics.horizontalOverflow),
    ...desktop.responsiveChecks.filter((entry) => entry.horizontalOverflow),
    ...mobile.responsiveChecks.filter((entry) => entry.horizontalOverflow),
  ];
  const pageErrors = [...desktop.pageErrors, ...mobile.pageErrors];
  const failedMosaic = [desktop, mobile].filter((entry) => (
    !entry.mosaicInteraction.trailAppeared || !entry.mosaicInteraction.trailFaded
  ));
  if (overflows.length || pageErrors.length || failedMosaic.length) {
    console.error(JSON.stringify({ overflows, pageErrors, failedMosaic }, null, 2));
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
