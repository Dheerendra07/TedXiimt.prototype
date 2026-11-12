const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:4173/';

const REGIONS = {
  'india-gate': {
    name: 'INDIA GATE',
    bounds: { left: 0.48, top: 0.42, right: 0.68, bottom: 1 },
  },
  akshardham: {
    name: 'AKSHARDHAM',
    bounds: { left: 0.68, top: 0.52, right: 1, bottom: 1 },
  },
};

async function findVisibleLandmarkPoint(page, region) {
  return page.evaluate(async (definition) => {
    const section = document.querySelector('.tedx-hero');
    const imageLayer = section?.querySelector('[data-mosaic-surface]');
    if (!section || !imageLayer) throw new Error('Night hero artwork layer is missing.');

    const mask = new Image();
    mask.src = '/transparent-hero-bg.PNG';
    await mask.decode();

    const sourceCanvas = document.createElement('canvas');
    sourceCanvas.width = mask.naturalWidth;
    sourceCanvas.height = mask.naturalHeight;
    const sourceContext = sourceCanvas.getContext('2d', { willReadFrequently: true });
    if (!sourceContext) throw new Error('Could not inspect the transparent landmark mask.');
    sourceContext.drawImage(mask, 0, 0);
    const pixels = sourceContext.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height).data;

    const sectionRect = section.getBoundingClientRect();
    const imageRect = imageLayer.getBoundingClientRect();
    const scale = Math.max(imageRect.width / mask.naturalWidth, imageRect.height / mask.naturalHeight);
    const renderedWidth = mask.naturalWidth * scale;
    const renderedHeight = mask.naturalHeight * scale;
    const offsetX = imageRect.left - sectionRect.left + ((imageRect.width - renderedWidth) * 0.5);
    const offsetY = imageRect.top - sectionRect.top + ((imageRect.height - renderedHeight) * 0.58);

    const cellSize = Number.parseFloat(section.style.getPropertyValue('--hero-grid-cell'));
    if (!Number.isFinite(cellSize) || cellSize <= 8) {
      throw new Error('The square-cell grid did not finish measuring.');
    }
    const tileSize = cellSize - 8;
    const textRects = [];
    const roots = [
      ...section.querySelectorAll('[data-mosaic-exclusion]'),
      document.querySelector('header'),
    ].filter(Boolean);
    const range = document.createRange();

    for (const root of [...new Set(roots)]) {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        const parent = node.parentElement;
        if (!parent || !(node.nodeValue || '').trim()) continue;
        if (parent.closest('script, style, noscript, [hidden], [aria-hidden="true"], .sr-only')) continue;

        const tokenPattern = /\S+/gu;
        let token;
        while ((token = tokenPattern.exec(node.nodeValue || ''))) {
          try {
            range.setStart(node, token.index);
            range.setEnd(node, token.index + token[0].length);
            for (const rect of range.getClientRects()) {
              if (rect.width <= 0 || rect.height <= 0) continue;
              textRects.push({
                left: rect.left - sectionRect.left,
                top: rect.top - sectionRect.top,
                right: rect.right - sectionRect.left,
                bottom: rect.bottom - sectionRect.top,
              });
            }
          } catch {
            // Ignore browser-owned text nodes without range geometry.
          }
        }
      }
    }
    range.detach?.();

    const startX = Math.max(0, Math.floor(definition.bounds.left * mask.naturalWidth));
    const endX = Math.min(mask.naturalWidth, Math.ceil(definition.bounds.right * mask.naturalWidth));
    const startY = Math.max(0, Math.floor(definition.bounds.top * mask.naturalHeight));
    const endY = Math.min(mask.naturalHeight, Math.ceil(definition.bounds.bottom * mask.naturalHeight));

    for (let sourceY = startY; sourceY < endY; sourceY += 2) {
      for (let sourceX = startX; sourceX < endX; sourceX += 2) {
        const alpha = pixels[((sourceY * mask.naturalWidth) + sourceX) * 4 + 3];
        if (alpha <= 24) continue;

        const localX = offsetX + ((sourceX + 0.5) * scale);
        const localY = offsetY + ((sourceY + 0.5) * scale);
        if (localX < 0 || localY < 0 || localX >= sectionRect.width || localY >= sectionRect.height) continue;

        const column = Math.floor(localX / cellSize);
        const row = Math.floor(localY / cellSize);
        const tile = {
          left: (column * cellSize) + 4,
          top: (row * cellSize) + 4,
          right: (column * cellSize) + 4 + tileSize,
          bottom: (row * cellSize) + 4 + tileSize,
        };
        const overlapsText = textRects.some((rect) => (
          tile.left < rect.right + 2 && tile.right > rect.left - 2 &&
          tile.top < rect.bottom + 2 && tile.bottom > rect.top - 2
        ));
        if (overlapsText) continue;

        return {
          x: sectionRect.left + localX,
          y: sectionRect.top + localY,
          sourceX,
          sourceY,
          alpha,
          cellSize,
        };
      }
    }

    throw new Error('No visible, text-free mask point found for ' + definition.name + '.');
  }, region);
}

async function assertReveal(page, region, interaction) {
  await page.waitForFunction(() => (
    document.querySelector('.tedx-hero')?.dataset.monumentMaskReady === 'true'
  ), undefined, { timeout: 15000 });

  await page.waitForFunction(() => {
    const mask = document.querySelector('[data-mosaic-surface]');
    return Boolean(mask && getComputedStyle(mask).backgroundImage.includes('hero-bg.png'));
  }, { timeout: 10000 });

  const point = await findVisibleLandmarkPoint(page, region);
  if (interaction === 'touch') {
    await page.touchscreen.tap(point.x, point.y);
  } else {
    await page.mouse.move(point.x, point.y);
  }

  const quote = page.locator('.tedx-hero__quote-card').filter({ hasText: region.name });
  await quote.waitFor({ state: 'visible', timeout: 5000 });

  const revealHasPixels = await page.evaluate(({ x, y }) => {
    const section = document.querySelector('.tedx-hero');
    const canvas = section?.querySelector('.tedx-hero__colour-reveal');
    if (!section || !canvas) return false;
    const rect = section.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const pixelX = Math.max(0, Math.min(canvas.width - 1, Math.floor((x - rect.left) * scaleX)));
    const pixelY = Math.max(0, Math.min(canvas.height - 1, Math.floor((y - rect.top) * scaleY)));
    const context = canvas.getContext('2d', { willReadFrequently: true });
    return Boolean(context && context.getImageData(pixelX, pixelY, 1, 1).data[3] > 0);
  }, point);

  assert.equal(revealHasPixels, true, region.name + ' quote appeared without a coloured monument reveal.');
  console.log('PASS ' + interaction + ': ' + region.name + ' (' + point.sourceX + ', ' + point.sourceY + ')');
}

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await desktop.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await desktop.locator('.tedx-hero').waitFor({ state: 'visible' });
    await assertReveal(desktop, REGIONS['india-gate'], 'mouse');

    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 1,
      isMobile: true,
      hasTouch: true,
    });
    const mobile = await mobileContext.newPage();
    await mobile.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await mobile.locator('.tedx-hero').waitFor({ state: 'visible' });
    await assertReveal(mobile, REGIONS.akshardham, 'touch');
    await mobileContext.close();
    await desktop.close();
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
