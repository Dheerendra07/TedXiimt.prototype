import React, { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

const ARTWORK_MASK = '/transparent-hero-bg.PNG?v=monument-art-20261118';
const NIGHT_ARTWORK = '/hero-bg.png?v=monument-art-20261118';

// Coordinates are tied to the original transparent artwork, not guessed DOM positions.
const MONUMENTS = [
  {
    id: 'lotus',
    name: 'LOTUS TEMPLE',
    bounds: { left: 0, top: 0.61, right: 0.275, bottom: 1 },
    palette: ['#D5E0E5', '#BCCACD', '#788B98'],
    highlight: '#EDF3F2',
  },
  {
    id: 'qutub',
    name: 'QUTUB MINAR',
    bounds: { left: 0.275, top: 0.29, right: 0.35, bottom: 1 },
    palette: ['#C27A52', '#A85C3C', '#623A2A'],
    highlight: '#FFD1A6',
  },
  {
    id: 'india-gate',
    name: 'INDIA GATE',
    bounds: { left: 0.48, top: 0.42, right: 0.68, bottom: 1 },
    palette: ['#CFA17B', '#AA7452', '#674B3A'],
    highlight: '#F2C9A3',
  },
];

const easeOutCubic = (value) => 1 - Math.pow(1 - value, 3);

export default function MonumentArtwork() {
  const frameRef = useRef(null);
  const colourCanvasRef = useRef(null);
  const trailCanvasRef = useRef(null);
  const [activeMonument, setActiveMonument] = useState(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const frame = frameRef.current;
    const revealCanvas = colourCanvasRef.current;
    const trailCanvas = trailCanvasRef.current;
    if (!frame || !revealCanvas || !trailCanvas) return undefined;

    const revealContext = revealCanvas.getContext('2d');
    const trailContext = trailCanvas.getContext('2d');
    const colourCanvas = document.createElement('canvas');
    const colourContext = colourCanvas.getContext('2d');
    if (!revealContext || !trailContext || !colourContext) return undefined;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let imageScale = 1;
    let imageLeft = 0;
    let imageTop = 0;
    let imageWidth = 0;
    let imageHeight = 0;
    let artworkWidth = 0;
    let artworkHeight = 0;
    let colourReady = false;
    let activeRegion = null;
    let revealStartedAt = 0;
    let revealFrame = 0;
    let trailFrame = 0;
    let disposed = false;
    let previousPoint = null;
    const trailCells = new Map();
    const CELL = 34;
    const INSET = 4;
    const HOLD = 430;
    const FADE = 260;

    const resizeCanvas = (canvas, context) => {
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawReveal = (now) => {
      revealFrame = 0;
      revealContext.clearRect(0, 0, width, height);
      if (!colourReady || !activeRegion) return;

      const progress = reduceMotion ? 1 : Math.min(1, Math.max(0, (now - revealStartedAt) / 520));
      const alpha = easeOutCubic(progress);
      const bounds = activeRegion.bounds;
      const left = imageLeft + bounds.left * imageWidth;
      const top = imageTop + bounds.top * imageHeight;
      const right = imageLeft + bounds.right * imageWidth;
      const bottom = imageTop + bounds.bottom * imageHeight;

      revealContext.save();
      revealContext.beginPath();
      revealContext.rect(left, top, right - left, bottom - top);
      revealContext.clip();
      revealContext.globalAlpha = alpha;
      revealContext.drawImage(colourCanvas, imageLeft, imageTop, imageWidth, imageHeight);
      revealContext.restore();

      if (progress < 1) revealFrame = window.requestAnimationFrame(drawReveal);
    };

    const buildColourArtwork = (maskImage, nightImage) => {
      artworkWidth = maskImage.naturalWidth;
      artworkHeight = maskImage.naturalHeight;
      if (!artworkWidth || !artworkHeight) return;

      colourCanvas.width = artworkWidth;
      colourCanvas.height = artworkHeight;
      colourContext.clearRect(0, 0, artworkWidth, artworkHeight);
      colourContext.drawImage(nightImage, 0, 0, artworkWidth, artworkHeight);

      MONUMENTS.forEach((monument) => {
        const { left, top, right, bottom } = monument.bounds;
        const x = left * artworkWidth;
        const y = top * artworkHeight;
        const w = (right - left) * artworkWidth;
        const h = (bottom - top) * artworkHeight;
        colourContext.save();
        colourContext.beginPath();
        colourContext.rect(x, y, w, h);
        colourContext.clip();

        const material = colourContext.createLinearGradient(0, y, 0, y + h);
        monument.palette.forEach((tone, index) => material.addColorStop(index / (monument.palette.length - 1), tone));
        colourContext.globalCompositeOperation = 'color';
        colourContext.fillStyle = material;
        colourContext.fillRect(x, y, w, h);

        const light = colourContext.createLinearGradient(0, y, 0, y + h);
        light.addColorStop(0, monument.highlight);
        light.addColorStop(0.42, 'rgba(0,0,0,.04)');
        light.addColorStop(1, 'rgba(0,0,0,0)');
        colourContext.globalCompositeOperation = 'screen';
        colourContext.globalAlpha = 0.32;
        colourContext.fillStyle = light;
        colourContext.fillRect(x, y, w, h);
        colourContext.restore();
      });

      colourContext.globalAlpha = 1;
      colourContext.globalCompositeOperation = 'destination-in';
      colourContext.drawImage(maskImage, 0, 0, artworkWidth, artworkHeight);
      colourContext.globalCompositeOperation = 'source-over';
      colourReady = true;
      drawReveal(performance.now());
    };

    const updateGeometry = () => {
      const rect = frame.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      resizeCanvas(revealCanvas, revealContext);
      resizeCanvas(trailCanvas, trailContext);

      if (!artworkWidth || !artworkHeight) return;
      imageScale = Math.max(width / artworkWidth, height / artworkHeight);
      imageWidth = artworkWidth * imageScale;
      imageHeight = artworkHeight * imageScale;
      imageLeft = (width - imageWidth) * 0.5;
      imageTop = (height - imageHeight) * 0.58;
      if (activeRegion) {
        revealStartedAt = performance.now() - (reduceMotion ? 520 : 0);
        if (!revealFrame) revealFrame = window.requestAnimationFrame(drawReveal);
      }
    };

    const maskImage = new Image();
    const nightImage = new Image();
    let maskLoaded = false;
    let nightLoaded = false;

    const initialize = () => {
      if (disposed || !maskLoaded || !nightLoaded) return;
      buildColourArtwork(maskImage, nightImage);
      updateGeometry();
    };

    maskImage.onload = () => { maskLoaded = true; initialize(); };
    nightImage.onload = () => { nightLoaded = true; initialize(); };
    maskImage.onerror = () => { frame.dataset.artworkStatus = 'mask-error'; };
    nightImage.onerror = () => { frame.dataset.artworkStatus = 'image-error'; };
    maskImage.decoding = 'async';
    nightImage.decoding = 'async';
    maskImage.src = ARTWORK_MASK;
    nightImage.src = NIGHT_ARTWORK;

    const drawTrail = (now) => {
      trailFrame = 0;
      trailContext.clearRect(0, 0, width, height);
      let hasCells = false;
      trailCells.forEach((cell, key) => {
        const age = now - cell.startedAt;
        const fade = Math.max(0, 1 - Math.max(0, age - HOLD) / FADE);
        if (fade <= 0) {
          trailCells.delete(key);
          return;
        }
        hasCells = true;
        const reveal = easeOutCubic(Math.min(1, age / 90));
        const size = CELL - INSET * 2;
        const x = cell.column * CELL + INSET;
        const y = cell.row * CELL + INSET;
        trailContext.save();
        trailContext.globalAlpha = fade * reveal * 0.72;
        trailContext.fillStyle = cell.tone;
        trailContext.shadowColor = 'rgba(235,0,40,.36)';
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
        column,
        row,
        startedAt: now,
        tone: ['#EB0028', '#B80C32', '#711329'][(column * 7 + row * 3) % 3],
      });
      while (trailCells.size > 120) trailCells.delete(trailCells.keys().next().value);
    };

    const handlePointerMove = (event) => {
      if (event.pointerType === 'touch' || !colourReady) return;
      const rect = frame.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      if (x < 0 || y < 0 || x > width || y > height) return;

      frame.style.setProperty('--pointer-x', x + 'px');
      frame.style.setProperty('--pointer-y', y + 'px');
      const sourceX = (x - imageLeft) / imageWidth;
      const sourceY = (y - imageTop) / imageHeight;
      const nextRegion = MONUMENTS.find(({ bounds }) => (
        sourceX >= bounds.left && sourceX <= bounds.right &&
        sourceY >= bounds.top && sourceY <= bounds.bottom
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
      activeRegion = null;
      setActiveMonument(null);
      frame.style.setProperty('--pointer-x', '-1000px');
      frame.style.setProperty('--pointer-y', '-1000px');
      revealStartedAt = performance.now();
      if (revealFrame) window.cancelAnimationFrame(revealFrame);
      revealFrame = window.requestAnimationFrame(drawReveal);
    };

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
      <img className="tedx-hero__monument-base" src={NIGHT_ARTWORK} alt="" draggable="false" />
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
