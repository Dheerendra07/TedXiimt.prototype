import React, { useEffect, useRef, useState } from 'react';
import { useEdition } from '../context/EditionContext';
import { ARCHIVE_EDITIONS } from '../data/archiveData';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import {
  ArrowRight, ArrowUpRight, CalendarDays, Camera, ChevronLeft, ChevronRight,
  Lightbulb, MapPin, Mic2, Users, X,
} from 'lucide-react';
import Hero from '../components/Hero';
import SocialMedia from '../components/SocialMedia';
import Partners from '../components/Partners';
import Blog from '../components/Blog';
import FloatingCTA from '../components/FloatingCTA';
import './HomePage.css';

const discovery = [
  {
    index: '01', label: 'THE SPEAKERS', title: 'Eight voices. One stage.',
    description: 'Meet the eight speakers featured in IIMT University’s official Break the Flow event recap.',
    href: '/speakers', action: 'EXPLORE THE SPEAKERS', Icon: Mic2,
  },
  {
    index: '02', label: 'EVENT CURATION', title: 'Faculty-led. Community-shaped.',
    description: 'The 2025 event was curated by Dr. Vaibhav Sharma, Dr. Akshay Raj, Dr. Vatsala Tomar and Ms. Zeba Tyagi.',
    href: '/team', action: 'MEET THE TEAM', Icon: Users,
  },
  {
    index: '03', label: 'THE ARCHIVE', title: 'The day, documented.',
    description: 'Revisit official TEDxIIMT stage, audience and campus moments from the 2025 edition.',
    href: '/gallery', action: 'VIEW EVENT GALLERY', Icon: Camera,
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

const formatEditionDate = (value) => {
  if (!value) return 'Date to be announced';
  const rawDate = String(value);
  const normalizedDate = /^\d{4}-\d{2}-\d{2}$/.test(rawDate)
    ? rawDate + 'T09:00:00'
    : rawDate;
  const date = new Date(normalizedDate);
  if (Number.isNaN(date.getTime())) return rawDate;
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
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

const Reveal = ({ children, className = '', delay = 0, ...props }) => (
  <Motion.div
    {...props}
    className={className}
    initial={{ opacity: 0, y: 26 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.16 }}
    transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </Motion.div>
);

const HomePage = () => {
  const { activeEdition } = useEdition();
  const homepageEdition = activeEdition?.is_active === true ? activeEdition : ARCHIVE_EDITIONS[0];
  const editionYear = Number(homepageEdition?.year) || 2025;
  const editionDateLabel = formatEditionDate(homepageEdition?.date);
  const editionFacts = [
    { index: '01', label: 'THE THEME', value: homepageEdition?.theme || 'To be announced', detail: homepageEdition?.tagline || 'Ideas worth spreading.', Icon: Lightbulb, className: '' },
    { index: '02', label: 'THE DATE', value: editionDateLabel, detail: 'Official event date', Icon: CalendarDays, className: '' },
    { index: '03', label: 'THE VENUE', value: homepageEdition?.venue || 'IIMT University, Meerut', detail: homepageEdition?.city || 'Meerut, Uttar Pradesh', Icon: MapPin, className: 'ted-home-edition-card--venue' },
  ];
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
            <Reveal>
              <span className="ted-home-kicker">TEDxIIMT UNIVERSITY / IDEAS WORTH SPREADING</span>
              <h2 id="home-statement-heading" className="ted-home-statement-title">
                <span>IDEAS</span><span className="accent">DON'T</span><span>STAND STILL.</span>
              </h2>
            </Reveal>
            <Reveal className="ted-home-statement-aside" delay={0.12}>
              <p>A local stage for original thinking, unexpected perspectives and conversations that can move an idea beyond the room.</p>
              <div className="ted-home-statement-meta">IIMT UNIVERSITY · MEERUT</div>
            </Reveal>
          </div>
        </section>

        <section className="ted-home-pillars ted-home-grid-surface" aria-labelledby="home-pillars-heading">
          <div className="ted-home-shell">
            <Reveal className="ted-home-pillars-head">
              <div>
                <span className="ted-home-kicker">THE EDITION / OFFICIAL EVENT RECORD</span>
                <h2 id="home-pillars-heading" className="ted-home-section-heading">{homepageEdition?.title || 'TEDxIIMT University'}.</h2>
              </div>
              <p>{homepageEdition?.tagline || homepageEdition?.description || 'Ideas worth spreading from IIMT University, Meerut.'}</p>
            </Reveal>
            <div className="ted-home-edition-grid">
              {editionFacts.map((fact) => (
                <Reveal key={fact.index} className={'ted-home-edition-card ' + fact.className}>
                  <div className="ted-home-edition-card-top">
                    <span>{fact.index} / {fact.label}</span>
                    <span className="ted-home-edition-icon">{React.createElement(fact.Icon, { "aria-hidden": true })}</span>
                  </div>
                  <div>
                    <h3>{fact.value}</h3>
                    <p>{fact.detail}</p>
                  </div>
                </Reveal>
              ))}
            </div>
            {editionYear === 2025 && (
              <a className="ted-home-edition-source" href="https://iimtu.edu.in/news-event-details/tedx-iimt-university-break-the-flow" target="_blank" rel="noreferrer">
                VIEW THE OFFICIAL IIMT EVENT RECORD <ArrowUpRight aria-hidden="true" />
              </a>
            )}
          </div>
        </section>

        <section className="ted-home-origin" aria-labelledby="home-origin-heading">
          <div className="ted-home-shell ted-home-origin-grid">
            <Reveal className="ted-home-origin-mark">
              <div className="ted-home-origin-logo"><span className="ted">TED</span><span className="x">x</span></div>
              <div className="ted-home-origin-caption"><span>INDEPENDENTLY ORGANIZED</span><span>MEERUT / INDIA</span></div>
              <a className="ted-home-origin-hit" href="/about" aria-label="Learn more about TEDxIIMT University" />
            </Reveal>
            <Reveal className="ted-home-origin-copy" delay={0.12}>
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
            <Reveal>
              <span className="ted-home-kicker">THE STAGE / THE NEXT PERSPECTIVE</span>
              <h2 id="home-stage-heading">A stage for ideas that <span>move people.</span></h2>
              <p>Every talk begins with a thought. Explore the voices behind the ideas—or take the first step towards sharing an idea of your own.</p>
            </Reveal>
            <Reveal className="ted-home-stage-actions" delay={0.15}>
              <a className="ted-home-link ted-home-link--red" href="/speakers">Explore speakers <ArrowUpRight aria-hidden="true" /></a>
              <a className="ted-home-link" href="/speaker-apply">Apply to speak <ArrowUpRight aria-hidden="true" /></a>
            </Reveal>
          </div>
        </section>

        <section className="ted-home-gallery" aria-labelledby="home-gallery-heading">
          <div className="ted-home-shell">
            <Reveal className="ted-home-gallery-head">
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
                <Reveal key={photo.id} className={'ted-home-gallery-slot ' + photo.className} delay={index * 0.07}>
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

        <section className="ted-home-discover" aria-labelledby="home-discover-heading">
          <div className="ted-home-shell">
            <Reveal className="ted-home-discover-head">
              <div>
                <span className="ted-home-kicker">THE EVENT / PEOPLE AND PROGRAMME</span>
                <h2 id="home-discover-heading" className="ted-home-section-heading">The people behind <em>Break the Flow.</em></h2>
              </div>
              <p>On 11 November 2025, IIMT University brought speakers, faculty, students and creative performers together in Meerut.</p>
            </Reveal>
            <div className="ted-home-discover-grid">
              {discovery.map(({ index, label, title, description, href, action, Icon }, cardIndex) => (
                <Reveal key={index} delay={cardIndex * 0.08}>
                  <a className="ted-home-discover-card" data-index={index} href={href}>
                    <div className="ted-home-discover-top">
                      <span>{index} / {label}</span>
                      <span className="ted-home-discover-icon">{React.createElement(Icon, { "aria-hidden": true })}</span>
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

        <div id="home-highlights">
          <SocialMedia />
        </div>

        <section className="ted-home-speakers ted-home-grid-surface" aria-labelledby="home-speakers-heading">
          <div className="ted-home-shell">
            <Reveal className="ted-home-benefits-head">
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
                  delay={speakerIndex * 0.065}
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
            <Reveal>
              <span className="ted-home-kicker">YOUR IDEA / YOUR NEXT STEP</span>
              <h2 id="home-close-heading">Make room for <span>what's next.</span></h2>
              <p>Join the TEDxIIMT community, discover ideas worth spreading and be part of the next conversation.</p>
            </Reveal>
            <Reveal className="ted-home-close-actions" delay={0.15}>
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
