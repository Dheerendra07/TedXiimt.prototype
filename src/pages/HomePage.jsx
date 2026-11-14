import React from 'react';
import Hero from '../components/Hero';
import HomepageAbout from '../components/HomepageAbout';
import FeaturedSpeakers from '../components/FeaturedSpeakers';
import EventHighlights from '../components/EventHighlights';
import ValueProposition from '../components/ValueProposition';
import SocialMedia from '../components/SocialMedia';
import Partners from '../components/Partners';
import Blog from '../components/Blog';
import FloatingCTA from '../components/FloatingCTA';
import './HomepageIdentity.css';

const HomePage = () => {
  return (
    <div className="tedx-home min-h-screen overflow-x-clip bg-[#050506] text-white">
      <main id="main-content">
        <Hero />
        <HomepageAbout />
        <FeaturedSpeakers />
        <EventHighlights />
        <ValueProposition />
        <SocialMedia />
        <Partners />
        <Blog />
      </main>
      <FloatingCTA />
    </div>
  );
};

export default HomePage;