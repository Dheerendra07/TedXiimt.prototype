import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import Hero from '../components/Hero';
import WhatIsTEDx from '../components/WhatIsTEDx';
import FeaturedSpeakers from '../components/FeaturedSpeakers';
import EventHighlights from '../components/EventHighlights';
import ValueProposition from '../components/ValueProposition';
import SocialMedia from '../components/SocialMedia';
import Partners from '../components/Partners';
import Blog from '../components/Blog';
import FloatingCTA from '../components/FloatingCTA';
import './HomePage.css';
import './HomeDynamicSections.css';

const HomePage = () => (
  <div className="homepage-root min-h-screen text-white">
    <main id="main-content">
      <Hero />
      <WhatIsTEDx />
      <FeaturedSpeakers />
      <EventHighlights />
      <ValueProposition />
      <SocialMedia />
      <Partners />
      <Blog />

      <section className="home-finale" aria-labelledby="home-finale-title">
        <div className="home-section__container home-finale__inner">
          <div>
            <span className="home-section__eyebrow">THE CONVERSATION CONTINUES</span>
            <h2 id="home-finale-title" className="home-finale__title">
              The next idea
              <br />
              <em>starts with you.</em>
            </h2>
          </div>
          <div className="home-finale__actions">
            <a href="/library" className="home-link home-link--primary">
              Explore the archive
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
            <a href="/contact" className="home-link">
              Connect with us
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    </main>

    <FloatingCTA />
  </div>
);

export default HomePage;
