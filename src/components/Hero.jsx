import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion as Motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, CalendarDays, MapPin, MoveDown, Play } from 'lucide-react';
import { useEdition } from '../context/EditionContext';
import './Hero.css';

const GRID_COLUMNS = { mobile: 12, tablet: 24, desktop: 40 };

const getCellTone = (index, columns) => {
  const row = Math.floor(index / columns);
  const pattern = (index * 17 + row * 11) % 61;
  if (pattern === 0) return 'red';
  if (pattern === 9) return 'crimson';
  if (pattern === 27) return 'burgundy';
  return '';
};

const formatEventDate = (edition) => {
  if (!edition || edition.is_active !== true || !edition.date) return null;
  const date = new Date(edition.date);
  if (Number.isNaN(date.getTime()) || date.getTime() < Date.now()) return null;
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(date);
};

const Hero = () => {
  const reduceMotion = useReducedMotion();
  const { activeEdition, loading } = useEdition();
  const heroRef = useRef(null);
  const cellsRef = useRef(new Map());
  const timersRef = useRef(new Map());
  const lastCellRef = useRef(-1);
  const [gridSize, setGridSize] = useState({ columns: GRID_COLUMNS.desktop, rows: 28 });

  useEffect(() => {
    const measure = () => {
      const element = heroRef.current;
      if (!element) return;
      const width = element.clientWidth || window.innerWidth;
      const height = element.clientHeight || window.innerHeight;
      const columns = width < 760 ? GRID_COLUMNS.mobile : width < 1100 ? GRID_COLUMNS.tablet : GRID_COLUMNS.desktop;
      const cellSize = width / columns;
      const rows = Math.ceil(height / cellSize) + 1;
      setGridSize((current) => (
        current.columns === columns && current.rows === rows ? current : { columns, rows }
      ));
    };
    measure();
    window.addEventListener('resize', measure, { passive: true });
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    if (heroRef.current && observer) observer.observe(heroRef.current);
    return () => {
      window.removeEventListener('resize', measure);
      observer?.disconnect();
    };
  }, []);

  useEffect(() => () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current.clear();
  }, []);

  const cells = useMemo(
    () => Array.from({ length: gridSize.columns * gridSize.rows }, (_, index) => ({
      index, tone: getCellTone(index, gridSize.columns),
    })),
    [gridSize],
  );

  const eventDate = useMemo(
    () => (!loading ? formatEventDate(activeEdition) : null),
    [activeEdition, loading],
  );
  const hasUpcomingEdition = activeEdition?.is_active === true
    && (!activeEdition.date || new Date(activeEdition.date).getTime() >= Date.now());
  const venueLabel = activeEdition?.is_active === true && activeEdition.venue
    ? activeEdition.venue
    : 'IIMT University, Meerut';

  const pulseCell = (index, delay = 0) => {
    const cell = cellsRef.current.get(index);
    if (!cell) return;
    const previous = timersRef.current.get(index);
    if (previous) window.clearTimeout(previous);
    cell.classList.remove('is-trailing');
    void cell.offsetWidth;
    cell.classList.add('is-trailing');
    const timer = window.setTimeout(() => {
      cell.classList.remove('is-trailing');
      timersRef.current.delete(index);
    }, 520 + delay);
    timersRef.current.set(index, timer);
  };

  const getCellIndex = (event) => {
    const bounds = heroRef.current?.getBoundingClientRect();
    if (!bounds?.width || !bounds?.height) return -1;
    const x = Math.max(0, Math.min(bounds.width - 1, event.clientX - bounds.left));
    const y = Math.max(0, Math.min(bounds.height - 1, event.clientY - bounds.top));
    const cellWidth = bounds.width / gridSize.columns;
    const column = Math.min(gridSize.columns - 1, Math.floor(x / cellWidth));
    const row = Math.min(gridSize.rows - 1, Math.floor(y / cellWidth));
    return row * gridSize.columns + column;
  };

  const handlePointerMove = (event) => {
    const element = heroRef.current;
    if (!element) return;
    const bounds = element.getBoundingClientRect();
    element.style.setProperty('--pointer-x', (((event.clientX - bounds.left) / bounds.width) * 100).toFixed(2) + '%');
    element.style.setProperty('--pointer-y', (((event.clientY - bounds.top) / bounds.height) * 100).toFixed(2) + '%');
    if (reduceMotion || (event.pointerType !== 'mouse' && event.pointerType !== 'pen')) return;

    const index = getCellIndex(event);
    if (index < 0 || index === lastCellRef.current) return;
    const previous = lastCellRef.current;
    lastCellRef.current = index;
    pulseCell(index);
    if (previous >= 0 && Math.abs(index - previous) <= gridSize.columns + 2) {
      pulseCell(previous, 45);
      pulseCell(index - Math.sign(index - previous), 90);
    } else {
      pulseCell(index - 1, 75);
      pulseCell(index - gridSize.columns, 135);
    }
  };

  const handlePointerDown = (event) => {
    if (event.pointerType === 'touch' && !reduceMotion) {
      const index = getCellIndex(event);
      if (index >= 0) pulseCell(index);
    }
  };

  const handlePointerLeave = () => {
    heroRef.current?.style.setProperty('--pointer-x', '57%');
    heroRef.current?.style.setProperty('--pointer-y', '48%');
    lastCellRef.current = -1;
  };

  return (
    <section
      ref={heroRef}
      className="tedx-hero"
      aria-labelledby="tedx-hero-title"
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerLeave={handlePointerLeave}
    >
      <div className="tedx-hero__grid" aria-hidden="true" style={{ '--grid-columns': gridSize.columns }}>
        {cells.map((cell) => (
          <span
            key={cell.index}
            ref={(node) => {
              if (node) cellsRef.current.set(cell.index, node);
              else cellsRef.current.delete(cell.index);
            }}
            className={'tedx-hero__cell' + (cell.tone ? ' tedx-hero__cell--' + cell.tone : '')}
          />
        ))}
      </div>

      <div className="tedx-hero__art-glow" aria-hidden="true" />
      <div className="tedx-hero__art" aria-hidden="true">
        <Motion.img
          src="/assets/home-hero-x.webp"
          alt=""
          className="tedx-hero__art-image"
          initial={reduceMotion ? false : { opacity: 0, scale: 1.035, x: 22 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 1.05, ease: [0.2, 0.75, 0.25, 1] }}
          draggable="false"
        />
      </div>

      <Motion.div
        className="tedx-hero__content"
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="tedx-hero__copy">
          <div className="tedx-hero__eyebrow" aria-label="Ideas, Inspiration, Impact">
            <span>IDEAS</span><i aria-hidden="true" />
            <span>INSPIRATION</span><i aria-hidden="true" />
            <span>IMPACT</span>
          </div>

          <h1 id="tedx-hero-title" className="tedx-hero__wordmark">
            <span className="tedx-hero__ted">TED<span>x</span></span>
            <span className="tedx-hero__university">IIMT University</span>
          </h1>

          <div className="tedx-hero__theme">
            <h2>Break the <em>Flow.</em></h2>
            <span className="tedx-hero__red-rule" aria-hidden="true" />
            <p>A platform to share ideas that challenge, inspire and create change.</p>
          </div>

          <div className="tedx-hero__actions">
            <a className="tedx-hero__primary" href={hasUpcomingEdition ? '/register' : '/archive/2025'}>
              {hasUpcomingEdition ? 'Register Now' : 'Explore the 2025 Edition'}
              <ArrowRight aria-hidden="true" size={18} />
            </a>
            <a className="tedx-hero__secondary" href={hasUpcomingEdition ? '/speakers' : '#home-highlights'}>
              <span className="tedx-hero__play-icon"><Play size={12} fill="currentColor" aria-hidden="true" /></span>
              {hasUpcomingEdition ? 'Meet Our Speakers' : 'Watch Highlights'}
            </a>
          </div>

          <div className="tedx-hero__meta">
            {eventDate && (
              <span className="tedx-hero__meta-item"><CalendarDays aria-hidden="true" size={19} />{eventDate}</span>
            )}
            {eventDate && <span className="tedx-hero__meta-divider" aria-hidden="true" />}
            <span className="tedx-hero__meta-item tedx-hero__meta-item--venue">
              <MapPin aria-hidden="true" size={20} /><span>{venueLabel}</span>
            </span>
          </div>
        </div>
      </Motion.div>

      <a className="tedx-hero__scroll" href="#featured-speakers" aria-label="Scroll to featured speakers">
        <span className="tedx-hero__scroll-icon"><MoveDown size={15} aria-hidden="true" /></span>
        <span>SCROLL TO EXPLORE</span>
      </a>

      <div className="tedx-hero__signature" aria-hidden="true">
        <span>TEDx IIMT University</span><i />
        <span>Ideas. Inspiration. Impact.<b /></span>
      </div>
      <div className="tedx-hero__bottom-line" aria-hidden="true" />
    </section>
  );
};

export default Hero;
