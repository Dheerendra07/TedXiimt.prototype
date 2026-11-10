import React from 'react';
import { motion as Motion } from 'framer-motion';
import { ArrowUpRight, Play } from 'lucide-react';
import { SPEAKERS_2025 } from '../data/TEDx2025';
import HomeSectionHeading from './HomeSectionHeading';

const archivedSpeakers = SPEAKERS_2025.filter((speaker) => (
  typeof speaker.photo_url === 'string'
  && speaker.photo_url.startsWith('/assets/')
  && speaker.name
  && speaker.topic
));

const FeaturedSpeakers = () => (
  <section
    id="featured-speakers"
    className="home-section home-section--speakers"
    aria-labelledby="home-speakers-title"
  >
    <div className="home-section__container">
      <HomeSectionHeading
        number="02"
        eyebrow="THE 2025 EDITION · SPEAKER ARCHIVE"
        title="Voices that"
        accent="broke the flow."
        description="A selection of ideas shared on the TEDxIIMT University stage. Each talk is a different way to look at the world."
        id="home-speakers-title"
      />

      {archivedSpeakers.length > 0 ? (
        <div className="home-speakers__layout">
          <Motion.div
            className="home-speakers__feature"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.65 }}
          >
            <div className="home-speakers__feature-image">
              <img
                src={archivedSpeakers[0].photo_url}
                alt={archivedSpeakers[0].name}
                loading="lazy"
              />
              <span className="home-speakers__image-index">01 / 04</span>
            </div>
            <div className="home-speakers__feature-copy">
              <span className="home-speakers__label">FEATURED TALK · 2025</span>
              <h3>{archivedSpeakers[0].name}</h3>
              <p className="home-speakers__role">{archivedSpeakers[0].title}</p>
              <p className="home-speakers__topic">{archivedSpeakers[0].topic}</p>
              {archivedSpeakers[0].talk_video_url && (
                <a
                  className="home-link home-link--primary"
                  href={archivedSpeakers[0].talk_video_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Play size={14} fill="currentColor" aria-hidden="true" />
                  Watch the talk
                </a>
              )}
            </div>
          </Motion.div>

          <div className="home-speakers__list">
            {archivedSpeakers.slice(1).map((speaker, index) => (
              <Motion.a
                key={speaker.id}
                href={speaker.talk_video_url || '/archive/2025'}
                target={speaker.talk_video_url ? '_blank' : undefined}
                rel={speaker.talk_video_url ? 'noreferrer' : undefined}
                className="home-speakers__row"
                initial={{ opacity: 0, x: 22 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55, delay: index * 0.08 }}
              >
                <span className="home-speakers__row-index">
                  {String(index + 2).padStart(2, '0')}
                </span>
                <span className="home-speakers__portrait">
                  <img src={speaker.photo_url} alt="" loading="lazy" />
                </span>
                <span className="home-speakers__row-copy">
                  <strong>{speaker.name}</strong>
                  <small>{speaker.title}</small>
                  <em>{speaker.topic}</em>
                </span>
                <ArrowUpRight size={18} aria-hidden="true" className="home-speakers__row-arrow" />
              </Motion.a>
            ))}
            <a className="home-speakers__archive-link" href="/archive/2025">
              Explore the full 2025 edition
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
      ) : (
        <div className="home-speakers__empty">
          <span className="home-speakers__label">SPEAKER ARCHIVE</span>
          <p>Speaker stories will appear here when the edition records are published.</p>
          <a className="home-link" href="/library">Explore the archive <ArrowUpRight size={15} /></a>
        </div>
      )}

      <div className="home-section__bottom-note">
        <span>IDEAS · PEOPLE · PERSPECTIVES</span>
        <span>ARCHIVE / 2025</span>
      </div>
    </div>
  </section>
);

export default FeaturedSpeakers;
