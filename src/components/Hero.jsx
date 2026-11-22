import React, { useMemo } from 'react';
import { motion as Motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, CalendarDays, ChevronDown, MapPin } from 'lucide-react';
import { useEdition } from '../context/EditionContext';

import './Hero.css';

const HERO_PHOTO = '/assets/tedx-hero-stage.webp';

const Hero = () => {
  const prefersReducedMotion = useReducedMotion();
  const { activeEdition, loading } = useEdition();

  const formattedEventDate = useMemo(() => {
    if (loading || !activeEdition?.date) return null;

    const rawDate = String(activeEdition.date);
    const normalizedDate = /^\d{4}-\d{2}-\d{2}$/.test(rawDate)
      ? rawDate + 'T09:00:00'
      : rawDate;
    const date = new Date(normalizedDate);

    if (Number.isNaN(date.getTime())) return null;

    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  }, [activeEdition, loading]);

  const venueLabel = activeEdition?.venue || 'IIMT University, Meerut';

  const reveal = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.82, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section className="ted-stage-hero" aria-label="TEDxIIMT University — Break the Flow">
      <Motion.div
        className="ted-stage-hero__photo"
        aria-hidden="true"
        style={{ backgroundImage: `url("${HERO_PHOTO}")` }}
        initial={prefersReducedMotion ? false : { opacity: 0.55, scale: 1.07 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.6, ease: [0.2, 0.7, 0.2, 1] }}
      />
      <div className="ted-stage-hero__shade" aria-hidden="true" />
      <div className="ted-stage-hero__grid" aria-hidden="true" />
      <div className="ted-stage-hero__edge-light" aria-hidden="true" />

      <div className="ted-stage-hero__inner">
        <Motion.div
          className="ted-stage-hero__content"
          initial={prefersReducedMotion ? false : 'hidden'}
          animate="visible"
          transition={{ staggerChildren: 0.14, delayChildren: 0.18 }}
        >
          <Motion.div className="ted-stage-hero__eyebrow" variants={reveal}>
            <span>IDEAS</span><i aria-hidden="true" /><span>INSPIRATION</span><i aria-hidden="true" /><span>IMPACT</span>
          </Motion.div>

          <Motion.div className="ted-stage-hero__identity" variants={reveal}>
            <div className="ted-stage-hero__tedx">TED<span>x</span></div>
            <h1>IIMT University</h1>
          </Motion.div>

          <Motion.div className="ted-stage-hero__message" variants={reveal}>
            <p className="ted-stage-hero__theme">Break the <em>Flow.</em></p>
            <span className="ted-stage-hero__accent-line" aria-hidden="true" />
            <p className="ted-stage-hero__description">
              A platform to share ideas that challenge,<br className="desktop-break" />
              inspire and create change.
            </p>
          </Motion.div>

          <Motion.div className="ted-stage-hero__actions" variants={reveal}>
            <a href="/register" className="ted-stage-hero__button ted-stage-hero__button--primary">
              Register Now <ArrowRight aria-hidden="true" />
            </a>
            <a href="/speakers" className="ted-stage-hero__button ted-stage-hero__button--secondary">
              <span className="ted-stage-hero__play" aria-hidden="true"><ArrowRight /></span>
              Meet the Speakers
            </a>
          </Motion.div>

          <Motion.div className="ted-stage-hero__meta" variants={reveal}>
            {formattedEventDate && (
              <span><CalendarDays aria-hidden="true" />{formattedEventDate}</span>
            )}
            <span><MapPin aria-hidden="true" />{venueLabel}</span>
          </Motion.div>
        </Motion.div>
      </div>

      <a className="ted-stage-hero__scroll" href="#home-statement-heading" aria-label="Scroll to explore the homepage">
        <span className="ted-stage-hero__scroll-icon"><ChevronDown aria-hidden="true" /></span>
        <span>SCROLL TO EXPLORE</span>
        <i aria-hidden="true" />
      </a>
    </section>
  );
};

export default Hero;
