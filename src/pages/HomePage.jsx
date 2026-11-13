import React from 'react';
import Hero from '../components/Hero';
import WhatIsTEDx from '../components/WhatIsTEDx';
import FeaturedSpeakers from '../components/FeaturedSpeakers';
import EventHighlights from '../components/EventHighlights';
import ValueProposition from '../components/ValueProposition';
import SocialMedia from '../components/SocialMedia';
import Partners from '../components/Partners';
import Blog from '../components/Blog';
import '../styles/homepage-editorial.css';

const HomePage = () => (
  <div className="tedx-home min-h-screen overflow-x-clip bg-black text-white">
    <main id="main-content">
      <Hero />
      <WhatIsTEDx />
      <FeaturedSpeakers />
      <EventHighlights />
      <ValueProposition />
      <SocialMedia />
      <Partners />
      <Blog />
    </main>
  </div>
);

export default HomePage;
