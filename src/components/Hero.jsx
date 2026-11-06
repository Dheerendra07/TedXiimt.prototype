import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion as Motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, CalendarDays, MapPin, MoveDown } from 'lucide-react';
import { useEdition } from '../context/EditionContext';
import './Hero.css';

const GRID_COLUMNS = {
  mobile: 12,
  tablet: 24,
  desktop: 40,
};

const getCellTone = (index, columns) => {
  const row = Math.floor(index / columns);
  const pattern = (index * 17 + row * 11) % 37;

  if (pattern === 0 || pattern === 1) return 'red';
  if (pattern === 8) return 'crimson';
  if (pattern === 19) return 'burgundy';
  if (pattern === 29) return 'charcoal';
  return '';
};

const formatEventDate = (edition) => {
  if (!edition || edition.is_active !== true || !edition.date) return null;

  const date = new Date(edition.date);
  if (Number.isNaN(date.getTime()) || date.getTime() < Date.now()) return null;

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

const Hero = () => {
  const reduceMotion = useReducedMotion();
  const { activeEdition, loading } = useEdition();
  const heroRef = useRef(null);
  const stageRef = useRef(null);
  const [gridSize, setGridSize] = useState({ columns: GRID_COLUMNS.desktop, rows: 28 });

  useEffect(() => {
    const measureGrid = () => {
      const hero = heroRef.current;
      if (!hero) return;

      const width = hero.clientWidth || window.innerWidth;
      const height = hero.clientHeight || window.innerHeight;
      const columns = width < 760
        ? GRID_COLUMNS.mobile
        : width < 1100
          ? GRID_COLUMNS.tablet
          : GRID_COLUMNS.desktop;
      const cellSize = width / columns;
      const rows = Math.ceil(height / cellSize) + 1;

      setGridSize((current) => (
        current.columns === columns && current.rows === rows
          ? current
          : { columns, rows }
      ));
    };

    measureGrid();
    window.addEventListener('resize', measureGrid, { passive: true });

    const observer = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(measureGrid)
      : null;

    if (heroRef.current && observer) observer.observe(heroRef.current);

    return () => {
      window.removeEventListener('resize', measureGrid);
      observer?.disconnect();
    };
  }, []);

  const gridCells = useMemo(
    () => Array.from({ length: gridSize.columns * gridSize.rows }, (_, index) => ({
      index,
      tone: getCellTone(index, gridSize.columns),
    })),
    [gridSize],
  );

  const eventDate = useMemo(
    () => (!loading ? formatEventDate(activeEdition) : null),
    [activeEdition, loading],
  );

  const venueLabel = activeEdition?.is_active === true && activeEdition.venue
    ? activeEdition.venue
    : 'IIMT University, Meerut';

  const resetStageTilt = () => {
    const stage = stageRef.current;
    if (!stage) return;
    stage.style.setProperty('--tilt-x', '0deg');
    stage.style.setProperty('--tilt-y', '0deg');
  };

  const handleHeroPointerMove = (event) => {
    if (event.pointerType !== 'mouse' || !stageRef.current) return;

    const bounds = stageRef.current.getBoundingClientRect();
    const isInsideStage = event.clientX >= bounds.left
      && event.clientX <= bounds.right
      && event.clientY >= bounds.top
      && event.clientY <= bounds.bottom;

    if (!isInsideStage) {
      resetStageTilt();
      return;
    }

    const horizontal = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    const vertical = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
    const tiltX = Math.max(-1, Math.min(1, vertical)) * -5.5;
    const tiltY = Math.max(-1, Math.min(1, horizontal)) * 8;

    stageRef.current.style.setProperty('--tilt-x', tiltX.toFixed(2) + 'deg');
    stageRef.current.style.setProperty('--tilt-y', tiltY.toFixed(2) + 'deg');
  };

  const fillCell = (event) => {
    if (event.pointerType === 'mouse' || event.pointerType === 'pen' || event.type === 'pointerdown') {
      event.currentTarget.classList.add('is-filled');
    }
  };

  return (
    <section
      ref={heroRef}
      className="tedx-hero"
      aria-labelledby="tedx-hero-title"
      onPointerMove={handleHeroPointerMove}
      onPointerLeave={resetStageTilt}
    >
      <div
        className="tedx-hero__grid"
        aria-hidden="true"
        style={{ '--grid-columns': gridSize.columns }}
      >
        {gridCells.map((cell) => (
          <span
            key={cell.index}
            className={'tedx-hero__cell' + (cell.tone ? ' tedx-hero__cell--' + cell.tone : '')}
            onPointerEnter={fillCell}
            onPointerDown={fillCell}
          />
        ))}
      </div>

      <div className="tedx-hero__stage" ref={stageRef} aria-hidden="true">
        <div className="tedx-hero__stage-glow" />
        <div className="tedx-hero__stage-core">
          <span className="tedx-hero__x-depth">X</span>
          <span className="tedx-hero__x-side">X</span>
          <span className="tedx-hero__x-face">X</span>
        </div>
      </div>

      <div className="tedx-hero__content">
        <Motion.div
          className="tedx-hero__copy"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="tedx-hero__eyebrow">
            <span>#TEDxIIMTUniversity</span>
            <i aria-hidden="true" />
          </div>

          <h1 id="tedx-hero-title" className="tedx-hero__wordmark">
            <span className="tedx-hero__wordmark-line">
              <span className="tedx-hero__ted">TED</span><span className="tedx-hero__x-small">x</span><span className="tedx-hero__iimt">IIMT</span>
            </span>
            <span className="tedx-hero__university">University</span>
          </h1>

          <div className="tedx-hero__theme">
            <h2>Break the <em>Flow.</em></h2>
            <div className="tedx-hero__red-rule" aria-hidden="true" />
            <p>A platform to share ideas that challenge, inspire and create change.</p>
          </div>

          <div className="tedx-hero__actions">
            <a className="tedx-hero__primary" href="/register">
              Register Now <ArrowRight aria-hidden="true" size={18} />
            </a>
            <a className="tedx-hero__secondary" href="/speakers">
              Meet Our Speakers
            </a>
          </div>

          <div className="tedx-hero__meta">
            {eventDate && (
              <span className="tedx-hero__meta-item">
                <CalendarDays aria-hidden="true" size={19} />
                {eventDate}
              </span>
            )}
            {eventDate && <span className="tedx-hero__meta-divider" aria-hidden="true" />}
            <span className="tedx-hero__meta-item tedx-hero__meta-item--venue">
              <MapPin aria-hidden="true" size={20} />
              <span>{venueLabel}</span>
            </span>
          </div>
        </Motion.div>
      </div>

      <a className="tedx-hero__scroll" href="#featured-speakers" aria-label="Scroll to explore the website">
        <span className="tedx-hero__scroll-icon"><MoveDown size={16} aria-hidden="true" /></span>
        <span>SCROLL TO EXPLORE</span>
      </a>

      <div className="tedx-hero__bottom-line" aria-hidden="true" />
    </section>
  );
};

export default Hero;
