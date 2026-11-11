import React, { useRef, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { Pause, Play, Volume2 } from 'lucide-react';
import HomeSectionHeading from './HomeSectionHeading';
import './SocialMedia.css';

const reelVideos = [
  { src: '/1.mp4', poster: '/assets/highlight-01.webp', orientation: 'portrait' },
  { src: '/2.mp4', poster: '/assets/highlight-02.webp', orientation: 'portrait' },
  { src: '/3.mp4', poster: '/assets/highlight-03.webp', orientation: 'landscape' },
  { src: '/4.mp4', poster: '/assets/highlight-04.webp', orientation: 'landscape' },
];

const ReelCard = ({ reel, index, activeVideoRef }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlayback = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      try {
        if (activeVideoRef.current && activeVideoRef.current !== video) {
          activeVideoRef.current.pause();
        }
        await video.play();
        activeVideoRef.current = video;
      } catch (error) {
        console.warn('Unable to play TEDxIIMT highlight:', error);
      }
      return;
    }

    video.pause();
  };

  const handlePlay = () => {
    if (activeVideoRef.current && activeVideoRef.current !== videoRef.current) {
      activeVideoRef.current.pause();
    }
    activeVideoRef.current = videoRef.current;
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
    if (activeVideoRef.current === videoRef.current) {
      activeVideoRef.current = null;
    }
  };

  return (
    <Motion.article
      className={'home-reel home-reel--' + reel.orientation}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.55, delay: index * 0.08 }}
    >
      <div className="home-reel__frame">
        <video
          ref={videoRef}
          src={reel.src}
          poster={reel.poster}
          className="home-reel__video"
          playsInline
          loop
          preload="metadata"
          onPlay={handlePlay}
          onPause={handlePause}
          onEnded={handlePause}
          aria-label={'TEDxIIMT event highlight ' + (index + 1)}
        />

        {!isPlaying && (
          <button
            type="button"
            className="home-reel__play"
            onClick={togglePlayback}
            aria-label={'Play TEDxIIMT highlight ' + (index + 1)}
          >
            <span><Play size={20} fill="currentColor" aria-hidden="true" /></span>
            <small>PLAY HIGHLIGHT</small>
          </button>
        )}

        {isPlaying && (
          <button
            type="button"
            className="home-reel__pause"
            onClick={togglePlayback}
            aria-label={'Pause TEDxIIMT highlight ' + (index + 1)}
          >
            <Pause size={15} fill="currentColor" aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="home-reel__caption">
        <span>HIGHLIGHT / {String(index + 1).padStart(2, '0')}</span>
        <span><Volume2 size={13} aria-hidden="true" /> EVENT FILM</span>
      </div>
    </Motion.article>
  );
};

const SocialMedia = () => {
  const activeVideoRef = useRef(null);

  return (
    <section
      id="home-highlights"
      className="home-section home-section--social"
      aria-labelledby="home-highlights-title"
    >
      <div className="home-section__container">
        <HomeSectionHeading
          number="04"
          eyebrow="WATCH THE MOMENTS"
          title="Highlights"
          accent="from the room."
          description="A closer look at the speakers, stage and community moments from TEDxIIMT University."
          id="home-highlights-title"
        />

        <div className="home-reels-grid">
          {reelVideos.map((reel, index) => (
            <ReelCard
              key={reel.src}
              reel={reel}
              index={index}
              activeVideoRef={activeVideoRef}
            />
          ))}
        </div>

        <div className="home-section__bottom-note">
          <span>WATCH · LISTEN · REVISIT</span>
          <span>TEDxIIMT UNIVERSITY / HIGHLIGHTS</span>
        </div>
      </div>
    </section>
  );
};

export default SocialMedia;
