import { pathToFileURL } from 'node:url';
import { mkdir } from 'node:fs/promises';

const modulePath = process.env.PLAYWRIGHT_MODULE;
if (!modulePath) throw new Error('PLAYWRIGHT_MODULE must point to the installed Playwright index.mjs');
const { chromium } = await import(pathToFileURL(modulePath).href);
const baseUrl = process.env.HOMEPAGE_PREVIEW_URL || 'http://127.0.0.1:4173/';
const outputDir = 'artifacts/homepage';
const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];
await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const assert = (condition, message) => { if (!condition) throw new Error(message); };

try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height }, deviceScaleFactor: 1 });
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.locator('.ted-home-discover-card').first().waitFor({ state: 'attached', timeout: 30000 });

    const cards = await page.locator('.ted-home-discover-card').evaluateAll((items) => items.map((card) => {
      const bounds = card.getBoundingClientRect();
      const watermark = getComputedStyle(card, '::before');
      return {
        number: card.dataset.index,
        title: card.querySelector('h3')?.textContent?.trim() || '',
        description: card.querySelector('p')?.textContent?.trim() || '',
        href: card.getAttribute('href'),
        imageCount: card.querySelectorAll('img').length,
        iconPresent: Boolean(card.querySelector('.ted-home-discover-icon svg')),
        watermark: watermark.content.replaceAll('"', ''),
        width: Math.round(bounds.width),
        height: Math.round(bounds.height),
      };
    }));
    const pageWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    assert(cards.length === 3, viewport.name + ': expected exactly 3 event discovery cards');
    assert(cards.every((card, index) => card.number === String(index + 1).padStart(2, '0')), viewport.name + ': discovery card order is wrong');
    assert(cards.every((card) => card.imageCount === 0), viewport.name + ': discovery cards must not use decorative photos');
    assert(cards.every((card) => card.title.length > 4 && card.description.length > 20 && card.iconPresent), viewport.name + ': event card content or icon missing');
    assert(cards.every((card) => card.watermark === card.number), viewport.name + ': full card numerals are missing');
    assert(cards.every((card) => card.width > 0 && card.height >= 300), viewport.name + ': discovery card dimensions are invalid');
    assert(pageWidth <= viewport.width, viewport.name + ': homepage has horizontal overflow');
    assert(pageErrors.length === 0, viewport.name + ': browser runtime errors: ' + pageErrors.join('; '));

    const discoverySection = page.locator('.ted-home-discover');
    const discoveryCards = page.locator('.ted-home-discover-card');
    for (let index = 0; index < await discoveryCards.count(); index += 1) {
      await discoveryCards.nth(index).scrollIntoViewIfNeeded();
      await page.waitForTimeout(100);
    }
    await discoverySection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(260);
    await discoverySection.screenshot({ path: outputDir + '/discovery-' + viewport.name + '.png', animations: 'disabled' });
    console.log(JSON.stringify({ viewport: viewport.name, cards, pageWidth, viewportWidth: viewport.width }));
    await page.close();
  }
} finally {
  await browser.close();
}
console.log('Image-free event discovery browser QA passed.');
