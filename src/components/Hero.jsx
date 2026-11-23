import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion as Motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { useEdition } from '../context/EditionContext';
import { IIMTMark } from './IIMTSignature';
import './Hero.css';

const CAMPUS_PHOTOS = [
  {
    id: 'main-campus-4k',
    src: 'https://upload.wikimedia.org/wikipedia/commons/7/72/IIMT_University%2C_Meerut.jpg',
    alt: 'Original high-resolution photograph of IIMT University campus, Meerut, with its academic buildings and entrance.',
    label: 'THE UNIVERSITY',
    detail: 'The campus, from the main approach',
    credit: 'Ravi Dwivedi · CC BY-SA 4.0',
    source: 'https://commons.wikimedia.org/wiki/File:IIMT_University,_Meerut.jpg',
    position: 'center 48%',
  },
  {
    id: 'campus-approach',
    src: 'https://iimtu.edu.in/blog/wp-content/uploads/2022/10/PHOTO-2022-07-10-21-47-52.jpg',
    alt: 'IIMT University approach road, pink academic building, landscaped entrance and campus sign.',
    label: 'CAMPUS LIFE',
    detail: 'A familiar view of the university entrance',
    credit: 'IIMT University',
    source: 'https://iimtu.edu.in/blog/iimt-university-gets-appreciation-by-mgncre/',
    position: 'center 52%',
  },
  {
    id: 'aerial-campus',
    src: 'https://iimtu.edu.in/blog/wp-content/uploads/2024/02/11.35.56-AM.png',
    alt: 'Aerial photograph of IIMT University showing the entrance gate, academic blocks and campus grounds.',
    label: 'THE BIGGER PICTURE',
    detail: 'The university from above',
    credit: 'IIMT University',
    source: 'https://iimtu.edu.in/blog/exploring-the-best-pharmacy-college/',
    position: 'center 50%',
  },
  {
    id: 'academic-entrance',
    src: 'https://image-static.collegedunia.com/public/college_data/images/campusimage/1746012490SET.jpg',
    alt: 'Red-brick IIMT University academic building with a curved entrance canopy and landscaped courtyard.',
    label: 'ACADEMIC SPACES',
    detail: 'Architecture, light and open campus spaces',
    credit: 'CollegeDunia campus gallery',
    source: 'https://collegedunia.com/university/59031-iimt-university-iimtu-meerut/gallery',
    position: 'center 48%',
  },
  {
    id: 'glass-campus-block',
    src: 'https://image-static.collegedunia.com/public/college_data/images/campusimage/1684133021artboard-3-8_20230309104811_0.jpg',
    alt: 'IIMT campus building with a glass facade, red architectural accents and a landscaped fountain courtyard.',
    label: 'CAMPUS DETAILS',
    detail: 'A closer look at the university architecture',
    credit: 'CollegeDunia campus gallery',
    source: 'https://collegedunia.com/university/59031-iimt-university-iimtu-meerut/gallery',
    position: 'center 50%',
  },
];


/*
 * Original TED vehicle-to-mech-to-wordmark sequence.
 * The vector characters are purpose-built for this event identity.
 */
