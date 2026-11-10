import React, { useRef, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { Play, Pause, Volume2 } from 'lucide-react';
import HomeSectionHeading from './HomeSectionHeading';
import './SocialMedia.css';

const reelVideos = ['/1.mp4', '/2.mp4', '/3.mp4', '/4.mp4'];

const ReelCard = ({ src, index, activeVideoRef, setActiveVideo }) => {
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
        setActiveVideo(video);
      } catch (error) {
        console.warn('Unable to play TEDxIIMT highlight:', error);
      }
      return;
    }

    video.pause();
    setIsPlaying(false);
    if (activeVideoRef.current === video) {
      activeVideoRef.current = null;
      setActiveVideo(null);
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
    setActiveVideo(videoRef.current);
  };

  const handlePause = () => {
    setIsPlaying(false);
    if (activeVideoRef.current === videoRef.current) {
      activeVideoRef.current = null;
      setActiveVideo(null);
    }
  };

  const handleKeyDown = (event) => {
    if ((event.key === 'Enter' || event.key === ' ') && isPlaying) {
      event.preventDefault();
      togglePlayback();
    }
  };

  return (
    <Motion.article
      className="home-reel"
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.55, delay: index * 0.08 }}
    >
      <div className="home-reel__frame">
        <video
          ref={videoRef}
          src={src}
          className="home-reel__video"
          playsInline
          loop
          preload="metadata"
          onPlay={handlePlay}
          onPause={handlePause}
          onEnded={handlePause}
          onClick={isPlaying ? togglePlayback : undefined}
          onKeyDown={handleKeyDown}
          tabIndex={isPlaying ? 0 : -1}
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
  const [, setActiveVideo] = useState(null);

  return (
    <section
      className="home-section home-section--social"
      aria-labelledby="home-highlights-title"
    >
      <div className="home-section__container">
        <HomeSectionHeading
          number="05"
          eyebrow="MOMENTS FROM THE ROOM"
          title="The energy"
          accent="lives on."
          description="A look back at the moments, voices and details that made the TEDxIIMT University experience."
          id="home-highlights-title"
        />

        <div className="home-reels-grid">
          {reelVideos.map((src, index) => (
            <ReelCard
              key={src}
              src={src}
              index={index}
              activeVideoRef={activeVideoRef}
              setActiveVideo={setActiveVideo}
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
