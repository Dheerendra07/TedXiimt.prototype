import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDown, ArrowRight, CalendarDays, MapPin } from 'lucide-react';
import api from '../services/api';

const HERO_ARTWORK = '/transparent-hero-bg.PNG';
const MOSAIC_COLORS = ['#EB0028', '#D5D5D5'];
const MOSAIC_ACCENTS = [
  { column: 1, row: 4, span: 1, tone: 'red', opacity: 0.24 },
  { column: 15, row: 4, span: 1, tone: 'red', opacity: 0.15 },
  { column: 16, row: 0, span: 2, tone: 'red', opacity: 0.12 },
  { column: 24, row: 8, span: 1, tone: 'red', opacity: 0.19 },
  { column: 26, row: 8, span: 1, tone: 'grey', opacity: 0.12 },
  { column: 38, row: 6, span: 1, tone: 'red', opacity: 0.22 },
  { column: 42, row: 12, span: 1, tone: 'red', opacity: 0.17 },
  { column: 39, row: 18, span: 1, tone: 'red', opacity: 0.21 },
  { column: 27, row: 20, span: 1, tone: 'grey', opacity: 0.12 },
  { column: 15, row: 21, span: 1, tone: 'red', opacity: 0.14 },
  { column: 4, row: 22, span: 1, tone: 'red', opacity: 0.12 },
  { column: 29, row: 23, span: 1, tone: 'red', opacity: 0.16 },
];

