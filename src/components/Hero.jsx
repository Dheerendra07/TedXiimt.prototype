import React, { useMemo, useState } from 'react';
import { motion as Motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, CalendarDays, MapPin, MoveDown, PlayCircle } from 'lucide-react';
import { useEdition } from '../context/EditionContext';
import './Hero.css';
import '../pages/HomepageMosaic.css';

const MOSAIC_COLUMNS = 18;
const MOSAIC_ROWS = 17;

const formatEventDate = (edition) => {
  if (!edition || edition.is_active !== true || !edition.date) return null;
  const date = new Date(edition.date);
  if (Number.isNaN(date.getTime()) || date.getTime() < Date.now()) return null;
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
};

const Hero = () => {
  const reduceMotion = useReducedMotion();
  const { activeEdition, loading } = useEdition();
  const [focusedMosaicCell, setFocusedMosaicCell] = useState(-1);
  const mosaicCells = useMemo(
    () => Array.from({ length: MOSAIC_COLUMNS * MOSAIC_ROWS }, (_, index) => ({
      index,
      row: Math.floor(index / MOSAIC_COLUMNS),
      column: index % MOSAIC_COLUMNS,
    })),
    [],
  );

  const eventDate = useMemo(() => (!loading ? formatEventDate(activeEdition) : null), [activeEdition, loading]);
  const venueLabel = activeEdition?.is_active === true && activeEdition.venue
    ? activeEdition.venue
    : 'IIMT University, Meerut';
  const themeWords = (activeEdition?.theme || 'Break the Flow').trim().split(/\s+/);
  const themeAccent = themeWords.pop() || 'Flow';
  const themeLead = themeWords.join(' ');

  const handleMosaicPointerMove = (event) => {
    if (event.pointerType !== 'mouse') return;
    const cell = event.target.closest('[data-mosaic-index]');
    if (!cell) return;
    const nextIndex = Number(cell.dataset.mosaicIndex);
    setFocusedMosaicCell((current) => (current === nextIndex ? current : nextIndex));
  };
  const focusedRow = focusedMosaicCell >= 0 ? Math.floor(focusedMosaicCell / MOSAIC_COLUMNS) : -1;
  const focusedColumn = focusedMosaicCell >= 0 ? focusedMosaicCell % MOSAIC_COLUMNS : -1;

  return (
    <section className="tedx-hero" aria-labelledby="tedx-hero-title" data-testid="tedx-home-hero">
      <div className="tedx-hero__grid" aria-hidden="true" />
      <div className="tedx-hero__stage" aria-hidden="true">
        <div className="tedx-hero__stage-glow" />
        <img
          className="tedx-hero__artwork"
          src="/tedx-x-campus-hero.webp"
          alt=""
          fetchPriority="high"
          decoding="async"
        />
        <div
          className="tedx-hero__mosaic"
          onPointerMove={handleMosaicPointerMove}
          onPointerLeave={() => setFocusedMosaicCell(-1)}
        >
          {mosaicCells.map(({ index, row, column }) => {
            const distance = focusedMosaicCell < 0
              ? -1
              : Math.abs(row - focusedRow) + Math.abs(column - focusedColumn);
            const visualState = distance === 0
              ? 'is-active'
              : distance === 1
                ? 'is-near'
                : distance === 2
                  ? 'is-wave'
                  : '';
            return (
              <span
                key={index}
                className={'tedx-hero__mosaic-cell' + (visualState ? ' ' + visualState : '')}
                data-mosaic-index={index}
                style={{ '--mosaic-delay': String(Math.max(0, distance) * 28) + 'ms' }}
              />
            );
          })}
        </div>
        <span className="tedx-hero__stage-edge" />
      </div>

      <div className="tedx-hero__content">
        <Motion.div
          className="tedx-hero__copy"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="tedx-hero__eyebrow">
            <span>IDEAS</span><i /><span>INSPIRATION</span><i /><span>IMPACT</span>
          </div>
          <h1 id="tedx-hero-title" className="tedx-hero__wordmark">
            <span className="tedx-hero__ted-line"><span>TED</span><small>x</small></span>
            <span className="tedx-hero__university">IIMT University</span>
          </h1>
          <div className="tedx-hero__theme">
            <h2>{themeLead && <span>{themeLead} </span>}<em>{themeAccent}.</em></h2>
            <div className="tedx-hero__red-rule" />
            <p>A platform to share ideas that challenge, inspire and create change.</p>
          </div>
          <div className="tedx-hero__actions">
            <a className="tedx-hero__primary" href="/register">
              Register Now <ArrowRight aria-hidden="true" size={18} />
            </a>
            <a className="tedx-hero__secondary" href="/gallery">
              <PlayCircle aria-hidden="true" size={19} /> Watch Highlights
            </a>
          </div>
          <div className="tedx-hero__meta">
            {eventDate && (
              <span className="tedx-hero__meta-item">
                <CalendarDays aria-hidden="true" size={19} />{eventDate}
              </span>
            )}
            {eventDate && <span className="tedx-hero__meta-divider" />}
            <span className="tedx-hero__meta-item">
              <MapPin aria-hidden="true" size={20} /><span>{venueLabel}</span>
            </span>
          </div>
        </Motion.div>
      </div>

      <a className="tedx-hero__scroll" href="#about" aria-label="Scroll to discover TEDxIIMT University">
        <span className="tedx-hero__scroll-icon"><MoveDown size={15} aria-hidden="true" /></span>
        <span>SCROLL TO EXPLORE</span>
      </a>

      <div className="tedx-hero__signature" aria-hidden="true">
        <span>TEDxIIMT University</span><i /><span>Ideas. Inspiration. Impact.</span><b />
      </div>
    </section>
  );
};

export default Hero;
