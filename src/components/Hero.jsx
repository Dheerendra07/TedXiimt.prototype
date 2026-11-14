import React, { useMemo } from 'react';
import { motion as Motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, CalendarDays, MapPin, MoveDown, PlayCircle } from 'lucide-react';
import { useEdition } from '../context/EditionContext';
import './Hero.css';
import '../pages/HomepageMosaic.css';
import HeroMosaic from './HeroMosaic';

const formatEventDate = (edition) => {
  if (!edition || edition.is_active !== true || !edition.date) return null;
  const date = new Date(edition.date);
  if (Number.isNaN(date.getTime()) || date.getTime() < Date.now()) return null;
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
};

const Hero = () => {
  const reduceMotion = useReducedMotion();
  const { activeEdition, loading } = useEdition();
  const eventDate = useMemo(() => (!loading ? formatEventDate(activeEdition) : null), [activeEdition, loading]);
  const venueLabel = activeEdition?.is_active === true && activeEdition.venue
    ? activeEdition.venue
    : 'IIMT University, Meerut';
  const themeWords = (activeEdition?.theme || 'Break the Flow').trim().split(/\s+/);
  const themeAccent = themeWords.pop() || 'Flow';
  const themeLead = themeWords.join(' ');


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
        <HeroMosaic />
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
