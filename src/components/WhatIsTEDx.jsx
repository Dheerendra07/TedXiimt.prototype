import React, { useRef } from 'react';
import { motion as Motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import './WhatIsTEDx.css';

const stories = [
  {
    number: '01',
    eyebrow: 'THE FORMAT',
    titleLines: ['Ideas worth', 'spreading.'],
    bodyLines: [
      'TEDx is a global initiative designed to bring the spirit of TED—Technology, Entertainment, Design—to local communities.',
      'Organized independently under a license from TED, these events spark meaningful conversations and inspire change.',
    ],
    linkLabel: 'Discover TEDx',
    link: '/about',
    visualLabel: 'A GLOBAL IDEA',
    visualLines: ['TED', 'TO THE', 'WORLD'],
    visualFoot: 'INDEPENDENTLY ORGANIZED · LOCALLY ROOTED',
  },
  {
    number: '02',
    eyebrow: 'THE SETTING',
    titleLines: ['A university', 'open to new ideas.'],
    bodyLines: [
      'IIMT University, Meerut is a vibrant centre of learning that brings together academic excellence, innovation, and a strong culture of community engagement.',
    ],
    linkLabel: 'Explore IIMT University',
    link: '/about',
    visualLabel: 'THE PLACE',
    visualLines: ['IIMT', 'UNIVERSITY'],
    visualFoot: 'MEERUT · UTTAR PRADESH',
  },
  {
    number: '03',
    eyebrow: 'THE CONVERSATION',
    titleLines: ['Break the', 'Flow.'],
    bodyLines: [
      'TEDxIIMT University creates a TED-like experience where bright minds meet, question familiar ideas, and share perspectives that can move a community forward.',
      'The 2025 edition explored the theme “Break the Flow”—challenging inertia and making room for new ways of thinking.',
    ],
    linkLabel: 'Explore the 2025 Edition',
    link: '/archive/2025',
    visualLabel: 'TEDxIIMT UNIVERSITY · 2025',
    visualLines: ['BREAK', 'THE', 'FLOW.'],
    visualFoot: 'CHALLENGE INERTIA · OPEN NEW PERSPECTIVES',
  },
];

const ScrollLine = ({ progress, text, start, className = '' }) => {
  const opacity = useTransform(progress, [start, start + 0.055], [0, 1], { clamp: true });
  const y = useTransform(progress, [start, start + 0.055], [22, 0], { clamp: true });

  return (
    <Motion.span className={className} style={{ opacity, y }}>
      {text}
    </Motion.span>
  );
};

const StoryFrame = ({ story, index, progress, reduceMotion }) => {
  const starts = [0, 0.335, 0.67];
  const start = starts[index];
  const end = index === 2 ? 1 : start + 0.36;
  const opacity = useTransform(
    progress,
    [start, start + 0.065, end - 0.035, end],
    index === 0 ? [1, 1, 1, 0] : index === 2 ? [0, 1, 1, 1] : [0, 1, 1, 0],
    { clamp: true },
  );
  const y = useTransform(progress, [start, start + 0.08], [34, 0], { clamp: true });
  const scale = useTransform(progress, [start, start + 0.08, end], [0.985, 1, 1], { clamp: true });
  const baseLine = start + 0.06;
  const linkOpacity = useTransform(
    progress,
    [baseLine + 0.19, baseLine + 0.25],
    [0, 1],
    { clamp: true },
  );
  const pointerEvents = useTransform(progress, (value) => (
    value >= start && value <= end ? 'auto' : 'none'
  ));

  return (
    <Motion.article
      className="home-story__frame"
      style={{
        opacity: reduceMotion ? 1 : opacity,
        y: reduceMotion ? 0 : y,
        scale: reduceMotion ? 1 : scale,
        zIndex: index + 1,
        pointerEvents: reduceMotion ? 'auto' : pointerEvents,
      }}
      aria-label={story.eyebrow}
    >
      <div className="home-story__copy">
        <div className="home-story__frame-meta">
          <span>{story.number} / 03</span>
          <span>{story.eyebrow}</span>
        </div>

        <h3 className="home-story__title">
          {story.titleLines.map((line, lineIndex) => (
            <ScrollLine
              key={line}
              progress={progress}
              text={line}
              start={reduceMotion ? -1 : baseLine + lineIndex * 0.035}
              className={lineIndex === story.titleLines.length - 1 ? 'home-story__title-accent' : ''}
            />
          ))}
        </h3>

        <div className="home-story__body">
          {story.bodyLines.map((line, lineIndex) => (
            <ScrollLine
              key={line}
              progress={progress}
              text={line}
              start={reduceMotion ? -1 : baseLine + 0.09 + lineIndex * 0.045}
              className="home-story__body-line"
            />
          ))}
        </div>

        <Motion.a
          href={story.link}
          className="home-link home-link--primary home-story__link"
          style={{ opacity: reduceMotion ? 1 : linkOpacity }}
        >
          {story.linkLabel}
          <span aria-hidden="true">→</span>
        </Motion.a>
      </div>

      <div className="home-story__visual" aria-hidden="true">
        <div className="home-story__visual-grid" />
        <div className="home-story__visual-top">
          <span>{story.visualLabel}</span>
          <span>TEDx / IIMT</span>
        </div>
        <div className="home-story__visual-wordmark">
          {story.visualLines.map((line, lineIndex) => (
            <span
              key={line}
              className={lineIndex === story.visualLines.length - 1 ? 'home-story__visual-highlight' : ''}
            >
              {line}
            </span>
          ))}
        </div>
        <div className="home-story__visual-bottom">
          <span className="home-story__visual-mark" />
          <span>{story.visualFoot}</span>
        </div>
        <span className="home-story__visual-index">{story.number}</span>
      </div>
    </Motion.article>
  );
};

const WhatIsTEDx = () => {
  const sectionRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });
  const progressScale = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <section
      ref={sectionRef}
      id="what-is-tedx"
      className="home-story"
      aria-label="About TEDx and TEDxIIMT University"
    >
      <div className="home-story__sticky">
        <div className="home-story__topline">
          <span>THE IDEA CONTINUES</span>
          <span>SCROLL TO FOLLOW THE STORY</span>
        </div>

        <div className="home-story__stage">
          {stories.map((story, index) => (
            <StoryFrame
              key={story.number}
              story={story}
              index={index}
              progress={scrollYProgress}
              reduceMotion={reduceMotion}
            />
          ))}
        </div>

        <div className="home-story__progress" aria-hidden="true">
          <Motion.span style={{ scaleX: progressScale }} />
        </div>
      </div>
    </section>
  );
};

export default WhatIsTEDx;
