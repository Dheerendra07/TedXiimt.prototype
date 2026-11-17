import { motion as Motion } from 'framer-motion';
import { ArrowDownRight, ArrowRight } from 'lucide-react';
import MonumentArtwork from './MonumentArtwork';
import { ARCHIVE_EDITIONS } from '../data/archiveData';
import './Hero.css';

const edition = ARCHIVE_EDITIONS[0];

const slide = { label: 'LANDMARKS OF INDIA', note: 'Architecture, memory and meaning' };

const Hero = () => {
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

      <figure className="tedx-hero__visual" aria-label="TEDxIIMT interactive Indian landmark artwork">
        <div className="tedx-hero__art-wrap">
          <div className="tedx-hero__art-frame" aria-hidden="true">
            <div className="tedx-hero__art-corner tedx-hero__art-corner--tl" />
            <div className="tedx-hero__art-corner tedx-hero__art-corner--br" />
          </div>

          <MonumentArtwork />
        </div>

        <figcaption className="tedx-hero__visual-footer">
          <div className="tedx-hero__visual-caption">
            <span>{slide.label}</span>
            <i aria-hidden="true" />
            <p>{slide.note}</p>
          </div>
          <span className="tedx-hero__artwork-index">01 — 03</span>
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
