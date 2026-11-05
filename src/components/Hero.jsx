import React, { useState, useEffect, useRef } from 'react';
import {motion, useReducedMotion } from 'framer-motion';
import api from '../services/api';

const Hero = () => {
  const prefersReducedMotion = useReducedMotion();
  const heroRef = useRef(null);
  const trailCanvasRef = useRef(null);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0 });
  const [editionData, setEditionData] = useState({
    theme: 'Break the Flow',
    date: '2025-11-11T09:00:00',
    attendee_capacity: 350,
    speaker_count: 10
  });

  useEffect(() => {
    let isMounted = true;
    const fetchActiveEdition = async () => {
      try {
        const data = await api.get('/api/editions/events/active/');
        if (isMounted && data) {
          setEditionData({
            theme: data.theme || 'Break the Flow',
            date: data.date ? `${data.date}T09:00:00` : '2025-11-11T09:00:00',
            attendee_capacity: data.attendee_capacity || 350,
            speaker_count: data.speaker_count || (Array.isArray(data.speakers) ? data.speakers.length : 10)
          });
        }
      } catch (err) {
        console.warn('Active edition fetch error:', err);
      }
    };

    fetchActiveEdition();
    return () => { isMounted = false; };
  }, []);


  // Monochrome pointer trail, clipped to verified transparent artwork space.
  useEffect(() => {
    const section = heroRef.current;
    const canvas = trailCanvasRef.current;
    const imageLayer = section?.querySelector('[data-mosaic-surface]');
    if (!section || !canvas || !imageLayer) return;

    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return;

    // Smaller, responsive cells keep the reference mosaic airy rather than oversized.
    const MIN_CELL_SIZE = 64;
    const MAX_CELL_SIZE = 92;
    let CELL_SIZE = 64;
    const CELL_INSET = 4;
    let TILE_SIZE = CELL_SIZE - (CELL_INSET * 2);
    const IMAGE_SAFETY_GAP = 3;

    const REVEAL_MS = 65;
    const HOLD_MS = 2000;
    const ERASE_MS = 190;
    const ERASE_STAGGER_MS = 42;
    const MAX_ACTIVE_CELLS = 110;
    const MAX_INTERPOLATED_CELLS = 28;
    // The four colour pairings come from the supplied mosaic references.
    // A fixed cell-coordinate sequence keeps the palette deliberate and repeatable.
    // Sampled from the provided GitHub Platform reference image.
    // Every active cell is one opaque, flat-colour square: no pattern, outline or glow.
    const CELL_COLORS = [
      '#DA7211', // orange
      '#FF7FD2', // pink
      '#24EA57', // vivid green
      '#C898FC', // lavender
      '#08882B', // forest green
      '#DC9D00', // gold
      '#10BF3E', // emerald
      '#4955E5', // indigo
      '#8DD6FF', // sky blue
      '#0377FF', // blue
    ];

    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let animationFrame = 0;
    let previousCell = null;
    let lastPathActivityAt = 0;
    let lastEraseScheduledAt = 0;
    let artworkMask = null;
    let coverTransform = null;
    let disposed = false;
    const cells = new Map();

    const mod = (value, divisor) => ((value % divisor) + divisor) % divisor;
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

      // A summed-area table makes artwork checks exact and constant-time.
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

      const sourceLeft = (left - offsetX) / scale;
      const sourceTop = (top - offsetY) / scale;
      const sourceRight = (right - offsetX) / scale;
      const sourceBottom = (bottom - offsetY) / scale;

      // Clip the safety margin at the source-image edge. The tile itself is
      // already constrained to the hero bounds; an off-canvas margin is not
      // evidence of heritage artwork and must not falsely block an edge cell.
      const x0 = Math.max(0, Math.min(artworkMask.width, Math.floor(sourceLeft)));
      const y0 = Math.max(0, Math.min(artworkMask.height, Math.floor(sourceTop)));
      const x1 = Math.max(0, Math.min(artworkMask.width, Math.ceil(sourceRight)));
      const y1 = Math.max(0, Math.min(artworkMask.height, Math.ceil(sourceBottom)));
      if (x0 >= x1 || y0 >= y1) return false;

      const { integral, stride } = artworkMask;
      const count = (
        integral[(y1 * stride) + x1]
        - integral[(y0 * stride) + x1]
        - integral[(y1 * stride) + x0]
        + integral[(y0 * stride) + x0]
      );
      return count > 0;
    };

    const artworkBlockedCells = new Set();
    const textBlockedCells = new Set();
    let gridMaskReady = false;
    let gridColumns = 0;
    let gridRows = 0;
    let maskRefreshFrame = 0;
    let motionSettleTimer = 0;
    let lastAuditSignature = '';

    const getGridDimensions = () => ({
      // Include edge cells whose squares are naturally clipped by the canvas,
      // matching the reference composition at the viewport boundaries.
      columns: Math.max(0, Math.ceil(width / CELL_SIZE)),
      rows: Math.max(0, Math.ceil(height / CELL_SIZE)),
    });

    const getColumnLabel = (column) => {
      let value = column + 1;
      let label = '';
      while (value > 0) {
        value -= 1;
        label = String.fromCharCode(65 + (value % 26)) + label;
        value = Math.floor(value / 26);
      }
      return label;
    };

    const getCellLabel = (column, row) => (
      getColumnLabel(column) + String(row + 1).padStart(2, '0')
    );

    const collectVisibleTextRects = () => {
      const sectionBounds = section.getBoundingClientRect();
      const roots = [
        ...section.querySelectorAll('[data-mosaic-exclusion]'),
        document.querySelector('header'),
        ...document.querySelectorAll('[data-mosaic-overlay]'),
      ].filter(Boolean);
      const uniqueRoots = [...new Set(roots)];
      const textRects = [];
      let wordCount = 0;
      const range = document.createRange();

      uniqueRoots.forEach((root) => {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        let textNode;

        while ((textNode = walker.nextNode())) {
          const parent = textNode.parentElement;
          const value = textNode.nodeValue || '';
          if (!parent || !value.trim()) continue;
          if (parent.closest('script, style, noscript, [hidden], [aria-hidden="true"], .sr-only')) {
            continue;
          }

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
            wordCount += 1;
            try {
              range.setStart(textNode, token.index);
              range.setEnd(textNode, token.index + token[0].length);
              const rects = range.getClientRects();

              for (let index = 0; index < rects.length; index += 1) {
                const rect = rects[index];
                if (
                  rect.width <= 0 ||
                  rect.height <= 0 ||
                  rect.right <= sectionBounds.left ||
                  rect.left >= sectionBounds.right ||
                  rect.bottom <= sectionBounds.top ||
                  rect.top >= sectionBounds.bottom
                ) continue;

                textRects.push({
                  left: rect.left - sectionBounds.left,
                  top: rect.top - sectionBounds.top,
                  right: rect.right - sectionBounds.left,
                  bottom: rect.bottom - sectionBounds.top,
                });
              }
            } catch {
              // Some SVG or browser-owned text nodes do not expose Range geometry.
            }
          }
        }
      });

      range.detach?.();
      return { rects: textRects, wordCount };
    };

    const rebuildGridMasks = () => {
      artworkBlockedCells.clear();
      textBlockedCells.clear();
      gridMaskReady = false;

      const dimensions = getGridDimensions();
      gridColumns = dimensions.columns;
      gridRows = dimensions.rows;

      if (!artworkMask || !coverTransform || !gridColumns || !gridRows) return;

      const textAudit = collectVisibleTextRects();
      const artworkLabels = [];
      const textLabels = [];
      const overlapLabels = [];
      const availableLabels = [];

      for (let row = 0; row < gridRows; row += 1) {
        for (let column = 0; column < gridColumns; column += 1) {
          const key = column + ':' + row;
          const left = (column * CELL_SIZE) + CELL_INSET;
          const top = (row * CELL_SIZE) + CELL_INSET;
          const right = left + TILE_SIZE;
          const bottom = top + TILE_SIZE;
          const label = getCellLabel(column, row);

          const intersectsArtwork = regionContainsArtwork(
            left - IMAGE_SAFETY_GAP,
            top - IMAGE_SAFETY_GAP,
            right + IMAGE_SAFETY_GAP,
            bottom + IMAGE_SAFETY_GAP
          );
          if (intersectsArtwork) {
            artworkBlockedCells.add(key);
            artworkLabels.push(label);
          }

          const intersectsText = textAudit.rects.some((rect) => (
            left < rect.right + 1.5 &&
            right > rect.left - 1.5 &&
            top < rect.bottom + 1.5 &&
            bottom > rect.top - 1.5
          ));
          if (intersectsText) {
            textBlockedCells.add(key);
            textLabels.push(label);
          }

          if (intersectsArtwork && intersectsText) {
            overlapLabels.push(label);
          } else if (!intersectsArtwork && !intersectsText) {
            availableLabels.push(label);
          }
        }
      }

      gridMaskReady = true;

      const signature = [
        width.toFixed(1),
        height.toFixed(1),
        artworkLabels.join(','),
        textLabels.join(','),
      ].join('|');

      if (signature !== lastAuditSignature) {
        lastAuditSignature = signature;
        console.info('[TEDx hero grid audit]', {
          viewport: {
            width: Math.round(width),
            height: Math.round(height),
          },
          lattice: {
            columns: gridColumns,
            rows: gridRows,
            candidateCells: gridColumns * gridRows,
          },
          artwork: {
            blockedCells: artworkLabels.length,
            cells: artworkLabels,
          },
          visibleText: {
            words: textAudit.wordCount,
            rectFragments: textAudit.rects.length,
            blockedCells: textLabels.length,
            cells: textLabels,
          },
          overlap: {
            cells: overlapLabels.length,
            labels: overlapLabels,
          },
          usableCells: availableLabels.length,
          usableCellLabels: availableLabels,
        });
      }
    };

    const cellIsSafe = (column, row) => {
      if (
        !gridMaskReady ||
        column < 0 || row < 0 ||
        column >= gridColumns || row >= gridRows
      ) return false;

      const left = (column * CELL_SIZE) + CELL_INSET;
      const top = (row * CELL_SIZE) + CELL_INSET;
      const right = left + TILE_SIZE;
      const bottom = top + TILE_SIZE;
      if (left >= width || top >= height || right <= 0 || bottom <= 0) return false;

      const key = column + ':' + row;
      return !artworkBlockedCells.has(key) && !textBlockedCells.has(key);
    };

    // Permanent, low-contrast cell outlines remain visible before any pointer
    // movement. The exact same artwork/text mask protects this static grid.
    const drawBaseGrid = () => {
      if (!gridMaskReady) return;

      context.save();
      context.strokeStyle = 'rgba(235, 238, 242, 0.22)';
      context.lineWidth = 1;

      for (let row = 0; row < gridRows; row += 1) {
        for (let column = 0; column < gridColumns; column += 1) {
          if (!cellIsSafe(column, row)) continue;

          const left = (column * CELL_SIZE) + CELL_INSET;
          const top = (row * CELL_SIZE) + CELL_INSET;
          context.strokeRect(
            left + 0.5,
            top + 0.5,
            TILE_SIZE - 1,
            TILE_SIZE - 1
          );
        }
      }

      context.restore();
    };

    const resizeCanvas = () => {
      const bounds = section.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      CELL_SIZE = Math.round(Math.min(MAX_CELL_SIZE, Math.max(MIN_CELL_SIZE, width * 0.048)));
      TILE_SIZE = CELL_SIZE - (CELL_INSET * 2);
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

    const activateCell = (column, row, enteredAt) => {
      if (
        !Number.isInteger(column) ||
        !Number.isInteger(row) ||
        column < 0 || row < 0 ||
        (column * CELL_SIZE) >= width ||
        (row * CELL_SIZE) >= height ||
        !cellIsSafe(column, row)
      ) return;

      // A fresh pointer stroke gets its own erase wave after a short idle gap.
      // Within one stroke, erase deadlines are spaced so cells clear one by one
      // in the same order that the cursor originally filled them.
      if (!lastPathActivityAt || enteredAt - lastPathActivityAt > 260) {
        lastEraseScheduledAt = enteredAt + HOLD_MS - ERASE_STAGGER_MS;
      }

      const eraseAt = Math.max(
        enteredAt + HOLD_MS,
        lastEraseScheduledAt + ERASE_STAGGER_MS
      );
      lastEraseScheduledAt = eraseAt;
      lastPathActivityAt = enteredAt;

      const key = column + ':' + row;
      cells.delete(key);
      cells.set(key, { column, row, enteredAt, eraseAt });

      while (cells.size > MAX_ACTIVE_CELLS) {
        cells.delete(cells.keys().next().value);
      }
    };

    const traceGridLine = (from, to, startedAt, finishedAt) => {
      let x = from.column;
      let y = from.row;
      const targetX = to.column;
      const targetY = to.row;
      const deltaX = Math.abs(targetX - x);
      const deltaY = Math.abs(targetY - y);
      const stepX = x < targetX ? 1 : -1;
      const stepY = y < targetY ? 1 : -1;
      const longest = Math.max(deltaX, deltaY, 1);
      let error = deltaX - deltaY;
      let step = 0;

      activateCell(x, y, startedAt);
      while (x !== targetX || y !== targetY) {
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
      const fillAge = Math.max(0, now - cell.enteredAt);
      const eraseAge = now - cell.eraseAt;
      if (eraseAge >= ERASE_MS) return false;

      const reveal = easeOutCubic(Math.min(1, fillAge / REVEAL_MS));
      const eraseProgress = eraseAge <= 0
        ? 0
        : smoothStep(Math.min(1, eraseAge / ERASE_MS));
      const opacity = reveal * (1 - eraseProgress);
      const scale = 1 - (0.08 * eraseProgress);
      const left = (cell.column * CELL_SIZE) + CELL_INSET;
      const top = (cell.row * CELL_SIZE) + CELL_INSET;
      const colorIndex = mod(
        (cell.column * 7) + (cell.row * 11) + (cell.column * cell.row * 3),
        CELL_COLORS.length
      );

      context.save();
      context.translate(left + (TILE_SIZE / 2), top + (TILE_SIZE / 2));
      context.scale(scale, scale);
      context.globalAlpha = opacity;
      context.fillStyle = CELL_COLORS[colorIndex];
      context.fillRect(
        -(TILE_SIZE / 2),
        -(TILE_SIZE / 2),
        TILE_SIZE,
        TILE_SIZE
      );
      context.restore();
      return true;
    };

    const draw = (now) => {
      animationFrame = 0;
      context.clearRect(0, 0, width, height);
      drawBaseGrid();
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
      if (prefersReducedMotion || event.pointerType === 'touch' || !artworkMask || !gridMaskReady) {
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
        column: Math.floor(localX / CELL_SIZE),
        row: Math.floor(localY / CELL_SIZE),
      };
      const now = performance.now();

      // Keep the pointer's real path continuous across protected cells.
      // The precomputed text/artwork masks decide which individual cells draw.
      if (!previousCell) {
        activateCell(nextCell.column, nextCell.row, now);
      } else if (
        nextCell.column !== previousCell.column ||
        nextCell.row !== previousCell.row
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
      lastPathActivityAt = 0;
      lastEraseScheduledAt = 0;
    };

    resizeCanvas();

    const maskImage = new Image();
    maskImage.decoding = 'async';
    maskImage.onload = () => {
      if (disposed) return;
      try {
        artworkMask = buildArtworkMask(maskImage);
        if (artworkMask) resizeCanvas();
      } catch (error) {
        artworkMask = null;
        previousCell = null;
        cells.clear();
        context.clearRect(0, 0, width, height);
        console.warn(
          '[Hero mosaic] Artwork mask could not be verified; pointer trail disabled.',
          error
        );
      }
    };
    maskImage.onerror = () => {
      artworkMask = null;
      previousCell = null;
      cells.clear();
      context.clearRect(0, 0, width, height);
    };

    const backgroundImage = window.getComputedStyle(imageLayer).backgroundImage;
    const backgroundUrl = backgroundImage.match(/url\(["']?(.*?)["']?\)/);
    if (backgroundUrl?.[1]) maskImage.src = backgroundUrl[1];

    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(resizeCanvas)
      : null;
    const header = document.querySelector('header');
    const textRoots = [
      ...section.querySelectorAll('[data-mosaic-exclusion]'),
      header,
      ...document.querySelectorAll('[data-mosaic-overlay]'),
    ].filter(Boolean);

    const scheduleGridMaskRefresh = () => {
      if (maskRefreshFrame || disposed) return;
      maskRefreshFrame = window.requestAnimationFrame(() => {
        maskRefreshFrame = 0;
        rebuildGridMasks();
        drawBaseGrid();
        if (cells.size > 0) requestDraw();
      });
    };

    const textMutationObserver = typeof MutationObserver !== 'undefined'
      ? new MutationObserver(scheduleGridMaskRefresh)
      : null;

    textMutationObserver?.observe(section, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    textRoots.forEach((root) => {
      if (root === section) return;
      resizeObserver?.observe(root);
      textMutationObserver?.observe(root, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    });

    resizeObserver?.observe(section);
    motionSettleTimer = window.setTimeout(scheduleGridMaskRefresh, 1200);
    document.fonts?.ready
      .then(scheduleGridMaskRefresh)
      .catch(() => {});

    window.addEventListener('resize', resizeCanvas, { passive: true });
    window.addEventListener('scroll', scheduleGridMaskRefresh, { passive: true });
    section.addEventListener('pointermove', handlePointerMove, { passive: true });
    section.addEventListener('pointerleave', handlePointerLeave, { passive: true });

    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      textMutationObserver?.disconnect();
      window.clearTimeout(motionSettleTimer);
      if (maskRefreshFrame) window.cancelAnimationFrame(maskRefreshFrame);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('scroll', scheduleGridMaskRefresh);
      section.removeEventListener('pointermove', handlePointerMove);
      section.removeEventListener('pointerleave', handlePointerLeave);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      cells.clear();
      context.clearRect(0, 0, width, height);
    };
  }, [prefersReducedMotion]);

  // Event date countdown timer
  useEffect(() => {
    const eventDate = new Date(editionData.date);
    const updateCountdown = () => {
      const now = new Date();
      const difference = eventDate - now;

      if (difference > 0) {
        setCountdown({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60)
        });
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0 });
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 60000);
    return () => clearInterval(timer);
  }, [editionData.date]);

  // Animation variants optimized for performance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 20
      }
    }
  };

  // const fadeInVariants = {
  //   hidden: { opacity: 0 },
  //   visible: {
  //     opacity: 1,
  //     transition: { duration: 0.8 }
  //   }
  // };

  return (
    <section
      ref={heroRef}
      className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center overflow-hidden bg-[#242424] text-white"
      aria-label="Hero Section"
    >
{/* Background Image */}

<div
  data-mosaic-surface
  className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
  style={{
    backgroundImage: "url('/transparent-hero-bg.PNG')",
    opacity: 1,
    filter: "brightness(1) contrast(1) saturate(1)",
  }}
  aria-hidden="true"
/>

{/* Very Light Bottom Gradient — For Text Readability */}
<div
  className="absolute inset-0 z-10 pointer-events-none"
  style={{
    background:
      "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.05) 55%, rgba(0,0,0,0.4) 100%)",
  }}
  aria-hidden="true"
/>
{/* Subtle Red Accent */}
<motion.div
  className="absolute inset-0 z-10 pointer-events-none"
  style={{
    background:
      "radial-gradient(circle at 50% 50%, rgba(235, 0, 40, 0.12), transparent 65%)",
  }}
  animate={
    prefersReducedMotion
      ? {}
      : { opacity: [0.2, 0.6, 0.2] }
  }
  transition={{
    duration: 8,
    repeat: Infinity,
    ease: "easeInOut",
  }}
  aria-hidden="true"
/>

<canvas
  ref={trailCanvasRef}
  className="absolute inset-0 z-10 pointer-events-none"
  aria-hidden="true"
/>

      {/* Content Container */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20 pt-20 pb-16 md:py-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-5xl mx-auto text-center"
        >
          {/* Eyebrow - Event Type */}
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 mb-4 md:mb-6"
            data-mosaic-exclusion
          >
            <div className="h-px w-8 bg-[#EB0028]" aria-hidden="true"></div>
            <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-gray-400">
              Independently Organized TED Event
            </span>
            <div className="h-px w-8 bg-[#EB0028]" aria-hidden="true"></div>
          </motion.div>

          {/* Main Title - Enhanced Typography */}
          <motion.h1
            variants={itemVariants}
            className="mb-6 md:mb-8"
            data-mosaic-exclusion
          >
            <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none">
              <span className="text-[#EB0028]">TED</span>
              <span className="text-[#EB0028] relative">
                x
                <span className="absolute -bottom-2 left-0 right-0 h-1 bg-[#EB0028]" aria-hidden="true"></span>
              </span>
            </span>
            <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mt-2 md:mt-4 tracking-wide">
              IIMT UNIVERSITY
            </span>
          </motion.h1>

          {/* Value Proposition - Enhanced Clarity */}
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto mb-8 md:mb-10 leading-relaxed font-light"
            data-mosaic-exclusion
          >
            <span className="text-white font-semibold">Theme: {editionData.theme}.</span>
            <br className="hidden sm:block" />
            <span className="block mt-2">
              Experience transformative talks, connect with innovators, and discover perspectives that challenge convention.
            </span>
          </motion.p>

          {/* Countdown Timer - Urgency Element */}
          {countdown.days > 0 && (
            <motion.div
              variants={itemVariants}
              className="mb-8 md:mb-12"
              data-mosaic-exclusion
            >
              <p className="text-xs md:text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">
                Event Starts In
              </p>
              <div className="flex justify-center gap-3 md:gap-6">
                {[
                  { value: countdown.days, label: 'Days' },
                  { value: countdown.hours, label: 'Hours' },
                  { value: countdown.minutes, label: 'Minutes' }
                ].map((item) => (
                  <div 
                    key={item.label}
                    className="bg-[#0a0a0a] border-2 border-[#1a1a1a] px-4 py-3 md:px-6 md:py-4 min-w-[70px] md:min-w-[90px]"
                  >
                    <div className="text-2xl md:text-4xl font-bold text-[#EB0028] tabular-nums">
                      {String(item.value).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-gray-500 mt-1">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Call-to-Action Buttons
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 md:mb-12"
          >
            <a
              href="/register"
              className="group relative w-full sm:w-auto bg-[#EB0028] hover:bg-[#ff1a3d] text-white font-bold px-8 md:px-12 py-4 md:py-5 text-base md:text-lg transition-all duration-300 overflow-hidden cursor-pointer"
              aria-label="Register for TEDxIIMT UNIVERSITY event"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Get Your Tickets
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" aria-hidden="true"></div>
            </a>

            <a
              href="/speakers"
              className="group w-full sm:w-auto bg-transparent border-2 border-white hover:border-[#EB0028] hover:bg-[#EB0028]/10 text-white font-bold px-8 md:px-12 py-4 md:py-5 text-base md:text-lg transition-all duration-300 cursor-pointer"
              aria-label="View TEDxIIMT UNIVERSITY speakers"
            >
              <span className="flex items-center justify-center gap-2">
                Meet Our Speakers
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </a>
          </motion.div> */}

          {/* Social Proof - Trust Signals
          <motion.div
            variants={fadeInVariants}
            className="flex flex-wrap justify-center items-center gap-4 md:gap-8 text-sm text-gray-400"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#EB0028]" aria-hidden="true"></div>
              <span className="font-semibold text-white">{editionData.attendee_capacity}+</span>
              <span>Delegates</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-gray-700" aria-hidden="true"></div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#EB0028]" aria-hidden="true"></div>
              <span className="font-semibold text-white">{editionData.speaker_count}+</span>
              <span>Visionary Speakers</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-gray-700" aria-hidden="true"></div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#EB0028]" aria-hidden="true"></div>
              <span className="font-semibold text-white">6 Hours</span>
              <span>of Inspiration</span>
            </div>
          </motion.div> */}
        </motion.div>

      
      </div>
    </section>
  );
};

export default Hero;
