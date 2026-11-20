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
    await page.locator('.ted-page-progress').waitFor({ state: 'attached', timeout: 30000 });
    await page.locator('.tedx-hero').waitFor({ state: 'attached', timeout: 30000 });

    const metadata = await page.evaluate(() => ({
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.content || '',
      openGraphTitle: document.querySelector('meta[property="og:title"]')?.content || '',
      openGraphDescription: document.querySelector('meta[property="og:description"]')?.content || '',
      openGraphUrl: document.querySelector('meta[property="og:url"]')?.content || '',
      canonical: document.querySelector('link[rel="canonical"]')?.href || '',
      favicon: document.querySelector('link[rel="icon"]')?.getAttribute('href') || '',
    }));

    assert(metadata.title.includes('TEDxIIMT'), viewport.name + ': document title was not set by the router');
    assert(metadata.description.length > 30, viewport.name + ': description metadata is missing');
    assert(metadata.openGraphTitle === metadata.title, viewport.name + ': Open Graph title is stale');
    assert(metadata.openGraphDescription === metadata.description, viewport.name + ': Open Graph description is stale');
    assert(metadata.openGraphUrl.startsWith(baseUrl), viewport.name + ': Open Graph URL does not match the current page');
    assert(metadata.canonical.startsWith(baseUrl), viewport.name + ': canonical URL does not match the current page');
    assert(metadata.favicon === '/favicon.svg', viewport.name + ': production favicon path is not configured');

    const faviconResponse = await page.request.get(new URL(metadata.favicon, baseUrl).href);
    assert(faviconResponse.ok(), viewport.name + ': favicon asset does not load in the production build');

    const progressFill = page.locator('.ted-page-progress__fill');
    const startProgress = await progressFill.evaluate((element) =>
      Number(element.style.getPropertyValue('--page-progress') || 0)
    );
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
    await page.waitForFunction(() => {
      const fill = document.querySelector('.ted-page-progress__fill');
      return Number(fill?.style.getPropertyValue('--page-progress') || 0) > 0.97;
    }, undefined, { timeout: 10000 });
    const endProgress = await progressFill.evaluate((element) =>
      Number(element.style.getPropertyValue('--page-progress') || 0)
    );

    assert(startProgress < 0.05, viewport.name + ': scroll progress should start near zero');
    assert(endProgress > 0.97 && endProgress <= 1, viewport.name + ': scroll progress does not reach the page end');

    if (viewport.name === 'mobile') {
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      const toggle = page.locator('.ted-mobile-menu-toggle');
      assert(await toggle.getAttribute('aria-label') === 'Open navigation menu', 'mobile: navigation toggle label is incorrect before opening');
      await toggle.click();

      await page.waitForFunction(() => {
        const menu = document.getElementById('mobile-navigation');
        return menu && document.body.style.overflow === 'hidden' && menu.contains(document.activeElement);
      }, undefined, { timeout: 10000 });

      const expandedWhileOpen = await toggle.getAttribute('aria-expanded');
      const focusInsideMenu = await page.locator('#mobile-navigation').evaluate((menu) => menu.contains(document.activeElement));
      assert(expandedWhileOpen === 'true', 'mobile: menu toggle did not expose its expanded state');
      assert(focusInsideMenu, 'mobile: opening the drawer did not move focus into navigation');

      await page.keyboard.press('Escape');
      await page.waitForFunction(() => {
        const toggleButton = document.querySelector('.ted-mobile-menu-toggle');
        return document.body.style.overflow !== 'hidden'
          && toggleButton?.getAttribute('aria-expanded') === 'false'
          && document.activeElement === toggleButton;
      }, undefined, { timeout: 10000 });

      const expandedAfterClose = await toggle.getAttribute('aria-expanded');
      assert(expandedAfterClose === 'false', 'mobile: Escape did not close the navigation drawer');
    }

    const pageWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    assert(pageWidth <= viewport.width, viewport.name + ': homepage has horizontal overflow');

    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(180);
    await page.locator('header').screenshot({
      path: outputDir + '/premium-header-' + viewport.name + '.png',
      animations: 'disabled',
    });

    assert(pageErrors.length === 0, viewport.name + ': browser runtime errors: ' + pageErrors.join('; '));
    console.log(JSON.stringify({
      viewport: viewport.name,
      metadata,
      startProgress,
      endProgress,
      pageWidth,
      viewportWidth: viewport.width,
      pageErrors,
      mobileDrawerVerified: viewport.name === 'mobile',
    }));
    await page.close();
  }
} finally {
  await browser.close();
}
console.log('Homepage navigation, metadata, favicon and scroll-progress QA passed.');
