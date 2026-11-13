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
    fit: 'contain',
    label: 'THE CAMPUS',
    note: 'Where a new perspective begins',
  },
  {
    id: 'stage',
    src: '/tedxiimt-hero-stage.webp',
    alt: 'The TEDxIIMT University stage and audience at the 2025 event',
    fit: 'cover',
    label: 'THE STAGE',
    note: 'Ideas shared beyond the familiar',
  },
];

const Hero = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const slide = slides[activeSlide];

  useEffect(() => {
    if (isPaused || reduceMotion) return undefined;
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 7200);
    return () => window.clearInterval(timer);
  }, [isPaused, reduceMotion]);

  const formattedDate = edition?.date
    ? new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(new Date(`${edition.date}T12:00:00`))
    : null;

  return (
    <section className="tedx-hero" aria-labelledby="tedx-hero-title">
      <div className="tedx-hero__backdrop" aria-hidden="true" />
      <div className="tedx-hero__ambient" aria-hidden="true" />

      <figure className="tedx-hero__visual" aria-roledescription="carousel" aria-label="TEDxIIMT campus and event photography">
        <AnimatePresence mode="wait" initial={false}>
          <Motion.div
            key={slide.id}
            className={`tedx-hero__slide tedx-hero__slide--${slide.fit}`}
            initial={reduceMotion ? false : { opacity: 0, scale: 1.035, x: 24 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.985, x: -18 }}
            transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
          >
            <img
              src={slide.src}
              alt={slide.alt}
              fetchPriority="high"
              draggable="false"
              className="tedx-hero__slide-image"
            />
            <div className="tedx-hero__slide-shade" aria-hidden="true" />
          </Motion.div>
        </AnimatePresence>
        <div className="tedx-hero__visual-caption" aria-live="polite">
          <span>{slide.label}</span>
          <i aria-hidden="true" />
          <p>{slide.note}</p>
        </div>
        <div className="tedx-hero__carousel">
          <div className="tedx-hero__carousel-count">
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
                onClick={() => setActiveSlide(index)}
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
      </figure>

      <div className="tedx-hero__content">
        <Motion.div
          className="tedx-hero__copy"
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
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
