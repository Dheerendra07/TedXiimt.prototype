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
    const gallery = page.locator('.ted-home-gallery');
    await gallery.waitFor({ state: 'attached', timeout: 30000 });

    // Scroll through the gallery so lazy-loaded photos and reveal animations activate.
    await page.evaluate(async () => {
      const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      const section = document.querySelector('.ted-home-gallery');
      if (!section) throw new Error('Homepage gallery section is missing');

      const top = window.scrollY + section.getBoundingClientRect().top;
      const bottom = top + section.offsetHeight;
      const step = Math.max(240, Math.floor(window.innerHeight * 0.7));

      for (let y = top; y < bottom; y += step) {
        window.scrollTo(0, y);
        await pause(180);
      }

      const images = [...section.querySelectorAll('.ted-home-gallery-card img')];
      await Promise.all(images.map((image) => new Promise((resolve) => {
        if (image.complete) return resolve();
        image.addEventListener('load', resolve, { once: true });
        image.addEventListener('error', resolve, { once: true });
        setTimeout(resolve, 10000);
      })));

      section.scrollIntoView({ block: 'start' });
      await pause(900);
    });

    const cardData = await page.locator('.ted-home-gallery-card').evaluateAll((cards) =>
      cards.map((card) => {
        const image = card.querySelector('img');
        const bounds = card.getBoundingClientRect();
        return {
          label: card.getAttribute('aria-label'),
          width: Math.round(bounds.width),
          height: Math.round(bounds.height),
          imageLoaded: image.complete && image.naturalWidth > 0,
          imageNaturalWidth: image.naturalWidth,
          imageAlt: image.alt,
          objectPosition: getComputedStyle(image).objectPosition,
        };
      }),
    );
    const pageWidth = await page.evaluate(() => document.documentElement.scrollWidth);

    assert(cardData.length === 5, viewport.name + ': expected exactly five homepage gallery cards');
    assert(cardData.every((card) => card.imageLoaded), viewport.name + ': one or more official gallery photos failed to load');
    assert(cardData.every((card) => card.imageAlt.trim().length > 15), viewport.name + ': a gallery photo is missing descriptive alt text');
    assert(cardData.every((card) => card.width > 0 && card.height > 0), viewport.name + ': a gallery card has no visible size');
    assert(pageWidth <= viewport.width, viewport.name + ': the homepage has horizontal overflow');

    await gallery.screenshot({
      path: outputDir + '/gallery-' + viewport.name + '.png',
      animations: 'disabled',
    });

    const opener = page.locator('.ted-home-gallery-card').first();
    await opener.click();

    const dialog = page.getByRole('dialog');
    await dialog.waitFor({ state: 'visible', timeout: 10000 });
    const closeButton = dialog.locator('button[aria-label="Close photo viewer"]');
    const previousButton = dialog.locator('button[aria-label="Previous photo"]');
    const nextButton = dialog.locator('button[aria-label="Next photo"]');
    const captionCount = dialog.locator('.ted-home-lightbox-caption > div > span');
    const sourceLink = dialog.locator('.ted-home-lightbox-caption a');

    assert(await captionCount.textContent().then((value) => value.startsWith('01 / 05')), viewport.name + ': first photo caption is incorrect');
    assert(await page.locator('.ted-home-lightbox-image img').evaluate((image) => image.complete && image.naturalWidth > 0), viewport.name + ': lightbox image did not load');
    assert(await page.locator('.ted-home-lightbox-image img').getAttribute('alt'), viewport.name + ': lightbox image has no alt text');
    assert(await sourceLink.getAttribute('href'), viewport.name + ': official source link is missing');
    assert(await page.evaluate(() => document.body.style.overflow) === 'hidden', viewport.name + ': page scrolling was not locked while lightbox is open');
    assert(await closeButton.evaluate((button) => document.activeElement === button), viewport.name + ': initial focus did not move into the lightbox');

    await dialog.screenshot({
      path: outputDir + '/lightbox-' + viewport.name + '.png',
      animations: 'disabled',
    });

    // Verify the keyboard focus trap cycles through the modal controls.
    await sourceLink.focus();
    await page.keyboard.press('Tab');
    assert(await page.evaluate(() => document.activeElement.getAttribute('aria-label')) === 'Next photo', viewport.name + ': Tab did not advance to the final lightbox control');

    await page.keyboard.press('Tab');
    assert(await page.evaluate(() => document.activeElement.getAttribute('aria-label')) === 'Close photo viewer', viewport.name + ': Tab did not wrap to the first lightbox control');

    await page.keyboard.press('Shift+Tab');
    assert(await page.evaluate(() => document.activeElement.getAttribute('aria-label')) === 'Next photo', viewport.name + ': Shift+Tab did not wrap to the last lightbox control');

    // Verify keyboard navigation and button navigation, including both wrap-around edges.
    await page.keyboard.press('ArrowRight');
    assert(await captionCount.textContent().then((value) => value.startsWith('02 / 05')), viewport.name + ': ArrowRight did not advance the gallery');

    await page.keyboard.press('ArrowLeft');
    assert(await captionCount.textContent().then((value) => value.startsWith('01 / 05')), viewport.name + ': ArrowLeft did not return to the first photo');

    await previousButton.click();
    assert(await captionCount.textContent().then((value) => value.startsWith('05 / 05')), viewport.name + ': previous button did not wrap to the last photo');

    await nextButton.click();
    assert(await captionCount.textContent().then((value) => value.startsWith('01 / 05')), viewport.name + ': next button did not wrap to the first photo');

    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'hidden', timeout: 10000 });
    assert(await page.evaluate(() => document.body.style.overflow) !== 'hidden', viewport.name + ': page scrolling was not restored after closing');
    assert(await opener.evaluate((button) => document.activeElement === button), viewport.name + ': focus was not restored to the opening photo button');

    // Also verify that clicking the backdrop closes the viewer and restores focus.
    const secondOpener = page.locator('.ted-home-gallery-card').nth(1);
    await secondOpener.click();
    await page.locator('.ted-home-lightbox').waitFor({ state: 'visible' });
    await page.locator('.ted-home-lightbox').click({ position: { x: 4, y: 4 } });
    await page.locator('.ted-home-lightbox').waitFor({ state: 'hidden' });
    assert(await secondOpener.evaluate((button) => document.activeElement === button), viewport.name + ': backdrop close did not restore trigger focus');

    assert(pageErrors.length === 0, viewport.name + ': browser runtime errors: ' + pageErrors.join('; '));

    console.log(JSON.stringify({
      viewport: viewport.name,
      cards: cardData,
      pageWidth,
      viewportWidth: viewport.width,
      keyboardFocusTrap: true,
      keyboardNavigation: true,
      escapeClose: true,
      backdropClose: true,
      focusRestored: true,
      bodyScrollRestored: true,
      pageErrors,
    }));

    await page.close();
  }
} finally {
  await browser.close();
}

console.log('Homepage gallery and lightbox browser QA passed.');
