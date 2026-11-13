import React from 'react';
import Hero from '../components/Hero';
import FeaturedSpeakers from '../components/FeaturedSpeakers';
import WhatIsTEDx from '../components/WhatIsTEDx';
import ValueProposition from '../components/ValueProposition';
import EventHighlights from '../components/EventHighlights';
import SocialMedia from '../components/SocialMedia';
import Partners from '../components/Partners';
import Blog from '../components/Blog';
import FloatingCTA from '../components/FloatingCTA';
import '../styles/homepage-editorial.css';

const HomePage = () => (
  <div className="tedx-home min-h-screen overflow-x-clip bg-black text-white">
    <main id="main-content">
      <Hero />
      <WhatIsTEDx />
      <div className="tedx-home__featured"><FeaturedSpeakers /></div>
      <div className="tedx-home__discover"><EventHighlights /></div>
      <div className="tedx-home__value"><ValueProposition /></div>
      <div className="tedx-home__social"><SocialMedia /></div>
      <div className="tedx-home__partners"><Partners /></div>
      <div className="tedx-home__blog"><Blog /></div>
    </main>
    <FloatingCTA />
  </div>
);

export default HomePage;
