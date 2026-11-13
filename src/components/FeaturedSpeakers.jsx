import React, { useState } from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowUpRight, PlayCircle } from 'lucide-react';
import { SPEAKERS_2025 } from '../data/TEDx2025';

const speakers = SPEAKERS_2025;
const wrap = (index) => (index + speakers.length) % speakers.length;

const FeaturedSpeakers = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = speakers[activeIndex];

  const select = (index) => setActiveIndex(wrap(index));

  if (!active) return null;

  return (
    <section id="featured-speakers" className="tedx-speakers">
      <div className="tedx-section-heading tedx-section-heading--split">
        <div>
          <div className="tedx-section-kicker"><span>FROM THE STAGE</span><i /> THE 2025 EDITION</div>
          <h2>Meet the voices<br /><em>behind the ideas.</em></h2>
        </div>
        <a href="/library" className="tedx-text-link">
          View the full edition <ArrowUpRight size={17} aria-hidden="true" />
        </a>
      </div>

      <div className="tedx-speakers__feature">
        <div className="tedx-speakers__portrait">
          <AnimatePresence mode="wait" initial={false}>
            <Motion.img
              key={active.id}
              src={active.photo_url}
              alt={active.name}
              loading="lazy"
              onError={(event) => { event.currentTarget.style.opacity = '0'; }}
              initial={{ opacity: 0, scale: 1.025 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: .99 }}
              transition={{ duration: .55, ease: [0.22, 1, 0.36, 1] }}
            />
          </AnimatePresence>
          <div className="tedx-speakers__portrait-shade" />
          <span className="tedx-speakers__edition-stamp">TEDxIIMT · 2025</span>
        </div>

        <div className="tedx-speakers__story">
          <AnimatePresence mode="wait" initial={false}>
            <Motion.div
              key={active.id}
              className="tedx-speakers__story-inner"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: .38 }}
            >
              <span className="tedx-speakers__index">SPEAKER  /  {String(activeIndex + 1).padStart(2, '0')}</span>
              <h3>{active.name}</h3>
              <p className="tedx-speakers__role">{active.title}{active.organization ? <><span> · </span>{active.organization}</> : null}</p>
              <div className="tedx-speakers__divider" />
              <p className="tedx-speakers__topic-label">THE IDEA</p>
              <p className="tedx-speakers__topic">{active.topic}</p>
              <p className="tedx-speakers__bio">{active.bio}</p>
              {active.talk_video_url && (
                <a className="tedx-speakers__watch" href={active.talk_video_url} target="_blank" rel="noreferrer">
                  <PlayCircle size={17} aria-hidden="true" /> Watch the talk <ArrowUpRight size={15} aria-hidden="true" />
                </a>
              )}
            </Motion.div>
          </AnimatePresence>

          <div className="tedx-speakers__controls">
            <div className="tedx-speakers__arrows">
              <button type="button" onClick={() => select(activeIndex - 1)} aria-label="Previous speaker"><ArrowLeft size={18} /></button>
              <button type="button" onClick={() => select(activeIndex + 1)} aria-label="Next speaker"><ArrowRight size={18} /></button>
            </div>
            <div className="tedx-speakers__dots" role="group" aria-label="Choose a speaker">
              {speakers.map((speaker, index) => (
                <button
                  type="button"
                  key={speaker.id}
                  className={index === activeIndex ? 'is-active' : ''}
                  onClick={() => select(index)}
                  aria-label={`Show ${speaker.name}`}
                  aria-pressed={index === activeIndex}
                />
              ))}
            </div>
            <span className="tedx-speakers__count">{String(activeIndex + 1).padStart(2, '0')} <i>/</i> {String(speakers.length).padStart(2, '0')}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedSpeakers;
