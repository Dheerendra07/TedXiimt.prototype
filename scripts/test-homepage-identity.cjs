const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require('playwright');
const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:4173/';

async function moveThroughSections(page) {
  const sections = await page.locator('.tedx-home > main > section').all();
  for (const section of sections) {
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(180);
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(650);
}
async function assertNoHorizontalOverflow(page, label) {
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
  }));
  assert.ok(dimensions.document <= dimensions.viewport + 1, label + ' has horizontal overflow: ' + JSON.stringify(dimensions));
}
async function assertSquareTiles(page, label) {
  const cards = page.locator('.tedx-discover__card');
  assert.equal(await cards.count(), 3, label + ' should show all three Explore tiles.');
  const boxes = await cards.evaluateAll((elements) => elements.map((element) => {
    const rect = element.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }));
  boxes.forEach((box, index) => {
    assert.ok(Math.abs(box.width / box.height - 1) < 0.08, label + ' Explore tile ' + (index + 1) + ' is not square.');
  });
  return boxes;
}
async function main() {
  fs.mkdirSync('artifacts/homepage', { recursive: true });
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const desktop = await browser.newPage({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1 });
    const pageErrors = [];
    desktop.on('pageerror', (error) => pageErrors.push(error.message));
    await desktop.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await desktop.locator('[data-testid="tedx-home-hero"]').waitFor({ state: 'visible', timeout: 15000 });
    await desktop.locator('#tedx-hero-title').waitFor({ state: 'visible' });
    await desktop.waitForFunction(() => {
      const image = document.querySelector('.tedx-hero__artwork');
      return Boolean(image && image.complete && image.naturalWidth > 0);
    }, undefined, { timeout: 15000 });
    const wordmark = (await desktop.locator('#tedx-hero-title').innerText()).replace(/\s+/g, '').toLowerCase();
    assert.ok(wordmark.startsWith('tedxiimtuniversity'), 'Hero wordmark should read TEDxIIMT University.');
    assert.equal(await desktop.locator('.tedx-hero__primary').getAttribute('href'), '/register');
    assert.equal(await desktop.locator('.tedx-hero__secondary').getAttribute('href'), '/gallery');

    const mosaicGrid = desktop.locator('.tedx-hero__mosaic');
    const mosaicCells = desktop.locator('.tedx-hero__mosaic-cell');
    assert.equal(await mosaicCells.count(), 48, 'The reference grid should contain 8 columns and 6 rows.');
    const mosaicBounds = await mosaicGrid.boundingBox();
    assert.ok(mosaicBounds, 'The desktop mosaic grid should be visible.');
    assert.ok(mosaicBounds.x > 1440 * 0.58, 'The grid should stay on the right side of the X artwork.');
    assert.ok(mosaicBounds.width < 1440 * 0.38, 'The grid should remain a focused area, not cover the full X.');
    assert.ok(Math.abs(mosaicBounds.width / mosaicBounds.height - 4 / 3) < 0.03,
      'The reference grid should preserve its 4:3 arrangement and square cells.');
    const firstTileBounds = await mosaicCells.first().boundingBox();
    assert.ok(Math.abs(firstTileBounds.width / firstTileBounds.height - 1) < 0.05,
      'Each reference grid cell should be square.');

    const readComposition = async () => mosaicCells.evaluateAll((elements) => elements.map((element) => {
      const style = window.getComputedStyle(element);
      const pattern = element.querySelector('.tedx-hero__mosaic-pattern');
      return {
        className: element.className,
        backgroundColor: style.backgroundColor,
        pixelPattern: pattern ? pattern.innerHTML : null,
      };
    }));
    await desktop.waitForTimeout(350);
    const firstFrameComposition = await readComposition();
    assert.equal(firstFrameComposition.filter((cell) => cell.pixelPattern !== null).length, 2,
      'The opening frame should show the two reference tiles, not a pre-filled tile cluster.');
    await desktop.screenshot({ path: 'artifacts/homepage/mosaic-first-frame.png' });

    await mosaicCells.nth(27).hover();
    const hoveredComposition = await readComposition();
    assert.ok(hoveredComposition.filter((cell) => cell.pixelPattern !== null).length >= 7,
      'Pointer movement should reveal a compact, irregular cluster of connected tiles.');
    assert.notDeepEqual(hoveredComposition, firstFrameComposition,
      'The active pixel cluster should move away from its opening-frame position.');
    assert.ok(await desktop.locator('.tedx-hero__mosaic-cell.is-violet').count() > 0,
      'The moving cluster should use the reference violet tile fill.');
    assert.ok(await desktop.locator('.tedx-hero__mosaic-cell.is-lilac').count() > 0,
      'The moving cluster should include lighter lilac tiles.');
    assert.ok(await desktop.locator('.tedx-hero__mosaic-pattern').count() >= 7,
      'The moving cluster should contain multiple fine pixel and stripe patterns.');
    await desktop.waitForTimeout(350);
    await desktop.screenshot({ path: 'artifacts/homepage/mosaic-hover.png' });

    await desktop.mouse.move(4, 4);
    await desktop.waitForTimeout(450);
    const restoredComposition = await readComposition();
    assert.deepEqual(restoredComposition, firstFrameComposition,
      'When hover ends, the exact two-tile opening frame must return.');
    assert.equal(await desktop.locator('.tedx-hero__mosaic-pattern').count(), 2,
      'Only the two opening-frame tiles should remain after pointer exit.');
    await desktop.screenshot({ path: 'artifacts/homepage/mosaic-restored.png' });

    await desktop.locator('#about').scrollIntoViewIfNeeded();
    await assertNoHorizontalOverflow(desktop, 'Desktop');
    assert.ok(await desktop.locator('#tedx-about-title').isVisible());
    await desktop.locator('.tedx-discover__grid').scrollIntoViewIfNeeded();
    const desktopTiles = await assertSquareTiles(desktop, 'Desktop');
    assert.ok(desktopTiles[0].width > desktopTiles[1].width * 1.7, 'Desktop Explore mosaic should feature one large tile and two stacked tiles.');

    await desktop.locator('#featured-speakers').scrollIntoViewIfNeeded();
    const speakersSection = desktop.locator('#featured-speakers');
    const nextSpeaker = desktop.getByRole('button', { name: 'Next speaker' });
    const pauseAutoplay = desktop.getByRole('button', { name: 'Pause autoplay' });
    const speakerStatus = await speakersSection.innerText();
    const countMatch = speakerStatus.match(/SPEAKER\s+\d+\s+OF\s+(\d+)/i);
    const speakerCount = countMatch ? Number(countMatch[1]) : 0;
    if (await pauseAutoplay.count()) {
      await pauseAutoplay.click();
      assert.ok(await desktop.getByRole('button', { name: 'Start autoplay' }).isVisible());
    }
    if (speakerCount > 1 && await nextSpeaker.count()) {
      await nextSpeaker.click();
      await desktop.waitForTimeout(450);
      assert.match(await speakersSection.innerText(), /Speaker 2 of/i);
    } else {
      assert.equal(speakerCount, 1, 'Speaker carousel should render its placeholder state.');
    }
    await moveThroughSections(desktop);
    assert.equal(pageErrors.length, 0, 'Desktop runtime errors: ' + pageErrors.join(' | '));
    await desktop.screenshot({ path: 'artifacts/homepage/desktop.png', fullPage: true });
    console.log('PASS desktop: hero, purple/white pixel mosaic and exact hover reset, Explore layout, speaker controls and overflow');

    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true,
    });
    const mobile = await mobileContext.newPage();
    const mobileErrors = [];
    mobile.on('pageerror', (error) => mobileErrors.push(error.message));
    await mobile.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await mobile.locator('[data-testid="tedx-home-hero"]').waitFor({ state: 'visible', timeout: 15000 });
    await mobile.waitForFunction(() => {
      const image = document.querySelector('.tedx-hero__artwork');
      return Boolean(image && image.complete && image.naturalWidth > 0);
    }, undefined, { timeout: 15000 });
    await assertNoHorizontalOverflow(mobile, 'Mobile');
    await mobile.locator('.tedx-discover__grid').scrollIntoViewIfNeeded();
    await assertSquareTiles(mobile, 'Mobile');
    const menuToggle = mobile.getByRole('button', { name: 'Toggle navigation menu' });
    await menuToggle.click();
    await mobile.locator('#mobile-navigation').waitFor({ state: 'visible' });
    assert.ok(await mobile.locator('#mobile-navigation').getByRole('link', { name: 'Speakers' }).isVisible());
    await mobile.getByRole('button', { name: 'Toggle navigation menu' }).click();
    await moveThroughSections(mobile);
    assert.equal(mobileErrors.length, 0, 'Mobile runtime errors: ' + mobileErrors.join(' | '));
    await mobile.screenshot({ path: 'artifacts/homepage/mobile.png', fullPage: true });
    console.log('PASS mobile: hero, square Explore tiles, responsive navigation and overflow');
    await mobileContext.close();
    await desktop.close();
  } finally {
    await browser.close();
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
