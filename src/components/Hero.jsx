import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion as Motion, useReducedMotion } from 'framer-motion';
import { ArrowDownRight, ArrowRight, Pause, Play } from 'lucide-react';
import { ARCHIVE_EDITIONS } from '../data/archiveData';
import './Hero.css';

const edition = ARCHIVE_EDITIONS[0];

const slides = [
  {
    id: 'campus',
    src: '/tedxiimt-hero-campus.webp',
    alt: 'IIMT University campus framed by a dramatic red architectural X',
    columns: 5,
    rows: 5,
    label: 'THE CAMPUS',
    note: 'Where a new perspective begins',
  },
  {
    id: 'stage',
    src: '/tedxiimt-hero-stage.webp',
    alt: 'The TEDxIIMT University stage and audience at the 2025 event',
    columns: 6,
    rows: 4,
    label: 'THE STAGE',
    note: 'Ideas shared beyond the familiar',
  },
];

const getTileDistance = (column, row, columns, rows) => {
  const centerColumn = (columns - 1) / 2;
  const centerRow = (rows - 1) / 2;
  return Math.abs(column - centerColumn) + Math.abs(row - centerRow);
};

const Hero = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const slide = slides[activeSlide];

  useEffect(() => {
    if (isPaused || reduceMotion) return undefined;
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 7600);
    return () => window.clearInterval(timer);
  }, [isPaused, reduceMotion]);

  const formattedDate = edition?.date
    ? new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(new Date(`${edition.date}T12:00:00`))
    : null;

  const selectSlide = (index) => setActiveSlide((index + slides.length) % slides.length);

  return (
    <section className="tedx-hero" aria-labelledby="tedx-hero-title">
      <div className="tedx-hero__backdrop" aria-hidden="true" />
      <div className="tedx-hero__ambient" aria-hidden="true" />

      <figure className="tedx-hero__visual" aria-roledescription="carousel" aria-label="TEDxIIMT campus and event photography">
        <div className="tedx-hero__art-wrap">
          <div className="tedx-hero__art-frame" aria-hidden="true">
            <div className="tedx-hero__art-corner tedx-hero__art-corner--tl" />
            <div className="tedx-hero__art-corner tedx-hero__art-corner--br" />
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <Motion.div
              key={slide.id}
              className={`tedx-hero__mosaic tedx-hero__mosaic--${slide.id}`}
              style={{
                '--mosaic-columns': slide.columns,
                '--mosaic-rows': slide.rows,
                aspectRatio: `${slide.columns} / ${slide.rows}`,
                '--mosaic-background-size': `${slide.columns * 100}% ${slide.rows * 100}%`,
              }}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.985, filter: 'brightness(.72)' }}
              animate={{ opacity: 1, scale: 1, filter: 'brightness(1)' }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.015, filter: 'brightness(.7)' }}
              transition={{ duration: reduceMotion ? 0 : 0.72, ease: [0.22, 1, 0.36, 1] }}
              aria-hidden="true"
            >
              {Array.from({ length: slide.columns * slide.rows }, (_, index) => {
                const column = index % slide.columns;
                const row = Math.floor(index / slide.columns);
                const distance = getTileDistance(column, row, slide.columns, slide.rows);
                const positionX = slide.columns === 1 ? 50 : (column / (slide.columns - 1)) * 100;
                const positionY = slide.rows === 1 ? 50 : (row / (slide.rows - 1)) * 100;

                return (
                  <Motion.span
                    key={`${slide.id}-${index}`}
                    className="tedx-hero__tile"
                    style={{
                      backgroundImage: `url("${slide.src}")`,
                      backgroundPosition: `${positionX}% ${positionY}%`,
                      backgroundSize: 'var(--mosaic-background-size)',
                    }}
                    initial={reduceMotion ? false : { opacity: 0, scale: 0.86, y: 13 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: -7 }}
                    transition={{
                      duration: reduceMotion ? 0 : 0.48,
                      delay: reduceMotion ? 0 : distance * 0.026,
                      ease: [0.2, 0.78, 0.25, 1],
                    }}
                  />
                );
              })}
            </Motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait" initial={false}>
            <Motion.img
              key={`mobile-${slide.id}`}
              className={`tedx-hero__mobile-image tedx-hero__mobile-image--${slide.id}`}
              src={slide.src}
              alt={slide.alt}
              fetchPriority="high"
              draggable="false"
              initial={reduceMotion ? false : { opacity: 0, scale: 1.025 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: reduceMotion ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}
            />
          </AnimatePresence>
        </div>

        <figcaption className="tedx-hero__visual-footer" aria-live="polite">
          <div className="tedx-hero__visual-caption">
            <span>{slide.label}</span>
            <i aria-hidden="true" />
            <p>{slide.note}</p>
          </div>

          <div className="tedx-hero__carousel">
            <div className="tedx-hero__carousel-count" aria-label={`Slide ${activeSlide + 1} of ${slides.length}`}>
              <strong>0{activeSlide + 1}</strong><span>/</span><span>0{slides.length}</span>
            </div>
            <div className="tedx-hero__carousel-progress" aria-hidden="true">
              <span key={activeSlide} className={isPaused || reduceMotion ? 'is-paused' : ''} />
            </div>
            <div className="tedx-hero__carousel-controls">
              {slides.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className={activeSlide === index ? 'is-active' : ''}
                  onClick={() => selectSlide(index)}
                  aria-label={`Show ${item.label.toLowerCase()} photograph`}
                  aria-pressed={activeSlide === index}
                />
              ))}
              <button
                type="button"
                className="tedx-hero__pause"
                onClick={() => setIsPaused((paused) => !paused)}
                aria-label={isPaused ? 'Resume automatic image transitions' : 'Pause automatic image transitions'}
                aria-pressed={isPaused}
              >
                {isPaused ? <Play size={13} fill="currentColor" /> : <Pause size={13} fill="currentColor" />}
              </button>
            </div>
          </div>
        </figcaption>
      </figure>

      <div className="tedx-hero__content">
        <Motion.div
          className="tedx-hero__copy"
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="tedx-hero__eyebrow">
            <span>INDEPENDENTLY ORGANIZED</span>
            <i aria-hidden="true" />
            <span>MEERUT, INDIA</span>
          </div>

          <h1 id="tedx-hero-title" className="tedx-hero__wordmark">
            <span className="tedx-hero__ted">TED<span>x</span></span>
            <span className="tedx-hero__university">IIMT University</span>
          </h1>

          <div className="tedx-hero__theme">
            <p className="tedx-hero__edition">THE 2025 EDITION <span>·</span> {formattedDate?.toUpperCase()}</p>
            <h2>Break the <em>Flow.</em></h2>
            <span className="tedx-hero__red-rule" aria-hidden="true" />
            <p className="tedx-hero__description">
              Ideas that challenge the familiar, open new perspectives and stay with us long after the talk ends.
            </p>
          </div>

          <div className="tedx-hero__actions">
            <a className="tedx-hero__primary" href="/library">
              Explore the edition <ArrowRight size={17} aria-hidden="true" />
            </a>
            <a className="tedx-hero__secondary" href="/gallery">
              View event moments <ArrowDownRight size={17} aria-hidden="true" />
            </a>
          </div>

          <div className="tedx-hero__meta">
            <span>{edition?.venue || 'IIMT University, Meerut'}</span>
            <i aria-hidden="true" />
            <span>IDEAS WORTH SPREADING</span>
          </div>
        </Motion.div>
      </div>

      <a className="tedx-hero__scroll" href="#about-tedx" aria-label="Scroll to discover TEDxIIMT">
        <span>SCROLL TO DISCOVER</span>
        <ArrowDownRight size={16} aria-hidden="true" />
      </a>
      <div className="tedx-hero__signature" aria-hidden="true">
        <span>TEDxIIMT UNIVERSITY</span>
        <i />
        <span>IDEAS. INSPIRATION. IMPACT.</span>
      </div>
    </section>
  );
};

export default Hero;
