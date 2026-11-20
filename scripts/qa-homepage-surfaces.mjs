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
    await page.locator('.ted-home-pillars').waitFor({ state: 'attached', timeout: 30000 });
    await page.locator('.ted-home-speakers').waitFor({ state: 'attached', timeout: 30000 });

    const gridSelectors = ['.ted-home-statement', '.ted-home-pillars', '.ted-home-stage', '.ted-home-speakers', '.ted-home-close'];
    const sectionGrid = await page.evaluate((selectors) => selectors.map((selector) => {
      const section = document.querySelector(selector);
      const before = section ? getComputedStyle(section, '::before') : null;
      return { selector, present: Boolean(section), backgroundSize: before?.backgroundSize || '', backgroundImage: before?.backgroundImage || '' };
    }), gridSelectors);
    const footerGrid = await page.locator('.ted-footer-grid-overlay').evaluate((element) => {
      const style = getComputedStyle(element);
      const bounds = element.getBoundingClientRect();
      return { width: Math.round(bounds.width), backgroundSize: style.backgroundSize, backgroundImage: style.backgroundImage };
    });

    assert(sectionGrid.every((item) => item.present && item.backgroundSize.includes('72px') && item.backgroundImage.includes('linear-gradient')), viewport.name + ': established grid missing from a spacious section');
    assert(footerGrid.width >= viewport.width && footerGrid.backgroundSize.includes('72px'), viewport.name + ': footer grid missing or too narrow');

    const factualData = await page.evaluate(() => {
      const facts = [...document.querySelectorAll('.ted-home-edition-card')].map((card) => ({
        label: card.querySelector('.ted-home-edition-card-top > span')?.textContent?.trim() || '',
        value: card.querySelector('h3')?.textContent?.trim() || '',
      }));
      const speakers = [...document.querySelectorAll('.ted-home-speaker-card')].map((card) => ({
        name: card.querySelector('h3')?.textContent?.trim() || '',
        role: card.querySelector('p')?.textContent?.trim() || '',
      }));
      const nonGalleryImages = document.querySelectorAll('.ted-home-edition-card img, .ted-home-discover-card img, .ted-home-speaker-card img').length;
      const galleryImages = [...document.querySelectorAll('.ted-home-gallery-card img')];
      const bodyText = document.body.innerText;
      return {
        title: document.querySelector('.ted-home-pillars-head h2')?.textContent?.trim() || '',
        facts,
        speakers,
        nonGalleryImages,
        galleryImageCount: galleryImages.length,
        dateVisibleInHero: bodyText.includes('11 November 2025'),
        venueVisibleInHero: bodyText.includes('Seminar Hall'),
      };
    });

    assert(factualData.title.includes('TEDxIIMT University 2025'), viewport.name + ': archive edition title is not displayed');
    assert(factualData.facts.length === 3, viewport.name + ': expected three official edition facts');
    assert(factualData.facts[0].value === 'Break the Flow', viewport.name + ': official theme is incorrect');
    assert(factualData.facts[1].value === '11 November 2025', viewport.name + ': official event date is incorrect');
    assert(factualData.facts[2].value.includes('Seminar Hall') && factualData.facts[2].value.includes('IIMT University'), viewport.name + ': official venue is incorrect');
    assert(factualData.speakers.length === 8, viewport.name + ': expected the eight speakers in IIMT University’s official recap');
    assert(factualData.nonGalleryImages === 0, viewport.name + ': decorative images were reintroduced into editorial cards');
    assert(factualData.dateVisibleInHero && factualData.venueVisibleInHero, viewport.name + ': event date or venue is missing from the hero');
    assert(factualData.galleryImageCount === 5, viewport.name + ': the dedicated official gallery should retain its five curated images');
    const pageWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    assert(pageWidth <= viewport.width, viewport.name + ': homepage has horizontal overflow');

    for (const [selector, name] of [['.ted-home-pillars', 'edition'], ['.ted-home-speakers', 'speakers'], ['footer', 'footer']]) {
      const section = page.locator(selector);
      await section.scrollIntoViewIfNeeded();

      // Trigger once-only Motion reveals for every card before capturing the full section.
      if (name === 'speakers') {
        const cards = page.locator('.ted-home-speaker-card');
        for (let index = 0; index < await cards.count(); index += 1) {
          await cards.nth(index).scrollIntoViewIfNeeded();
          await page.waitForTimeout(90);
        }
        await section.scrollIntoViewIfNeeded();
      }

      await page.waitForTimeout(260);
      await section.screenshot({ path: outputDir + '/factual-' + name + '-' + viewport.name + '.png', animations: 'disabled' });
    }

    const mobileTicketControls = await page.locator('.ted-home > div[class~="fixed"][class~="bottom-6"][class~="right-6"]').count();
    if (viewport.name === 'mobile') {
      assert(mobileTicketControls === 0, 'mobile: duplicate floating ticket action should not cover homepage cards');
    }

    assert(pageErrors.length === 0, viewport.name + ': browser runtime errors: ' + pageErrors.join('; '));
    console.log(JSON.stringify({ viewport: viewport.name, sectionGrid, footerGrid, factualData, pageErrors }));
    await page.close();
  }
} finally {
  await browser.close();
}
console.log('IIMT edition facts, speaker lineup, photo discipline and grid browser QA passed.');
