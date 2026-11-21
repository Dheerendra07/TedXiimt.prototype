import React, { useEffect, useRef } from 'react';
import logo from './logo-white.png';
import './Footer.css';

const footerGroups = [
  {
    number: '01',
    title: 'Explore',
    links: [
      { label: 'About TEDx & our mission', href: '/about' },
      { label: 'Speaker lineup', href: '/speakers' },
      { label: 'Organizing team', href: '/team' },
      { label: 'Multi-year archive', href: '/library' },
    ],
  },
  {
    number: '02',
    title: 'The experience',
    links: [
      { label: 'Event schedule', href: '/schedule' },
      { label: 'Venue & directions', href: '/venue' },
      { label: 'Photo & video gallery', href: '/gallery' },
      { label: 'What to expect', href: '/what-to-expect' },
      { label: 'Frequently asked questions', href: '/faq' },
    ],
  },
  {
    number: '03',
    title: 'Get involved',
    links: [
      { label: 'Register as an attendee', href: '/register' },
      { label: 'Apply to speak', href: '/speaker-apply' },
      { label: 'Partner with us', href: '/join-us/sponsor' },
      { label: 'Contact the team', href: '/contact' },
      { label: 'Code of conduct', href: '/code-of-conduct' },
    ],
  },
];

const MOSAIC_PALETTE = ['#EB0028', '#CF1237', '#A80F2D', '#7D1028', '#570F22', '#B31E3D'];
const MOSAIC_TRAIL_PALETTE = MOSAIC_PALETTE.slice(0, 3);
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

