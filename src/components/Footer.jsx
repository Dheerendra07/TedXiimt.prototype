import React, { useEffect, useRef, useState } from 'react';
import logo from './logo-white.png';
import './Footer.css';

const footerGroups = [
  {
    number: '01',
    title: 'Explore',
    description: 'Meet the people, purpose and ideas behind our community.',
    links: [
      { label: 'About TEDx & our mission', href: '/about' },
      { label: 'Speaker lineup', href: '/speakers' },
      { label: 'Organizing team', href: '/team' },
      { label: 'Multi-year archive', href: '/library' },
    ],
  },
  {
    number: '02',
    title: 'The experience',
    description: 'Everything you need to be part of the day.',
    links: [
      { label: 'Event schedule', href: '/schedule' },
      { label: 'Venue & directions', href: '/venue' },
      { label: 'Photo & video gallery', href: '/gallery' },
      { label: 'What to expect', href: '/what-to-expect' },
      { label: 'Frequently asked questions', href: '/faq' },
    ],
  },
  {
    number: '03',
    title: 'Get involved',
    description: 'Bring your voice, your idea or your support.',
    links: [
      { label: 'Register as an attendee', href: '/register' },
      { label: 'Apply to speak', href: '/speaker-apply' },
      { label: 'Partner with us', href: '/join-us/sponsor' },
      { label: 'Contact the team', href: '/contact' },
      { label: 'Code of conduct', href: '/code-of-conduct' },
    ],
  },
];

const Footer = () => {
  const stageRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [flowStep, setFlowStep] = useState(0);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return undefined;

    let intervalId = null;
    const startFlow = () => {
      setIsActive(true);
      if (intervalId === null) {
        intervalId = window.setInterval(() => {
          setFlowStep((current) => (current + 1) % 6);
        }, 8600);
      }
    };
    const stopFlow = () => {
      setIsActive(false);
      if (intervalId !== null) {
        window.clearInterval(intervalId);
        intervalId = null;
      }
    };

    if (typeof IntersectionObserver === 'undefined') {
      startFlow();
      return () => {
        if (intervalId !== null) window.clearInterval(intervalId);
      };
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) startFlow();
      else stopFlow();
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -5% 0px',
    });

    observer.observe(stage);
    return () => {
      observer.disconnect();
      if (intervalId !== null) window.clearInterval(intervalId);
    };
  }, []);

  return (
    <footer className="ted-site-footer">
      <div className="ted-footer-shell">
        <section
          ref={stageRef}
          className={'ted-footer-stage' + (isActive ? ' is-active' : '')}
          aria-label="TEDxIIMT University footer"
        >
          <div className="ted-footer-artwork" aria-hidden="true">
            <div className="ted-footer-artwork__ambient" />
            <div className="ted-footer-artwork__image" />
            <div className="ted-footer-artwork__shade" />
            <div className={'ted-footer-flow ted-footer-flow--' + flowStep} />
          </div>

          <div className="ted-footer-content">
            <div className="ted-footer-brand">
              <p className="ted-footer-brand__eyebrow">Ideas worth sharing</p>
              <a
                href="/"
                className="ted-footer-logo-link"
                aria-label="TEDxIIMT University home"
              >
                <img src={logo} alt="TEDxIIMT University" className="ted-footer-logo" />
              </a>
              <p className="ted-footer-brand__copy">
                A platform for curious minds, courageous ideas and conversations
                that move perspectives forward.
              </p>
              <div className="ted-footer-brand__rule" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
            </div>

            <div className="ted-footer-groups">
              {footerGroups.map((group) => (
                <nav
                  className="ted-footer-group"
                  aria-label={group.title}
                  key={group.number}
                >
                  <div className="ted-footer-group__intro">
                    <p className="ted-footer-group__eyebrow">Section {group.number}</p>
                    <h2 className="ted-footer-group__title">{group.title}</h2>
                    <p className="ted-footer-group__description">{group.description}</p>
                  </div>
                  <ul className="ted-footer-link-list">
                    {group.links.map((link) => (
                      <li key={link.href}>
                        <a className="ted-footer-link" href={link.href}>
                          <span>{link.label}</span>
                          <span className="ted-footer-link__arrow" aria-hidden="true">↗</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
            </div>
          </div>
        </section>

        <div className="ted-footer-legal">
          <p className="ted-footer-legal__disclaimer">
            This independent <strong>TEDx</strong> event is operated under license from{' '}
            <a href="https://www.ted.com/tedx" target="_blank" rel="noopener noreferrer">TED</a>.
            © {new Date().getFullYear()} TEDxIIMT University. All rights reserved.
          </p>
          <nav className="ted-footer-legal__links" aria-label="Legal links">
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
            <a href="https://www.ted.com" target="_blank" rel="noopener noreferrer">TED.com</a>
            <a href="#main-content" className="ted-footer-back-top">
              Back to top <span aria-hidden="true">↑</span>
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