const Hero = () => {
  const prefersReducedMotion = useReducedMotion();
  const heroRef = useRef(null);
  const trailCanvasRef = useRef(null);
  const [countdown, setCountdown] = useState(null);
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
  // Cursor tiles are deterministic and are kept clear of both copy and artwork.
  useEffect(() => {
    if (prefersReducedMotion) return undefined;

    const section = heroRef.current;
    const canvas = trailCanvasRef.current;
    const imageLayer = section?.querySelector('[data-mosaic-surface]');
    if (!section || !canvas || !imageLayer) return undefined;

    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return undefined;

    const MIN_CELL_SIZE = 28;
    const MAX_CELL_SIZE = 38;
    const CELL_INSET = 4;
    const IMAGE_SAFETY_GAP = 2;
    const REVEAL_MS = 80;
    const HOLD_MS = 680;
    const ERASE_MS = 280;
    const MAX_ACTIVE_CELLS = 86;
    const MAX_INTERPOLATED_CELLS = 24;

    let width = 0;
    let height = 0;
    let cellSize = 38;
    let tileSize = cellSize - (CELL_INSET * 2);
    let pixelRatio = 1;
    let animationFrame = 0;
    let maskRefreshFrame = 0;
    let settleTimer = 0;
    let previousCell = null;
    let artworkMask = null;
    let coverTransform = null;
    let disposed = false;
    let gridReady = false;
    let gridColumns = 0;
    let gridRows = 0;

    const cells = new Map();
    const artworkBlockedCells = new Set();
    const textBlockedCells = new Set();
    const easeOutCubic = (value) => 1 - Math.pow(1 - value, 3);
    const smoothStep = (value) => value * value * (3 - (2 * value));

    const buildArtworkMask = (image) => {
      const maskWidth = image.naturalWidth;
      const maskHeight = image.naturalHeight;
      if (!maskWidth || !maskHeight) return null;

      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = maskWidth;
      maskCanvas.height = maskHeight;
      const maskContext = maskCanvas.getContext('2d', { willReadFrequently: true });
      if (!maskContext) return null;

      maskContext.drawImage(image, 0, 0);
      const pixels = maskContext.getImageData(0, 0, maskWidth, maskHeight).data;
      const stride = maskWidth + 1;
      const integral = new Uint32Array(stride * (maskHeight + 1));

      for (let y = 1; y <= maskHeight; y += 1) {
        let rowCount = 0;
        const sourceRow = (y - 1) * maskWidth;
        const currentRow = y * stride;
        const previousRow = (y - 1) * stride;

        for (let x = 1; x <= maskWidth; x += 1) {
          if (pixels[((sourceRow + x - 1) * 4) + 3] > 0) rowCount += 1;
          integral[currentRow + x] = integral[previousRow + x] + rowCount;
        }
      }

      maskCanvas.width = 1;
      maskCanvas.height = 1;
      return { width: maskWidth, height: maskHeight, stride, integral };
    };

    const updateCoverTransform = () => {
      if (!artworkMask) {
        coverTransform = null;
        return;
      }

      const sectionRect = section.getBoundingClientRect();
      const imageRect = imageLayer.getBoundingClientRect();
      const scale = Math.max(
        imageRect.width / artworkMask.width,
        imageRect.height / artworkMask.height
      );

      coverTransform = {
        scale,
        offsetX: (imageRect.left - sectionRect.left)
          + ((imageRect.width - (artworkMask.width * scale)) / 2),
        offsetY: (imageRect.top - sectionRect.top)
          + ((imageRect.height - (artworkMask.height * scale)) / 2),
      };
    };

    const regionContainsArtwork = (left, top, right, bottom) => {
      if (!artworkMask || !coverTransform) return true;

      const { scale, offsetX, offsetY } = coverTransform;
      if (!Number.isFinite(scale) || scale <= 0) return true;

      const x0 = Math.max(0, Math.min(artworkMask.width, Math.floor((left - offsetX) / scale)));
      const y0 = Math.max(0, Math.min(artworkMask.height, Math.floor((top - offsetY) / scale)));
      const x1 = Math.max(0, Math.min(artworkMask.width, Math.ceil((right - offsetX) / scale)));
      const y1 = Math.max(0, Math.min(artworkMask.height, Math.ceil((bottom - offsetY) / scale)));
      if (x0 >= x1 || y0 >= y1) return false;

      const { integral, stride } = artworkMask;
      return (
        integral[(y1 * stride) + x1]
        - integral[(y0 * stride) + x1]
        - integral[(y1 * stride) + x0]
        + integral[(y0 * stride) + x0]
      ) > 0;
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
      artworkBlockedCells.clear();
      textBlockedCells.clear();
      gridReady = false;

      const bounds = section.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      gridColumns = Math.ceil(width / cellSize);
      gridRows = Math.ceil(height / cellSize);
      if (!artworkMask || !coverTransform || !gridColumns || !gridRows) return;

      const textRects = collectVisibleTextRects();
      for (let row = 0; row < gridRows; row += 1) {
        for (let column = 0; column < gridColumns; column += 1) {
          const key = column + ':' + row;
          const left = (column * cellSize) + CELL_INSET;
          const top = (row * cellSize) + CELL_INSET;
          const right = left + tileSize;
          const bottom = top + tileSize;

          if (regionContainsArtwork(
            left - IMAGE_SAFETY_GAP,
            top - IMAGE_SAFETY_GAP,
            right + IMAGE_SAFETY_GAP,
            bottom + IMAGE_SAFETY_GAP
          )) {
            artworkBlockedCells.add(key);
          }

          if (textRects.some((rect) => (
            left < rect.right + 2 && right > rect.left - 2 &&
            top < rect.bottom + 2 && bottom > rect.top - 2
          ))) {
            textBlockedCells.add(key);
          }
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
      return !artworkBlockedCells.has(key) && !textBlockedCells.has(key);
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
      const colorIndex = ((cell.column * 3) + (cell.row * 5)) % 7 === 0 ? 0 : 1;

      context.save();
      context.translate(left + (tileSize / 2), top + (tileSize / 2));
      context.scale(scale, scale);
      context.globalAlpha = opacity;
      context.fillStyle = MOSAIC_COLORS[colorIndex];
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

      const nextCell = {
        column: Math.floor(localX / cellSize),
        row: Math.floor(localY / cellSize),
      };
      const now = performance.now();

      if (!previousCell) {
        activateCell(nextCell.column, nextCell.row, now);
      } else if (
        nextCell.column !== previousCell.column || nextCell.row !== previousCell.row
      ) {
        const distance = Math.max(
          Math.abs(nextCell.column - previousCell.column),
          Math.abs(nextCell.row - previousCell.row)
        );
        if (distance <= MAX_INTERPOLATED_CELLS) {
          traceGridLine(previousCell, nextCell, previousCell.time, now);
        } else {
          activateCell(nextCell.column, nextCell.row, now);
        }
      }

      previousCell = { ...nextCell, time: now };
      requestDraw();
    };

    const handlePointerLeave = () => {
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
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      cells.clear();
      previousCell = null;
      context.clearRect(0, 0, width, height);
      updateCoverTransform();
      rebuildGridMasks();
    };

    const scheduleMaskRefresh = () => {
      if (maskRefreshFrame || disposed) return;
      maskRefreshFrame = window.requestAnimationFrame(() => {
        maskRefreshFrame = 0;
        updateCoverTransform();
        rebuildGridMasks();
        if (cells.size > 0) requestDraw();
      });
    };

    const maskImage = new Image();
    maskImage.decoding = 'async';
    maskImage.onload = () => {
      if (disposed) return;
      try {
        artworkMask = buildArtworkMask(maskImage);
        resizeCanvas();
      } catch (error) {
        artworkMask = null;
        gridReady = false;
        cells.clear();
        context.clearRect(0, 0, width, height);
        console.warn('[TEDx hero] Artwork mask unavailable; cursor tiles safely disabled.', error);
      }
    };
    maskImage.onerror = () => {
      artworkMask = null;
      gridReady = false;
      cells.clear();
      context.clearRect(0, 0, width, height);
    };
    maskImage.src = HERO_ARTWORK;

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
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('scroll', scheduleMaskRefresh);
      section.removeEventListener('pointermove', handlePointerMove);
      section.removeEventListener('pointerleave', handlePointerLeave);
      cells.clear();
      context.clearRect(0, 0, width, height);
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

  const scrollToNextSection = () => {
    const nextSection = heroRef.current?.nextElementSibling;
    nextSection?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  };

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
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-[#050505] text-white lg:h-[100svh] lg:min-h-[760px]"
      aria-label="TEDxIIMT University hero"
      style={{
        backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.055) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.055) 1px, transparent 1px)',
        backgroundSize: 'var(--hero-grid-cell, 38px) var(--hero-grid-cell, 38px)',
        backgroundPosition: '0 0',
      }}
    >
      {/* The original transparent artwork remains the hero image, not a substitute. */}
      <div
        data-mosaic-surface
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(' + HERO_ARTWORK + ')',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          filter: 'brightness(1.03) contrast(1.07) saturate(0.88)',
        }}
        aria-hidden="true"
      />

      {/* Keep the left reading area calm while leaving the original image legible on the right. */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background: 'linear-gradient(90deg, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.88) 27%, rgba(0,0,0,0.68) 45%, rgba(0,0,0,0.16) 76%, rgba(0,0,0,0.28) 100%), linear-gradient(0deg, rgba(0,0,0,0.56) 0%, transparent 32%, rgba(0,0,0,0.16) 100%)',
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background: 'radial-gradient(ellipse at 77% 43%, rgba(235,0,40,0.22), transparent 34%)',
        }}
        aria-hidden="true"
      />

      {/* Fixed accents sit on the same 38px lattice as the reference image. */}
      <div className="pointer-events-none absolute inset-0 z-[2] overflow-hidden" aria-hidden="true">
        {MOSAIC_ACCENTS.map((cell, index) => {
          const tone = cell.tone === 'red' ? '#EB0028' : '#D5D5D5';
          return (
            <span
              key={index}
              className="absolute"
              style={{
                left: 'calc(var(--hero-grid-cell, 38px) * ' + cell.column + ' + 4px)',
                top: 'calc(var(--hero-grid-cell, 38px) * ' + cell.row + ' + 4px)',
                width: 'calc(var(--hero-grid-cell, 38px) * ' + cell.span + ' - 8px)',
                height: 'calc(var(--hero-grid-cell, 38px) * ' + cell.span + ' - 8px)',
                backgroundColor: tone,
                opacity: cell.opacity,
              }}
            />
          );
        })}
      </div>

      <canvas
        ref={trailCanvasRef}
        className="pointer-events-none absolute inset-0 z-10"
        aria-hidden="true"
      />

      <div className="relative z-20 mx-auto flex w-full max-w-[1528px] items-center px-6 pb-24 pt-28 sm:px-8 lg:px-0 lg:pb-24 lg:pt-36">
        <motion.div
          variants={containerVariants}
          initial={prefersReducedMotion ? false : 'hidden'}
          animate="visible"
          className="w-full max-w-[700px]"
        >
          <motion.div
            variants={itemVariants}
            className="mb-5 flex items-center gap-3 sm:mb-6"
            data-mosaic-exclusion
          >
            <span className="h-px w-9 bg-[#EB0028]" aria-hidden="true" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-300 sm:text-xs">
              Independently organized TED event
            </span>
          </motion.div>

          <motion.div variants={itemVariants} data-mosaic-exclusion>
            <h1 className="leading-[0.9] tracking-[-0.065em]">
              <span className="block whitespace-nowrap text-[clamp(3.35rem,6.1vw,6.15rem)] font-black">
                <span className="text-[#EB0028]">TED</span><span className="text-white">x</span><span className="ml-2 text-white sm:ml-3">IIMT</span>
              </span>
              <span className="mt-3 block pl-1 text-[clamp(0.82rem,1.55vw,1.35rem)] font-medium tracking-[0.34em] text-zinc-200 sm:tracking-[0.43em]">
                IIMT UNIVERSITY
              </span>
            </h1>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-7 sm:mt-8" data-mosaic-exclusion>
            <h2 className="whitespace-nowrap text-[clamp(2.75rem,5.1vw,5rem)] font-semibold leading-[0.98] tracking-[-0.05em]">
              Break the <span className="font-bold italic text-[#EB0028]">Flow.</span>
            </h2>
            <p className="mt-2 text-lg font-medium tracking-[0.025em] text-zinc-200 sm:text-[1.65rem]">
              Ideas. Inspiration. Impact.
            </p>
            <div className="mt-5 h-[3px] w-24 bg-[#EB0028]" aria-hidden="true" />
            <p className="mt-4 max-w-[470px] text-sm leading-6 text-zinc-300 sm:text-base sm:leading-7">
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
              className="mt-6 flex max-w-[550px] items-center border-y border-white/20 py-3 sm:mt-7 sm:py-3.5"
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

      <button
        type="button"
        onClick={scrollToNextSection}
        className="group absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1.5 rounded-full px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-400 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:bottom-4"
        aria-label="Scroll to explore featured speakers"
      >
        <span>Scroll to explore</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 transition-all duration-300 group-hover:border-[#EB0028] group-hover:bg-[#EB0028]/15">
          <ArrowDown className="h-4 w-4" aria-hidden="true" />
        </span>
      </button>
    </section>
  );
};

export default Hero;
