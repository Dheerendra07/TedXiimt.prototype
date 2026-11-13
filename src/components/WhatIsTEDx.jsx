import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

const WhatIsTEDx = () => (
  <section id="about-tedx" className="tedx-about">
    <div className="tedx-about__inner">
      <motion.div
        className="tedx-about__copy"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: .65 }}
      >
        <div className="tedx-section-kicker"><span>01</span><i /> THE IDEA BEHIND THE X</div>
        <h2>Ideas that move a community <em>forward.</em></h2>
        <p className="tedx-about__lead">
          TEDx brings the spirit of TED to local communities — creating a place for ideas to be shared,
          questioned and carried into the world.
        </p>
        <p>
          TEDxIIMT University brings together curious minds, bold perspectives and ground-level innovators
          for a TED-like experience in Meerut. Our stage is a meeting point for ideas across technology,
          education, culture, entrepreneurship and social impact.
        </p>
        <p>
          Independently organised under a TEDx licence, the event is shaped around one belief:
          a single idea can change the way a person sees what is possible.
        </p>
        <a href="/about" className="tedx-text-link">
          Discover TEDxIIMT <ArrowUpRight size={17} aria-hidden="true" />
        </a>
      </motion.div>
      <motion.div
        className="tedx-about__visual"
        initial={{ opacity: 0, x: 26 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: .75 }}
      >
        <div className="tedx-about__image-frame">
          <img src="/ted-conference.webp" alt="A TED-style conference stage surrounded by an audience" loading="lazy" />
          <div className="tedx-about__image-shade" />
          <div className="tedx-about__image-caption">
            <span>IDEAS WORTH SPREADING</span>
            <strong>One stage. Many perspectives.</strong>
          </div>
        </div>
        <div className="tedx-about__side-note"><span>MEERUT, INDIA</span><i /></div>
      </motion.div>
    </div>
    <div className="tedx-about__principles" aria-label="TEDxIIMT values">
      <div><span>01 / LISTEN</span><strong>Make space for new perspectives.</strong></div>
      <div><span>02 / QUESTION</span><strong>Challenge the familiar.</strong></div>
      <div><span>03 / ACT</span><strong>Carry meaningful ideas forward.</strong></div>
    </div>
  </section>
);

export default WhatIsTEDx;
