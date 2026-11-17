import React, { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

const ARTWORK_MASK = '/transparent-hero-bg.PNG?v=monument-art-20261118';
const NIGHT_ARTWORK = '/hero-bg.png?v=monument-art-20261118';
const COMPOSITION = { width: 1680, height: 1500 };

// Source bounds reference the supplied transparent artwork. Target positions create
// one balanced composition from only the three requested landmarks.
const MONUMENTS = [
  {
    id: 'lotus',
    name: 'LOTUS TEMPLE',
    source: { left: 0, top: 0.61, right: 0.275, bottom: 1 },
    target: { centerX: 0.18, maxWidth: 0.32, maxHeight: 0.52, bottom: 0.83 },
    palette: ['#D5E0E5', '#BCCACD', '#788B98'],
    highlight: '#EDF3F2',
  },
  {
    id: 'qutub',
    name: 'QUTUB MINAR',
    source: { left: 0.275, top: 0.29, right: 0.35, bottom: 1 },
    target: { centerX: 0.5, maxWidth: 0.16, maxHeight: 0.73, bottom: 0.83 },
    palette: ['#C27A52', '#A85C3C', '#623A2A'],
    highlight: '#FFD1A6',
  },
  {
    id: 'india-gate',
    name: 'INDIA GATE',
    source: { left: 0.48, top: 0.42, right: 0.68, bottom: 1 },
    target: { centerX: 0.82, maxWidth: 0.31, maxHeight: 0.53, bottom: 0.83 },
    palette: ['#CFA17B', '#AA7452', '#674B3A'],
    highlight: '#F2C9A3',
  },
];

const easeOutCubic = (value) => 1 - Math.pow(1 - value, 3);

export default function MonumentArtwork() {
  const frameRef = useRef(null);
  const baseCanvasRef = useRef(null);
  const colourCanvasRef = useRef(null);
  const trailCanvasRef = useRef(null);
  const [activeMonument, setActiveMonument] = useState(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const frame = frameRef.current;
    const baseCanvas = baseCanvasRef.current;
    const revealCanvas = colourCanvasRef.current;
    const trailCanvas = trailCanvasRef.current;
    if (!frame || !baseCanvas || !revealCanvas || !trailCanvas) return undefined;

    const baseContext = baseCanvas.getContext('2d');
    const revealContext = revealCanvas.getContext('2d');
    const trailContext = trailCanvas.getContext('2d');
    const compositionCanvas = document.createElement('canvas');
    const compositionContext = compositionCanvas.getContext('2d');
    if (!baseContext || !revealContext || !trailContext || !compositionContext) return undefined;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let imageScale = 1;
    let imageLeft = 0;
    let imageTop = 0;
    let imageWidth = 0;
    let imageHeight = 0;
    let activeRegion = null;
    let revealStartedAt = 0;
    let revealFrame = 0;
    let trailFrame = 0;
    let leaveTimer = 0;
    let disposed = false;
    let previousPoint = null;
    const trailCells = new Map();
    const CELL = 34;
    const INSET = 4;
    const HOLD = 430;
    const FADE = 260;
    let compositionReady = false;

    const setCanvasSize = (canvas, context) => {
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawReveal = (now) => {
      revealFrame = 0;
      revealContext.clearRect(0, 0, width, height);
      if (!compositionReady || !activeRegion) return;

      const progress = reduceMotion ? 1 : Math.min(1, Math.max(0, (now - revealStartedAt) / 540));
      const alpha = easeOutCubic(progress);
      const bounds = activeRegion.displayBounds;
      const left = imageLeft + bounds.left * imageWidth;
      const top = imageTop + bounds.top * imageHeight;
      const right = imageLeft + bounds.right * imageWidth;
      const bottom = imageTop + bounds.bottom * imageHeight;

      revealContext.save();
      revealContext.beginPath();
      revealContext.rect(left, top, right - left, bottom - top);
      revealContext.clip();
      revealContext.globalAlpha = alpha;
      revealContext.drawImage(compositionCanvas, imageLeft, imageTop, imageWidth, imageHeight);
      revealContext.restore();

      if (progress < 1) revealFrame = window.requestAnimationFrame(drawReveal);
    };

    const buildComposition = (maskImage, nightImage) => {
      compositionCanvas.width = COMPOSITION.width;
      compositionCanvas.height = COMPOSITION.height;
      compositionContext.clearRect(0, 0, COMPOSITION.width, COMPOSITION.height);
      compositionContext.fillStyle = '#080709';
      compositionContext.fillRect(0, 0, COMPOSITION.width, COMPOSITION.height);

      const ambient = compositionContext.createRadialGradient(
        COMPOSITION.width * 0.5, COMPOSITION.height * 0.56, 30,
        COMPOSITION.width * 0.5, COMPOSITION.height * 0.56, COMPOSITION.width * 0.68
      );
      ambient.addColorStop(0, 'rgba(94, 5, 27, .22)');
      ambient.addColorStop(0.58, 'rgba(37, 5, 15, .1)');
      ambient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      compositionContext.fillStyle = ambient;
      compositionContext.fillRect(0, 0, COMPOSITION.width, COMPOSITION.height);

      MONUMENTS.forEach((monument) => {
        const source = monument.source;
        const sx = source.left * maskImage.naturalWidth;
        const sy = source.top * maskImage.naturalHeight;
        const sw = (source.right - source.left) * maskImage.naturalWidth;
        const sh = (source.bottom - source.top) * maskImage.naturalHeight;
        const cutout = document.createElement('canvas');
        cutout.width = Math.max(1, Math.round(sw));
        cutout.height = Math.max(1, Math.round(sh));
        const cutoutContext = cutout.getContext('2d');
        if (!cutoutContext) return;

        cutoutContext.drawImage(nightImage, sx, sy, sw, sh, 0, 0, cutout.width, cutout.height);
        cutoutContext.globalCompositeOperation = 'destination-in';
        cutoutContext.drawImage(maskImage, sx, sy, sw, sh, 0, 0, cutout.width, cutout.height);
        cutoutContext.globalCompositeOperation = 'source-over';

        const material = cutoutContext.createLinearGradient(0, 0, 0, cutout.height);
        monument.palette.forEach((tone, index) => material.addColorStop(index / (monument.palette.length - 1), tone));
        cutoutContext.globalCompositeOperation = 'color';
        cutoutContext.fillStyle = material;
        cutoutContext.fillRect(0, 0, cutout.width, cutout.height);

        const light = cutoutContext.createLinearGradient(0, 0, 0, cutout.height);
        light.addColorStop(0, monument.highlight);
        light.addColorStop(0.42, 'rgba(0,0,0,.04)');
        light.addColorStop(1, 'rgba(0,0,0,0)');
        cutoutContext.globalCompositeOperation = 'screen';
        cutoutContext.globalAlpha = 0.28;
        cutoutContext.fillStyle = light;
        cutoutContext.fillRect(0, 0, cutout.width, cutout.height);
        cutoutContext.globalAlpha = 1;
        cutoutContext.globalCompositeOperation = 'destination-in';
        cutoutContext.drawImage(maskImage, sx, sy, sw, sh, 0, 0, cutout.width, cutout.height);
        cutoutContext.globalCompositeOperation = 'source-over';

        const target = monument.target;
        const maxW = target.maxWidth * COMPOSITION.width;
        const maxH = target.maxHeight * COMPOSITION.height;
        const scale = Math.min(maxW / cutout.width, maxH / cutout.height);
        const drawWidth = cutout.width * scale;
        const drawHeight = cutout.height * scale;
        const drawX = target.centerX * COMPOSITION.width - drawWidth / 2;
        const drawY = target.bottom * COMPOSITION.height - drawHeight;

        compositionContext.save();
        compositionContext.shadowColor = 'rgba(0,0,0,.5)';
        compositionContext.shadowBlur = 30;
        compositionContext.drawImage(cutout, drawX, drawY, drawWidth, drawHeight);
        compositionContext.restore();

        monument.displayBounds = {
          left: drawX / COMPOSITION.width,
          top: drawY / COMPOSITION.height,
          right: (drawX + drawWidth) / COMPOSITION.width,
          bottom: (drawY + drawHeight) / COMPOSITION.height,
        };
      });

      compositionReady = true;
      updateGeometry();
    };

    const drawStaticColour = () => {
      if (!compositionReady) return;
      revealContext.clearRect(0, 0, width, height);
      revealContext.drawImage(compositionCanvas, imageLeft, imageTop, imageWidth, imageHeight);
    };

    const updateGeometry = () => {
      const rect = frame.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      setCanvasSize(baseCanvas, baseContext);
      setCanvasSize(revealCanvas, revealContext);
      setCanvasSize(trailCanvas, trailContext);

      imageScale = Math.max(width / COMPOSITION.width, height / COMPOSITION.height);
      imageWidth = COMPOSITION.width * imageScale;
      imageHeight = COMPOSITION.height * imageScale;
      imageLeft = (width - imageWidth) * 0.5;
      imageTop = (height - imageHeight) * 0.5;

      if (compositionReady) {
        baseContext.clearRect(0, 0, width, height);
        baseContext.filter = 'grayscale(1) brightness(.58) contrast(1.12)';
        baseContext.drawImage(compositionCanvas, imageLeft, imageTop, imageWidth, imageHeight);
        baseContext.filter = 'none';
        if (window.matchMedia('(hover: none)').matches || reduceMotion) {
          drawStaticColour();
        } else {
          drawReveal(performance.now());
        }
      }
    };

    const drawTrail = (now) => {
      trailFrame = 0;
      trailContext.clearRect(0, 0, width, height);
      let hasCells = false;
      trailCells.forEach((cell) => {
        const age = now - cell.startedAt;
        const fade = Math.max(0, 1 - Math.max(0, age - HOLD) / FADE);
        if (fade <= 0) {
          trailCells.delete(cell.key);
          return;
        }
        hasCells = true;
        const reveal = easeOutCubic(Math.min(1, age / 90));
        const size = CELL - INSET * 2;
        const x = cell.column * CELL + INSET;
        const y = cell.row * CELL + INSET;
        trailContext.save();
        trailContext.globalAlpha = fade * reveal * 0.7;
        trailContext.fillStyle = cell.tone;
        trailContext.shadowColor = 'rgba(235,0,40,.34)';
        trailContext.shadowBlur = 10;
        trailContext.fillRect(x, y, size, size);
        trailContext.restore();
      });
      if (hasCells) trailFrame = window.requestAnimationFrame(drawTrail);
    };

    const addTrailCell = (column, row, now) => {
      const key = column + ':' + row;
      trailCells.delete(key);
      trailCells.set(key, {
        key, column, row, startedAt: now,
        tone: ['#EB0028', '#B80C32', '#711329'][(column * 7 + row * 3) % 3],
      });
      while (trailCells.size > 120) trailCells.delete(trailCells.keys().next().value);
    };

    const handlePointerMove = (event) => {
      if (event.pointerType === 'touch' || !compositionReady) return;
      const rect = frame.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      if (x < 0 || y < 0 || x > width || y > height) return;

      if (leaveTimer) window.clearTimeout(leaveTimer);
      revealCanvas.style.opacity = '1';
      frame.style.setProperty('--pointer-x', x + 'px');
      frame.style.setProperty('--pointer-y', y + 'px');

      const sourceX = (x - imageLeft) / imageWidth;
      const sourceY = (y - imageTop) / imageHeight;
      const nextRegion = MONUMENTS.find(({ displayBounds }) => (
        displayBounds &&
        sourceX >= displayBounds.left && sourceX <= displayBounds.right &&
        sourceY >= displayBounds.top && sourceY <= displayBounds.bottom
      )) || null;

      if (nextRegion !== activeRegion) {
        activeRegion = nextRegion;
        setActiveMonument(nextRegion?.id || null);
        revealStartedAt = performance.now();
        if (revealFrame) window.cancelAnimationFrame(revealFrame);
        revealFrame = window.requestAnimationFrame(drawReveal);
      }

      if (!nextRegion) {
        const column = Math.floor(x / CELL);
        const row = Math.floor(y / CELL);
        const now = performance.now();
        if (!previousPoint || previousPoint.column !== column || previousPoint.row !== row) {
          addTrailCell(column, row, now);
          if (previousPoint) {
            const steps = Math.max(Math.abs(column - previousPoint.column), Math.abs(row - previousPoint.row), 1);
            for (let step = 1; step < steps; step += 1) {
              const t = step / steps;
              addTrailCell(
                Math.round(previousPoint.column + (column - previousPoint.column) * t),
                Math.round(previousPoint.row + (row - previousPoint.row) * t),
                now,
              );
            }
          }
          previousPoint = { column, row };
          if (!trailFrame) trailFrame = window.requestAnimationFrame(drawTrail);
        }
      } else {
        previousPoint = null;
      }
    };

    const handlePointerLeave = () => {
      previousPoint = null;
      revealCanvas.style.opacity = '0';
      frame.style.setProperty('--pointer-x', '-1000px');
      frame.style.setProperty('--pointer-y', '-1000px');
      if (leaveTimer) window.clearTimeout(leaveTimer);
      leaveTimer = window.setTimeout(() => {
        activeRegion = null;
        setActiveMonument(null);
        revealContext.clearRect(0, 0, width, height);
      }, reduceMotion ? 0 : 360);
    };

    const maskImage = new Image();
    const nightImage = new Image();
    let maskLoaded = false;
    let nightLoaded = false;
    const initialize = () => {
      if (disposed || !maskLoaded || !nightLoaded) return;
      buildComposition(maskImage, nightImage);
    };
    maskImage.onload = () => { maskLoaded = true; initialize(); };
    nightImage.onload = () => { nightLoaded = true; initialize(); };
    maskImage.onerror = () => { frame.dataset.artworkStatus = 'mask-error'; };
    nightImage.onerror = () => { frame.dataset.artworkStatus = 'image-error'; };
    maskImage.decoding = 'async';
    nightImage.decoding = 'async';
    maskImage.src = ARTWORK_MASK;
    nightImage.src = NIGHT_ARTWORK;

    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateGeometry) : null;
    observer?.observe(frame);
    window.addEventListener('resize', updateGeometry, { passive: true });
    frame.addEventListener('pointermove', handlePointerMove, { passive: true });
    frame.addEventListener('pointerleave', handlePointerLeave, { passive: true });
    updateGeometry();

    return () => {
      disposed = true;
      observer?.disconnect();
      window.removeEventListener('resize', updateGeometry);
      frame.removeEventListener('pointermove', handlePointerMove);
      frame.removeEventListener('pointerleave', handlePointerLeave);
      if (leaveTimer) window.clearTimeout(leaveTimer);
      if (revealFrame) window.cancelAnimationFrame(revealFrame);
      if (trailFrame) window.cancelAnimationFrame(trailFrame);
      trailCells.clear();
    };
  }, [reduceMotion]);

  return (
    <div
      ref={frameRef}
      className="tedx-hero__monument-art"
      data-active-monument={activeMonument || ''}
      aria-label="Interactive artwork featuring the Lotus Temple, Qutub Minar and India Gate"
      role="img"
    >
      <canvas ref={baseCanvasRef} className="tedx-hero__monument-base" aria-hidden="true" />
      <canvas ref={colourCanvasRef} className="tedx-hero__monument-colour" aria-hidden="true" />
      <canvas ref={trailCanvasRef} className="tedx-hero__monument-trail" aria-hidden="true" />
      <div className="tedx-hero__monument-vignette" aria-hidden="true" />
      <div className="tedx-hero__monument-pointer" aria-hidden="true" />
      <div className="tedx-hero__monument-labels" aria-hidden="true">
        {MONUMENTS.map((monument, index) => (
          <span key={monument.id} className={activeMonument === monument.id ? 'is-active' : ''}>
            <i>0{index + 1}</i>{monument.name}
          </span>
        ))}
      </div>
    </div>
  );
}
