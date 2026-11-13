import React, { useMemo } from 'react';
import { motion as Motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, CalendarDays, MapPin, MoveDown, PlayCircle } from 'lucide-react';
import { useEdition } from '../context/EditionContext';
import './Hero.css';

const formatEventDate = (edition) => {
  if (!edition || edition.is_active !== true || !edition.date) return null;
  const date = new Date(edition.date);
  if (Number.isNaN(date.getTime()) || date.getTime() < Date.now()) return null;
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(date);
};

const mosaicSquares = [
  { className: 'tedx-mosaic__square--red', style: { gridArea: '1 / 2' } },
  { className: 'tedx-mosaic__square--dark', style: { gridArea: '2 / 1' } },
  { className: 'tedx-mosaic__square--crimson', style: { gridArea: '2 / 3' } },
  { className: 'tedx-mosaic__square--red', style: { gridArea: '3 / 2' } },
];

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
      <div className="tedx-hero__ambient" aria-hidden="true" />
      <div className="tedx-hero__floor" aria-hidden="true" />
      <div className="tedx-hero__mosaic tedx-hero__mosaic--upper" aria-hidden="true">
        {mosaicSquares.map((square, index) => (
          <span key={index} className={`tedx-mosaic__square ${square.className}`} style={square.style} />
        ))}
      </div>
      <div className="tedx-hero__mosaic tedx-hero__mosaic--lower" aria-hidden="true">
        <span className="tedx-mosaic__square tedx-mosaic__square--red" />
        <span className="tedx-mosaic__square tedx-mosaic__square--dark" />
        <span className="tedx-mosaic__square tedx-mosaic__square--crimson" />
      </div>

      <Motion.figure
        className="tedx-hero__architecture"
        initial={reduceMotion ? false : { opacity: 0, x: 34, scale: .985 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
      >
        <img
          src="/iimt-campus-x.webp"
          alt="IIMT University campus framed inside a sculptural red-edged X"
          fetchPriority="high"
          draggable="false"
        />
      </Motion.figure>

      <div className="tedx-hero__content">
        <Motion.div
          className="tedx-hero__copy"
          initial={reduceMotion ? false : { opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .8, delay: .12, ease: [0.22, 1, .36, 1] }}
        >
          <div className="tedx-hero__eyebrow">
            <span>IDEAS</span><i aria-hidden="true" /><span>INSPIRATION</span><i aria-hidden="true" /><span>IMPACT</span>
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
            <a className="tedx-hero__primary" href="/register">
              Register Now <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a className="tedx-hero__secondary" href="/gallery">
              <PlayCircle size={20} aria-hidden="true" /> Explore Highlights
            </a>
          </div>
          <div className="tedx-hero__meta">
            {eventDate && (
              <span className="tedx-hero__meta-item">
                <CalendarDays size={19} aria-hidden="true" /> {eventDate}
              </span>
            )}
            {eventDate && <span className="tedx-hero__meta-divider" aria-hidden="true" />}
            <span className="tedx-hero__meta-item tedx-hero__meta-item--venue">
              <MapPin size={20} aria-hidden="true" /><span>{venueLabel}</span>
            </span>
          </div>
        </Motion.div>
      </div>

      <a className="tedx-hero__scroll" href="#about-tedx" aria-label="Scroll to explore TEDxIIMT">
        <span className="tedx-hero__scroll-icon"><MoveDown size={15} aria-hidden="true" /></span>
        <span>SCROLL TO EXPLORE</span>
      </a>
      <div className="tedx-hero__signature" aria-hidden="true">
        <span>TEDxIIMT University</span><i /><span>Ideas. Inspiration. Impact.</span>
      </div>
    </section>
  );
};

export default Hero;
