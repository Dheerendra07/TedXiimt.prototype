import React from 'react';
import Hero from '../components/Hero';
import FeaturedSpeakers from '../components/FeaturedSpeakers';
import WhatIsTEDx from '../components/WhatIsTEDx';
import EventHighlights from '../components/EventHighlights';
import ValueProposition from '../components/ValueProposition';
import SocialMedia from '../components/SocialMedia';
import './HomePage.css';

const HomePage = () => (
  <div className="homepage-root min-h-screen text-white">
    <main id="main-content">
      <Hero />
      <FeaturedSpeakers />
      <WhatIsTEDx />
      <EventHighlights />
      <ValueProposition />
      <SocialMedia />
    </main>
  </div>
);

export default HomePage;
