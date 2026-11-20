import React, { useEffect, useRef } from 'react';
import './PageScrollProgress.css';

const PageScrollProgress = () => {
  const progressRef = useRef(null);

  useEffect(() => {
    let animationFrame = 0;

    const updateProgress = () => {
      if (animationFrame) return;

      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = 0;

        const root = document.documentElement;
        const scrollableHeight = Math.max(root.scrollHeight - window.innerHeight, 1);
        const progress = Math.min(1, Math.max(0, window.scrollY / scrollableHeight));

        progressRef.current?.style.setProperty('--page-progress', String(progress));
      });
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <div className="ted-page-progress" aria-hidden="true">
      <span ref={progressRef} className="ted-page-progress__fill" />
    </div>
  );
};

export default PageScrollProgress;
