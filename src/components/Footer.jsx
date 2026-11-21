import React from 'react';
import logo from './logo-white.png';
import './Footer.css';

const footerGroups = [
  {
    number: '01',
    title: 'Explore',
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
  return (
    <footer className="ted-site-footer">
      <div className="ted-footer-grid-overlay" aria-hidden="true" />
      <div className="ted-footer-shell">
        <section className="ted-footer-frame" aria-label="TEDxIIMT University">
          <div className="ted-footer-frame__image" aria-hidden="true" />
          <div className="ted-footer-frame__grid" aria-hidden="true" />
          <div className="ted-footer-frame__tiles" aria-hidden="true">
            <span className="ted-footer-tile ted-footer-tile--one" />
            <span className="ted-footer-tile ted-footer-tile--two" />
            <span className="ted-footer-tile ted-footer-tile--three" />
            <span className="ted-footer-tile ted-footer-tile--four" />
            <span className="ted-footer-tile ted-footer-tile--five" />
            <span className="ted-footer-tile ted-footer-tile--six" />
            <span className="ted-footer-tile ted-footer-tile--seven" />
          </div>

          <div className="ted-footer-frame__content">
            <p className="ted-footer-kicker">
              <span className="ted-footer-kicker__dot" />
              IIMT UNIVERSITY <span className="ted-footer-kicker__divider">/</span> MEERUT, INDIA
            </p>
            <h2 className="ted-footer-wordmark">
              <span className="ted-footer-wordmark__ted">TED</span><span className="ted-footer-wordmark__x">x</span><span className="ted-footer-wordmark__iimt">IIMT</span>
            </h2>
            <p className="ted-footer-tagline">Break the <em>Flow.</em></p>
            <div className="ted-footer-frame__bottom">
              <p>Ideas worth spreading. Voices worth hearing.</p>
              <a href="/about" className="ted-footer-discover-link">
                Discover TEDxIIMT <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>

          <p className="ted-footer-frame__edition" aria-hidden="true">
            <span>INDEPENDENTLY ORGANIZED</span>
            <span>IDEAS <b>·</b> PEOPLE <b>·</b> PERSPECTIVES</span>
          </p>
        </section>

        <div className="ted-footer-navigation-grid">
          <div className="ted-footer-brand-cell">
            <a
              href="/"
              className="ted-footer-logo-link"
              aria-label="TEDxIIMT University home"
            >
              <img src={logo} alt="TEDxIIMT University" className="ted-footer-logo" />
            </a>
            <p className="ted-footer-brand-copy">
              A platform for curious minds, courageous ideas and conversations
              that move perspectives forward.
            </p>
            <span className="ted-footer-brand-note">Locally rooted. Open to the world.</span>
          </div>

          {footerGroups.map((group) => (
            <nav
              className="ted-footer-column"
              aria-label={group.title}
              key={group.number}
            >
              <h3 className="ted-footer-column__heading">
                <span>{group.number}</span>
                {group.title}
              </h3>
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
