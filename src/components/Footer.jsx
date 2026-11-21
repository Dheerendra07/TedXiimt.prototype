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
      <div className="ted-footer-shell">
        <div className="ted-footer-artwork" aria-hidden="true">
          <div className="ted-footer-artwork__image" />
          <div className="ted-footer-artwork__shade" />
          <div className="ted-footer-artwork__grid" />
          <div className="ted-footer-artwork__tiles">
            <span className="ted-footer-tile ted-footer-tile--one" />
            <span className="ted-footer-tile ted-footer-tile--two" />
            <span className="ted-footer-tile ted-footer-tile--three" />
            <span className="ted-footer-tile ted-footer-tile--four" />
            <span className="ted-footer-tile ted-footer-tile--five" />
            <span className="ted-footer-tile ted-footer-tile--six" />
            <span className="ted-footer-tile ted-footer-tile--seven" />
            <span className="ted-footer-tile ted-footer-tile--eight" />
            <span className="ted-footer-tile ted-footer-tile--nine" />
            <span className="ted-footer-tile ted-footer-tile--ten" />
          </div>
        </div>

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
