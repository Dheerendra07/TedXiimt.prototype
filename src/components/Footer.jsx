import React, { useEffect, useRef, useState } from 'react';
import logo from './logo-white.png';
import './Footer.css';

const footerGroups = [
  {
    number: '01',
    title: 'Explore',
    description: 'Meet the people, purpose and ideas behind our community.',
    links: [
      { label: 'About TEDx & our mission', href: '/about' },
      { label: 'Speaker lineup', href: '/speakers' },
      { label: 'Organizing team', href: '/team' },
      { label: 'Multi-year archive', href: '/library' },
    ],
  },
  {
    number: '02',
    title: 'The experience',
    description: 'Everything you need to be part of the day.',
    links: [
      { label: 'Event schedule', href: '/schedule' },
      { label: 'Venue & directions', href: '/venue' },
      { label: 'Photo & video gallery', href: '/gallery' },
      { label: 'What to expect', href: '/what-to-expect' },
      { label: 'Frequently asked questions', href: '/faq' },
    ],
  },
  {
    number: '03',
    title: 'Get involved',
    description: 'Bring your voice, your idea or your support.',
    links: [
      { label: 'Register as an attendee', href: '/register' },
      { label: 'Apply to speak', href: '/speaker-apply' },
      { label: 'Partner with us', href: '/join-us/sponsor' },
      { label: 'Contact the team', href: '/contact' },
      { label: 'Code of conduct', href: '/code-of-conduct' },
    ],
  },
];

const FOOTER_MONUMENT_REGIONS = [
  {
    id: 'lotus',
    number: '01',
    name: 'LOTUS TEMPLE',
    bounds: { left: 0, top: 0.61, right: 0.275, bottom: 1 },
    palette: ['#D5E0E5', '#BCCACD', '#788B98'],
    highlight: '#EDF3F2',
    title: 'Ideas grow when we stay open.',
    message: 'A more meaningful conversation begins when different voices are welcomed — and allowed to challenge what we think we know.',
  },
  {
    id: 'qutub',
    number: '02',
    name: 'QUTUB MINAR',
    bounds: { left: 0.275, top: 0.29, right: 0.35, bottom: 1 },
    palette: ['#C27A52', '#A85C3C', '#623A2A'],
    highlight: '#FFD1A6',
    title: 'Build with patience. Leave with impact.',
    message: 'Lasting ideas are shaped layer by layer: by practice, persistence and the people who keep improving the work.',
  },
  {
    id: 'humayun',
    number: '03',
    name: 'HUMAYUN’S TOMB',
    bounds: { left: 0.35, top: 0.64, right: 0.48, bottom: 1 },
    palette: ['#D5D3C7', '#B87961', '#754B43'],
    highlight: '#F2DED0',
    title: 'A new perspective can reshape the old.',
    message: 'Progress does not erase what came before. It sees familiar stories differently and carries the most meaningful parts forward.',
  },
  {
    id: 'india-gate',
    number: '04',
    name: 'INDIA GATE',
    bounds: { left: 0.48, top: 0.42, right: 0.68, bottom: 1 },
    palette: ['#CFA17B', '#AA7452', '#674B3A'],
    highlight: '#F2C9A3',
    title: 'Make every contribution visible.',
    message: 'Big change is never a solo act. It is made possible by people whose ideas, effort and courage deserve to be heard.',
  },
  {
    id: 'akshardham',
    number: '05',
    name: 'AKSHARDHAM',
    bounds: { left: 0.68, top: 0.52, right: 1, bottom: 1 },
    palette: ['#D8B091', '#BD8468', '#764D3F'],
    highlight: '#F4D0AD',
    title: 'Let purpose guide the details.',
    message: 'An idea becomes meaningful when care, craft and conviction turn it into something people can experience.',
  },
];

