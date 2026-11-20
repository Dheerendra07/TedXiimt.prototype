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

    const initialCards = await page.locator('.ted-reel-card').evaluateAll((cards) =>
      cards.map((card) => {
        const video = card.querySelector('video');
        const bounds = card.getBoundingClientRect();

        return {
          number: card.querySelector('.ted-reel-index')?.textContent?.trim(),
          width: Math.round(bounds.width),
          height: Math.round(bounds.height),
          aspectRatio: Number((bounds.width / bounds.height).toFixed(3)),
          source: video.currentSrc || video.src,
          preload: video.preload,
          playControl: Boolean(card.querySelector('.ted-reel-toggle')),
          soundControl: Boolean(card.querySelector('.ted-reel-sound-toggle')),
        };
      }),
    );

    const pageWidth = await page.evaluate(() => document.documentElement.scrollWidth);

    assert(initialCards.length === 4, viewport.name + ': expected four reel cards');
    assert(initialCards.every((card) => card.width > 0 && card.height > 0), viewport.name + ': a reel card has no visible size');
    assert(initialCards.every((card) => card.playControl && card.soundControl), viewport.name + ': playback or sound control is missing');
    assert(initialCards.every((card) => card.source.includes('/' + (Number(card.number.slice(0, 2)) ) + '.mp4')), viewport.name + ': an original local reel source is missing');
    assert(pageWidth <= viewport.width, viewport.name + ': homepage has horizontal overflow');

    const loadedClips = [];

    // Load and decode each original clip only after an explicit Play action.
    // This respects preload="metadata" and avoids forcing all video downloads on page entry.
    for (let index = 0; index < 4; index += 1) {
      const card = page.locator('.ted-reel-card').nth(index);
      await card.locator('.ted-reel-toggle').click();

      await page.waitForFunction((videoIndex) => {
        const video = document.querySelectorAll('.ted-reel-video')[videoIndex];
        return video && ((video.readyState >= 2 && !video.paused) || video.error);
      }, index, { timeout: 45000 });

      const clip = await card.locator('video').evaluate((video) => ({
        readyState: video.readyState,
        duration: video.duration,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        mediaError: video.error ? video.error.code : null,
        paused: video.paused,
      }));

      assert(clip.mediaError === null, viewport.name + ': reel ' + (index + 1) + ' reported a media error');
      assert(clip.readyState >= 2 && !clip.paused, viewport.name + ': reel ' + (index + 1) + ' did not decode and start');
      assert(Number.isFinite(clip.duration) && clip.duration > 0, viewport.name + ': reel ' + (index + 1) + ' has invalid duration metadata');
      assert(clip.videoWidth > 0 && clip.videoHeight > 0, viewport.name + ': reel ' + (index + 1) + ' has no decoded video dimensions');

      loadedClips.push({
        ...clip,
        number: String(index + 1).padStart(2, '0'),
      });

      // Keep a decoded still frame in the card for a useful visual screenshot.
      await card.locator('video').evaluate((video) => video.pause());
      await page.waitForFunction((videoIndex) => {
        const video = document.querySelectorAll('.ted-reel-video')[videoIndex];
        return video && video.paused;
      }, index);
    }

    await section.screenshot({
      path: outputDir + '/reels-' + viewport.name + '.png',
      animations: 'disabled',
    });

    const firstCard = page.locator('.ted-reel-card').nth(0);
    const secondCard = page.locator('.ted-reel-card').nth(1);
    const firstVideo = firstCard.locator('video');
    const secondVideo = secondCard.locator('video');
    const firstPlay = firstCard.locator('.ted-reel-toggle');
    const secondPlay = secondCard.locator('.ted-reel-toggle');

    await firstPlay.click();
    await page.waitForFunction(() => {
      const video = document.querySelector('.ted-reel-card:nth-child(1) video');
      return video && !video.paused;
    }, null, { timeout: 10000 });

    assert(await firstVideo.evaluate((video) => !video.paused), viewport.name + ': first reel did not start');
    assert(await firstCard.locator('.ted-reel-toggle').getAttribute('aria-pressed') === 'true', viewport.name + ': first reel play state was not announced');

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

    const secondToggle = secondCard.locator('.ted-reel-toggle');
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

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForFunction(() => document.querySelector('.ted-reel-card:nth-child(2) video')?.paused, null, { timeout: 10000 });
    assert(await secondVideo.evaluate((video) => video.paused), viewport.name + ': active reel kept playing after leaving the section');

    assert(pageErrors.length === 0, viewport.name + ': browser runtime errors: ' + pageErrors.join('; '));

    console.log(JSON.stringify({
      viewport: viewport.name,
      reducedMotion: viewport.reducedMotion,
      initialCards,
      loadedClips,
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
