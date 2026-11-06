import React, { useMemo } from 'react';
import { motion as Motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, CalendarDays, MapPin, MoveDown } from 'lucide-react';
import { useEdition } from '../context/EditionContext';
import './Hero.css';

const MOSAIC_CELLS = [
  { x: 0, y: 4, tone: 'burgundy', opacity: 0.64 },
  { x: 1, y: 5, tone: 'red', opacity: 0.86 },
  { x: 4, y: 14, tone: 'charcoal', opacity: 0.78 },
  { x: 7, y: 1, tone: 'burgundy', opacity: 0.56 },
  { x: 9, y: 18, tone: 'red', opacity: 0.72 },
  { x: 12, y: 3, tone: 'charcoal', opacity: 0.7 },
  { x: 15, y: 7, tone: 'red', opacity: 0.9 },
  { x: 17, y: 17, tone: 'burgundy', opacity: 0.68 },
  { x: 19, y: 2, tone: 'crimson', opacity: 0.72 },
  { x: 21, y: 12, tone: 'red', opacity: 0.82 },
  { x: 23, y: 5, tone: 'burgundy', opacity: 0.62 },
  { x: 25, y: 18, tone: 'charcoal', opacity: 0.76 },
  { x: 27, y: 1, tone: 'red', opacity: 0.9 },
  { x: 29, y: 9, tone: 'crimson', opacity: 0.7 },
  { x: 31, y: 4, tone: 'burgundy', opacity: 0.7 },
  { x: 33, y: 15, tone: 'red', opacity: 0.82 },
  { x: 35, y: 2, tone: 'charcoal', opacity: 0.78 },
  { x: 37, y: 11, tone: 'crimson', opacity: 0.76 },
  { x: 39, y: 5, tone: 'red', opacity: 0.9 },
  { x: 41, y: 17, tone: 'burgundy', opacity: 0.72 },
  { x: 43, y: 8, tone: 'red', opacity: 0.82 },
  { x: 2, y: 18, tone: 'crimson', opacity: 0.58 },
  { x: 6, y: 9, tone: 'red', opacity: 0.74 },
  { x: 11, y: 12, tone: 'burgundy', opacity: 0.68 },
  { x: 16, y: 20, tone: 'charcoal', opacity: 0.8 },
  { x: 22, y: 16, tone: 'red', opacity: 0.78 },
  { x: 28, y: 13, tone: 'burgundy', opacity: 0.7 },
  { x: 34, y: 19, tone: 'crimson', opacity: 0.68 },
  { x: 40, y: 1, tone: 'red', opacity: 0.76 },
];

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

  const eventDate = useMemo(
    () => (!loading ? formatEventDate(activeEdition) : null),
    [activeEdition, loading],
  );
  const venueLabel = activeEdition?.is_active === true && activeEdition.venue
    ? activeEdition.venue
    : 'IIMT University, Meerut';

  return (
    <section className="tedx-hero" aria-labelledby="tedx-hero-title">
      <div className="tedx-hero__grid" aria-hidden="true" />

      <div className="tedx-hero__x" aria-hidden="true">X</div>

      <div className="tedx-hero__accents" aria-hidden="true">
        {MOSAIC_CELLS.map((cell, index) => (
          <span
            key={index}
            className={'tedx-hero__cell tedx-hero__cell--' + cell.tone}
            style={{
              '--cell-x': cell.x,
              '--cell-y': cell.y,
              '--cell-opacity': cell.opacity,
            }}
          />
        ))}
      </div>

      <div className="tedx-hero__content">
        <Motion.div
          className="tedx-hero__copy"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="tedx-hero__eyebrow">
            <span>IDEAS. INSPIRATION. IMPACT.</span>
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
