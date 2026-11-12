import React from 'react';
import { motion as Motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const discoverCards = [
  {
    title: 'Our Speakers',
    description: 'Meet the voices bringing new perspectives and ideas to the TEDxIIMT stage.',
    href: '/speakers',
    image: '/assets/Aditya_Yadav.jpeg',
    alt: 'TEDxIIMT featured speaker',
    index: '01',
  },
  {
    title: 'The TEDx Experience',
    description: 'Explore the talks, moments and stories that stay with you long after the event.',
    href: '/gallery',
    image: '/ted-conference.webp',
    alt: 'A TED stage and audience',
    index: '02',
  },
  {
    title: 'IIMT Campus',
    description: 'Discover the university community and the setting behind TEDxIIMT University.',
    href: '/venue',
    image: '/tedx-x-campus-hero.webp',
    alt: 'IIMT campus framed by an architectural X',
    index: '03',
  },
];

const EventHighlights = () => {
  return (
    <section className="tedx-discover relative bg-black py-24 text-white md:py-32" aria-labelledby="discover-heading">
      <div className="container mx-auto px-5 sm:px-8 lg:px-12">
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="tedx-discover__heading mb-14 w-full text-center md:mb-16"
        >
          <span className="tedx-section-kicker">EXPLORE TEDxIIMT</span>
          <h2 id="discover-heading" className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            One stage. <span>Many perspectives.</span>
          </h2>
          <p>Meet the people, experience the moments and discover the place behind the ideas.</p>
        </Motion.div>

        <div className="tedx-discover__grid grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {discoverCards.map((card, index) => (
            <Motion.div
              key={card.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="h-full"
            >
              <a href={card.href} className="tedx-discover__card group relative block h-full min-h-[380px] overflow-hidden outline-none">
                <img
                  src={card.image}
                  alt={card.alt}
                  loading="lazy"
                  className="tedx-discover__image absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.045]"
                />
                <div className="tedx-discover__shade absolute inset-0" aria-hidden="true" />
                <div className="tedx-discover__card-content absolute inset-x-0 bottom-0 p-6 md:p-7">
                  <span className="tedx-discover__index">{card.index} / 03</span>
                  <div className="tedx-discover__rule" />
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                  <span className="tedx-discover__action">
                    Explore <ArrowRight size={16} aria-hidden="true" />
                  </span>
                </div>
              </a>
            </Motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventHighlights;