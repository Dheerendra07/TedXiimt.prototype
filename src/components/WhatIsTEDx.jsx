import React from 'react';
import { motion as Motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

const principles = [
  { number: '01', title: 'Listen closely', description: 'Make room for perspectives you may not have heard before.' },
  { number: '02', title: 'Question openly', description: 'Look beyond the familiar and ask what else could be possible.' },
  { number: '03', title: 'Carry it forward', description: 'Let a meaningful idea become part of the conversations that follow.' },
];

const WhatIsTEDx = () => (
  <section id="about-tedx" className="tedx-about">
    <div className="tedx-about__inner">
      <Motion.div
        className="tedx-about__copy"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-70px' }}
        transition={{ duration: .7 }}
      >
        <div className="tedx-section-kicker"><span>THE IDEA</span><i /> BEYOND THE RED DOT</div>
        <h2>One idea can change the way we <em>see everything.</em></h2>
        <p className="tedx-about__lead">
          TEDx is a local, independently organised event that brings people together to share ideas worth spreading.
        </p>
        <p>
          TEDxIIMT University brings that spirit to Meerut: a space for thoughtful talks, fresh perspectives and
          conversations that continue beyond the stage. The 2025 edition explored the theme <em>Break the Flow</em>.
        </p>
        <a href="/library" className="tedx-text-link">
          Explore the 2025 edition <ArrowUpRight size={17} aria-hidden="true" />
        </a>
      </Motion.div>

      <Motion.div
        className="tedx-about__manifesto"
        initial={{ opacity: 0, x: 25 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-70px' }}
        transition={{ duration: .75 }}
      >
        <div className="tedx-about__manifesto-mark" aria-hidden="true">“</div>
        <p className="tedx-about__manifesto-line">Ideas are only the beginning.</p>
        <div className="tedx-about__manifesto-rule" />
        <p className="tedx-about__manifesto-note">A stage for sharing. A community for listening. A spark for what comes next.</p>
        <span className="tedx-about__manifesto-signature">TEDxIIMT UNIVERSITY</span>
      </Motion.div>
    </div>

    <div className="tedx-about__principles">
      {principles.map((item, index) => (
        <Motion.div
          key={item.number}
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-35px' }}
          transition={{ duration: .5, delay: index * .08 }}
        >
          <span>{item.number}</span>
          <div><strong>{item.title}</strong><p>{item.description}</p></div>
        </Motion.div>
      ))}
    </div>
  </section>
);

export default WhatIsTEDx;
