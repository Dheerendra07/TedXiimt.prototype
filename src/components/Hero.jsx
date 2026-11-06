import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion as Motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, CalendarDays, MapPin, MoveDown } from 'lucide-react';
import { useEdition } from '../context/EditionContext';
import './Hero.css';

const CAMPUS_IMAGES = [
  {
    src: '/campus-iimt-hero.avif',
    alt: 'IIMT University campus in Meerut, with its academic building and palm-lined entrance',
  },
];

// Keep this data-driven. With one supplied campus photograph, no artificial
// duplicate-slide transition is shown. Extra supplied images will crossfade.
const MOSAIC_CELLS = [
  { x: 0, y: 4, tone: 'burgundy', opacity: 0.46 },
  { x: 1, y: 5, tone: 'red', opacity: 0.78 },
  { x: 5, y: 1, tone: 'charcoal', opacity: 0.72 },
  { x: 12, y: 0, tone: 'burgundy', opacity: 0.44 },
  { x: 18, y: 2, tone: 'red', opacity: 0.88 },
  { x: 21, y: 4, tone: 'crimson', opacity: 0.55 },
  { x: 25, y: 0, tone: 'charcoal', opacity: 0.62 },
  { x: 29, y: 3, tone: 'red', opacity: 0.7 },
  { x: 34, y: 6, tone: 'burgundy', opacity: 0.48 },
  { x: 39, y: 8, tone: 'crimson', opacity: 0.42 },
  { x: 43, y: 10, tone: 'red', opacity: 0.76 },
  { x: 40, y: 15, tone: 'burgundy', opacity: 0.5 },
  { x: 35, y: 17, tone: 'red', opacity: 0.7 },
  { x: 28, y: 19, tone: 'charcoal', opacity: 0.74 },
  { x: 22, y: 18, tone: 'burgundy', opacity: 0.5 },
  { x: 13, y: 20, tone: 'crimson', opacity: 0.38 },
  { x: 6, y: 17, tone: 'red', opacity: 0.54 },
  { x: 1, y: 14, tone: 'charcoal', opacity: 0.62 },
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
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion || CAMPUS_IMAGES.length < 2) return undefined;

    const interval = window.setInterval(() => {
      setActiveImageIndex((current) => (current + 1) % CAMPUS_IMAGES.length);
    }, 7200);

    return () => window.clearInterval(interval);
  }, [reduceMotion]);

  const eventDate = useMemo(
    () => (!loading ? formatEventDate(activeEdition) : null),
    [activeEdition, loading],
  );
  const campusImage = CAMPUS_IMAGES[activeImageIndex] || CAMPUS_IMAGES[0];

  return (
    <section className="tedx-hero" aria-labelledby="tedx-hero-title">
      <div className="tedx-hero__grid" aria-hidden="true" />
      <div className="tedx-hero__accents tedx-hero__accents--under" aria-hidden="true">
        {MOSAIC_CELLS.filter((cell) => cell.x >= 18 || (cell.x >= 6 && cell.y > 15)).map((cell) => (
          <span
            key={cell.x + ':' + cell.y}
            className={'tedx-hero__cell tedx-hero__cell--' + cell.tone}
            style={{
              '--cell-x': cell.x,
              '--cell-y': cell.y,
              '--cell-opacity': cell.opacity,
            }}
          />
        ))}
      </div>
      <div className="tedx-hero__accents tedx-hero__accents--over" aria-hidden="true">
        {MOSAIC_CELLS.filter((cell) => cell.x < 18 && !(cell.x >= 6 && cell.y > 15)).map((cell) => (
          <span
            key={cell.x + ':' + cell.y}
            className={'tedx-hero__cell tedx-hero__cell--' + cell.tone}
            style={{
              '--cell-x': cell.x,
              '--cell-y': cell.y,
              '--cell-opacity': cell.opacity,
            }}
          />
        ))}
      </div>

      <div className="tedx-hero__x" aria-hidden="true">X</div>

      <div className="tedx-hero__media" aria-hidden="true">
        <AnimatePresence initial={false} mode="sync">
          <Motion.img
            key={campusImage.src}
            className="tedx-hero__campus-image"
            src={campusImage.src}
            alt=""
            draggable="false"
            loading="eager"
            decoding="async"
            initial={reduceMotion ? false : { opacity: 0, scale: 1.035 }}
            animate={{ opacity: 1, scale: reduceMotion ? 1 : 1.075 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 1.25, ease: [0.22, 1, 0.36, 1] }}
          />
        </AnimatePresence>
        <div className="tedx-hero__media-tone" />
        <div className="tedx-hero__media-edge" />
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
            <span className="tedx-hero__meta-item">
              <MapPin aria-hidden="true" size={20} />
              IIMT University, Meerut
            </span>
          </div>
        </motion.div>
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
