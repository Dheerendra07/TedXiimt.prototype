import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, CalendarDays, MapPin } from 'lucide-react';
import api from '../services/api';

const HERO_ARTWORK = '/transparent-hero-bg.PNG';
const HERO_BACKGROUND = '/hero-bg.png';
const MOSAIC_PALETTE = [
  '#EB0028', // TED red
  '#B10E2E', // deep crimson
  '#650F27', // oxblood
  '#A64C60', // muted rose
  '#C1BEC3', // soft silver
  '#6B6570', // graphite plum
  '#3A303A', // charcoal plum
];

// Fixed, deliberately arranged cells: a broken diagonal path with a few
// clustered squares, matching the supplied reference without random placement.
const MOSAIC_ACCENTS = [
  { column: 1, row: 4, width: 1, height: 1, color: 2, opacity: 0.34 },
  { column: 15, row: 0, width: 2, height: 2, color: 2, opacity: 0.28 },
  { column: 18, row: 2, width: 1, height: 1, color: 1, opacity: 0.22 },
  { column: 27, row: 3, width: 1, height: 1, color: 0, opacity: 0.62 },
  { column: 31, row: 5, width: 1, height: 1, color: 5, opacity: 0.28 },
  { column: 35, row: 7, width: 1, height: 1, color: 0, opacity: 0.72 },
  { column: 38, row: 9, width: 2, height: 1, color: 1, opacity: 0.5 },
  { column: 42, row: 10, width: 1, height: 1, color: 0, opacity: 0.76 },
  { column: 45, row: 12, width: 2, height: 2, color: 1, opacity: 0.58 },
  { column: 41, row: 13, width: 1, height: 1, color: 4, opacity: 0.32 },
  { column: 38, row: 14, width: 2, height: 2, color: 0, opacity: 0.58 },
  { column: 35, row: 16, width: 1, height: 1, color: 3, opacity: 0.42 },
  { column: 39, row: 17, width: 1, height: 2, color: 0, opacity: 0.76 },
  { column: 43, row: 18, width: 2, height: 2, color: 2, opacity: 0.64 },
  { column: 31, row: 19, width: 1, height: 1, color: 4, opacity: 0.26 },
  { column: 26, row: 20, width: 2, height: 1, color: 3, opacity: 0.32 },
  { column: 22, row: 22, width: 1, height: 1, color: 2, opacity: 0.3 },
  { column: 16, row: 23, width: 1, height: 1, color: 0, opacity: 0.26 },
  { column: 5, row: 20, width: 1, height: 1, color: 5, opacity: 0.2 },
  { column: 2, row: 10, width: 1, height: 1, color: 0, opacity: 0.38 },
];


const MONUMENT_REGIONS = [
  {
    id: 'lotus',
    name: 'LOTUS TEMPLE',
    bounds: { left: 0, top: 0.61, right: 0.23, bottom: 0.86 },
    anchor: [0.12, 0.77],
    colour: '#788D98',
    source: 'https://sahbaarchitect.com/lotus/',
    quotes: [
      { text: 'One of the most remarkable achievements of our time, proving that the drive and vision of spirit can achieve miracles.', attribution: 'Arthur Erickson · Canadian architect' },
      { text: 'People visiting here, will find intense joy, love and peace.', attribution: 'Pandit Ravi Shankar' },
    ],
  },
  {
    id: 'qutub',
    name: 'QUTUB MINAR',
    bounds: { left: 0.275, top: 0.29, right: 0.35, bottom: 0.86 },
    anchor: [0.28, 0.69],
    colour: '#9B7058',
    source: 'https://ignca.gov.in/Asi_data/41873.pdf',
    quotes: [
      { text: 'May the inscrutable Creator preserve it from all calamities.', attribution: 'Qutub Minar inscription · 1369 translation' },
      { text: 'Built this portion of the edifice with care.', attribution: 'Qutub Minar inscription · 1369 translation' },
    ],
  },
  {
    id: 'humayun',
    name: "HUMAYUN’S TOMB",
    bounds: { left: 0.35, top: 0.64, right: 0.48, bottom: 0.86 },
    anchor: [0.47, 0.77],
    colour: '#8C6258',
    source: 'https://whc.unesco.org/en/list/232/',
    quotes: [
      { text: 'The first garden-tomb on the Indian subcontinent.', attribution: 'UNESCO World Heritage Centre' },
      { text: 'The first of the grand dynastic mausoleums that were to become synonyms of Mughal architecture.', attribution: 'UNESCO World Heritage Centre' },
    ],
  },
  {
    id: 'india-gate',
    name: 'INDIA GATE',
    bounds: { left: 0.48, top: 0.42, right: 0.68, bottom: 0.86 },
    anchor: [0.575, 0.69],
    colour: '#A39478',
    source: 'https://www.mea.gov.in/Uploads/PublicationDocs/23460_IWM_Book__11-06-2014_.pdf',
    quotes: [
      { text: 'To the dead of the Indian Armies who fell and are honoured…', attribution: 'India Gate memorial inscription' },
      { text: '…and in Sacred Memory also of those whose names are here recorded.', attribution: 'India Gate memorial inscription' },
    ],
  },
  {
    id: 'akshardham',
    name: 'AKSHARDHAM',
    bounds: { left: 0.68, top: 0.52, right: 1, bottom: 0.86 },
    anchor: [0.835, 0.74],
    colour: '#9A825F',
    source: 'https://akshardham.com/',
    quotes: [
      { text: 'Each soul is potentially divine.', attribution: 'Akshardham · Spiritual premise' },
      { text: 'Each service can help one move towards divinity.', attribution: 'Akshardham · Spiritual premise' },
    ],
  },
];