const Hero = () => {
  const prefersReducedMotion = useReducedMotion();
  const { activeEdition, loading } = useEdition();
  const [photos, setPhotos] = useState(CAMPUS_PHOTOS);
  const [activePhoto, setActivePhoto] = useState(0);
  const [photosReady, setPhotosReady] = useState(false);
  useEffect(() => {
    let cancelled = false;

    const preloadPhoto = (photo) => new Promise((resolve) => {
      const image = new Image();
      image.decoding = 'async';
      image.onload = () => resolve(photo);
      image.onerror = () => resolve(null);
      image.src = photo.src;

      if (image.complete && image.naturalWidth > 0) {
        resolve(photo);
      }
    });

    Promise.all(CAMPUS_PHOTOS.map(preloadPhoto)).then((results) => {
      if (cancelled) return;

      const availablePhotos = results.filter(Boolean);
      setPhotos(availablePhotos.length ? availablePhotos : [CAMPUS_PHOTOS[0]]);
      setActivePhoto(0);
      setPhotosReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!photosReady || photos.length < 2 || prefersReducedMotion) return undefined;

    const rotation = window.setInterval(() => {
      setActivePhoto((current) => (current + 1) % photos.length);
    }, 3800);

    return () => window.clearInterval(rotation);
  }, [photos, photosReady, prefersReducedMotion]);

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

  const currentPhoto = photos[activePhoto] || photos[0];
  const goToPhoto = (direction) => {
    setActivePhoto((current) => (current + direction + photos.length) % photos.length);
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.12, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 18, filter: 'blur(4px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.68, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section className="tedx-hero" aria-label="TEDxIIMT University — Break the Flow">
      <div className="tedx-hero__ambient" aria-hidden="true" />
      <div className="tedx-hero__grid" aria-hidden="true" />
      <div className="tedx-hero__split-line" aria-hidden="true" />
      <div className="tedx-hero__corner-art" aria-hidden="true">
        <svg viewBox="0 0 132 104" fill="none" focusable="false">
          <defs>
            <linearGradient id="tedx-corner-flow" x1="10" y1="88" x2="119" y2="13" gradientUnits="userSpaceOnUse">
              <stop stopColor="#EB0028" stopOpacity=".95" />
              <stop offset=".48" stopColor="#E4E8EE" stopOpacity=".86" />
              <stop offset=".76" stopColor="#A78BFA" stopOpacity=".92" />
              <stop offset="1" stopColor="#EB0028" stopOpacity=".82" />
            </linearGradient>
            <radialGradient id="tedx-corner-glow">
              <stop stopColor="#EB0028" stopOpacity=".32" />
              <stop offset="1" stopColor="#EB0028" stopOpacity="0" />
            </radialGradient>
          </defs>
          <path d="M8 79C3 59 12 30 33 17C53 4 83 7 101 22C118 36 122 61 108 77C94 93 66 96 48 84C32 73 31 51 45 37C57 25 76 25 88 35" stroke="#CBD5E1" strokeOpacity=".12" strokeWidth="7" strokeLinecap="round" />
          <path className="tedx-hero__corner-art-line" d="M8 79C3 59 12 30 33 17C53 4 83 7 101 22C118 36 122 61 108 77C94 93 66 96 48 84C32 73 31 51 45 37C57 25 76 25 88 35" stroke="url(#tedx-corner-flow)" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M8 79C3 59 12 30 33 17" stroke="#EB0028" strokeOpacity=".72" strokeWidth=".9" strokeDasharray="2 5" strokeLinecap="round" />
          <circle cx="8" cy="79" r="14" fill="url(#tedx-corner-glow)" />
          <circle cx="88" cy="35" r="11" fill="url(#tedx-corner-glow)" />
          <circle cx="8" cy="79" r="2.6" fill="#EB0028" />
          <circle cx="88" cy="35" r="2.3" fill="#E4E8EE" />
          <circle cx="8" cy="79" r="5.4" stroke="#EB0028" strokeOpacity=".72" strokeWidth=".7" />
          <circle cx="88" cy="35" r="4.8" stroke="#A78BFA" strokeOpacity=".78" strokeWidth=".7" />
        </svg>
      </div>

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
              <span className="tedx-hero__letter-wrap tedx-hero__letter-wrap--t">
                <span className="tedx-hero__letter tedx-hero__letter--t" aria-hidden="true">T</span>
                <svg className="tedx-hero__t-shades" viewBox="0 0 110 72" aria-hidden="true" focusable="false">
                  <defs>
                    <linearGradient id="tedx-shades-glass" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#718092" />
                      <stop offset=".28" stopColor="#263444" />
                      <stop offset="1" stopColor="#080d14" />
                    </linearGradient>
                    <linearGradient id="tedx-shades-metal" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="#dce5eb" />
                      <stop offset=".45" stopColor="#657381" />
                      <stop offset="1" stopColor="#111820" />
                    </linearGradient>
                  </defs>
                  <g transform="translate(110 0) scale(-1 1)">
                  <g stroke="#070b11" strokeWidth="4" strokeLinejoin="round">
                    <path d="M7 10Q8 5 14 6L38 9Q45 10 43 17L38 34Q36 39 30 38L12 35Q6 34 6 27Z" fill="url(#tedx-shades-glass)" />
                    <path d="M53 15Q54 9 60 10L86 13Q93 14 91 21L85 38Q83 43 77 42L59 39Q53 38 52 31Z" fill="url(#tedx-shades-glass)" />
                    <path d="M43 15Q48 12 53 16M4 11 1 10" fill="none" />
                  </g>
                  <path d="m13 11 18 3m31 1 19 3" fill="none" stroke="#e5f0f7" strokeWidth="2.2" opacity=".76" strokeLinecap="round" />
                  <path d="M90 17Q105 18 105 30L101 44 97 63" fill="none" stroke="url(#tedx-shades-metal)" strokeWidth="5" strokeLinecap="round" />
                  <path d="M97 62q-1 5-6 6" fill="none" stroke="#111820" strokeWidth="4" strokeLinecap="round" />
                  <circle cx="91" cy="18" r="3.2" fill="#d9e4eb" stroke="#111820" strokeWidth="1.4" />
                  <path d="M96 44 93 57" stroke="#d8e3e9" strokeWidth="1.4" opacity=".65" strokeLinecap="round" />
                  </g>
                </svg>
              </span><span className="tedx-hero__letter tedx-hero__letter--e" aria-hidden="true">E</span><span className="tedx-hero__letter tedx-hero__letter--d" aria-hidden="true">D</span><sup className="tedx-hero__wordmark-x" aria-hidden="true">x</sup>
            </div>
            <h1 className="tedx-hero__university">
              <IIMTMark className="tedx-hero__university-iimt" stemColor="#FFFFFF" />{' '}
              <span className="tedx-hero__university-name">University</span>
            </h1>
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

          <Motion.div variants={itemVariants} className="tedx-hero__signature">
            <span className="tedx-hero__signature-mark">TED<span>x</span></span>
            <span className="tedx-hero__signature-divider" aria-hidden="true" />
            <span className="tedx-hero__signature-copy">INDEPENDENTLY ORGANIZED<br />TED EVENT</span>
          </Motion.div>
        </Motion.div>
      </div>

      <div className="tedx-hero__visual-wrap">
        <div className="tedx-hero__photo-frame">
          <AnimatePresence initial={false} mode="sync">
            <Motion.img
              key={currentPhoto.id}
              className="tedx-hero__photo"
              src={currentPhoto.src}
              alt={currentPhoto.alt}
              fetchPriority={activePhoto === 0 ? 'high' : 'auto'}
              loading="eager"
              decoding="async"
              draggable="false"
              initial={prefersReducedMotion ? false : { opacity: 0, scale: 1.035 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 1.012 }}
              transition={{
                opacity: { duration: prefersReducedMotion ? 0 : 1.05, ease: [0.22, 1, 0.36, 1] },
                scale: { duration: prefersReducedMotion ? 0 : 4.6, ease: 'linear' },
              }}
              style={{ objectPosition: currentPhoto.position }}
            />
          </AnimatePresence>

          <div className="tedx-hero__photo-shade" aria-hidden="true" />
          <div className="tedx-hero__photo-topline">
            <span>TEDxIIMT UNIVERSITY</span>
            <span>MEERUT · INDIA</span>
          </div>

          <div className="tedx-hero__photo-caption" aria-live="off">
            <div className="tedx-hero__photo-caption-copy">
              <span>{currentPhoto.label}</span>
              <strong>{currentPhoto.detail}</strong>
            </div>
            <div className="tedx-hero__photo-credit">
              <span>PHOTO</span>
              <a href={currentPhoto.source} target="_blank" rel="noreferrer">{currentPhoto.credit}</a>
            </div>
          </div>

          <div className="tedx-hero__photo-controls" aria-label="Campus photo carousel controls">
            <div className="tedx-hero__photo-count">
              <strong>{String(activePhoto + 1).padStart(2, '0')}</strong>
              <span>/ {String(photos.length).padStart(2, '0')}</span>
            </div>
            <div className="tedx-hero__photo-progress" aria-hidden="true">
              {photos.map((photo, index) => (
                <span key={photo.id} className={index === activePhoto ? 'is-active' : ''}>
                  {index === activePhoto && !prefersReducedMotion && <i />}
                </span>
              ))}
            </div>
            <div className="tedx-hero__photo-arrows">
              <button type="button" onClick={() => goToPhoto(-1)} aria-label="Previous campus photo">
                <ChevronLeft aria-hidden="true" />
              </button>
              <button type="button" onClick={() => goToPhoto(1)} aria-label="Next campus photo">
                <ChevronRight aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
        <div className="tedx-hero__visual-foot">
          <span>THE CAMPUS, THROUGH DIFFERENT PERSPECTIVES</span>
          <span>01 — 05 / IIMT UNIVERSITY</span>
        </div>
      </div>

      <a className="tedx-hero__scroll" href="#home-statement-heading" aria-label="Scroll to explore the homepage">
        <span className="tedx-hero__scroll-icon"><ChevronDown aria-hidden="true" /></span>
        <span>SCROLL TO EXPLORE</span>
      </a>
    </section>
  );
};

export default Hero;
