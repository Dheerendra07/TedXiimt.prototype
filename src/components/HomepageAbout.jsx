import React from 'react';
import { motion as Motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Lightbulb, Users, Sparkles } from 'lucide-react';

const HomepageAbout = () => {
  const reduceMotion = useReducedMotion();

  return (
    <section id="about" className="tedx-about" aria-labelledby="tedx-about-title">
      <div className="tedx-about__inner">
        <Motion.div
          className="tedx-about__media"
          initial={reduceMotion ? false : { opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.65 }}
        >
          <img
            src="/ted-conference.webp"
            alt="A TED stage with a live speaker and audience"
            loading="lazy"
          />
          <div className="tedx-about__media-shade" />
          <div className="tedx-about__media-caption">
            <span>THE TEDx EXPERIENCE</span>
            <strong>Ideas that move people.</strong>
          </div>
          <span className="tedx-about__media-index">01 / 04</span>
        </Motion.div>

        <Motion.div
          className="tedx-about__copy"
          initial={reduceMotion ? false : { opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.65, delay: 0.08 }}
        >
          <div className="tedx-section-kicker">ABOUT TEDxIIMT</div>
          <h2 id="tedx-about-title">
            Ideas Worth <em>Spreading.</em>
          </h2>
          <p className="tedx-about__lead">
            A stage for fresh perspectives. A space for meaningful conversations. A community built around ideas that can make a difference.
          </p>
          <p className="tedx-about__body">
            TEDxIIMT University is an independently organised TEDx event at IIMT University, Meerut. We bring together curious minds, creative thinkers and changemakers to share ideas, challenge assumptions and inspire action.
          </p>

          <div className="tedx-about__pillars">
            <div>
              <Lightbulb aria-hidden="true" />
              <span>Ideas</span>
            </div>
            <div>
              <Users aria-hidden="true" />
              <span>Community</span>
            </div>
            <div>
              <Sparkles aria-hidden="true" />
              <span>Impact</span>
            </div>
          </div>

          <a href="/about" className="tedx-about__link">
            Explore our story <ArrowRight size={17} aria-hidden="true" />
          </a>
        </Motion.div>
      </div>
    </section>
  );
};

export default HomepageAbout;