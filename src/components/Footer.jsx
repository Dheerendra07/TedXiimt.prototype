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
  const [isAssembled, setIsAssembled] = useState(false);

  useEffect(() => {
    const surface = artworkRef.current;
    if (!surface) return undefined;

    const updateLayout = () => {
      const bounds = surface.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;

      const cellSize = Math.round(Math.min(40, Math.max(30, window.innerWidth * 0.023)));
      const columns = Math.ceil(bounds.width / cellSize);
      const rows = Math.ceil(bounds.height / cellSize);
      const coverScale = Math.max(
        bounds.width / PUZZLE_IMAGE_WIDTH,
        bounds.height / PUZZLE_IMAGE_HEIGHT
      );
      const renderedWidth = PUZZLE_IMAGE_WIDTH * coverScale;
      const renderedHeight = PUZZLE_IMAGE_HEIGHT * coverScale;
      const offsetX = (bounds.width - renderedWidth) * 0.5;
      const offsetY = (bounds.height - renderedHeight) * 0.64;

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
      setIsAssembled(true);
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setIsAssembled(true);
        observer.disconnect();
      }
    }, {
      threshold: 0.16,
      rootMargin: '0px 0px -5% 0px',
    });

    observer.observe(surface);
    return () => observer.disconnect();
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

    // A deterministic diagonal weave makes the image assemble like a puzzle,
    // rather than using random positions or a flashy repeating effect.
    cells.sort((a, b) => {
      if (a.diagonal !== b.diagonal) return a.diagonal - b.diagonal;
      return a.row % 2 === 0
        ? a.column - b.column
        : b.column - a.column;
    });

    const accentBlocks = [
      {
        column: Math.round(columns * 0.16),
        row: Math.round(rows * 0.16),
        width: 2,
        height: 2,
        tone: 'rgba(168, 15, 45, 0.3)',
      },
      {
        column: Math.round(columns * 0.48),
        row: Math.round(rows * 0.48),
        width: 2,
        height: 2,
        tone: 'rgba(235, 0, 40, 0.22)',
      },
      {
        column: Math.round(columns * 0.76),
        row: Math.round(rows * 0.18),
        width: 2,
        height: 1,
        tone: 'rgba(207, 18, 55, 0.26)',
      },
      {
        column: Math.round(columns * 0.88),
        row: Math.round(rows * 0.68),
        width: 1,
        height: 2,
        tone: 'rgba(87, 15, 34, 0.3)',
      },
    ];

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
      };
    });
  }, [puzzleLayout]);

  return (
    <footer className="ted-site-footer">
      <div className="ted-footer-shell">
        <div
          ref={artworkRef}
          className={'ted-footer-artwork' + (isAssembled ? ' is-assembling' : '')}
          aria-hidden="true"
          style={{ '--ted-footer-cell': puzzleLayout.cellSize + 'px' }}
        >
          <div className="ted-footer-artwork__image" />
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
                  '--puzzle-delay': (cell.order * 5) + 'ms',
                  '--puzzle-accent': cell.accent || 'transparent',
                }}
              />
            ))}
          </div>
          <div className="ted-footer-artwork__grid" />
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