const Hero = () => {
  const prefersReducedMotion = useReducedMotion();
  const heroRef = useRef(null);
  const trailCanvasRef = useRef(null);
  const colourRevealCanvasRef = useRef(null);
  const [countdown, setCountdown] = useState(null);
  const [monumentCards, setMonumentCards] = useState({});
  const [editionData, setEditionData] = useState({
    theme: 'Break the Flow',
    date: '2025-11-11T09:00:00',
    attendee_capacity: 350,
    speaker_count: 10,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchActiveEdition = async () => {
      try {
        const data = await api.get('/api/editions/events/active/');
        if (isMounted && data) {
          setEditionData({
            theme: data.theme || 'Break the Flow',
            date: data.date ? data.date + 'T09:00:00' : '2025-11-11T09:00:00',
            attendee_capacity: data.attendee_capacity || 350,
            speaker_count: data.speaker_count || (Array.isArray(data.speakers) ? data.speakers.length : 10),
          });
        }
      } catch (error) {
        console.warn('[TEDx hero] Active edition could not be loaded:', error);
      }
    };

    fetchActiveEdition();
    return () => {
      isMounted = false;
    };
  }, []);

  // The tile lattice is intentionally fixed to the supplied reference.
  // The square-cell trail stays on open hero space; hovering artwork reveals its full monument.
  useEffect(() => {
    if (prefersReducedMotion) return undefined;

    const section = heroRef.current;
    const canvas = trailCanvasRef.current;
    const revealCanvas = colourRevealCanvasRef.current;
    const imageLayer = section?.querySelector('[data-mosaic-surface]');
    if (!section || !canvas || !revealCanvas || !imageLayer) return undefined;

    const context = canvas.getContext('2d', { alpha: true });
    const revealContext = revealCanvas.getContext('2d', { alpha: true });
    if (!context || !revealContext) return undefined;

    const MIN_CELL_SIZE = 30;
    const MAX_CELL_SIZE = 40;
    const CELL_INSET = 4;
    const REVEAL_MS = 80;
    const HOLD_MS = 680;
    const ERASE_MS = 280;
    const MAX_ACTIVE_CELLS = 180;

    let width = 0;
    let height = 0;
    let cellSize = 40;
    let tileSize = cellSize - (CELL_INSET * 2);
    let pixelRatio = 1;
    let animationFrame = 0;
    let maskRefreshFrame = 0;
    let settleTimer = 0;
    let previousCell = null;
    let artworkMask = null;
    let coverTransform = null;
    let sourceArtwork = null;
    let backgroundArtwork = null;
    let maskPixels = null;
    const colourCanvas = document.createElement('canvas');
    const colourContext = colourCanvas.getContext('2d');
    let disposed = false;
    let gridReady = false;
    let gridColumns = 0;
    let gridRows = 0;

    const cells = new Map();
    const textBlockedCells = new Set();
    const regionCells = new Map();
    const regionTimers = new Map();
    const regionQuoteIndexes = new Map();
    let currentRegionId = null;
    let fadingRegionId = null;
    let regionTransitionStartedAt = 0;
    let revealAnimationFrame = 0;
    let currentRegionQuoteShown = false;

    MONUMENT_REGIONS.forEach((region) => {
      regionCells.set(region.id, new Set());
      regionQuoteIndexes.set(region.id, 0);
    });

    const clearRegionReveal = () => {
      currentRegionId = null;
      fadingRegionId = null;
      currentRegionQuoteShown = false;
      regionTimers.forEach((timer) => window.clearTimeout(timer));
      regionTimers.clear();
      setMonumentCards({});
      revealContext.clearRect(0, 0, width, height);
      if (revealAnimationFrame) {
        window.cancelAnimationFrame(revealAnimationFrame);
        revealAnimationFrame = 0;
      }
    };
    const easeOutCubic = (value) => 1 - Math.pow(1 - value, 3);
    const smoothStep = (value) => value * value * (3 - (2 * value));

    const buildArtworkMask = (image) => {
      const maskWidth = image.naturalWidth;
      const maskHeight = image.naturalHeight;
      if (!maskWidth || !maskHeight) return null;
      return { width: maskWidth, height: maskHeight };
    };

    const updateCoverTransform = () => {
      if (!artworkMask) {
        coverTransform = null;
        return;
      }

      const sectionRect = section.getBoundingClientRect();
      const imageRect = imageLayer.getBoundingClientRect();

      // Match the visible background's cover crop exactly, including its
      // slightly raised vertical position, so cursor tiles never cross art.
      const coverScale = Math.max(
        imageRect.width / artworkMask.width,
        imageRect.height / artworkMask.height
      );
      const renderedWidth = artworkMask.width * coverScale;
      const renderedHeight = artworkMask.height * coverScale;
      const horizontalCrop = (imageRect.width - renderedWidth) * 0.5;
      const verticalCrop = (imageRect.height - renderedHeight) * 0.58;

      coverTransform = {
        scaleX: coverScale,
        scaleY: coverScale,
        offsetX: imageRect.left - sectionRect.left + horizontalCrop,
        offsetY: imageRect.top - sectionRect.top + verticalCrop,
      };
    };

    const rebuildColourLayer = () => {
      if (!sourceArtwork || !backgroundArtwork || !artworkMask || !coverTransform || !colourContext) return;

      colourCanvas.width = Math.max(1, Math.round(width * pixelRatio));
      colourCanvas.height = Math.max(1, Math.round(height * pixelRatio));
      colourContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      colourContext.clearRect(0, 0, width, height);

      // Start with the full night panorama so COLOR blending works against
      // real luminance rather than transparent pixels.
      colourContext.drawImage(
        backgroundArtwork,
        coverTransform.offsetX,
        coverTransform.offsetY,
        artworkMask.width * coverTransform.scaleX,
        artworkMask.height * coverTransform.scaleY
      );

      MONUMENT_REGIONS.forEach((region) => {
        const left = coverTransform.offsetX + (region.bounds.left * artworkMask.width * coverTransform.scaleX);
        const top = coverTransform.offsetY + (region.bounds.top * artworkMask.height * coverTransform.scaleY);
        const right = coverTransform.offsetX + (region.bounds.right * artworkMask.width * coverTransform.scaleX);
        const bottom = coverTransform.offsetY + (region.bounds.bottom * artworkMask.height * coverTransform.scaleY);
        colourContext.save();
        colourContext.beginPath();
        colourContext.rect(left, top, right - left, bottom - top);
        colourContext.clip();
        colourContext.globalCompositeOperation = 'color';
        colourContext.globalAlpha = 0.78;
        colourContext.fillStyle = region.colour;
        colourContext.fillRect(left, top, right - left, bottom - top);
        colourContext.restore();
      });

      // Reapply the original alpha only after tinting. This keeps the exact
      // monument silhouettes and prevents coloured rectangular hit regions.
      colourContext.globalAlpha = 1;
      colourContext.globalCompositeOperation = 'destination-in';
      colourContext.drawImage(
        sourceArtwork,
        coverTransform.offsetX,
        coverTransform.offsetY,
        artworkMask.width * coverTransform.scaleX,
        artworkMask.height * coverTransform.scaleY
      );
      colourContext.globalCompositeOperation = 'source-over';

      try {
        maskPixels = colourContext.getImageData(0, 0, colourCanvas.width, colourCanvas.height).data;
      } catch (error) {
        maskPixels = null;
        console.warn('[TEDx hero] Landmark hit-testing is unavailable.', error);
      }
    };
    const collectVisibleTextRects = () => {
      const sectionBounds = section.getBoundingClientRect();
      const roots = [
        ...section.querySelectorAll('[data-mosaic-exclusion]'),
        document.querySelector('header'),
      ].filter(Boolean);
      const rects = [];
      const range = document.createRange();

      [...new Set(roots)].forEach((root) => {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        let textNode;

        while ((textNode = walker.nextNode())) {
          const parent = textNode.parentElement;
          const value = textNode.nodeValue || '';
          if (!parent || !value.trim()) continue;
          if (parent.closest('script, style, noscript, [hidden], [aria-hidden="true"], .sr-only')) continue;

          let hidden = false;
          let ancestor = parent;
          while (ancestor && root.contains(ancestor)) {
            const style = window.getComputedStyle(ancestor);
            if (style.display === 'none' || style.visibility === 'hidden') {
              hidden = true;
              break;
            }
            if (ancestor === root) break;
            ancestor = ancestor.parentElement;
          }
          if (hidden) continue;

          const tokenPattern = /\S+/gu;
          let token;
          while ((token = tokenPattern.exec(value))) {
            try {
              range.setStart(textNode, token.index);
              range.setEnd(textNode, token.index + token[0].length);
              const tokenRects = range.getClientRects();

              for (let index = 0; index < tokenRects.length; index += 1) {
                const rect = tokenRects[index];
                if (
                  rect.width <= 0 || rect.height <= 0 ||
                  rect.right <= sectionBounds.left || rect.left >= sectionBounds.right ||
                  rect.bottom <= sectionBounds.top || rect.top >= sectionBounds.bottom
                ) continue;

                rects.push({
                  left: rect.left - sectionBounds.left,
                  top: rect.top - sectionBounds.top,
                  right: rect.right - sectionBounds.left,
                  bottom: rect.bottom - sectionBounds.top,
                });
              }
            } catch {
              // Some browser-owned or SVG text nodes do not expose Range geometry.
            }
          }
        }
      });

      range.detach?.();
      return rects;
    };

    const rebuildGridMasks = () => {
      textBlockedCells.clear();
      gridReady = false;

      const bounds = section.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      gridColumns = Math.ceil(width / cellSize);
      gridRows = Math.ceil(height / cellSize);
      if (!artworkMask || !coverTransform || !gridColumns || !gridRows) return;

      const textRects = collectVisibleTextRects();
      regionCells.forEach((regionSet) => regionSet.clear());
      for (let row = 0; row < gridRows; row += 1) {
        for (let column = 0; column < gridColumns; column += 1) {
          const key = column + ':' + row;
          const left = (column * cellSize) + CELL_INSET;
          const top = (row * cellSize) + CELL_INSET;
          const right = left + tileSize;
          const bottom = top + tileSize;

          if (textRects.some((rect) => (
            left < rect.right + 2 && right > rect.left - 2 &&
            top < rect.bottom + 2 && bottom > rect.top - 2
          ))) {
            textBlockedCells.add(key);
            continue;
          }

          if (!maskPixels) continue;

          // A cell counts only when its tile samples the original opaque artwork
          // inside one known landmark region. Empty background cells never count.
          MONUMENT_REGIONS.forEach((region) => {
            // Dense sampling prevents a square tile from slipping across narrow
            // monument edges or the thinner lotus petals.
            const samples = [0.1, 0.3, 0.5, 0.7, 0.9];
            let touchesArtwork = false;
            for (let sampleY = 0; sampleY < samples.length && !touchesArtwork; sampleY += 1) {
              for (let sampleX = 0; sampleX < samples.length; sampleX += 1) {
                const pointX = left + (tileSize * samples[sampleX]);
                const pointY = top + (tileSize * samples[sampleY]);
                const sourceX = (pointX - coverTransform.offsetX) / coverTransform.scaleX;
                const sourceY = (pointY - coverTransform.offsetY) / coverTransform.scaleY;
                const normalX = sourceX / artworkMask.width;
                const normalY = sourceY / artworkMask.height;
                if (
                  normalX < region.bounds.left || normalX > region.bounds.right ||
                  normalY < region.bounds.top || normalY > region.bounds.bottom
                ) continue;

                const pixelX = Math.min(colourCanvas.width - 1, Math.max(0, Math.round(pointX * pixelRatio)));
                const pixelY = Math.min(colourCanvas.height - 1, Math.max(0, Math.round(pointY * pixelRatio)));
                const alphaIndex = ((pixelY * colourCanvas.width) + pixelX) * 4 + 3;
                if (maskPixels[alphaIndex] > 24) {
                  touchesArtwork = true;
                  break;
                }
              }
            }
            if (touchesArtwork) regionCells.get(region.id).add(key);
          });
        }
      }

      gridReady = true;
    };

    const cellIsSafe = (column, row) => {
      if (
        !gridReady || column < 0 || row < 0 ||
        column >= gridColumns || row >= gridRows
      ) return false;

      const left = (column * cellSize) + CELL_INSET;
      const top = (row * cellSize) + CELL_INSET;
      if (left >= width || top >= height) return false;
      const key = column + ':' + row;
      const overMonument = [...regionCells.values()].some((regionSet) => regionSet.has(key));
      return !textBlockedCells.has(key) && !overMonument;
    };

    const showRegionQuote = (region) => {
      const quotes = region.quotes;
      const quoteIndex = regionQuoteIndexes.get(region.id) || 0;
      const quote = quotes[quoteIndex % quotes.length];
      regionQuoteIndexes.set(region.id, (quoteIndex + 1) % quotes.length);

      const anchorX = coverTransform.offsetX + (region.anchor[0] * artworkMask.width * coverTransform.scaleX);
      const anchorY = coverTransform.offsetY + (region.anchor[1] * artworkMask.height * coverTransform.scaleY);
      const card = {
        ...quote,
        source: region.source,
        left: Math.min(width - 120, Math.max(120, anchorX)),
        top: Math.min(height - 90, Math.max(20, anchorY)),
      };
      setMonumentCards({ [region.id]: card });

      const timer = window.setTimeout(() => {
        regionTimers.delete(region.id);
        setMonumentCards((current) => {
          const next = { ...current };
          delete next[region.id];
          return next;
        });
      }, 4200);
      regionTimers.set(region.id, timer);
    };

    const getRegionAtPoint = (localX, localY) => {
      if (!maskPixels || !colourCanvas.width || !colourCanvas.height || !coverTransform || !artworkMask) return null;

      const sourceX = (localX - coverTransform.offsetX) / coverTransform.scaleX;
      const sourceY = (localY - coverTransform.offsetY) / coverTransform.scaleY;
      const normalX = sourceX / artworkMask.width;
      const normalY = sourceY / artworkMask.height;
      const pixelX = Math.min(colourCanvas.width - 1, Math.max(0, Math.floor(localX * pixelRatio)));
      const pixelY = Math.min(colourCanvas.height - 1, Math.max(0, Math.floor(localY * pixelRatio)));
      const alphaIndex = ((pixelY * colourCanvas.width) + pixelX) * 4 + 3;
      if (maskPixels[alphaIndex] < 24) return null;

      return MONUMENT_REGIONS.find((region) => (
        normalX >= region.bounds.left && normalX <= region.bounds.right &&
        normalY >= region.bounds.top && normalY <= region.bounds.bottom
      )) || null;
    };

    const drawRegionReveal = (now) => {
      revealAnimationFrame = 0;
      revealContext.clearRect(0, 0, width, height);

      const regionId = currentRegionId || fadingRegionId;
      if (!regionId || !colourCanvas.width || !colourCanvas.height) return;
      const region = MONUMENT_REGIONS.find((item) => item.id === regionId);
      if (!region) return;

      const progress = Math.min(1, Math.max(0, (now - regionTransitionStartedAt) / 460));
      const opacity = currentRegionId
        ? 1 - Math.pow(1 - progress, 3)
        : Math.pow(1 - progress, 2);
      const left = coverTransform.offsetX + (region.bounds.left * artworkMask.width * coverTransform.scaleX);
      const top = coverTransform.offsetY + (region.bounds.top * artworkMask.height * coverTransform.scaleY);
      const right = coverTransform.offsetX + (region.bounds.right * artworkMask.width * coverTransform.scaleX);
      const bottom = coverTransform.offsetY + (region.bounds.bottom * artworkMask.height * coverTransform.scaleY);

      revealContext.save();
      revealContext.beginPath();
      revealContext.rect(left, top, right - left, bottom - top);
      revealContext.clip();
      revealContext.globalAlpha = opacity;
      revealContext.drawImage(colourCanvas, 0, 0, width, height);
      revealContext.restore();

      if (progress < 1) {
        revealAnimationFrame = window.requestAnimationFrame(drawRegionReveal);
      } else if (!currentRegionId) {
        fadingRegionId = null;
      } else if (!currentRegionQuoteShown) {
        currentRegionQuoteShown = true;
        showRegionQuote(region);
      }
    };

    const setHoveredRegion = (region, now) => {
      const nextId = region?.id || null;
      if (nextId === currentRegionId) return;

      if (nextId) {
        currentRegionId = nextId;
        fadingRegionId = null;
        currentRegionQuoteShown = false;
        regionTransitionStartedAt = now;
        regionTimers.forEach((timer) => window.clearTimeout(timer));
        regionTimers.clear();
        setMonumentCards({});
        if (!revealAnimationFrame) {
          revealAnimationFrame = window.requestAnimationFrame(drawRegionReveal);
        }
        return;
      }

      if (currentRegionId) {
        fadingRegionId = currentRegionId;
        currentRegionId = null;
        regionTransitionStartedAt = now;
        if (!revealAnimationFrame) {
          revealAnimationFrame = window.requestAnimationFrame(drawRegionReveal);
        }
      }
    };

    const activateCell = (column, row, enteredAt) => {
      if (!cellIsSafe(column, row)) return;

      const key = column + ':' + row;
      cells.delete(key);
      cells.set(key, { column, row, enteredAt, eraseAt: enteredAt + HOLD_MS });

      while (cells.size > MAX_ACTIVE_CELLS) {
        cells.delete(cells.keys().next().value);
      }
    };

    const traceGridLine = (from, to, startedAt, finishedAt) => {
      let x = from.column;
      let y = from.row;
      const deltaX = Math.abs(to.column - x);
      const deltaY = Math.abs(to.row - y);
      const stepX = x < to.column ? 1 : -1;
      const stepY = y < to.row ? 1 : -1;
      const longest = Math.max(deltaX, deltaY, 1);
      let error = deltaX - deltaY;
      let step = 0;

      while (x !== to.column || y !== to.row) {
        const doubledError = error * 2;
        if (doubledError > -deltaY) {
          error -= deltaY;
          x += stepX;
        }
        if (doubledError < deltaX) {
          error += deltaX;
          y += stepY;
        }
        step += 1;
        activateCell(
          x,
          y,
          startedAt + ((finishedAt - startedAt) * Math.min(1, step / longest))
        );
      }
    };

    const drawCell = (cell, now) => {
      if (!cellIsSafe(cell.column, cell.row)) return false;

      const eraseAge = now - cell.eraseAt;
      if (eraseAge >= ERASE_MS) return false;

      const reveal = easeOutCubic(Math.min(1, Math.max(0, now - cell.enteredAt) / REVEAL_MS));
      const eraseProgress = eraseAge <= 0 ? 0 : smoothStep(Math.min(1, eraseAge / ERASE_MS));
      const opacity = reveal * (1 - eraseProgress);
      const scale = 1 - (0.06 * eraseProgress);
      const left = (cell.column * cellSize) + CELL_INSET;
      const top = (cell.row * cellSize) + CELL_INSET;
      const nightCellPalette = ['#392326', '#2B3038', '#3A3028', '#32252D', '#26323A'];
      const tone = nightCellPalette[(cell.column * 7 + cell.row * 3) % nightCellPalette.length];

      context.save();
      context.globalAlpha = opacity * 0.62;
      context.translate(left + (tileSize / 2), top + (tileSize / 2));
      context.scale(scale, scale);
      context.fillStyle = tone;
      context.fillRect(-(tileSize / 2), -(tileSize / 2), tileSize, tileSize);
      context.restore();
      return true;
    };
    const draw = (now) => {
      animationFrame = 0;
      context.clearRect(0, 0, width, height);
      for (const [key, cell] of cells) {
        if (!drawCell(cell, now)) cells.delete(key);
      }
      if (cells.size > 0) animationFrame = window.requestAnimationFrame(draw);
    };

    const requestDraw = () => {
      if (!animationFrame && cells.size > 0) {
        animationFrame = window.requestAnimationFrame(draw);
      }
    };

    const handlePointerMove = (event) => {
      if (event.pointerType === 'touch' || !artworkMask || !gridReady) {
        previousCell = null;
        return;
      }

      const bounds = section.getBoundingClientRect();
      const localX = event.clientX - bounds.left;
      const localY = event.clientY - bounds.top;
      if (localX < 0 || localY < 0 || localX >= width || localY >= height) {
        previousCell = null;
        return;
      }

      const now = performance.now();
      const hoveredRegion = getRegionAtPoint(localX, localY);
      if (hoveredRegion) {
        setHoveredRegion(hoveredRegion, now);
        previousCell = null;
        return;
      }

      setHoveredRegion(null, now);

      const nextCell = {
        column: Math.floor(localX / cellSize),
        row: Math.floor(localY / cellSize),
      };

      if (!previousCell) {
        activateCell(nextCell.column, nextCell.row, now);
      } else if (
        nextCell.column !== previousCell.column || nextCell.row !== previousCell.row
      ) {
        traceGridLine(previousCell, nextCell, previousCell.time, now);
      }

      previousCell = { ...nextCell, time: now };
      requestDraw();
    };

    const handlePointerLeave = () => {
      setHoveredRegion(null, performance.now());
      previousCell = null;
    };

    const resizeCanvas = () => {
      const bounds = section.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      cellSize = Math.round(Math.min(MAX_CELL_SIZE, Math.max(MIN_CELL_SIZE, width * 0.023)));
      tileSize = cellSize - (CELL_INSET * 2);
      section.style.setProperty('--hero-grid-cell', cellSize + 'px');

      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(width * pixelRatio));
      canvas.height = Math.max(1, Math.round(height * pixelRatio));
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      revealCanvas.width = Math.max(1, Math.round(width * pixelRatio));
      revealCanvas.height = Math.max(1, Math.round(height * pixelRatio));
      revealCanvas.style.width = width + 'px';
      revealCanvas.style.height = height + 'px';
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      revealContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      cells.clear();
      previousCell = null;
      clearRegionReveal();
      context.clearRect(0, 0, width, height);
      updateCoverTransform();
      rebuildColourLayer();
      rebuildGridMasks();
    };

    const scheduleMaskRefresh = () => {
      if (maskRefreshFrame || disposed) return;
      maskRefreshFrame = window.requestAnimationFrame(() => {
        maskRefreshFrame = 0;
        // Scrolling changes text/header exclusions, not the artwork-to-section transform.
        rebuildGridMasks();
        if (cells.size > 0) requestDraw();
      });
    };

    const maskImage = new Image();
    const backgroundImage = new Image();
    let maskLoaded = false;
    let backgroundLoaded = false;

    const initializeArtwork = () => {
      if (disposed || !maskLoaded || !backgroundLoaded) return;
      try {
        sourceArtwork = maskImage;
        backgroundArtwork = backgroundImage;
        artworkMask = buildArtworkMask(maskImage);
        resizeCanvas();
      } catch (error) {
        artworkMask = null;
        gridReady = false;
        cells.clear();
        context.clearRect(0, 0, width, height);
        revealContext.clearRect(0, 0, width, height);
        console.warn('[TEDx hero] Artwork mask unavailable; colour reveal disabled.', error);
      }
    };

    maskImage.decoding = 'async';
    maskImage.onload = () => {
      maskLoaded = true;
      initializeArtwork();
    };
    maskImage.onerror = () => {
      artworkMask = null;
      gridReady = false;
      cells.clear();
      context.clearRect(0, 0, width, height);
      revealContext.clearRect(0, 0, width, height);
    };

    backgroundImage.decoding = 'async';
    backgroundImage.onload = () => {
      backgroundLoaded = true;
      initializeArtwork();
    };
    backgroundImage.onerror = () => {
      backgroundArtwork = null;
      maskPixels = null;
      gridReady = false;
      context.clearRect(0, 0, width, height);
      revealContext.clearRect(0, 0, width, height);
      console.warn('[TEDx hero] Original night panorama unavailable; colour reveal disabled.');
    };

    maskImage.src = HERO_ARTWORK;
    backgroundImage.src = HERO_BACKGROUND;

    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(resizeCanvas)
      : null;
    const mutationObserver = typeof MutationObserver !== 'undefined'
      ? new MutationObserver(scheduleMaskRefresh)
      : null;
    const observedRoots = [section, document.querySelector('header')].filter(Boolean);

    observedRoots.forEach((root) => {
      resizeObserver?.observe(root);
      mutationObserver?.observe(root, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    });

    window.addEventListener('resize', resizeCanvas, { passive: true });
    window.addEventListener('scroll', scheduleMaskRefresh, { passive: true });
    section.addEventListener('pointermove', handlePointerMove, { passive: true });
    section.addEventListener('pointerleave', handlePointerLeave, { passive: true });
    settleTimer = window.setTimeout(scheduleMaskRefresh, 1000);
    document.fonts?.ready.then(scheduleMaskRefresh).catch(() => {});

    resizeCanvas();

    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      window.clearTimeout(settleTimer);
      if (maskRefreshFrame) window.cancelAnimationFrame(maskRefreshFrame);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      if (revealAnimationFrame) window.cancelAnimationFrame(revealAnimationFrame);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('scroll', scheduleMaskRefresh);
      section.removeEventListener('pointermove', handlePointerMove);
      section.removeEventListener('pointerleave', handlePointerLeave);
      cells.clear();
      regionTimers.forEach((timer) => window.clearTimeout(timer));
      regionTimers.clear();
      context.clearRect(0, 0, width, height);
      revealContext.clearRect(0, 0, width, height);
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    const eventDate = new Date(editionData.date);
    if (Number.isNaN(eventDate.getTime()) || eventDate.getTime() <= Date.now()) {
      setCountdown(null);
      return undefined;
    }

    const updateCountdown = () => {
      const difference = eventDate.getTime() - Date.now();
      if (difference <= 0) {
        setCountdown(null);
        return;
      }

      setCountdown({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / (1000 * 60)) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(timer);
  }, [editionData.date]);

  const parsedEventDate = new Date(editionData.date);
  const formattedEventDate = Number.isNaN(parsedEventDate.getTime())
    ? null
    : parsedEventDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.08 },
    },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.58, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section
      ref={heroRef}
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-[#050505] text-white lg:h-[100svh] lg:min-h-[720px]"
      aria-label="TEDxIIMT University hero"
      style={{
        backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.052) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.052) 1px, transparent 1px)',
        backgroundSize: 'var(--hero-grid-cell, 40px) var(--hero-grid-cell, 40px)',
        backgroundPosition: '0 0',
      }}
    >
      {/* One original panorama only. Cover preserves the artwork proportions;
          a small upward bias keeps the full landmark row visually balanced. */}
      <div
        data-mosaic-surface
        className="pointer-events-none absolute inset-0 z-0 bg-no-repeat"
        style={{
          backgroundImage: 'url(' + HERO_BACKGROUND + ')',
          backgroundSize: 'cover',
          backgroundPosition: 'center 58%',
          filter: 'brightness(1.34) contrast(1.08) saturate(0.9)',
        }}
        aria-hidden="true"
      />

      <canvas
        ref={colourRevealCanvasRef}
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{ filter: 'brightness(1.34) contrast(1.08) saturate(0.9)' }}
        aria-hidden="true"
      />

      {/* Fixed cells form a repeatable zig-zag scatter on the same square lattice. */}
      <div className="pointer-events-none absolute inset-0 z-[3] overflow-hidden" aria-hidden="true">
        {MOSAIC_ACCENTS.map((cell, index) => (
          <span
            key={index}
            className="absolute"
            style={{
              left: 'calc(var(--hero-grid-cell, 38px) * ' + cell.column + ' + 4px)',
              top: 'calc(var(--hero-grid-cell, 38px) * ' + cell.row + ' + 4px)',
              width: 'calc(var(--hero-grid-cell, 38px) * ' + cell.width + ' - 8px)',
              height: 'calc(var(--hero-grid-cell, 38px) * ' + cell.height + ' - 8px)',
              backgroundColor: MOSAIC_PALETTE[cell.color],
              opacity: cell.opacity,
            }}
          />
        ))}
      </div>

      <canvas
        ref={trailCanvasRef}
        className="pointer-events-none absolute inset-0 z-10"
        aria-hidden="true"
      />

      <div className="pointer-events-none absolute inset-0 z-30" aria-live="polite">
        {Object.entries(monumentCards).map(([monumentId, card]) => {
          const monument = MONUMENT_REGIONS.find((item) => item.id === monumentId);
          if (!monument) return null;
          return (
            <motion.div
              key={monumentId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute w-[min(180px,64vw)] -translate-x-1/2 border-l-2 border-[#EB0028] bg-[#080808]/90 px-3 py-2.5 shadow-[0_8px_28px_rgba(0,0,0,0.28)] backdrop-blur-sm"
              style={{ left: card.left, top: card.top }}
              data-mosaic-exclusion
            >
              <div className="text-[9px] font-semibold tracking-[0.2em] text-[#EB0028]">
                {monument.name}
              </div>
              <p className="mt-1 text-[11px] leading-[1.45] text-white/95">
                “{card.text}”
              </p>
              <div className="mt-1.5 flex items-center justify-between gap-2">
                <span className="text-[9px] leading-tight text-zinc-400">{card.attribution}</span>
                <a
                  href={card.source}
                  target="_blank"
                  rel="noreferrer"
                  className="pointer-events-auto shrink-0 text-[9px] font-medium text-zinc-300 underline decoration-white/40 underline-offset-2"
                  aria-label={'Open source for ' + monument.name}
                >
                  SOURCE
                </a>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="relative z-20 mx-auto flex w-[88%] max-w-[1660px] items-center px-0 py-24 sm:py-28 lg:py-0">
        <motion.div
          variants={containerVariants}
          initial={prefersReducedMotion ? false : 'hidden'}
          animate="visible"
          className="flex min-h-[540px] w-full max-w-[740px] flex-col justify-center lg:min-h-[560px] lg:pl-8 xl:pl-12"
        >
          <motion.div variants={itemVariants} data-mosaic-exclusion>
            <h1 className="leading-[0.9] tracking-[-0.065em]">
              <span className="block whitespace-nowrap text-[clamp(3.1rem,5.35vw,5.8rem)] font-black">
                <span className="text-[#EB0028]">TED</span><span className="text-white">x</span><span className="ml-2 text-white sm:ml-3">IIMT</span>
              </span>
              <span className="mt-3 block pl-1 text-[clamp(0.8rem,1.45vw,1.25rem)] font-medium tracking-[0.34em] text-zinc-200 sm:tracking-[0.43em]">
                IIMT UNIVERSITY
              </span>
            </h1>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-8 sm:mt-9" data-mosaic-exclusion>
            <h2 className="whitespace-nowrap text-[clamp(2.5rem,4.35vw,4.55rem)] font-semibold leading-[0.98] tracking-[-0.05em]">
              Break the <span className="font-bold italic text-[#EB0028]">Flow.</span>
            </h2>
            <p className="mt-2 text-lg font-medium tracking-[0.025em] text-zinc-200 sm:text-[1.55rem]">
              Ideas. Inspiration. Impact.
            </p>
            <div className="mt-5 h-[3px] w-24 bg-[#EB0028]" aria-hidden="true" />
            <p className="mt-4 max-w-[490px] text-sm leading-6 text-zinc-300 sm:text-base sm:leading-7">
              A platform to share ideas that challenge, inspire and create change.
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-6 flex flex-col gap-2.5 text-sm text-zinc-100 sm:mt-7 sm:flex-row sm:items-center sm:gap-8"
            data-mosaic-exclusion
          >
            {formattedEventDate && (
              <span className="inline-flex items-center gap-2.5">
                <CalendarDays className="h-[18px] w-[18px] text-[#EB0028]" aria-hidden="true" />
                {formattedEventDate}
              </span>
            )}
            <span className="inline-flex items-center gap-2.5">
              <MapPin className="h-[18px] w-[18px] text-[#EB0028]" aria-hidden="true" />
              IIMT University, Meerut
            </span>
          </motion.div>

          {countdown && (
            <motion.div
              variants={itemVariants}
              className="mt-6 flex max-w-[560px] items-center border-y border-white/20 py-3 sm:mt-7 sm:py-3.5"
              aria-label="Event countdown"
              data-mosaic-exclusion
            >
              {[
                { value: countdown.days, label: 'Days' },
                { value: countdown.hours, label: 'Hours' },
                { value: countdown.minutes, label: 'Minutes' },
                { value: countdown.seconds, label: 'Seconds' },
              ].map((item, index) => (
                <div
                  key={item.label}
                  className={'min-w-0 flex-1 px-3 sm:px-5 ' + (index === 0 ? 'pl-1' : 'border-l border-white/25')}
                >
                  <div className="text-2xl font-semibold tabular-nums text-white sm:text-[2rem]">
                    {String(item.value).padStart(2, '0')}
                  </div>
                  <div className="mt-1 text-[10px] font-medium text-zinc-300 sm:text-xs">
                    {item.label}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          <motion.div
            variants={itemVariants}
            className="mt-6 flex flex-col gap-3 sm:mt-7 sm:flex-row sm:items-center"
            data-mosaic-exclusion
          >
            <a
              href="/register"
              className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#EB0028] px-8 py-3 text-sm font-bold text-white shadow-[0_12px_35px_rgba(235,0,40,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#d90025] hover:shadow-[0_16px_42px_rgba(235,0,40,0.3)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              aria-label="Register for TEDxIIMT University"
            >
              Register Now
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
            </a>
            <a
              href="/speakers"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/35 bg-black/25 px-7 py-3 text-sm font-semibold text-white backdrop-blur-sm transition duration-300 hover:border-white/70 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Meet Our Speakers
            </a>
          </motion.div>
        </motion.div>
      </div>


    </section>
  );
};

export default Hero;
