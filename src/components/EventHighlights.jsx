import React from 'react';
import { motion as Motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import HomeSectionHeading from './HomeSectionHeading';
import './EventHighlights.css';

const discoverCards = [
  {
    number: '01',
    title: 'Our Speakers',
    description: 'Meet the voices behind the ideas and revisit talks from the TEDxIIMT stage.',
    href: '/speakers',
    image: '/assets/Miriam.jpg',
    alt: 'Miriam Chandy Menacherry, TEDxIIMT University 2025 speaker',
    note: 'PEOPLE & PERSPECTIVES',
  },
  {
    number: '02',
    title: 'Our Team',
    description: 'Discover the people who bring the event together through care, craft and collaboration.',
    href: '/team',
    image: '/hero-bg.png',
    alt: 'TEDxIIMT University event artwork',
    note: 'THE PEOPLE BEHIND IT',
  },
  {
    number: '03',
    title: 'Partners',
    description: 'Explore the organizations and people who support a platform for ideas worth spreading.',
    href: '/partners',
    image: '/transparent-hero-bg.PNG',
    alt: 'TEDxIIMT University partner artwork',
    note: 'BUILT TOGETHER',
  },
];

const EventHighlights = () => (
  <section
    id="discover"
    className="home-section home-section--discover"
    aria-labelledby="home-discover-title"
  >
    <div className="home-section__container">
      <HomeSectionHeading
        number="05"
        eyebrow="EXPLORE TEDxIIMT"
        title="More than"
        accent="a stage."
        description="An event is made of people, ideas and the work that brings them into the same room. Explore the parts that make TEDxIIMT what it is."
        id="home-discover-title"
      />

      <div className="home-discover-grid">
        {discoverCards.map((card, index) => (
          <Motion.a
            key={card.number}
            href={card.href}
            className="home-discover-card"
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <div className="home-discover-card__image">
              <img src={card.image} alt={card.alt} loading="lazy" />
              <span>{card.number}</span>
              <div className="home-discover-card__image-shade" />
            </div>
            <div className="home-discover-card__copy">
              <div className="home-discover-card__meta">
                <span>{card.note}</span>
                <ArrowUpRight size={18} aria-hidden="true" />
              </div>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </div>
          </Motion.a>
        ))}
      </div>

      <div className="home-section__bottom-note">
        <span>PEOPLE MAKE THE PLATFORM</span>
        <span>EXPLORE / TEDxIIMT UNIVERSITY</span>
      </div>
    </div>
  </section>
);

export default EventHighlights;
