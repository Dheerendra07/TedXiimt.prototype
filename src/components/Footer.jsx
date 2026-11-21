import React, { useEffect, useMemo, useRef, useState } from 'react';
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

const PUZZLE_IMAGE_WIDTH = 1920;
const PUZZLE_IMAGE_HEIGHT = 1080;

const Footer = () => {
  const artworkRef = useRef(null);
  const [puzzleLayout, setPuzzleLayout] = useState({
    columns: 0,
    rows: 0,
    cellSize: 40,
    width: 0,
    height: 0,
    renderedWidth: 0,
    renderedHeight: 0,
    offsetX: 0,
    offsetY: 0,
  });
  const [isPuzzleActive, setIsPuzzleActive] = useState(false);
  const [puzzleMode, setPuzzleMode] = useState(0);

  useEffect(() => {
    const surface = artworkRef.current;
    if (!surface) return undefined;

    const updateLayout = () => {
      const bounds = surface.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;

      const cellSize = Math.round(Math.min(40, Math.max(30, window.innerWidth * 0.023)));
      const columns = Math.ceil(bounds.width / cellSize);
      const rows = Math.ceil(bounds.height / cellSize);
      // Fit the complete original 16:9 artwork inside the compact frame.
      // A separate ambient cover layer fills the remaining side space.
      const fitScale = Math.min(
        bounds.width / PUZZLE_IMAGE_WIDTH,
        bounds.height / PUZZLE_IMAGE_HEIGHT
      );
      const renderedWidth = PUZZLE_IMAGE_WIDTH * fitScale;
      const renderedHeight = PUZZLE_IMAGE_HEIGHT * fitScale;
      const offsetX = (bounds.width - renderedWidth) * 0.5;
      const offsetY = (bounds.height - renderedHeight) * 0.5;

      setPuzzleLayout((current) => {
        const unchanged = (
          current.columns === columns &&
          current.rows === rows &&
          current.cellSize === cellSize &&
          Math.abs(current.width - bounds.width) < 1 &&
          Math.abs(current.height - bounds.height) < 1
        );
        if (unchanged) return current;
        return {
          columns,
          rows,
          cellSize,
          width: bounds.width,
          height: bounds.height,
          renderedWidth,
          renderedHeight,
          offsetX,
          offsetY,
        };
      });
    };

    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(updateLayout)
      : null;

    resizeObserver?.observe(surface);
    window.addEventListener('resize', updateLayout, { passive: true });
    updateLayout();

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updateLayout);
    };
  }, []);

  useEffect(() => {
    const surface = artworkRef.current;
    if (!surface) return undefined;

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion || typeof IntersectionObserver === 'undefined') {
      setIsPuzzleActive(false);
      return undefined;
    }

    let intervalId = null;
    const observer = new IntersectionObserver((entries) => {
      const isVisible = entries.some((entry) => entry.isIntersecting);
      if (isVisible) {
        setIsPuzzleActive(true);
        if (intervalId === null) {
          // Six different grid puzzle passes cycle while the artwork is in view.
          intervalId = window.setInterval(() => {
            setPuzzleMode((current) => (current + 1) % 6);
          }, 6800);
        }
      } else {
        setIsPuzzleActive(false);
        if (intervalId !== null) {
          window.clearInterval(intervalId);
          intervalId = null;
        }
      }
    }, {
      threshold: 0.14,
      rootMargin: '0px 0px -6% 0px',
    });

    observer.observe(surface);
    return () => {
      observer.disconnect();
      if (intervalId !== null) window.clearInterval(intervalId);
    };
  }, []);

  const puzzleCells = useMemo(() => {
    const { columns, rows, cellSize, width, height } = puzzleLayout;
    if (!columns || !rows || !width || !height) return [];

    const cells = [];
    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        cells.push({
          column,
          row,
          diagonal: column + row,
          left: column * cellSize,
          top: row * cellSize,
          width: Math.max(0, Math.min(cellSize - 1, width - (column * cellSize) - 1)),
          height: Math.max(0, Math.min(cellSize - 1, height - (row * cellSize) - 1)),
        });
      }
    }

    // Six deterministic puzzle paths: diagonal, row snake, column snake,
    // center-out, four-corner convergence, and perimeter-to-center spiral.
    const centerX = (columns - 1) / 2;
    const centerY = (rows - 1) / 2;
    const ringOf = (cell) => Math.min(
      cell.column,
      cell.row,
      columns - 1 - cell.column,
      rows - 1 - cell.row
    );
    const angleOf = (cell) => {
      const angle = Math.atan2(cell.row - centerY, cell.column - centerX);
      return (angle + (Math.PI * 2)) % (Math.PI * 2);
    };

    const orderCells = (a, b) => {
      if (puzzleMode === 0) {
        return (a.diagonal - b.diagonal) ||
          (a.row % 2 === 0 ? a.column - b.column : b.column - a.column);
      }
      if (puzzleMode === 1) {
        return (a.row - b.row) ||
          (a.row % 2 === 0 ? a.column - b.column : b.column - a.column);
      }
      if (puzzleMode === 2) {
        return (a.column - b.column) ||
          (a.column % 2 === 0 ? a.row - b.row : b.row - a.row);
      }
      if (puzzleMode === 3) {
        const distanceA = Math.hypot(a.column - centerX, a.row - centerY);
        const distanceB = Math.hypot(b.column - centerX, b.row - centerY);
        return (distanceA - distanceB) || (angleOf(a) - angleOf(b));
      }
      if (puzzleMode === 4) {
        const cornerDistance = (cell) => Math.min(
          Math.hypot(cell.column, cell.row),
          Math.hypot(columns - 1 - cell.column, cell.row),
          Math.hypot(cell.column, rows - 1 - cell.row),
          Math.hypot(columns - 1 - cell.column, rows - 1 - cell.row)
        );
        return (cornerDistance(a) - cornerDistance(b)) || (angleOf(a) - angleOf(b));
      }
      return (ringOf(a) - ringOf(b)) || (angleOf(a) - angleOf(b));
    };

    cells.sort(orderCells);

    const accentAnchors = [
      [[0.14, 0.16], [0.46, 0.42], [0.78, 0.2], [0.84, 0.7]],
      [[0.12, 0.35], [0.36, 0.58], [0.68, 0.28], [0.9, 0.62]],
      [[0.24, 0.12], [0.48, 0.46], [0.72, 0.68], [0.86, 0.28]],
      [[0.5, 0.34], [0.36, 0.52], [0.64, 0.52], [0.5, 0.72]],
      [[0.08, 0.12], [0.9, 0.12], [0.08, 0.78], [0.9, 0.78]],
      [[0.5, 0.08], [0.88, 0.5], [0.5, 0.82], [0.12, 0.5]],
    ][puzzleMode];

    const accentBlocks = accentAnchors.map(([x, y], index) => ({
      column: Math.max(0, Math.min(columns - 2, Math.round(columns * x))),
      row: Math.max(0, Math.min(rows - 2, Math.round(rows * y))),
      width: index % 2 === 0 ? 2 : 1,
      height: index % 2 === 0 ? 2 : 1,
      tone: [
        'rgba(168, 15, 45, 0.3)',
        'rgba(235, 0, 40, 0.22)',
        'rgba(207, 18, 55, 0.26)',
        'rgba(87, 15, 34, 0.28)',
      ][index],
    }));

    const entryTransform = (cell) => {
      if (puzzleMode === 0) return 'translate3d(-8px, -8px, 0) rotate(-1deg) scale(0.88)';
      if (puzzleMode === 1) return 'translate3d(0, ' + (cell.row % 2 ? '-10px' : '10px') + ', 0) scale(0.92)';
      if (puzzleMode === 2) return 'translate3d(' + (cell.column % 2 ? '-10px' : '10px') + ', 0, 0) scale(0.92)';
      if (puzzleMode === 3) return 'translate3d(0, 0, 0) scale(0.68)';
      if (puzzleMode === 4) {
        const x = cell.column < centerX ? -9 : 9;
        const y = cell.row < centerY ? -9 : 9;
        return 'translate3d(' + x + 'px, ' + y + 'px, 0) rotate(' + ((cell.column + cell.row) % 2 ? '-2deg' : '2deg') + ') scale(0.86)';
      }
      return 'translate3d(0, -11px, 0) rotate(2deg) scale(0.88)';
    };

    return cells.map((cell, index) => {
      const accent = accentBlocks.find((block) => (
        cell.column >= block.column &&
        cell.column < block.column + block.width &&
        cell.row >= block.row &&
        cell.row < block.row + block.height
      ));

      return {
        ...cell,
        key: cell.column + ':' + cell.row,
        order: index,
        accent: accent ? accent.tone : null,
        entryTransform: entryTransform(cell),
      };
    });
  }, [puzzleLayout, puzzleMode]);

  return (
    <footer className="ted-site-footer">
      <div className="ted-footer-shell">
        <section className="ted-footer-stage" aria-label="Explore TEDxIIMT University">
        <div
          ref={artworkRef}
          className={'ted-footer-artwork' + (isPuzzleActive ? ' is-puzzling puzzle-mode-' + puzzleMode : '')}
          aria-hidden="true"
          style={{ '--ted-footer-cell': puzzleLayout.cellSize + 'px' }}
        >
          <div className="ted-footer-artwork__image" />
          <div
            className="ted-footer-artwork__full-image"
            style={{
              backgroundSize: puzzleLayout.renderedWidth + 'px ' + puzzleLayout.renderedHeight + 'px',
              backgroundPosition: 'center center',
            }}
          />
          <div className="ted-footer-artwork__shade" />
          <div className="ted-footer-artwork__tiles">
            {puzzleCells.map((cell) => (
              <span
                key={cell.key}
                className={'ted-footer-puzzle-cell' + (cell.accent ? ' ted-footer-puzzle-cell--accent' : '')}
                style={{
                  left: (cell.left + 1) + 'px',
                  top: (cell.top + 1) + 'px',
                  width: cell.width + 'px',
                  height: cell.height + 'px',
                  backgroundSize: puzzleLayout.renderedWidth + 'px ' + puzzleLayout.renderedHeight + 'px',
                  backgroundPosition: (puzzleLayout.offsetX - cell.left - 1) + 'px ' + (puzzleLayout.offsetY - cell.top - 1) + 'px',
                  '--puzzle-delay': (cell.order * 6) + 'ms',
                  '--puzzle-accent': cell.accent || 'transparent',
                  '--puzzle-entry-transform': cell.entryTransform,
                }}
              />
            ))}
          </div>
          <div className="ted-footer-artwork__grid" />
        </div>
        <div className="ted-footer-stage__atmosphere" aria-hidden="true" />

        <div className="ted-footer-navigation-grid">
          <div className="ted-footer-brand-cell">
            <p className="ted-footer-brand-kicker">Curious minds · Courageous ideas</p>
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
        </section>

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