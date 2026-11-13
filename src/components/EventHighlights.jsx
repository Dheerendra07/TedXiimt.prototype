import React from 'react';
import { motion as Motion } from 'framer-motion';
import { ArrowUpRight, Images, LibraryBig, UsersRound } from 'lucide-react';

const destinations = [
  {
    number: '01',
    title: 'The 2025 edition',
    description: 'Revisit the theme, event details and the ideas shared at Break the Flow.',
    href: '/library',
    label: 'EXPLORE THE ARCHIVE',
    Icon: LibraryBig,
  },
  {
    number: '02',
    title: 'The people',
    description: 'Meet the organisers and collaborators who brought the event together.',
    href: '/team',
    label: 'MEET THE TEAM',
    Icon: UsersRound,
  },
  {
    number: '03',
    title: 'The moments',
    description: 'Step back into the room through photographs from the event.',
    href: '/gallery',
    label: 'OPEN THE GALLERY',
    Icon: Images,
  },
];

const EventHighlights = () => (
  <section className="tedx-discover">
    <div className="tedx-section-heading">
      <div className="tedx-section-kicker"><span>LOOK CLOSER</span><i /> EXPLORE TEDxIIMT</div>
      <h2>Three ways to enter<br /><em>the story.</em></h2>
    </div>
    <div className="tedx-discover__grid">
      {destinations.map(({ number, title, description, href, label, Icon }, index) => (
        <Motion.a
          key={number}
          href={href}
          className="tedx-discover__card"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: .55, delay: index * .08 }}
          whileHover={{ y: -5 }}
        >
          <div className="tedx-discover__card-top">
            <span>{number}</span>
            {React.createElement(Icon, { size: 23, strokeWidth: 1.35, 'aria-hidden': true })}
          </div>
          <div className="tedx-discover__card-body">
            <h3>{title}</h3>
            <p>{description}</p>
          </div>
          <div className="tedx-discover__card-foot">
            <span>{label}</span><ArrowUpRight size={17} aria-hidden="true" />
          </div>
        </Motion.a>
      ))}
    </div>
  </section>
);

export default EventHighlights;
