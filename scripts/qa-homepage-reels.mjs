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
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const assert = (condition, message) => { if (!condition) throw new Error(message); };

try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height }, deviceScaleFactor: 1 });
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    const section = page.locator('#home-highlights > section');
    await section.waitFor({ state: 'attached', timeout: 30000 });
    await section.scrollIntoViewIfNeeded();

    const clips = await page.locator('#home-highlights video').evaluateAll((videos) => videos.map((video) => ({
      source: new URL(video.src).pathname,
      preload: video.preload,
      paused: video.paused,
      autoplay: video.autoplay,
      playButton: Boolean(video.parentElement?.querySelector('button[aria-label^="Play reel"]')),
    })));
    assert(clips.length === 4, viewport.name + ': the original 4 local event clips should remain unchanged');
    assert(clips.every((clip, index) => clip.source === '/' + (index + 1) + '.mp4'), viewport.name + ': an original local clip path has changed');
    assert(clips.every((clip) => clip.preload === 'metadata' && clip.paused && !clip.autoplay), viewport.name + ': clips must stay idle until a visitor starts playback');
    assert(clips.every((clip) => clip.playButton), viewport.name + ': original explicit Play buttons are missing');

    const firstVideo = page.locator('#home-highlights video').nth(0);
    const secondVideo = page.locator('#home-highlights video').nth(1);
    await page.locator('#home-highlights button[aria-label="Play reel 1"]').click();
    await page.waitForFunction(() => {
      const video = document.querySelector('#home-highlights video');
      return video && !video.paused && video.readyState >= 2;
    }, undefined, { timeout: 20000 });
    assert(await firstVideo.evaluate((video) => !video.paused), viewport.name + ': first original clip did not start');

    await page.locator('#home-highlights button[aria-label="Play reel 2"]').click();
    await page.waitForFunction(() => {
      const videos = document.querySelectorAll('#home-highlights video');
      return videos.length === 4 && videos[0].paused && !videos[1].paused;
    }, undefined, { timeout: 20000 });
    assert(await firstVideo.evaluate((video) => video.paused), viewport.name + ': the first clip was not paused when the second started');
    assert(await secondVideo.evaluate((video) => !video.paused), viewport.name + ': the second original clip did not start');

    await secondVideo.focus();
    await page.keyboard.press('Space');
    await page.waitForFunction(() => document.querySelectorAll('#home-highlights video')[1]?.paused);
    assert(await secondVideo.evaluate((video) => video.paused), viewport.name + ': keyboard Space did not pause the active clip');

    await page.locator('#home-highlights button[aria-label="Play reel 2"]').click();
    await page.waitForFunction(() => {
      const video = document.querySelectorAll('#home-highlights video')[1];
      return video && !video.paused;
    }, undefined, { timeout: 10000 });

    await section.screenshot({ path: outputDir + '/reels-' + viewport.name + '.png', animations: 'disabled' });
    assert(pageErrors.length === 0, viewport.name + ': browser runtime errors: ' + pageErrors.join('; '));
    console.log(JSON.stringify({ viewport: viewport.name, clips, singleActivePlayback: true, keyboardPause: true, pageErrors }));
    await page.close();
  }
} finally {
  await browser.close();
}
console.log('Original IIMT clip behavior browser QA passed.');
