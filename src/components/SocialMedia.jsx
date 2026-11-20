import React, { useEffect, useRef, useState } from 'react';
import { motion as Motion, useReducedMotion } from 'framer-motion';
import { Pause, Play, Volume2, VolumeX } from 'lucide-react';

const reelVideos = ['/1.mp4', '/2.mp4', '/3.mp4', '/4.mp4'];

const formatDuration = (value) => {
  if (!Number.isFinite(value) || value <= 0) return 'SHORT FILM';

  const totalSeconds = Math.floor(value);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, '0');

  return minutes + ':' + seconds;
};

const ReelCard = ({ src, index, onPlaybackStart, onPlaybackStop }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const reelNumber = String(index + 1).padStart(2, '0');

  const handleMetadata = () => {
    const video = videoRef.current;
    if (!video) return;

    if (Number.isFinite(video.duration)) {
      setDuration(video.duration);
    }

    if (video.readyState >= 2) {
      setIsReady(true);
    }
  };

  const handlePlay = () => {
    const video = videoRef.current;
    setIsReady(true);
    setIsPlaying(true);
    onPlaybackStart(video);
  };

  const handlePause = () => {
    setIsPlaying(false);
    onPlaybackStop(videoRef.current);
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return;

    setProgress(Math.min(100, (video.currentTime / video.duration) * 100));
  };

  const handleError = () => {
    setHasError(true);
    setIsReady(false);
    setIsPlaying(false);
    onPlaybackStop(videoRef.current);
  };

  const togglePlayback = async () => {
    const video = videoRef.current;
    if (!video || hasError) return;

    if (video.paused) {
      onPlaybackStart(video);

      try {
        await video.play();
      } catch {
        setIsPlaying(false);
        onPlaybackStop(video);
      }
      return;
    }

    video.pause();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video || hasError) return;

    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  return (
    <Motion.article
      initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={shouldReduceMotion ? { duration: 0 } : {
        duration: 0.65,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="ted-reel-card"
      data-playing={isPlaying ? 'true' : 'false'}
    >
      <div
        className="ted-reel-media"
        data-ready={isReady ? 'true' : 'false'}
        data-playing={isPlaying ? 'true' : 'false'}
        data-error={hasError ? 'true' : 'false'}
      >
        <div className="ted-reel-poster-fallback" aria-hidden="true">
          <span className="ted-reel-poster-mark">TED<span>x</span></span>
          <span className="ted-reel-poster-number">{reelNumber}</span>
          <span className="ted-reel-poster-caption">IIMT UNIVERSITY / MEERUT</span>
        </div>

        <video
          ref={videoRef}
          src={src}
          className="ted-reel-video"
          playsInline
          loop
          preload="metadata"
          onLoadedMetadata={handleMetadata}
          onLoadedData={() => setIsReady(true)}
          onDurationChange={handleMetadata}
          onTimeUpdate={handleTimeUpdate}
          onPlay={handlePlay}
          onPause={handlePause}
          onError={handleError}
          aria-hidden="true"
        />

        <span className="ted-reel-shade" aria-hidden="true" />

        <div className="ted-reel-topline">
          <span className="ted-reel-index">{reelNumber}<span> / 04</span></span>
          <span className="ted-reel-duration">{formatDuration(duration)}</span>
        </div>

        {hasError ? (
          <div className="ted-reel-error" role="status">
            <span>THIS FILM IS UNAVAILABLE</span>
            <p>The video could not be loaded in this browser.</p>
          </div>
        ) : (
          <button
            type="button"
            className="ted-reel-toggle"
            onClick={togglePlayback}
            aria-label={(isPlaying ? 'Pause' : 'Play') + ' reel ' + reelNumber}
            aria-pressed={isPlaying}
          >
            <span className="ted-reel-toggle-icon">
              {isPlaying ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
            </span>
            <span className="ted-reel-toggle-label">{isPlaying ? 'PAUSE' : 'PLAY MOMENT'}</span>
          </button>
        )}

        {!isReady && !hasError && (
          <div className="ted-reel-loading" aria-live="polite">
            <span className="ted-reel-loading-dot" />
            <span>PREPARING FILM</span>
          </div>
        )}

        <div className="ted-reel-footer">
          <div className="ted-reel-footer-copy">
            <span>TEDxIIMT UNIVERSITY</span>
            <strong>HIGHLIGHT / {reelNumber}</strong>
          </div>
          <button
            type="button"
            className="ted-reel-sound-toggle"
            onClick={toggleMute}
            disabled={hasError}
            aria-label={(isMuted ? 'Turn sound on for reel ' : 'Mute reel ') + reelNumber}
          >
            {isMuted ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
          </button>
        </div>

        <div
          className="ted-reel-progress"
          role="progressbar"
          aria-label={'Reel ' + reelNumber + ' playback progress'}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={Math.round(progress)}
        >
          <span style={{ width: progress + '%' }} />
        </div>
      </div>
      <h3 className="ted-reel-card-title">TEDxIIMT reel {reelNumber}</h3>
    </Motion.article>
  );
};

const SocialMedia = () => {
  const sectionRef = useRef(null);
  const activeVideoRef = useRef(null);

  const stopActiveVideo = () => {
    const activeVideo = activeVideoRef.current;
    if (activeVideo) {
      activeVideo.pause();
      activeVideoRef.current = null;
    }
  };

  const handlePlaybackStart = (video) => {
    if (!video) return;

    if (activeVideoRef.current && activeVideoRef.current !== video) {
      activeVideoRef.current.pause();
    }

    activeVideoRef.current = video;
  };

  const handlePlaybackStop = (video) => {
    if (activeVideoRef.current === video) {
      activeVideoRef.current = null;
    }
  };

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const handleVisibilityChange = () => {
      if (document.hidden) stopActiveVideo();
    };

    let observer;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver((entries) => {
        if (entries[0] && !entries[0].isIntersecting) {
          stopActiveVideo();
        }
      }, { threshold: 0.08 });

      observer.observe(section);
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (observer) observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopActiveVideo();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="ted-reels-section"
      aria-labelledby="social-media-heading"
    >
      <div className="ted-reels-shell">
        <div className="ted-reels-heading">
          <div className="ted-reels-heading-main">
            <span className="ted-reels-kicker">THE MOMENTS / TEDxIIMT UNIVERSITY</span>
            <h2 id="social-media-heading">THE EVENT,<br /><em>IN MOTION.</em></h2>
          </div>

          <div className="ted-reels-heading-aside">
            <p>Four short clips from TEDxIIMT University. Press play to revisit the experience.</p>
            <span className="ted-reels-collection-count">04 FILMS <i /> TAP TO PLAY</span>
          </div>
        </div>

        <div className="ted-reels-grid">
          {reelVideos.map((src, index) => (
            <ReelCard
              key={src}
              src={src}
              index={index}
              onPlaybackStart={handlePlaybackStart}
              onPlaybackStop={handlePlaybackStop}
            />
          ))}
        </div>

        <div className="ted-reels-footnote">
          <span>TEDxIIMT UNIVERSITY</span>
          <span>IDEAS WORTH SPREADING</span>
        </div>
      </div>
    </section>
  );
};

export default SocialMedia;
