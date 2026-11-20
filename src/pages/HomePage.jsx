import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import {
  ArrowRight, ArrowUpRight, BookOpen, Camera, ChevronLeft, ChevronRight,
  Handshake, Lightbulb, Mic2, Sparkles, Users, X,
} from 'lucide-react';
import Hero from '../components/Hero';
import SocialMedia from '../components/SocialMedia';
import Partners from '../components/Partners';
import Blog from '../components/Blog';
import FloatingCTA from '../components/FloatingCTA';
import './HomePage.css';

const pillars = [
  {
    number: '01', label: 'EDUCATION', title: <>LEARN TO <em>QUESTION.</em></>,
    description: 'A new perspective begins when a familiar answer is challenged.',
    action: 'EXPLORE PAST TALKS', href: '/library', Icon: BookOpen,
    className: 'ted-home-pillar--education',
    image: 'https://iimtu.edu.in/uploads/images/17630369861.jpg',
    imagePosition: 'center 44%',
  },
  {
    number: '02', label: 'ENTERTAINMENT', title: <>MAKE EVERY <em>MOMENT MATTER.</em></>,
    description: 'Stories and expression that make an idea stay with you.',
    action: 'WATCH EVENT MOMENTS', href: '#home-highlights', Icon: Sparkles,
    className: '',
    image: 'https://iimtu.edu.in/uploads/images/17630370541.jpg',
    imagePosition: 'center 50%',
  },
  {
    number: '03', label: 'ENTREPRENEURSHIP', title: <>TURN IDEAS <em>INTO ACTION.</em></>,
    description: 'The curiosity to imagine something better—and the courage to begin.',
    action: 'SHARE AN IDEA', href: '/speaker-apply', Icon: Lightbulb,
    className: '',
    image: 'https://iimtu.edu.in/uploads/images/17630370091.jpg',
    imagePosition: 'center 46%',
  },
];

const discovery = [
  {
    index: '01', label: 'THE VOICES', title: 'Ideas have a voice.',
    description: 'Meet the speakers and explore the perspectives brought to the TEDxIIMT stage.',
    href: '/speakers', action: 'MEET THE SPEAKERS', Icon: Mic2,
    image: 'https://iimtu.edu.in/uploads/images/17630369861.jpg', imagePosition: 'center 46%',
  },
  {
    index: '02', label: 'THE PEOPLE', title: 'Made possible together.',
    description: 'Get to know the team building the experience behind every idea.',
    href: '/team', action: 'MEET THE TEAM', Icon: Users,
    image: 'https://iimtu.edu.in/uploads/images/17630370831.jpg', imagePosition: 'center center',
  },
  {
    index: '03', label: 'THE ECOSYSTEM', title: 'Good ideas need allies.',
    description: 'Discover the partners who help create room for meaningful conversations.',
    href: '/partners', action: 'VIEW PARTNERS', Icon: Handshake,
    image: 'https://iimtu.edu.in/uploads/images/17630370541.jpg', imagePosition: 'center 48%',
  },
];

