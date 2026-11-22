import React, { useEffect, useRef, useState } from 'react';
import { useEdition } from '../context/EditionContext';
import { ARCHIVE_EDITIONS } from '../data/archiveData';
import { AnimatePresence, motion as Motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight, ArrowUpRight, CalendarDays, Camera, ChevronLeft, ChevronRight,
  MapPin, X,
} from 'lucide-react';
import Hero from '../components/Hero';
import SocialMedia from '../components/SocialMedia';
import Partners from '../components/Partners';
import Blog from '../components/Blog';
import FloatingCTA from '../components/FloatingCTA';
import './HomePage.css';

const discovery = [
  {
    index: '01',
    label: 'THE VOICES',
    title: 'Our Speakers',
    description: 'Meet the visionaries who bring powerful ideas to our stage.',
    href: '/speakers',
    action: 'MEET OUR SPEAKERS',
    image: 'https://www.tedxiimtuniversity.com/assets/Aditya_Yadav.jpeg',
    imageAlt: 'Speaker portrait used for the TEDxIIMT University speakers collection.',
    imagePosition: 'center 27%',
  },
  {
    index: '02',
    label: 'THE PEOPLE',
    title: 'Our Team',
    description: 'Discover the passionate people who make TEDxIIMT possible.',
    href: '/team',
    action: 'MEET THE TEAM',
    image: 'https://www.tedxiimtuniversity.com/hero-bg.png',
    imageAlt: 'TEDxIIMT event stage and visual identity.',
    imagePosition: 'center center',
  },
  {
    index: '03',
    label: 'THE COLLABORATORS',
    title: 'Our Partners',
    description: 'Recognise the organisations and collaborators helping ideas travel further.',
    href: '/partners',
    action: 'EXPLORE OUR PARTNERS',
    image: 'https://www.tedxiimtuniversity.com/transparent-hero-bg.PNG',
    imageAlt: 'TEDxIIMT event monument artwork used as a background visual.',
    imagePosition: 'center center',
  },
];

const featuredSpeakers2025 = [
  {
    id: '2025-yogesh-mohanji-gupta', index: '01', name: 'Yogesh Mohanji Gupta',
    role: 'Chancellor, IIMT University',
    image: 'https://iimtu.edu.in/uploads/images/16656521121.jpg',
    imageAlt: 'Official IIMT University portrait of Chancellor Yogesh Mohanji Gupta.',
    imagePosition: 'center 30%',
  },
  {
    id: '2025-deepa-sharma', index: '02', name: 'Dr. Deepa Sharma',
    role: 'Vice-Chancellor, IIMT University',
    image: 'https://iimtu.edu.in/uploads/images/16656521221.jpg',
    imageAlt: 'Official IIMT University portrait of Vice-Chancellor Dr. Deepa Sharma.',
    imagePosition: 'center 26%',
  },
  {
    id: '2025-siddharth-sagar', index: '03', name: 'Siddharth Sagar',
    role: 'Comedian and performer',
    image: 'https://blackhattalent.com/wp-content/uploads/2024/01/Sidharth-Sagar.jpg',
    imageAlt: 'Promotional portrait of comedian Siddharth Sagar.',
    imagePosition: 'center 24%',
  },
  {
    id: '2025-alka-tomar', index: '04', name: 'Alka Tomar',
    role: 'Arjuna Award-winning wrestler',
    image: 'https://ss-i.thgim.com/public/photos/article32125154.ece/alternates/FREE_1200/alkajpg',
    imageAlt: 'Published portrait of wrestler Alka Tomar.',
    imagePosition: 'center 24%',
  },
  {
    id: '2025-miriam-chandy-menacherry', index: '05', name: 'Miriam Chandy Menacherry',
    role: 'Documentary filmmaker and founder, Filament Pictures',
    image: '/assets/Miriam.jpg',
    imageAlt: 'Portrait of documentary filmmaker Miriam Chandy Menacherry.',
    imagePosition: 'center 22%',
  },
  {
    id: '2025-piyush-sharma', index: '06', name: 'Piyush Sharma',
    role: 'Education influencer and founder, Tricky Man',
    image: '/assets/Piyush.jpg',
    imageAlt: 'Portrait of educator and creator Piyush Sharma.',
    imagePosition: 'center 22%',
  },
  {
    id: '2025-nishtha-mishra', index: '07', name: 'Nishtha Mishra',
    role: 'Founder, FirstShot Technologies',
    image: '/assets/Nishtha.png',
    imageAlt: 'Portrait of entrepreneur Nishtha Mishra.',
    imagePosition: 'center 22%',
  },
  {
    id: '2025-sparsh-agarwal', index: '08', name: 'Sparsh Agarwal',
    role: 'CEO, AP Mobility India Pvt. Ltd.',
    image: '/assets/Sparsh.png',
    imageAlt: 'Portrait of AP Mobility India CEO Sparsh Agarwal.',
    imagePosition: 'center 22%',
  },
];

