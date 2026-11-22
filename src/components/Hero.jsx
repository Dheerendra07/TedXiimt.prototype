import React, { useMemo } from 'react';
import { motion as Motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, CalendarDays, ChevronDown, MapPin } from 'lucide-react';
import { useEdition } from '../context/EditionContext';
import './Hero.css';

const CAMPUS_PHOTO = 'https://upload.wikimedia.org/wikipedia/commons/7/72/IIMT_University%2C_Meerut.jpg';
const CAMPUS_PHOTO_SOURCE = 'https://commons.wikimedia.org/wiki/File:IIMT_University,_Meerut.jpg';
const PHOTO_LICENSE = 'https://creativecommons.org/licenses/by-sa/4.0/';

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

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.13, delayChildren: 0.22 },
    },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 18, filter: 'blur(5px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section className="tedx-hero" aria-label="TEDxIIMT University — Break the Flow">
      <div className="tedx-hero__photo-frame" aria-hidden="true">
        <img
          className="tedx-hero__photo"
          src={CAMPUS_PHOTO}
          alt=""
          fetchPriority="high"
          loading="eager"
          decoding="async"
          draggable="false"
        />
      </div>
      <div className="tedx-hero__photo-shade" aria-hidden="true" />
      <div className="tedx-hero__grid" aria-hidden="true" />
      <div className="tedx-hero__top-rule" aria-hidden="true" />

      <div className="tedx-hero__content-wrap">
        <Motion.div
          className="tedx-hero__content"
          initial={prefersReducedMotion ? false : 'hidden'}
          animate="visible"
          variants={containerVariants}
        >
          <Motion.div variants={itemVariants} className="tedx-hero__eyebrow">
            <span>IDEAS</span><i aria-hidden="true" /><span>INSPIRATION</span><i aria-hidden="true" /><span>IMPACT</span>
          </Motion.div>

          <Motion.div variants={itemVariants} className="tedx-hero__identity">
            <div className="tedx-hero__wordmark" aria-label="TEDx">
              <span>TED</span><sup>x</sup>
            </div>
            <h1>IIMT University</h1>
          </Motion.div>

          <Motion.div variants={itemVariants} className="tedx-hero__message">
            <p className="tedx-hero__theme">Break the <em>Flow.</em></p>
            <span className="tedx-hero__rule" aria-hidden="true" />
            <p className="tedx-hero__description">
              A platform to share ideas that challenge,<br className="tedx-desktop-break" />
              inspire and create change.
            </p>
          </Motion.div>

          <Motion.div variants={itemVariants} className="tedx-hero__actions">
            <a href="/register" className="tedx-hero__button tedx-hero__button--primary">
              Register Now <ArrowRight aria-hidden="true" />
            </a>
            <a href="/speakers" className="tedx-hero__button tedx-hero__button--secondary">
              Meet the Speakers
            </a>
          </Motion.div>

          <Motion.div variants={itemVariants} className="tedx-hero__meta">
            {formattedEventDate && (
              <span><CalendarDays aria-hidden="true" />{formattedEventDate}</span>
            )}
            <span><MapPin aria-hidden="true" />IIMT University, Meerut</span>
          </Motion.div>
        </Motion.div>
      </div>

      <Motion.div
        className="tedx-hero__event-banner"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.85, delay: 0.62, ease: [0.22, 1, 0.36, 1] }}
        aria-label="TEDx IIMT University, Break the Flow"
      >
        <div className="tedx-hero__event-banner-brand">
          <span>TED<span className="tedx-hero__banner-x">x</span></span>
          <i aria-hidden="true" />
          <strong>IIMT UNIVERSITY</strong>
        </div>
        <div className="tedx-hero__event-banner-detail">
          <span>BREAK THE FLOW</span>
          <span>INDEPENDENTLY ORGANIZED TED EVENT</span>
        </div>
      </Motion.div>

      <div className="tedx-hero__photo-credit">
        Campus photograph by <a href={CAMPUS_PHOTO_SOURCE} target="_blank" rel="noreferrer">Ravi Dwivedi</a>
        <span aria-hidden="true">·</span>
        <a href={PHOTO_LICENSE} target="_blank" rel="noreferrer">CC BY-SA 4.0</a>
      </div>

      <a className="tedx-hero__scroll" href="#home-statement-heading" aria-label="Scroll to explore the homepage">
        <span className="tedx-hero__scroll-icon"><ChevronDown aria-hidden="true" /></span>
        <span>SCROLL TO EXPLORE</span>
        <i aria-hidden="true" />
      </a>
    </section>
  );
};

export default Hero;
