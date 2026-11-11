import React from 'react';
import { motion as Motion } from 'framer-motion';

const lineVariants = {
  hidden: { opacity: 0, y: '108%' },
  visible: { opacity: 1, y: 0 },
};

const HomeSectionHeading = ({
  number,
  eyebrow,
  title,
  accent,
  description,
  align = 'left',
  id,
}) => {
  const centered = align === 'center';

  return (
    <Motion.header
      className={'home-section__heading' + (centered ? ' home-section__heading--center' : '')}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.35 }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.12, delayChildren: 0.04 } },
      }}
    >
      <Motion.div className="home-section__eyebrow-row" variants={lineVariants}>
        {number && <span className="home-section__index">{number}</span>}
        <span className="home-section__eyebrow">{eyebrow}</span>
        <span className="home-section__eyebrow-rule" aria-hidden="true" />
      </Motion.div>

      <h2 id={id} className="home-section__title" aria-label={[title, accent].filter(Boolean).join(' ')}>
        <span className="home-section__title-line">
          <Motion.span variants={lineVariants}>{title}</Motion.span>
        </span>
        {accent && (
          <span className="home-section__title-line home-section__title-line--accent">
            <Motion.span variants={lineVariants}>{accent}</Motion.span>
          </span>
        )}
      </h2>

      {description && (
        <Motion.p className="home-section__description" variants={lineVariants}>
          {description}
        </Motion.p>
      )}
    </Motion.header>
  );
};

export default HomeSectionHeading;