const Footer = () => {
  const artworkRef = useRef(null);
  const trailCanvasRef = useRef(null);

  useEffect(() => {
    const surface = artworkRef.current;
    const canvas = trailCanvasRef.current;
    if (!surface || !canvas) return undefined;

    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return undefined;

    const CELL_INSET = 4;
    const REVEAL_MS = 80;
    const HOLD_MS = 680;
    const ERASE_MS = 280;
    const MAX_ACTIVE_CELLS = 180;
    const SAMPLE_POINTS = [0.1, 0.3, 0.5, 0.7, 0.9];
    const maskCanvas = document.createElement('canvas');
    const maskContext = maskCanvas.getContext('2d', { willReadFrequently: true });
    const maskImage = new Image();
    const safeCells = new Set();
    const cells = new Map();
    const accents = surface.querySelectorAll('[data-footer-mosaic-accent]');
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let cellSize = 40;
    let tileSize = 32;
    let pixelRatio = 1;
    let gridColumns = 0;
    let gridRows = 0;
    let maskPixels = null;
    let maskReady = false;
    let previousCell = null;
    let animationFrame = 0;
    let disposed = false;

    const cellTouchesArtwork = (column, row, cellWidth = 1, cellHeight = 1) => {
      if (!maskReady || !maskPixels || !width || !height) return false;

      for (let y = 0; y < cellHeight; y += 1) {
        for (let x = 0; x < cellWidth; x += 1) {
          for (let sampleY = 0; sampleY < SAMPLE_POINTS.length; sampleY += 1) {
            for (let sampleX = 0; sampleX < SAMPLE_POINTS.length; sampleX += 1) {
              const localX = ((column + x) * cellSize) + CELL_INSET + (tileSize * SAMPLE_POINTS[sampleX]);
              const localY = ((row + y) * cellSize) + CELL_INSET + (tileSize * SAMPLE_POINTS[sampleY]);
              if (localX < 0 || localY < 0 || localX >= width || localY >= height) continue;

              const sourceX = Math.min(maskCanvas.width - 1, Math.max(0, Math.floor((localX / width) * maskCanvas.width)));
              const sourceY = Math.min(maskCanvas.height - 1, Math.max(0, Math.floor((localY / height) * maskCanvas.height)));
              const alphaIndex = ((sourceY * maskCanvas.width) + sourceX) * 4 + 3;
              if (maskPixels[alphaIndex] > 24) return true;
            }
          }
        }
      }

      return false;
    };

    const rebuildGrid = () => {
      safeCells.clear();
      gridColumns = Math.ceil(width / cellSize);
      gridRows = Math.ceil(height / cellSize);

      if (maskReady) {
        for (let row = 0; row < gridRows; row += 1) {
          for (let column = 0; column < gridColumns; column += 1) {
            if (!cellTouchesArtwork(column, row)) {
              safeCells.add(column + ':' + row);
            }
          }
        }
      }

      accents.forEach((accent) => {
        const column = Number(accent.dataset.footerColumn);
        const row = Number(accent.dataset.footerRow);
        const accentWidth = Number(accent.dataset.footerWidth);
        const accentHeight = Number(accent.dataset.footerHeight);
        accent.style.visibility = !maskReady || !cellTouchesArtwork(column, row, accentWidth, accentHeight)
          ? 'visible'
          : 'hidden';
      });
    };

    const resizeCanvas = () => {
      const bounds = surface.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      cellSize = Math.round(Math.min(40, Math.max(30, width * 0.023)));
      tileSize = cellSize - (CELL_INSET * 2);
      surface.style.setProperty('--ted-footer-cell', cellSize + 'px');

      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(width * pixelRatio));
      canvas.height = Math.max(1, Math.round(height * pixelRatio));
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);
      cells.clear();
      previousCell = null;
      rebuildGrid();
    };

    const activateCell = (column, row, enteredAt) => {
      const key = column + ':' + row;
      if (!safeCells.has(key)) return;

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
        activateCell(x, y, startedAt + ((finishedAt - startedAt) * Math.min(1, step / longest)));
      }
    };

    const drawCell = (cell, now) => {
      if (!safeCells.has(cell.column + ':' + cell.row)) return false;
      const eraseAge = now - cell.eraseAt;
      if (eraseAge >= ERASE_MS) return false;

      const reveal = 1 - Math.pow(1 - Math.min(1, Math.max(0, now - cell.enteredAt) / REVEAL_MS), 3);
      const eraseProgress = eraseAge <= 0 ? 0 : Math.min(1, eraseAge / ERASE_MS);
      const smoothErase = eraseProgress * eraseProgress * (3 - (2 * eraseProgress));
      const opacity = reveal * (1 - smoothErase);
      const scale = 1 - (0.06 * smoothErase);
      const left = (cell.column * cellSize) + CELL_INSET;
      const top = (cell.row * cellSize) + CELL_INSET;
      const tone = MOSAIC_TRAIL_PALETTE[(cell.column * 7 + cell.row * 3) % MOSAIC_TRAIL_PALETTE.length];

      context.save();
      context.globalAlpha = opacity * 0.84;
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
      if (event.pointerType === 'touch' || !maskReady || safeCells.size === 0) {
        previousCell = null;
        return;
      }

      const bounds = surface.getBoundingClientRect();
      const localX = event.clientX - bounds.left;
      const localY = event.clientY - bounds.top;
      if (localX < 0 || localY < 0 || localX >= width || localY >= height) {
        previousCell = null;
        return;
      }

      const now = performance.now();
      const nextCell = {
        column: Math.floor(localX / cellSize),
        row: Math.floor(localY / cellSize),
      };

      if (!previousCell) {
        activateCell(nextCell.column, nextCell.row, now);
      } else if (nextCell.column !== previousCell.column || nextCell.row !== previousCell.row) {
        traceGridLine(previousCell, nextCell, previousCell.time, now);
      }

      previousCell = { ...nextCell, time: now };
      requestDraw();
    };

    const handlePointerLeave = () => {
      previousCell = null;
    };

    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(resizeCanvas)
      : null;

    maskImage.decoding = 'async';
    maskImage.onload = () => {
      if (disposed || !maskContext) return;
      maskCanvas.width = maskImage.naturalWidth;
      maskCanvas.height = maskImage.naturalHeight;
      maskContext.drawImage(maskImage, 0, 0);
      try {
        maskPixels = maskContext.getImageData(0, 0, maskCanvas.width, maskCanvas.height).data;
        maskReady = true;
      } catch (error) {
        maskPixels = null;
        maskReady = false;
        console.warn('[TEDx footer] Mosaic artwork mask unavailable.', error);
      }
      resizeCanvas();
    };
    maskImage.onerror = () => {
      maskReady = false;
      maskPixels = null;
      rebuildGrid();
    };
    maskImage.src = '/transparent-hero-bg.PNG';

    resizeCanvas();
    resizeObserver?.observe(surface);
    window.addEventListener('resize', resizeCanvas, { passive: true });
    if (!prefersReducedMotion) {
      surface.addEventListener('pointermove', handlePointerMove, { passive: true });
      surface.addEventListener('pointerleave', handlePointerLeave, { passive: true });
    }

    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      window.removeEventListener('resize', resizeCanvas);
      surface.removeEventListener('pointermove', handlePointerMove);
      surface.removeEventListener('pointerleave', handlePointerLeave);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      cells.clear();
      context.clearRect(0, 0, width, height);
      maskImage.onload = null;
      maskImage.onerror = null;
    };
  }, []);

  return (
    <footer className="ted-site-footer">
      <div className="ted-footer-shell">
        <div ref={artworkRef} className="ted-footer-artwork" aria-hidden="true">
          <div className="ted-footer-artwork__image" />
          <div className="ted-footer-artwork__shade" />
          <div className="ted-footer-artwork__grid" />
          <div className="ted-footer-artwork__tiles">
            {MOSAIC_ACCENTS.map((cell, index) => (
              <span
                key={index}
                data-footer-mosaic-accent
                data-footer-column={cell.column}
                data-footer-row={cell.row}
                data-footer-width={cell.width}
                data-footer-height={cell.height}
                className="ted-footer-tile"
                style={{
                  left: 'calc(var(--ted-footer-cell, 40px) * ' + cell.column + ' + 4px)',
                  top: 'calc(var(--ted-footer-cell, 40px) * ' + cell.row + ' + 4px)',
                  width: 'calc(var(--ted-footer-cell, 40px) * ' + cell.width + ' - 8px)',
                  height: 'calc(var(--ted-footer-cell, 40px) * ' + cell.height + ' - 8px)',
                  backgroundColor: MOSAIC_PALETTE[cell.color],
                  opacity: Math.min(cell.opacity, 0.5),
                  visibility: 'hidden',
                }}
              />
            ))}
          </div>
          <canvas ref={trailCanvasRef} className="ted-footer-artwork__trail" />
        </div>

        <div className="ted-footer-navigation-grid">
          <div className="ted-footer-brand-cell">
            <a
              href="/"
              className="ted-footer-logo-link"
              aria-label="TEDxIIMT University home"
            >
              <img src={logo} alt="TEDxIIMT University" className="ted-footer-logo" />
            </a>
            <p className="ted-footer-brand-copy">
              A platform for curious minds, courageous ideas and conversations
              that move perspectives forward.
            </p>
          </div>

          {footerGroups.map((group) => (
            <nav
              className="ted-footer-column"
              aria-label={group.title}
              key={group.number}
            >
              <h3 className="ted-footer-column__heading">
                <span>{group.number}</span>
                {group.title}
              </h3>
              <ul className="ted-footer-link-list">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <a className="ted-footer-link" href={link.href}>
                      <span>{link.label}</span>
                      <span className="ted-footer-link__arrow" aria-hidden="true">↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="ted-footer-legal">
          <p className="ted-footer-legal__disclaimer">
            This independent <strong>TEDx</strong> event is operated under license from{' '}
            <a href="https://www.ted.com/tedx" target="_blank" rel="noopener noreferrer">TED</a>.
            © {new Date().getFullYear()} TEDxIIMT University. All rights reserved.
          </p>
          <nav className="ted-footer-legal__links" aria-label="Legal links">
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
            <a href="https://www.ted.com" target="_blank" rel="noopener noreferrer">TED.com</a>
            <a href="#main-content" className="ted-footer-back-top">
              Back to top <span aria-hidden="true">↑</span>
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