const Footer = () => {
  const stageRef = useRef(null);
  const revealCanvasRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [flowStep, setFlowStep] = useState(0);
  const [hoveredMonument, setHoveredMonument] = useState(null);
  const [hoverCardPosition, setHoverCardPosition] = useState({ left: 24, top: 360 });

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return undefined;

    let intervalId = null;
    const startFlow = () => {
      setIsActive(true);
      if (intervalId === null) {
        intervalId = window.setInterval(() => {
          setFlowStep((current) => (current + 1) % 6);
        }, 8600);
      }
    };
    const stopFlow = () => {
      setIsActive(false);
      if (intervalId !== null) {
        window.clearInterval(intervalId);
        intervalId = null;
      }
    };

    if (typeof IntersectionObserver === 'undefined') {
      startFlow();
      return () => {
        if (intervalId !== null) window.clearInterval(intervalId);
      };
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) startFlow();
      else stopFlow();
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -5% 0px',
    });

    observer.observe(stage);
    return () => {
      observer.disconnect();
      if (intervalId !== null) window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = revealCanvasRef.current;
    const imageLayer = stage?.querySelector('.ted-footer-artwork__image');
    if (!stage || !canvas || !imageLayer) return undefined;

    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return undefined;

    const sourceArtwork = new Image();
    const backgroundArtwork = new Image();
    const colourCanvas = document.createElement('canvas');
    const colourContext = colourCanvas.getContext('2d', { willReadFrequently: true });
    if (!colourContext) return undefined;

    // A longer reveal gives the material colour time to bloom before it settles.
    const REVEAL_MS = 760;
    const HOLD_MS = 1580;
    const FADE_MS = 920;
    const SWEEP_MS = 1180;
    const HIDE_CARD_MS = 760;
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let coverTransform = null;
    let maskDimensions = null;
    let maskPixels = null;
    let maskLoaded = false;
    let backgroundLoaded = false;
    let activeRegionId = null;
    let animationFrame = 0;
    let hideCardTimer = null;
    let disposed = false;
    const activeReveals = new Map();

    const easeOutCubic = (value) => 1 - Math.pow(1 - value, 3);

    const updateImageTransform = () => {
      if (!maskDimensions) return;

      const stageRect = stage.getBoundingClientRect();
      const imageRect = imageLayer.getBoundingClientRect();
      // The art is width-fitted and bottom-aligned inside its own lower stage.
      // This is the same mapping used by the visible CSS background.
      const scale = imageRect.width / maskDimensions.width;
      const renderedWidth = maskDimensions.width * scale;
      const renderedHeight = maskDimensions.height * scale;
      coverTransform = {
        scale,
        offsetX: imageRect.left - stageRect.left + ((imageRect.width - renderedWidth) * 0.5),
        offsetY: imageRect.top - stageRect.top + imageRect.height - renderedHeight,
        renderedWidth,
        renderedHeight,
      };
    };

    const rebuildColourArtwork = () => {
      if (!maskLoaded || !backgroundLoaded || !coverTransform || !width || !height) return;

      colourCanvas.width = Math.max(1, Math.round(width * pixelRatio));
      colourCanvas.height = Math.max(1, Math.round(height * pixelRatio));
      colourContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      colourContext.clearRect(0, 0, width, height);

      colourContext.drawImage(
        backgroundArtwork,
        coverTransform.offsetX,
        coverTransform.offsetY,
        coverTransform.renderedWidth,
        coverTransform.renderedHeight
      );

      FOOTER_MONUMENT_REGIONS.forEach((region) => {
        const left = coverTransform.offsetX + (region.bounds.left * coverTransform.renderedWidth);
        const top = coverTransform.offsetY + (region.bounds.top * coverTransform.renderedHeight);
        const right = coverTransform.offsetX + (region.bounds.right * coverTransform.renderedWidth);
        const bottom = coverTransform.offsetY + (region.bounds.bottom * coverTransform.renderedHeight);

        colourContext.save();
        colourContext.beginPath();
        colourContext.rect(left, top, right - left, bottom - top);
        colourContext.clip();

        const materialGradient = colourContext.createLinearGradient(0, top, 0, bottom);
        region.palette.forEach((tone, index) => {
          materialGradient.addColorStop(index / (region.palette.length - 1), tone);
        });
        colourContext.globalCompositeOperation = 'color';
        colourContext.globalAlpha = 1;
        colourContext.fillStyle = materialGradient;
        colourContext.fillRect(left, top, right - left, bottom - top);

        const naturalLight = colourContext.createLinearGradient(0, top, 0, bottom);
        naturalLight.addColorStop(0, region.highlight);
        naturalLight.addColorStop(0.38, 'rgba(0, 0, 0, 0.08)');
        naturalLight.addColorStop(1, 'rgba(0, 0, 0, 0)');
        colourContext.globalCompositeOperation = 'screen';
        colourContext.globalAlpha = 0.34;
        colourContext.fillStyle = naturalLight;
        colourContext.fillRect(left, top, right - left, bottom - top);
        colourContext.restore();
      });

      // The transparent original is the silhouette mask; only the actual monument
      // pixels receive material colour. This never paints square or rectangular tiles.
      colourContext.globalAlpha = 1;
      colourContext.globalCompositeOperation = 'destination-in';
      colourContext.drawImage(
        sourceArtwork,
        coverTransform.offsetX,
        coverTransform.offsetY,
        coverTransform.renderedWidth,
        coverTransform.renderedHeight
      );
      colourContext.globalCompositeOperation = 'source-over';

      try {
        maskPixels = colourContext.getImageData(0, 0, colourCanvas.width, colourCanvas.height).data;
      } catch (error) {
        maskPixels = null;
        console.warn('[TEDx footer] Colour reveal hit testing unavailable.', error);
      }
    };

    const getRegionAtPoint = (localX, localY) => {
      if (!maskPixels || !coverTransform || !maskDimensions) return null;

      const sourceX = (localX - coverTransform.offsetX) / coverTransform.scale;
      const sourceY = (localY - coverTransform.offsetY) / coverTransform.scale;
      if (
        sourceX < 0 || sourceY < 0 ||
        sourceX >= maskDimensions.width || sourceY >= maskDimensions.height
      ) return null;

      const pixelX = Math.min(colourCanvas.width - 1, Math.max(0, Math.floor(localX * pixelRatio)));
      const pixelY = Math.min(colourCanvas.height - 1, Math.max(0, Math.floor(localY * pixelRatio)));
      const alphaIndex = ((pixelY * colourCanvas.width) + pixelX) * 4 + 3;
      if (maskPixels[alphaIndex] < 20) return null;

      const normalX = sourceX / maskDimensions.width;
      const normalY = sourceY / maskDimensions.height;
      return FOOTER_MONUMENT_REGIONS.find((region) => (
        normalX >= region.bounds.left && normalX <= region.bounds.right &&
        normalY >= region.bounds.top && normalY <= region.bounds.bottom
      )) || null;
    };

    const clampUnit = (value) => Math.min(1, Math.max(0, value));
    const easeOutQuint = (value) => 1 - Math.pow(1 - clampUnit(value), 5);
    const smoothStep = (value) => {
      const progress = clampUnit(value);
      return progress * progress * (3 - (2 * progress));
    };

    const drawReveal = (now) => {
      animationFrame = 0;
      context.clearRect(0, 0, width, height);
      let hasPendingReveal = false;

      activeReveals.forEach((state, regionId) => {
        const region = FOOTER_MONUMENT_REGIONS.find((item) => item.id === regionId);
        if (!region) {
          activeReveals.delete(regionId);
          return;
        }

        const elapsed = now - state.startedAt;
        const totalDuration = REVEAL_MS + HOLD_MS + FADE_MS;
        if (elapsed >= totalDuration) {
          activeReveals.delete(regionId);
          return;
        }

        const revealProgress = clampUnit(elapsed / REVEAL_MS);
        const settledOpacity = 0.96 * easeOutQuint(revealProgress);
        const fadeProgress = clampUnit((elapsed - REVEAL_MS - HOLD_MS) / FADE_MS);
        const fadeOpacity = elapsed <= REVEAL_MS + HOLD_MS
          ? 1
          : 1 - smoothStep(fadeProgress);
        const opacity = settledOpacity * fadeOpacity;

        const left = coverTransform.offsetX + (region.bounds.left * coverTransform.renderedWidth);
        const top = coverTransform.offsetY + (region.bounds.top * coverTransform.renderedHeight);
        const right = coverTransform.offsetX + (region.bounds.right * coverTransform.renderedWidth);
        const bottom = coverTransform.offsetY + (region.bounds.bottom * coverTransform.renderedHeight);
        const regionWidth = right - left;
        const regionHeight = bottom - top;
        const glowStrength = (1 - easeOutQuint(revealProgress)) * fadeOpacity;

        context.save();
        context.beginPath();
        context.rect(left, top, regionWidth, regionHeight);
        context.clip();

        // First pass: a soft, coloured bloom follows the original silhouette.
        context.globalAlpha = opacity * 0.42;
        context.shadowColor = region.highlight;
        context.shadowBlur = 10 + (22 * glowStrength);
        context.drawImage(colourCanvas, 0, 0, width, height);

        // Second pass: crisp material colour keeps the landmark's real detail intact.
        context.shadowBlur = 0;
        context.globalAlpha = opacity;
        context.drawImage(colourCanvas, 0, 0, width, height);

        // A diagonal specular sweep travels only across the already-masked monument.
        const sweepProgress = clampUnit((elapsed - 90) / SWEEP_MS);
        if (sweepProgress > 0 && sweepProgress < 1) {
          const beamWidth = Math.max(24, regionWidth * 0.3);
          const beamCenter = left - (regionWidth * 0.48) + (sweepProgress * regionWidth * 1.96);
          const highlightSweep = context.createLinearGradient(
            beamCenter - beamWidth,
            top,
            beamCenter + beamWidth,
            bottom
          );
          highlightSweep.addColorStop(0, 'rgba(255, 255, 255, 0)');
          highlightSweep.addColorStop(0.4, 'rgba(255, 255, 255, 0.035)');
          highlightSweep.addColorStop(0.5, 'rgba(255, 255, 255, 0.42)');
          highlightSweep.addColorStop(0.6, 'rgba(255, 255, 255, 0.035)');
          highlightSweep.addColorStop(1, 'rgba(255, 255, 255, 0)');

          context.globalCompositeOperation = 'source-atop';
          context.globalAlpha = (1 - (sweepProgress * 0.16)) * fadeOpacity;
          context.fillStyle = highlightSweep;
          context.fillRect(left, top, regionWidth, regionHeight);
        }

        context.restore();
        hasPendingReveal = true;
      });

      if (hasPendingReveal) {
        animationFrame = window.requestAnimationFrame(drawReveal);
      }
    };

    const requestRevealDraw = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(drawReveal);
    };

    const hideMessageSoon = () => {
      if (hideCardTimer !== null) window.clearTimeout(hideCardTimer);
      hideCardTimer = window.setTimeout(() => {
        hideCardTimer = null;
        setHoveredMonument(null);
      }, HIDE_CARD_MS);
    };

    const handlePointerMove = (event) => {
      if (event.pointerType === 'touch' || event.target.closest?.('a, button')) {
        if (activeRegionId !== null) {
          activeRegionId = null;
          hideMessageSoon();
        }
        return;
      }

      const bounds = stage.getBoundingClientRect();
      const localX = event.clientX - bounds.left;
      const localY = event.clientY - bounds.top;
      const region = getRegionAtPoint(localX, localY);

      if (!region) {
        if (activeRegionId !== null) {
          activeRegionId = null;
          hideMessageSoon();
        }
        return;
      }

      if (activeRegionId === region.id) return;

      activeRegionId = region.id;
      if (hideCardTimer !== null) {
        window.clearTimeout(hideCardTimer);
        hideCardTimer = null;
      }

      // Re-entering any monument always restarts its colour reveal, even when
      // the previous pass for that same monument has not finished fading.
      activeReveals.clear();
      activeReveals.set(region.id, { startedAt: performance.now() });
      requestRevealDraw();
      setHoveredMonument(region);

      const imageRect = imageLayer.getBoundingClientRect();
      const artTop = imageRect.top - bounds.top;
      const cardWidth = Math.min(356, Math.max(250, width - 36));
      const cardHeight = 174;
      const cardLeft = localX < width * 0.5
        ? Math.max(18, width - cardWidth - 22)
        : 22;
      const cardTop = Math.max(
        artTop + 16,
        Math.min(height - cardHeight - 18, localY - cardHeight - 28)
      );
      setHoverCardPosition({ left: cardLeft, top: cardTop });
    };

    const handlePointerLeave = () => {
      if (activeRegionId !== null) {
        activeRegionId = null;
        hideMessageSoon();
      }
    };

    const resizeCanvas = () => {
      if (disposed) return;
      const bounds = stage.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(width * pixelRatio));
      canvas.height = Math.max(1, Math.round(height * pixelRatio));
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      if (maskDimensions) {
        updateImageTransform();
        rebuildColourArtwork();
        activeReveals.clear();
        if (animationFrame) {
          window.cancelAnimationFrame(animationFrame);
          animationFrame = 0;
        }
        context.clearRect(0, 0, width, height);
      }
    };

    const initializeArtwork = () => {
      if (disposed || !maskLoaded || !backgroundLoaded) return;
      maskDimensions = {
        width: sourceArtwork.naturalWidth,
        height: sourceArtwork.naturalHeight,
      };
      if (!maskDimensions.width || !maskDimensions.height) return;
      resizeCanvas();
    };

    sourceArtwork.decoding = 'async';
    sourceArtwork.onload = () => {
      maskLoaded = true;
      initializeArtwork();
    };
    sourceArtwork.onerror = () => {
      maskPixels = null;
      console.warn('[TEDx footer] Transparent monument mask could not be loaded.');
    };

    backgroundArtwork.decoding = 'async';
    backgroundArtwork.onload = () => {
      backgroundLoaded = true;
      initializeArtwork();
    };
    backgroundArtwork.onerror = () => {
      maskPixels = null;
      console.warn('[TEDx footer] Original artwork could not be loaded for colour reveal.');
    };

    sourceArtwork.src = '/transparent-hero-bg.PNG';
    backgroundArtwork.src = '/hero-bg.png';

    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(resizeCanvas)
      : null;
    resizeObserver?.observe(stage);
    resizeObserver?.observe(imageLayer);
    window.addEventListener('resize', resizeCanvas, { passive: true });
    stage.addEventListener('pointermove', handlePointerMove, { passive: true });
    stage.addEventListener('pointerleave', handlePointerLeave, { passive: true });
    resizeCanvas();

    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      window.removeEventListener('resize', resizeCanvas);
      stage.removeEventListener('pointermove', handlePointerMove);
      stage.removeEventListener('pointerleave', handlePointerLeave);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      if (hideCardTimer !== null) window.clearTimeout(hideCardTimer);
      activeReveals.clear();
      context.clearRect(0, 0, width, height);
    };
  }, []);

  return (
    <footer className="ted-site-footer">
      <div className="ted-footer-shell">
        <section
          ref={stageRef}
          className={'ted-footer-stage' + (isActive ? ' is-active' : '')}
          aria-label="TEDxIIMT University footer"
        >
          <div className="ted-footer-artwork" aria-hidden="true">
            <div className="ted-footer-artwork__ambient" />
            <div className="ted-footer-artwork__image" />
            <div className="ted-footer-artwork__shade" />
            <canvas
              ref={revealCanvasRef}
              className="ted-footer-artwork__reveal"
              aria-hidden="true"
            />
            <div className="ted-footer-artwork__grid" />
            <div className={'ted-footer-flow ted-footer-flow--' + flowStep} />
          </div>

          <div className="ted-footer-content">
            <div className="ted-footer-brand">
              <p className="ted-footer-brand__eyebrow">Ideas worth sharing</p>
              <a
                href="/"
                className="ted-footer-logo-link"
                aria-label="TEDxIIMT University home"
              >
                <img src={logo} alt="TEDxIIMT University" className="ted-footer-logo" />
              </a>
              <p className="ted-footer-brand__copy">
                A platform for curious minds, courageous ideas and conversations
                that move perspectives forward.
              </p>
              <div className="ted-footer-brand__rule" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
            </div>

            <div className="ted-footer-groups">
              {footerGroups.map((group) => (
                <nav
                  className="ted-footer-group"
                  aria-label={group.title}
                  key={group.number}
                >
                  <div className="ted-footer-group__intro">
                    <p className="ted-footer-group__eyebrow">Section {group.number}</p>
                    <h2 className="ted-footer-group__title">{group.title}</h2>
                    <p className="ted-footer-group__description">{group.description}</p>
                  </div>
                  <ul className="ted-footer-link-list">
                    {group.links.map((link) => (
                      <li key={link.href}>
                        <a className="ted-footer-link" href={link.href}>
                          <span>{link.label}</span>
                          <span className="ted-footer-link__arrow" aria-hidden="true">↗</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
            </div>
          </div>

          {hoveredMonument && (
            <aside
              key={hoveredMonument.id}
              className="ted-footer-hover-card"
              style={{
                left: hoverCardPosition.left + 'px',
                top: hoverCardPosition.top + 'px',
              }}
              aria-live="polite"
              aria-label={'TEDxIIMT perspective for ' + hoveredMonument.name}
            >
              <div className="ted-footer-hover-card__topline">
                <span>TEDxIIMT PERSPECTIVE</span>
                <span>{hoveredMonument.number} / 05</span>
              </div>
              <p className="ted-footer-hover-card__place">{hoveredMonument.name}</p>
              <h3>{hoveredMonument.title}</h3>
              <p className="ted-footer-hover-card__message">{hoveredMonument.message}</p>
              <div className="ted-footer-hover-card__foot">
                <span className="ted-footer-hover-card__pulse" />
                AN IDEA TO TAKE WITH YOU
              </div>
            </aside>
          )}
        </section>

        <div className="ted-footer-legal">
          <p className="ted-footer-legal__disclaimer">
            This independent <strong>TEDx</strong> event is operated under license from{' '}
            <a href="https://www.ted.com/tedx" target="_blank" rel="noopener noreferrer">TED</a>.
            © {new Date().getFullYear()} TEDxIIMT University. All rights reserved.
          </p>
          <nav className="ted-footer-legal__links" aria-label="Legal links">
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
            <a href="https://www.ted.com" target="_blank" rel="noopener noreferrer">TED.com</a>
            <a href="#main-content" className="ted-footer-back-top">
              Back to top <span aria-hidden="true">↑</span>
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
