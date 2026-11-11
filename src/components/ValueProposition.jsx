import React from 'react';
import { motion as Motion } from 'framer-motion';
import { ArrowRight, Compass, Lightbulb, Network, Rocket } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEdition } from '../context/EditionContext';
import HomeSectionHeading from './HomeSectionHeading';
import './ValueProposition.css';

const benefits = [
  {
    number: '01',
    Icon: Lightbulb,
    title: 'Expand your mind',
    description: 'Discover groundbreaking ideas from visionary speakers across diverse fields of innovation.',
    features: ['Technology', 'Science', 'Social impact'],
  },
  {
    number: '02',
    Icon: Network,
    title: 'Build connections',
    description: 'Meet curious people, emerging innovators and thought leaders who see the world differently.',
    features: ['Networking', 'Partnerships', 'Mentorship'],
  },
  {
    number: '03',
    Icon: Rocket,
    title: 'Fuel innovation',
    description: 'Take inspiration beyond the auditorium and turn new perspectives into meaningful action.',
    features: ['Workshops', 'Interactive sessions', 'Action plans'],
  },
  {
    number: '04',
    Icon: Compass,
    title: 'Join a wider movement',
    description: 'Become part of a global community that believes ideas can start conversations and create change.',
    features: ['Global network', 'Impact stories', 'Community'],
  },
];

const ValueProposition = () => {
  const { isAuthenticated } = useAuth();
  const { activeEdition } = useEdition();
  const hasUpcomingEdition = activeEdition?.is_active === true
    && (!activeEdition.date || new Date(activeEdition.date).getTime() >= Date.now());
  const actionHref = hasUpcomingEdition
    ? (isAuthenticated ? '/attendee-form' : '/register')
    : '/archive/2025';
  const actionLabel = hasUpcomingEdition ? 'Reserve your seat' : 'Explore the 2025 edition';

  return (
    <section
      className="home-section home-section--benefits"
      aria-labelledby="home-benefits-title"
    >
      <div className="home-section__container">
        <HomeSectionHeading
          number="05"
          eyebrow="WHY ATTEND TEDxIIMT UNIVERSITY?"
          title="Why attend"
          accent="TEDxIIMT University?"
          description="Because one idea, one conversation or one new connection can change the way you see what is possible."
          align="center"
          id="home-benefits-title"
        />

        <div className="home-benefits-grid">
          {benefits.map((benefit, index) => {
            const Icon = benefit.Icon;
            return (
              <Motion.article
                key={benefit.number}
                className="home-benefit"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55, delay: index * 0.09 }}
              >
                <div className="home-benefit__top">
                  <span>{benefit.number}</span>
                  <Icon size={21} strokeWidth={1.5} aria-hidden="true" />
                </div>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
                <div className="home-benefit__features">
                  {benefit.features.map((feature) => (
                    <span key={feature}>{feature}</span>
                  ))}
                </div>
              </Motion.article>
            );
          })}
        </div>

        <Motion.div
          className="home-benefits__cta"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <span className="home-section__eyebrow">TAKE THE NEXT STEP</span>
            <p>{hasUpcomingEdition
              ? 'Be part of the next room where ideas meet action.'
              : 'Revisit the ideas and people from the 2025 edition.'}
            </p>
          </div>
          <a className="home-link home-link--primary" href={actionHref}>
            {actionLabel}
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        </Motion.div>

        <div className="home-section__bottom-note">
          <span>LISTEN · QUESTION · CONNECT</span>
          <span>IDEAS WORTH SPREADING</span>
        </div>
      </div>
    </section>
  );
};

export default ValueProposition;
