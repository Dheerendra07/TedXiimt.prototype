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
  assert.ok(
    dimensions.document <= dimensions.viewport + 1,
    label + ' has horizontal overflow: ' + JSON.stringify(dimensions),
  );
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
    await desktop.locator('.tedx-hero__artwork').waitFor({ state: 'visible' });
    await desktop.waitForFunction(() => {
      const image = document.querySelector('.tedx-hero__artwork');
      return Boolean(image && image.complete && image.naturalWidth > 500);
    }, undefined, { timeout: 15000 });

    const wordmark = (await desktop.locator('#tedx-hero-title').innerText()).replace(/\s+/g, '').toLowerCase();
    assert.ok(wordmark.startsWith('tedxiimtuniversity'), 'Hero wordmark should read TEDxIIMT University.');
    assert.equal(await desktop.locator('.tedx-hero__primary').getAttribute('href'), '/register');
    assert.equal(await desktop.locator('.tedx-hero__secondary').getAttribute('href'), '/gallery');

    await desktop.locator('#about').scrollIntoViewIfNeeded();
    await assertNoHorizontalOverflow(desktop, 'Desktop');
    assert.ok(await desktop.locator('#tedx-about-title').isVisible());

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
      console.log('PASS speakers: next/previous controls with ' + speakerCount + ' entries');
    } else {
      assert.equal(speakerCount, 1, 'Speaker carousel should render at least its current placeholder state.');
      console.log('PASS speakers: single-entry placeholder and autoplay controls');
    }

    await moveThroughSections(desktop);
    assert.equal(pageErrors.length, 0, 'Desktop runtime errors: ' + pageErrors.join(' | '));
    await desktop.screenshot({ path: 'artifacts/homepage/desktop.png', fullPage: true });
    console.log('PASS desktop: X hero, hero artwork, content sections, CTA and speaker controls');

    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 1,
      isMobile: true,
      hasTouch: true,
    });
    const mobile = await mobileContext.newPage();
    const mobileErrors = [];
    mobile.on('pageerror', (error) => mobileErrors.push(error.message));

    await mobile.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await mobile.locator('[data-testid="tedx-home-hero"]').waitFor({ state: 'visible', timeout: 15000 });
    await mobile.locator('.tedx-hero__artwork').waitFor({ state: 'visible' });
    await mobile.waitForFunction(() => {
      const image = document.querySelector('.tedx-hero__artwork');
      return Boolean(image && image.complete && image.naturalWidth > 500);
    }, undefined, { timeout: 15000 });

    await assertNoHorizontalOverflow(mobile, 'Mobile');
    const menuToggle = mobile.getByRole('button', { name: 'Toggle navigation menu' });
    await menuToggle.click();
    await mobile.locator('#mobile-navigation').waitFor({ state: 'visible' });
    assert.ok(await mobile.locator('#mobile-navigation').getByRole('link', { name: 'Speakers' }).isVisible());
    await mobile.getByRole('button', { name: 'Toggle navigation menu' }).click();

    await moveThroughSections(mobile);
    assert.equal(mobileErrors.length, 0, 'Mobile runtime errors: ' + mobileErrors.join(' | '));
    await mobile.screenshot({ path: 'artifacts/homepage/mobile.png', fullPage: true });
    console.log('PASS mobile: responsive hero, mobile navigation and no horizontal overflow');

    await mobileContext.close();
    await desktop.close();
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