const getEditionDateParts = (value) => {
  if (!value) return { day: '—', monthYear: 'DATE TO BE ANNOUNCED' };
  const rawDate = String(value);
  const normalizedDate = /^\d{4}-\d{2}-\d{2}$/.test(rawDate)
    ? rawDate + 'T09:00:00'
    : rawDate;
  const date = new Date(normalizedDate);
  if (Number.isNaN(date.getTime())) return { day: '—', monthYear: rawDate.toUpperCase() };
  return {
    day: new Intl.DateTimeFormat('en-IN', { day: '2-digit' }).format(date),
    monthYear: new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(date).toUpperCase(),
  };
};

const galleryItems = [
  {
    id: 'stage', index: '01', category: 'ON THE STAGE', title: 'Ideas that found a voice.',
    detail: 'A speaker addresses the audience during the official TEDxIIMT University 2025 highlights.',
    image: 'https://iimtu.edu.in/blog/wp-content/uploads/2025/11/WhatsApp-Image-2025-11-14-at-11.58.40-AM.jpeg',
    alt: 'TEDxIIMT 2025 event highlights banner showing a speaker holding a microphone and facing the audience under stage lights.',
    position: 'left center', className: 'ted-home-gallery-card--stage',
    sourcePage: 'https://iimtu.edu.in/blog/ideas-that-ignited-the-stage-highlights-from-tedx-iimt-university-2025/',
  },
  {
    id: 'campus', index: '02', category: 'THE CAMPUS', title: 'A place for new perspectives.',
    detail: 'Official IIMT University campus imagery from the university website.',
    image: 'https://iimtu.edu.in/assets/admissions/accomplishments/campuses.21_03_2025.webp',
    alt: 'IIMT University campus entrance in Meerut, with academic buildings and the IIMT University sign.',
    position: 'center center', className: 'ted-home-gallery-card--campus',
    sourcePage: 'https://iimtu.edu.in/admissions-open/',
  },
  {
    id: 'opening', index: '03', category: 'THE OPENING', title: 'The event begins together.',
    detail: 'Official IIMT event imagery featuring the TEDxIIMT 2025 inauguration and ribbon-cutting moment.',
    image: 'https://iimtu.edu.in/uploads/images/17630370661.jpg',
    alt: 'Official TEDxIIMT University 2025 event collage featuring the inauguration ribbon-cutting ceremony.',
    position: 'center 62%', className: 'ted-home-gallery-card--opening',
    sourcePage: 'https://iimtu.edu.in/news-event-details/tedx-iimt-university-break-the-flow',
  },
  {
    id: 'community', index: '04', category: 'THE PEOPLE', title: 'The people behind the stage.',
    detail: 'Official IIMT event imagery showing the TEDxIIMT organising community and event message wall.',
    image: 'https://iimtu.edu.in/uploads/images/17630370831.jpg',
    alt: 'Official TEDxIIMT University 2025 event collage showing the organising team in front of the TEDx backdrop.',
    position: 'center 58%', className: 'ted-home-gallery-card--community',
    sourcePage: 'https://iimtu.edu.in/news-event-details/tedx-iimt-university-break-the-flow',
  },
  {
    id: 'audience', index: '05', category: 'IN THE ROOM', title: 'Every perspective belongs.',
    detail: 'Official IIMT event imagery with speaker and audience moments from TEDxIIMT University 2025.',
    image: 'https://iimtu.edu.in/uploads/images/17630369961.jpg',
    alt: 'Official TEDxIIMT University 2025 event collage with a speaker and audience moments.',
    position: 'center 64%', className: 'ted-home-gallery-card--audience',
    sourcePage: 'https://iimtu.edu.in/news-event-details/tedx-iimt-university-break-the-flow',
  },
];

