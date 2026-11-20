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
  { name: 'desktop', width: 1440, height: 900, reducedMotion: 'no-preference' },
  { name: 'mobile', width: 390, height: 844, reducedMotion: 'reduce' },
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
    await page.emulateMedia({ reducedMotion: viewport.reducedMotion });

    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

    const section = page.locator('.ted-reels-section');
    await section.waitFor({ state: 'attached', timeout: 30000 });

    await section.scrollIntoViewIfNeeded();
    await page.waitForFunction(() => {
      const videos = [...document.querySelectorAll('.ted-reel-video')];
      return videos.length === 4 && videos.every((video) => video.readyState >= 2 || video.error);
    }, null, { timeout: 60000 });

    const cardData = await page.locator('.ted-reel-card').evaluateAll((cards) =>
      cards.map((card) => {
        const video = card.querySelector('video');
        const bounds = card.getBoundingClientRect();
        const playButton = card.querySelector('.ted-reel-toggle');
        const soundButton = card.querySelector('.ted-reel-sound-toggle');

        return {
          number: card.querySelector('.ted-reel-index')?.textContent?.trim(),
          width: Math.round(bounds.width),
          height: Math.round(bounds.height),
          aspectRatio: Number((bounds.width / bounds.height).toFixed(3)),
          source: video.currentSrc || video.src,
          readyState: video.readyState,
          duration: video.duration,
          videoWidth: video.videoWidth,
          videoHeight: video.videoHeight,
          mediaError: video.error ? video.error.code : null,
          playControl: Boolean(playButton),
          soundControl: Boolean(soundButton),
        };
      }),
    );

    const pageWidth = await page.evaluate(() => document.documentElement.scrollWidth);

    assert(cardData.length === 4, viewport.name + ': expected four reel cards');
    assert(cardData.every((card) => card.readyState >= 2), viewport.name + ': one or more reel previews did not load');
    assert(cardData.every((card) => card.mediaError === null), viewport.name + ': one or more reel files reported a media error');
    assert(cardData.every((card) => Number.isFinite(card.duration) && card.duration > 0), viewport.name + ': a reel has invalid duration metadata');
    assert(cardData.every((card) => card.videoWidth > 0 && card.videoHeight > 0), viewport.name + ': a reel has no decoded video dimensions');
    assert(cardData.every((card) => card.width > 0 && card.height > 0), viewport.name + ': a reel card has no visible size');
    assert(cardData.every((card) => card.playControl && card.soundControl), viewport.name + ': playback or sound control is missing');
    assert(pageWidth <= viewport.width, viewport.name + ': homepage has horizontal overflow');

    await section.screenshot({
      path: outputDir + '/reels-' + viewport.name + '.png',
      animations: 'disabled',
    });

    const firstVideo = page.locator('.ted-reel-card').nth(0).locator('video');
    const secondVideo = page.locator('.ted-reel-card').nth(1).locator('video');
    const firstPlay = page.getByRole('button', { name: 'Play reel 01' });
    const secondPlay = page.getByRole('button', { name: 'Play reel 02' });

    await firstPlay.click();
    await page.waitForFunction(() => {
      const video = document.querySelector('.ted-reel-card:nth-child(1) video');
      return video && !video.paused;
    }, null, { timeout: 10000 });

    assert(await firstVideo.evaluate((video) => !video.paused), viewport.name + ': first reel did not start');
    assert(await page.getByRole('button', { name: 'Pause reel 01' }).getAttribute('aria-pressed') === 'true', viewport.name + ': first reel play state was not announced');

    await secondPlay.click();
    await page.waitForFunction(() => {
      const first = document.querySelector('.ted-reel-card:nth-child(1) video');
      const second = document.querySelector('.ted-reel-card:nth-child(2) video');
      return first && second && first.paused && !second.paused;
    }, null, { timeout: 10000 });

    assert(await firstVideo.evaluate((video) => video.paused), viewport.name + ': starting the second reel did not pause the first');
    assert(await secondVideo.evaluate((video) => !video.paused), viewport.name + ': second reel did not start');

    await page.getByRole('button', { name: 'Mute reel 02' }).click();
    assert(await secondVideo.evaluate((video) => video.muted), viewport.name + ': sound toggle did not mute the active reel');
    assert(await page.getByRole('button', { name: 'Turn sound on for reel 02' }).count() === 1, viewport.name + ': sound toggle label did not update');

    const secondToggle = page.locator('.ted-reel-card').nth(1).locator('.ted-reel-toggle');
    await secondToggle.focus();
    await page.keyboard.press('Space');
    await page.waitForFunction(() => document.querySelector('.ted-reel-card:nth-child(2) video')?.paused);
    assert(await secondVideo.evaluate((video) => video.paused), viewport.name + ': Space did not pause the focused reel');

    await page.keyboard.press('Enter');
    await page.waitForFunction(() => {
      const video = document.querySelector('.ted-reel-card:nth-child(2) video');
      return video && !video.paused;
    }, null, { timeout: 10000 });
    assert(await secondVideo.evaluate((video) => !video.paused), viewport.name + ': Enter did not resume the focused reel');

    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForFunction(() => document.querySelector('.ted-reel-card:nth-child(2) video')?.paused, null, { timeout: 10000 });
    assert(await secondVideo.evaluate((video) => video.paused), viewport.name + ': active reel kept playing after leaving the section');

    assert(pageErrors.length === 0, viewport.name + ': browser runtime errors: ' + pageErrors.join('; '));

    console.log(JSON.stringify({
      viewport: viewport.name,
      reducedMotion: viewport.reducedMotion,
      cards: cardData,
      pageWidth,
      viewportWidth: viewport.width,
      singleActivePlayback: true,
      soundToggle: true,
      keyboardPlayPause: true,
      pauseOutsideSection: true,
      pageErrors,
    }));

    await page.close();
  }
} finally {
  await browser.close();
}

console.log('Homepage reels browser QA passed.');
