import { pathToFileURL } from 'node:url';

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

await (await import('node:fs/promises')).mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];

try {
  for (const viewport of viewports) {
    const page = await browser.newPage({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1,
    });
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.locator('.ted-home-discover-card').first().waitFor({ state: 'attached', timeout: 30000 });

    // Trigger every scroll-reveal section before taking a screenshot.
    await page.evaluate(async () => {
      const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      const step = Math.max(280, Math.floor(window.innerHeight * 0.72));
      const bottom = document.documentElement.scrollHeight;

      for (let y = 0; y < bottom; y += step) {
        window.scrollTo(0, y);
        await pause(180);
      }

      const images = [...document.querySelectorAll('.ted-home-discover-photo')];
      await Promise.all(images.map((image) => new Promise((resolve) => {
        if (image.complete) return resolve();
        image.addEventListener('load', resolve, { once: true });
        image.addEventListener('error', resolve, { once: true });
        setTimeout(resolve, 7000);
      })));

      document.querySelector('.ted-home-discover')?.scrollIntoView({ block: 'center' });
      await pause(850);
    });

    const cardData = await page.locator('.ted-home-discover-card').evaluateAll((cards) =>
      cards.map((card) => {
        const image = card.querySelector('.ted-home-discover-photo');
        const watermark = getComputedStyle(card, '::before');
        const bounds = card.getBoundingClientRect();
        return {
          number: card.dataset.index,
          width: Math.round(bounds.width),
          height: Math.round(bounds.height),
          imageLoaded: image.complete && image.naturalWidth > 0,
          imageNaturalWidth: image.naturalWidth,
          watermarkText: watermark.content.replaceAll('"', ''),
          watermarkFontSize: watermark.fontSize,
          horizontalOverflow: card.scrollWidth > card.clientWidth,
        };
      }),
    );

    const pageWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const diagnostics = {
      viewport: viewport.name,
      cards: cardData,
      pageWidth,
      viewportWidth: viewport.width,
      pageErrors,
    };

    console.log(JSON.stringify(diagnostics));
    if (cardData.length !== 3) throw new Error(viewport.name + ': expected exactly 3 discovery cards');
    if (cardData.some((card, index) => card.number !== String(index + 1).padStart(2, '0'))) {
      throw new Error(viewport.name + ': a discovery-card number is missing or out of order');
    }
    if (cardData.some((card) => !card.imageLoaded)) {
      throw new Error(viewport.name + ': one or more official discovery-card images failed to load');
    }
    if (cardData.some((card) => card.horizontalOverflow)) {
      throw new Error(viewport.name + ': a discovery card has horizontal overflow');
    }
    if (pageWidth > viewport.width) {
      throw new Error(viewport.name + ': the homepage has horizontal overflow');
    }
    if (pageErrors.length) {
      throw new Error(viewport.name + ': browser runtime errors were reported');
    }

    await page.locator('.ted-home-discover').screenshot({
      path: outputDir + '/discovery-' + viewport.name + '.png',
      animations: 'disabled',
    });
    await page.close();
    results.push(diagnostics);
  }
} finally {
  await browser.close();
}

console.log('Homepage discovery screenshots and browser checks passed.');