const REVEAL_PRESETS = {
  lift: {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0 },
  },
  left: {
    hidden: { opacity: 0, x: -22 },
    visible: { opacity: 1, x: 0 },
  },
  right: {
    hidden: { opacity: 0, x: 22 },
    visible: { opacity: 1, x: 0 },
  },
  card: {
    hidden: { opacity: 0, y: 18, scale: 0.982 },
    visible: { opacity: 1, y: 0, scale: 1 },
  },
  image: {
    hidden: { opacity: 0, scale: 0.975 },
    visible: { opacity: 1, scale: 1 },
  },
};

const Reveal = ({ children, className = '', delay = 0, variant = 'lift', ...props }) => {
  const prefersReducedMotion = useReducedMotion();
  const selectedPreset = REVEAL_PRESETS[variant] || REVEAL_PRESETS.lift;

  return (
    <Motion.div
      {...props}
      className={className}
      initial={prefersReducedMotion ? false : 'hidden'}
      whileInView={prefersReducedMotion ? undefined : 'visible'}
      variants={selectedPreset}
      viewport={{ once: true, amount: 0.14, margin: '0px 0px -36px 0px' }}
      transition={{ duration: 0.56, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Motion.div>
  );
};

const HomePage = () => {
  const { activeEdition } = useEdition();
  const homepageEdition = activeEdition?.is_active === true ? activeEdition : ARCHIVE_EDITIONS[0];
  const editionYear = Number(homepageEdition?.year) || 2025;
  const editionDate = getEditionDateParts(homepageEdition?.date);
  const homepageSpeakers = editionYear === 2025
    ? featuredSpeakers2025
    : (Array.isArray(homepageEdition?.speakers) ? homepageEdition.speakers.map((speaker, index) => ({
      id: speaker.id || 'edition-speaker-' + index,
      index: String(index + 1).padStart(2, '0'),
      name: speaker.name || 'Featured speaker',
      role: speaker.title || speaker.designation || speaker.organization || 'TEDxIIMT speaker',
    })) : []);
  const [activePhoto, setActivePhoto] = useState(null);
  const selectedPhoto = activePhoto === null ? null : galleryItems[activePhoto];
  const isLightboxOpen = activePhoto !== null;
  const lightboxRef = useRef(null);
  const lightboxCloseButtonRef = useRef(null);
  const previousPhotoTriggerRef = useRef(null);

  useEffect(() => {
    const themePanel = document.querySelector('.ted-home-edition-theme-panel');
    if (!themePanel || typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver(([entry]) => {
      themePanel.classList.toggle('is-theme-trajectory-active', entry.isIntersecting);
    }, { threshold: 0.38, rootMargin: '0px 0px -5% 0px' });

    observer.observe(themePanel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isLightboxOpen) {
      const previousTrigger = previousPhotoTriggerRef.current;
      if (previousTrigger?.isConnected) {
        previousTrigger.focus({ preventScroll: true });
      }
      previousPhotoTriggerRef.current = null;
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    lightboxCloseButtonRef.current?.focus({ preventScroll: true });

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setActivePhoto(null);
        return;
      }

      if (event.key === 'ArrowRight') {
        setActivePhoto((current) => current === null ? null : (current + 1) % galleryItems.length);
        return;
      }

      if (event.key === 'ArrowLeft') {
        setActivePhoto((current) => current === null ? null : (current - 1 + galleryItems.length) % galleryItems.length);
        return;
      }

      if (event.key === 'Tab') {
        const dialog = lightboxRef.current;
        const focusable = dialog?.querySelectorAll(
          'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable?.length || !dialog) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const focusIsOutsideDialog = !dialog.contains(document.activeElement);

        if (event.shiftKey && (document.activeElement === first || focusIsOutsideDialog)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (document.activeElement === last || focusIsOutsideDialog)) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLightboxOpen]);

  const openPhoto = (index, trigger) => {
    previousPhotoTriggerRef.current = trigger;
    setActivePhoto(index);
  };

  const changePhoto = (direction) => {
    setActivePhoto((current) => current === null ? null : (current + direction + galleryItems.length) % galleryItems.length);
  };

  return (
    <div className="ted-home min-h-screen bg-black text-white">
      <main id="main-content">
        {/* Preserve the established hero artwork, mosaic and pointer interactions. */}
        <Hero />

        <section className="ted-home-statement ted-home-grid-surface" aria-labelledby="home-statement-heading">
          <div className="ted-home-shell ted-home-statement-grid">
            <Reveal variant="left">
              <span className="ted-home-kicker">TEDxIIMT UNIVERSITY / IDEAS WORTH SPREADING</span>
              <h2 id="home-statement-heading" className="ted-home-statement-title">
                <span>IDEAS</span><span className="accent">DON'T</span><span>STAND STILL.</span>
              </h2>
            </Reveal>
            <Reveal className="ted-home-statement-aside" variant="right" delay={0.1}>
              <p>A local stage for original thinking, unexpected perspectives and conversations that can move an idea beyond the room.</p>
              <div className="ted-home-statement-meta">IIMT UNIVERSITY · MEERUT</div>
            </Reveal>
          </div>
        </section>

        <section className="ted-home-pillars ted-home-grid-surface ted-home-edition-showcase" aria-labelledby="home-pillars-heading">
          <div className="ted-home-shell ted-home-edition-shell">
            <Reveal className="ted-home-edition-intro" variant="left">
              <div className="ted-home-edition-intro-top">
                <span className="ted-home-kicker">THE EDITION / OFFICIAL EVENT RECORD</span>
                <span className="ted-home-edition-edition-index">01 — 01 <i aria-hidden="true" /> ARCHIVE</span>
              </div>
              <div className="ted-home-edition-heading-row">
                <h2 id="home-pillars-heading">TEDxIIMT University <em>{editionYear}.</em></h2>
                <div className="ted-home-edition-lede">
                  <span>THE IDEA BEHIND THE EDITION</span>
                  <p>{homepageEdition?.tagline || homepageEdition?.description || 'Ideas worth spreading from IIMT University, Meerut.'}</p>
                </div>
              </div>
            </Reveal>

            <div className="ted-home-edition-showcase-grid">
              <Reveal className="ted-home-edition-theme-panel" variant="card" delay={0.06}>
                <div className="ted-home-edition-panel-top">
                  <span>01 / THE THEME</span>
                  <span>THE CENTRAL IDEA</span>
                </div>
                <div className="ted-home-edition-theme-content">
                  <span className="ted-home-edition-theme-overline">TEDxIIMT UNIVERSITY · {editionYear}</span>
                  <div className="ted-home-edition-theme-trajectory" aria-hidden="true">
                    <span className="ted-home-edition-theme-trajectory-line" />
                    <span className="ted-home-edition-theme-trajectory-dot" />
                  </div>
                  <h3>Break <em>the</em><br />Flow<span className="ted-home-edition-theme-period">.</span></h3>
                  <div className="ted-home-edition-theme-foot">
                    <span>A THEME THAT INVITES A DIFFERENT PERSPECTIVE.</span>
                    <span className="ted-home-edition-theme-mark">TED<span>x</span></span>
                  </div>
                </div>
                <span className="ted-home-edition-theme-watermark" aria-hidden="true">01</span>
              </Reveal>

              <div className="ted-home-edition-facts-rail">
                <Reveal className="ted-home-edition-date-panel" variant="lift" delay={0.12}>
                  <div className="ted-home-edition-panel-top">
                    <span>02 / THE DATE</span>
                    <CalendarDays aria-hidden="true" />
                  </div>
                  <div className="ted-home-edition-date-lockup">
                    <span className="ted-home-edition-date-day">{editionDate.day}</span>
                    <div>
                      <strong>{editionDate.monthYear}</strong>
                      <span>OFFICIAL EVENT DATE</span>
                    </div>
                  </div>
                  <div className="ted-home-edition-panel-foot">
                    <span>THE DAY IDEAS TOOK THE STAGE</span>
                    <i aria-hidden="true" />
                  </div>
                </Reveal>

                <Reveal className="ted-home-edition-venue-panel" variant="right" delay={0.18}>
                  <div className="ted-home-edition-panel-top">
                    <span>03 / THE VENUE</span>
                    <MapPin aria-hidden="true" />
                  </div>
                  <div className="ted-home-edition-venue-content">
                    <h3>Seminar Hall</h3>
                    <p className="ted-home-edition-venue-floor">2nd Floor <i aria-hidden="true" /> B Block</p>
                    <p className="ted-home-edition-venue-campus">IIMT University, Meerut</p>
                  </div>
                  <div className="ted-home-edition-venue-location">
                    <MapPin aria-hidden="true" />
                    <span>{homepageEdition?.city || 'Meerut, Uttar Pradesh'}</span>
                  </div>
                </Reveal>
              </div>
            </div>

            <div className="ted-home-edition-bottomline">
              <span><i aria-hidden="true" /> OFFICIAL 2025 EDITION / IIMT UNIVERSITY, MEERUT</span>
              {editionYear === 2025 && (
                <a className="ted-home-edition-source" href="https://iimtu.edu.in/news-event-details/tedx-iimt-university-break-the-flow" target="_blank" rel="noreferrer">
                  VIEW THE OFFICIAL IIMT EVENT RECORD <ArrowUpRight aria-hidden="true" />
                </a>
              )}
            </div>
          </div>
        </section>

        <section className="ted-home-origin" aria-labelledby="home-origin-heading">
          <div className="ted-home-shell ted-home-origin-grid">
            <Reveal className="ted-home-origin-mark" variant="image">
              <div className="ted-home-origin-lockup">
                <div className="ted-home-origin-logo"><span className="ted">TED</span><span className="x">x</span></div>
                <span className="ted-home-origin-university"><svg className="ted-home-origin-university-initial" viewBox="0 0 40 68" role="img" aria-label="I" focusable="false">
                    <path d="M5 25 L35 14 V64 H5 Z" fill="url(#iimt-signature-stem)" />
                    <path d="M5 4 H35 V15 L5 26 Z" fill="#EB0028" />
                    <defs>
                      <linearGradient id="iimt-signature-stem" x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0" stopColor="#BFC6CE" />
                        <stop offset=".48" stopColor="#F7F8F9" />
                        <stop offset="1" stopColor="#D9DEE4" />
                      </linearGradient>
                    </defs>
                  </svg>IMT University</span>
              </div>
              <div className="ted-home-origin-caption"><span>INDEPENDENTLY ORGANIZED</span><span>MEERUT / INDIA</span></div>
              <a className="ted-home-origin-hit" href="/about" aria-label="Learn more about TEDxIIMT University" />
            </Reveal>
            <Reveal className="ted-home-origin-copy" variant="right" delay={0.1}>
              <span className="ted-home-kicker">A GLOBAL IDEA / A LOCAL STAGE</span>
              <h2 id="home-origin-heading">What is <span>TEDx?</span></h2>
              <p>TEDx is a program of local, independently organized events that bring people together to share a TED-like experience. Each event is organized under a license from TED.</p>
              <p>At IIMT University in Meerut, TEDxIIMT creates a space for students, educators and curious minds to encounter ideas worth spreading.</p>
              <div className="ted-home-origin-note"><span>INDEPENDENTLY ORGANIZED</span><span>IDEAS WORTH SPREADING</span><span>IIMT UNIVERSITY</span></div>
              <a className="ted-home-link mt-8" href="/about">Discover the TEDx story <ArrowUpRight aria-hidden="true" /></a>
            </Reveal>
          </div>
        </section>

        <section className="ted-home-stage ted-home-grid-surface" aria-labelledby="home-stage-heading">
          <div className="ted-home-shell ted-home-stage-inner">
            <Reveal variant="left">
              <span className="ted-home-kicker">THE STAGE / THE NEXT PERSPECTIVE</span>
              <h2 id="home-stage-heading">A stage for ideas that <span>move people.</span></h2>
              <p>Every talk begins with a thought. Explore the voices behind the ideas—or take the first step towards sharing an idea of your own.</p>
            </Reveal>
            <Reveal className="ted-home-stage-actions" variant="right" delay={0.1}>
              <a className="ted-home-link ted-home-link--red" href="/speakers">Explore speakers <ArrowUpRight aria-hidden="true" /></a>
              <a className="ted-home-link" href="/speaker-apply">Apply to speak <ArrowUpRight aria-hidden="true" /></a>
            </Reveal>
          </div>
        </section>

        <section className="ted-home-gallery" aria-labelledby="home-gallery-heading">
          <div className="ted-home-shell">
            <Reveal className="ted-home-gallery-head" variant="left">
              <div>
                <span className="ted-home-kicker">THE EVENT / DOCUMENTED MOMENTS</span>
                <h2 id="home-gallery-heading" className="ted-home-section-heading">A few moments. <em>A thousand ideas.</em></h2>
              </div>
              <div className="ted-home-gallery-intro">
                <p>Real moments from TEDxIIMT University and the campus that brings this community together.</p>
                <a href="/gallery" className="ted-home-gallery-all">EXPLORE FULL GALLERY <ArrowUpRight aria-hidden="true" /></a>
              </div>
            </Reveal>

            <div className="ted-home-gallery-grid">
              {galleryItems.map((photo, index) => (
                <Reveal key={photo.id} className={'ted-home-gallery-slot ' + photo.className} variant="image" delay={Math.min(index * 0.055, 0.22)}>
                  <button
                    type="button"
                    className="ted-home-gallery-card"
                    onClick={(event) => openPhoto(index, event.currentTarget)}
                    aria-label={'Open photo: ' + photo.title}
                  >
                    <img
                      src={photo.image}
                      alt={photo.alt}
                      loading="lazy"
                      decoding="async"
                      style={{ objectPosition: photo.position }}
                    />
                    <span className="ted-home-gallery-shade" aria-hidden="true" />
                    <span className="ted-home-gallery-count">{photo.index} / 05</span>
                    <span className="ted-home-gallery-copy">
                      <span>{photo.category}</span>
                      <strong>{photo.title}</strong>
                    </span>
                    <span className="ted-home-gallery-open" aria-hidden="true"><Camera /></span>
                  </button>
                </Reveal>
              ))}
            </div>
            <p className="ted-home-gallery-credit">EVENT AND CAMPUS IMAGERY · IIMT UNIVERSITY OFFICIAL SOURCES</p>
          </div>
        </section>

        <section className="ted-home-discover ted-home-grid-surface" aria-labelledby="home-discover-heading">
          <div className="ted-home-shell">
            <Reveal className="ted-home-discover-head" variant="right">
              <div>
                <span className="ted-home-kicker">EXPLORE</span>
                <h2 id="home-discover-heading" className="ted-home-section-heading">TEDxIIMT <em>University</em></h2>
              </div>
              <p>Meet the voices, people and partners behind the TEDxIIMT experience.</p>
            </Reveal>
            <div className="ted-home-discover-grid">
              {discovery.map(({ index, label, title, description, href, action, image, imageAlt, imagePosition }, cardIndex) => (
                <Reveal key={index} variant="card" delay={cardIndex * 0.07}>
                  <a className="ted-home-discover-card" data-index={index} href={href}>
                    <img
                      className="ted-home-discover-image"
                      src={image}
                      alt={imageAlt}
                      loading="lazy"
                      decoding="async"
                      style={{ objectPosition: imagePosition }}
                    />
                    <span className="ted-home-discover-image-shade" aria-hidden="true" />
                    <div className="ted-home-discover-top">
                      <span>{index} / {label}</span>
                      <span className="ted-home-discover-open" aria-hidden="true"><ArrowUpRight /></span>
                    </div>
                    <div className="ted-home-discover-content">
                      <h3>{title}</h3>
                      <p>{description}</p>
                    </div>
                    <div className="ted-home-discover-bottom">
                      <span>{action}</span>
                      <ArrowUpRight aria-hidden="true" />
                    </div>
                  </a>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <div id="home-highlights" className="ted-home-reels">
          <SocialMedia />
        </div>

        <section className="ted-home-speakers ted-home-grid-surface" aria-labelledby="home-speakers-heading">
          <div className="ted-home-shell">
            <Reveal className="ted-home-benefits-head" variant="left">
              <div>
                <span className="ted-home-kicker">THE STAGE / {homepageSpeakers.length} SPEAKERS</span>
                <h2 id="home-speakers-heading" className="ted-home-section-heading">{editionYear === 2025 ? 'Eight voices.' : 'The voices.'} <em>Different worlds.</em></h2>
              </div>
              <p>The speakers documented in IIMT University’s official recap of TEDxIIMT University {editionYear}.</p>
            </Reveal>
            <div className="ted-home-speaker-grid">
              {homepageSpeakers.map((speaker, speakerIndex) => (
                <Reveal
                  key={speaker.id}
                  className="ted-home-speaker-card"
                  variant="card"
                  delay={(speakerIndex % 4) * 0.05}
                >
                  <article className="ted-home-speaker-card__surface">
                    <div className="ted-home-speaker-portrait">
                      <div className="ted-home-speaker-portrait-fallback" aria-hidden="true">
                        {speaker.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('')}
                      </div>
                      {speaker.image && (
                        <img
                          src={speaker.image}
                          alt={speaker.imageAlt || ('Portrait of ' + speaker.name)}
                          loading="lazy"
                          decoding="async"
                          onError={(event) => { event.currentTarget.style.display = 'none'; }}
                          style={{ objectPosition: speaker.imagePosition || 'center 24%' }}
                        />
                      )}
                      <span className="ted-home-speaker-image-wash" aria-hidden="true" />
                      <div className="ted-home-speaker-image-top">
                        <span>{speaker.index} / SPEAKER</span>
                        <span>TEDxIIMT · 2025</span>
                      </div>
                      <span className="ted-home-speaker-image-corner" aria-hidden="true" />
                    </div>
                    <div className="ted-home-speaker-card-copy">
                      <h3>{speaker.name}</h3>
                      <p>{speaker.role}</p>
                      <span className="ted-home-speaker-card-rule" aria-hidden="true" />
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
            {editionYear === 2025 && (
              <div className="ted-home-speaker-context">
                <p><strong>CREATIVE PERFORMANCES</strong><span>Kapil Dinkar and IIMT student artists brought music and dance to the programme.</span></p>
                <p><strong>EVENT CURATION</strong><span>Dr. Vaibhav Sharma, Dr. Akshay Raj, Dr. Vatsala Tomar and Ms. Zeba Tyagi.</span></p>
              </div>
            )}
            {editionYear === 2025 && (
              <a className="ted-home-speaker-source" href="https://iimtu.edu.in/blog/ideas-that-ignited-the-stage-highlights-from-tedx-iimt-university-2025/" target="_blank" rel="noreferrer">
                READ THE OFFICIAL IIMT UNIVERSITY RECAP <ArrowUpRight aria-hidden="true" />
              </a>
            )}
          </div>
        </section>

        <div className="ted-home-dynamic"><Partners /><Blog /></div>

        <section className="ted-home-close ted-home-grid-surface" aria-labelledby="home-close-heading">
          <div className="ted-home-shell ted-home-close-inner">
            <Reveal variant="left">
              <span className="ted-home-kicker">YOUR IDEA / YOUR NEXT STEP</span>
              <h2 id="home-close-heading">Make room for <span>what's next.</span></h2>
              <p>Join the TEDxIIMT community, discover ideas worth spreading and be part of the next conversation.</p>
            </Reveal>
            <Reveal className="ted-home-close-actions" variant="right" delay={0.1}>
              <a className="ted-home-link ted-home-link--red" href="/register">Be part of the experience <ArrowRight aria-hidden="true" /></a>
              <a className="ted-home-link" href="/speaker-apply">Share an idea <ArrowUpRight aria-hidden="true" /></a>
            </Reveal>
          </div>
        </section>
      </main>

      <FloatingCTA />

      <AnimatePresence>
        {selectedPhoto && (
          <Motion.div
            ref={lightboxRef}
            className="ted-home-lightbox"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ted-home-lightbox-title"
            aria-describedby="ted-home-lightbox-description"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => setActivePhoto(null)}
          >
            <button ref={lightboxCloseButtonRef} type="button" className="ted-home-lightbox-close" onClick={() => setActivePhoto(null)} aria-label="Close photo viewer">
              <X aria-hidden="true" />
            </button>
            <button
              type="button"
              className="ted-home-lightbox-nav ted-home-lightbox-prev"
              onClick={(event) => { event.stopPropagation(); changePhoto(-1); }}
              aria-label="Previous photo"
            >
              <ChevronLeft aria-hidden="true" />
            </button>

            <div className="ted-home-lightbox-panel" onClick={(event) => event.stopPropagation()}>
              <div className="ted-home-lightbox-image">
                <img src={selectedPhoto.image} alt={selectedPhoto.alt} />
              </div>
              <div className="ted-home-lightbox-caption">
                <div>
                  <span aria-live="polite">{selectedPhoto.index} / 05 · {selectedPhoto.category}</span>
                  <h3 id="ted-home-lightbox-title">{selectedPhoto.title}</h3>
                  <p id="ted-home-lightbox-description">{selectedPhoto.detail}</p>
                </div>
                <a href={selectedPhoto.sourcePage} target="_blank" rel="noopener noreferrer">
                  IIMT OFFICIAL SOURCE <ArrowUpRight aria-hidden="true" />
                </a>
              </div>
            </div>

            <button
              type="button"
              className="ted-home-lightbox-nav ted-home-lightbox-next"
              onClick={(event) => { event.stopPropagation(); changePhoto(1); }}
              aria-label="Next photo"
            >
              <ChevronRight aria-hidden="true" />
            </button>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePage;
