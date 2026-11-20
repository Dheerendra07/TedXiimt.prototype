import { pathToFileURL } from 'node:url';
import { mkdir } from 'node:fs/promises';

const modulePath = process.env.PLAYWRIGHT_MODULE;
if (!modulePath) {
  throw new Error('PLAYWRIGHT_MODULE must point to the installed Playwright index.mjs');
}
const { chromium } = await import(pathToFileURL(modulePath).href);
const baseUrl = process.env.HOMEPAGE_PREVIEW_URL || 'http://127.0.0.1:4173/';
const outputDir = 'artifacts/homepage';
const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

try {
  for (const viewport of viewports) {
    const page = await browser.newPage({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1,
    });
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.locator('.ted-home-pillars').waitFor({ state: 'attached', timeout: 30000 });

    const gridSurfaces = [
      '.ted-home-statement',
      '.ted-home-pillars',
      '.ted-home-stage',
      '.ted-home-benefits',
      '.ted-home-close',
    ];
    const backgroundPattern = await page.evaluate((selectors) => selectors.map((selector) => {
      const element = document.querySelector(selector);
      const before = element ? getComputedStyle(element, '::before') : null;
      return {
        selector,
        present: Boolean(element),
        backgroundSize: before?.backgroundSize || '',
        backgroundImage: before?.backgroundImage || '',
      };
    }), gridSurfaces);

    const footerPattern = await page.locator('.ted-footer-grid-overlay').evaluate((element) => {
      const style = getComputedStyle(element);
      const bounds = element.getBoundingClientRect();
      return {
        width: Math.round(bounds.width),
        height: Math.round(bounds.height),
        backgroundSize: style.backgroundSize,
        backgroundImage: style.backgroundImage,
        opacity: Number(style.opacity),
      };
    });

    assert(backgroundPattern.every((item) => item.present && item.backgroundSize.includes('72px')), viewport.name + ': a spacious section is missing the established 72px grid');
    assert(backgroundPattern.every((item) => item.backgroundImage.includes('linear-gradient')), viewport.name + ': a section grid pattern is not rendered');
    assert(footerPattern.backgroundSize.includes('72px') && footerPattern.width >= viewport.width, viewport.name + ': the shared footer grid is missing or too narrow');

    // Scroll both photo-card groups into view so native lazy loading is honored.
    for (const selector of ['.ted-home-pillars', '.ted-home-benefits']) {
      await page.locator(selector).scrollIntoViewIfNeeded();
      await page.waitForTimeout(450);
    }

    const imageSelector = '.ted-home-pillar-photo, .ted-home-benefit-photo';
    await page.waitForFunction((selector) => {
      const images = [...document.querySelectorAll(selector)];
      return images.length === 7 && images.every((image) => image.complete && image.naturalWidth > 0);
    }, imageSelector, { timeout: 45000 });

    const cards = await page.locator(imageSelector).evaluateAll((images) => images.map((image) => {
      const card = image.closest('.ted-home-pillar, .ted-home-benefit');
      const bounds = card.getBoundingClientRect();
      const shade = card.querySelector('.ted-home-pillar-shade, .ted-home-benefit-shade');
      const shadeStyle = shade ? getComputedStyle(shade) : null;
      return {
        cardType: card.classList.contains('ted-home-pillar') ? 'pillar' : 'benefit',
        imageLoaded: image.complete && image.naturalWidth > 0,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
        cardWidth: Math.round(bounds.width),
        cardHeight: Math.round(bounds.height),
        overlayPresent: Boolean(shadeStyle && shadeStyle.backgroundImage !== 'none'),
      };
    }));

    const pageWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    assert(cards.length === 7, viewport.name + ': expected 7 photo-backed editorial cards');
    assert(cards.every((card) => card.imageLoaded && card.naturalWidth > 0 && card.overlayPresent), viewport.name + ': a card photo or readability overlay failed');
    assert(cards.every((card) => card.cardWidth > 0 && card.cardHeight > 0), viewport.name + ': a photo-backed card has no visible dimensions');
    assert(pageWidth <= viewport.width, viewport.name + ': homepage has horizontal overflow');

    for (const [selector,name] of [
      ['.ted-home-pillars','pillars'],
      ['.ted-home-benefits','benefits'],
      ['footer','footer'],
    ]) {
      await page.locator(selector).scrollIntoViewIfNeeded();
      await page.waitForTimeout(220);
      await page.locator(selector).screenshot({
        path: outputDir + '/surface-' + name + '-' + viewport.name + '.png',
        animations: 'disabled',
      });
    }

    assert(pageErrors.length === 0, viewport.name + ': browser runtime errors: ' + pageErrors.join('; '));
    console.log(JSON.stringify({
      viewport: viewport.name,
      gridSurfaces: backgroundPattern,
      footerPattern,
      imageCards: cards,
      pageWidth,
      viewportWidth: viewport.width,
      pageErrors,
    }));
    await page.close();
  }
} finally {
  await browser.close();
}
console.log('Homepage grid surfaces and photo-card browser QA passed.');