const takeaways = [
  {
    index: '01 / PERSPECTIVE', title: 'See differently.',
    description: 'Encounter ideas that invite you to look beyond the familiar.',
    action: 'EXPLORE THE ARCHIVE', href: '/library',
    image: 'https://iimtu.edu.in/uploads/images/17630369961.jpg',
    imagePosition: 'center 52%',
  },
  {
    index: '02 / CONNECTION', title: 'Meet through ideas.',
    description: 'Find common ground with people who are curious about what comes next.',
    action: 'MEET THE COMMUNITY', href: '/team',
    image: 'https://iimtu.edu.in/uploads/images/17630370831.jpg',
    imagePosition: 'center 50%',
  },
  {
    index: '03 / CURIOSITY', title: 'Keep asking.',
    description: 'Leave with new questions, fresh context and a wider point of view.',
    action: 'READ MORE STORIES', href: '/blog',
    image: 'https://iimtu.edu.in/uploads/images/17630370661.jpg',
    imagePosition: 'center 52%',
  },
  {
    index: '04 / POSSIBILITY', title: 'Make it matter.',
    description: 'Carry an idea into your studies, work, community or next project.',
    action: 'SHARE YOUR IDEA', href: '/speaker-apply',
    image: 'https://iimtu.edu.in/uploads/images/17630370971.jpg',
    imagePosition: 'center 48%',
  },
];

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
                <span className="ted-home-kicker">THE THEME / THREE LENSES</span>
                <h2 id="home-pillars-heading" className="ted-home-section-heading">A wider way to <em>see the world.</em></h2>
              </div>
              <p>Education, Entertainment and Entrepreneurship are more than categories. They are different ways to question, connect and create.</p>
            </Reveal>
            <div className="ted-home-pillar-grid">
              {pillars.map(({ number, label, title, description, action, href, Icon, className, image, imagePosition }, index) => (
                <Reveal key={number} data-number={number} className={'ted-home-pillar ' + className} delay={index * 0.1}>
                  <img
                    className="ted-home-pillar-photo"
                    src={image}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    decoding="async"
                    draggable="false"
                    style={{ objectPosition: imagePosition }}
                  />
                  <span className="ted-home-pillar-shade" aria-hidden="true" />
                  <div className="ted-home-pillar-top">
                    <span className="ted-home-pillar-label">{number} / {label}</span>
                    <span className="ted-home-pillar-symbol">{React.createElement(Icon, { "aria-hidden": true })}</span>
                  </div>
                  <h3>{title}</h3>
                  <div className="ted-home-pillar-bottom">
                    <span>{description}</span>
                    <span className="ted-home-pillar-action">{action}<ArrowUpRight aria-hidden="true" /></span>
                  </div>
                  <a className="ted-home-pillar-hit" href={href} aria-label={label + ': ' + action} />
                </Reveal>
              ))}
            </div>
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
                <span className="ted-home-kicker">EXPLORE / TEDxIIMT UNIVERSITY</span>
                <h2 id="home-discover-heading" className="ted-home-section-heading">The people behind <em>the ideas.</em></h2>
              </div>
              <p>A great event is built by many voices, many hands and a community that believes in sharing what matters.</p>
            </Reveal>
            <div className="ted-home-discover-grid">
              {discovery.map(({ index, label, title, description, href, action, Icon, image, imagePosition }, cardIndex) => (
                <Reveal key={index} delay={cardIndex * 0.1}>
                  <a className="ted-home-discover-card" data-index={index} href={href}>
                    <img
                      className="ted-home-discover-photo"
                      src={image}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      decoding="async"
                      draggable="false"
                      style={{ objectPosition: imagePosition }}
                    />
                    <span className="ted-home-discover-shade" aria-hidden="true" />
                    <div className="ted-home-discover-top">
                      <span>{index} / {label}</span><span className="ted-home-discover-icon">{React.createElement(Icon, { "aria-hidden": true })}</span>
                    </div>
                    <div className="ted-home-discover-content"><h3>{title}</h3><p>{description}</p></div>
                    <div className="ted-home-discover-bottom"><span>{action}</span><ArrowUpRight aria-hidden="true" /></div>
                  </a>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <div className="ted-home-reels" id="home-highlights">
          <SocialMedia />
        </div>

        <section className="ted-home-benefits ted-home-grid-surface" aria-labelledby="home-benefits-heading">
          <div className="ted-home-shell">
            <Reveal className="ted-home-benefits-head">
              <div>
                <span className="ted-home-kicker">BEYOND THE ROOM / THE EXPERIENCE</span>
                <h2 id="home-benefits-heading" className="ted-home-section-heading">Take home more than <em>a memory.</em></h2>
              </div>
              <p>The best part of an idea is what it makes possible next: a new question, a conversation, a connection or a first step.</p>
            </Reveal>
            <div className="ted-home-benefits-grid">
              {takeaways.map((item, index) => (
                <Reveal key={item.index} className="ted-home-benefit" delay={index * 0.08}>
                  <img
                    className="ted-home-benefit-photo"
                    src={item.image}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    decoding="async"
                    draggable="false"
                    style={{ objectPosition: item.imagePosition }}
                  />
                  <span className="ted-home-benefit-shade" aria-hidden="true" />
                  <span className="ted-home-benefit-index">{item.index}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <span className="ted-home-benefit-action">{item.action}<ArrowUpRight aria-hidden="true" /></span>
                  <a className="ted-home-benefit-hit" href={item.href} aria-label={item.title + ' ' + item.action} />
                </Reveal>
              ))}
            </div>
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
