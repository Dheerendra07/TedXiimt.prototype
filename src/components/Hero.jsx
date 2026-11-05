import React, { useState, useEffect, useRef } from 'react';
import {motion, useReducedMotion } from 'framer-motion';
import api from '../services/api';

const Hero = () => {
  const prefersReducedMotion = useReducedMotion();
  const heroRef = useRef(null);
  const trailCanvasRef = useRef(null);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0 });
  const [editionData, setEditionData] = useState({
    theme: 'Break the Flow',
    date: '2025-11-11T09:00:00',
    attendee_capacity: 350,
    speaker_count: 10
  });

  useEffect(() => {
    let isMounted = true;
    const fetchActiveEdition = async () => {
      try {
        const data = await api.get('/api/editions/events/active/');
        if (isMounted && data) {
          setEditionData({
            theme: data.theme || 'Break the Flow',
            date: data.date ? `${data.date}T09:00:00` : '2025-11-11T09:00:00',
            attendee_capacity: data.attendee_capacity || 350,
            speaker_count: data.speaker_count || (Array.isArray(data.speakers) ? data.speakers.length : 10)
          });
        }
      } catch (err) {
        console.warn('Active edition fetch error:', err);
      }
    };

    fetchActiveEdition();
    return () => { isMounted = false; };
  }, []);


  // Pointer-led mosaic: a one-cell-wide path, patterned tiles, and protected copy.
  useEffect(() => {
    const section = heroRef.current;
    const canvas = trailCanvasRef.current;
    if (!section || !canvas || prefersReducedMotion) return;

    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return;

    // Match the existing 4rem CSS grid exactly. Every crossed grid cell is
    // activated once; there is no radial brush or multi-cell stamp.
    const CELL_SIZE = 64;
    const INSET = 2;
    const TILE_SIZE = CELL_SIZE - (INSET * 2);
    const REVEAL_MS = 105;
    const HOLD_MS = 210;
    const ERASE_MS = 430;
    const MAX_ACTIVE_CELLS = 900;

    // Four fixed mosaic motifs taken from the supplied SVG reference:
    // blue/white, lavender/violet, green/pink, and grey/violet.
    // Coordinates are normalized to the inside of one grid cell.
    const MOSAIC_TILES = [
      {
        background: '#178ffb',
        accent: '#fafafa',
        blocks: [
          [0.08, 0.08, 0.28, 0.28],
          [0.62, 0.08, 0.28, 0.28],
          [0.34, 0.62, 0.28, 0.28],
        ],
      },
      {
        background: '#ae85ff',
        accent: '#583af7',
        blocks: [
          [0.08, -0.08, 0.34, 0.34],
          [0.42, 0.28, 0.34, 0.34],
          [0.08, 0.64, 0.34, 0.34],
          [0.64, -0.08, 0.34, 0.34],
        ],
      },
      {
        background: '#08872b',
        accent: '#ff7ded',
        blocks: [
          [0.08, 0.64, 0.30, 0.30],
          [0.35, 0.35, 0.30, 0.30],
          [0.65, 0.06, 0.30, 0.30],
        ],
      },
      {
        background: '#d9d9d9',
        accent: '#583af7',
        blocks: [
          [0.34, -0.08, 0.32, 0.32],
          [0.06, 0.30, 0.32, 0.32],
          [0.62, 0.30, 0.32, 0.32],
          [0.34, 0.66, 0.32, 0.32],
        ],
      },
    ];

    // A fixed staggered layout creates a deliberate mosaic, not random
    // colour assignment. The same coordinates always produce the same tile.
    const MOSAIC_LAYOUT = [
      [0, 1, 2, 3, 0, 1, 2, 3],
      [1, 2, 3, 0, 1, 2, 3, 0],
      [2, 3, 0, 1, 2, 3, 0, 1],
      [3, 0, 1, 2, 3, 0, 1, 2],
    ];

    const cells = new Map();
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let animationFrame = 0;
    let previousCell = null;
    let protectedRects = [];

    const positiveMod = (value, divisor) => ((value % divisor) + divisor) % divisor;
    const easeOutCubic = (value) => 1 - Math.pow(1 - value, 3);
    const smoothStep = (value) => value * value * (3 - (2 * value));

    const refreshProtectedRects = () => {
      const bounds = section.getBoundingClientRect();
      protectedRects = Array.from(section.querySelectorAll('[data-mosaic-exclusion]'))
        .map((element) => {
          const rect = element.getBoundingClientRect();
          const padding = 12;
          return {
            left: rect.left - bounds.left - padding,
            top: rect.top - bounds.top - padding,
            right: rect.right - bounds.left + padding,
            bottom: rect.bottom - bounds.top + padding,
          };
        });
    };

    const cellIsProtected = (column, row) => {
      const left = (column * CELL_SIZE) + INSET;
      const top = (row * CELL_SIZE) + INSET;
      const right = left + TILE_SIZE;
      const bottom = top + TILE_SIZE;

      return protectedRects.some((rect) => (
        left < rect.right &&
        right > rect.left &&
        top < rect.bottom &&
        bottom > rect.top
      ));
    };

    const resizeCanvas = () => {
      const bounds = section.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.max(1, Math.round(width * pixelRatio));
      canvas.height = Math.max(1, Math.round(height * pixelRatio));
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      cells.clear();
      previousCell = null;
      refreshProtectedRects();
      context.clearRect(0, 0, width, height);
    };

    const activateCell = (column, row, enteredAt) => {
      if (
        column < 0 ||
        row < 0 ||
        (column * CELL_SIZE) >= width ||
        (row * CELL_SIZE) >= height ||
        cellIsProtected(column, row)
      ) {
        return;
      }

      const key = column + ':' + row;
      cells.delete(key);
      cells.set(key, { column, row, enteredAt });

      while (cells.size > MAX_ACTIVE_CELLS) {
        const oldestKey = cells.keys().next().value;
        cells.delete(oldestKey);
      }
    };

    // Integer grid traversal. It advances one cell at a time along the
    // pointer's actual segment and never paints a circular cluster.
    const traceGridLine = (from, to, startedAt, finishedAt) => {
      let x = from.column;
      let y = from.row;
      const targetX = to.column;
      const targetY = to.row;

      const deltaX = Math.abs(targetX - x);
      const deltaY = Math.abs(targetY - y);
      const stepX = x < targetX ? 1 : -1;
      const stepY = y < targetY ? 1 : -1;
      const longest = Math.max(deltaX, deltaY, 1);
      let error = deltaX - deltaY;
      let step = 0;

      activateCell(x, y, startedAt);

      while (x !== targetX || y !== targetY) {
        const doubledError = error * 2;

        if (doubledError > -deltaY) {
          error -= deltaY;
          x += stepX;
        }

        if (doubledError < deltaX) {
          error += deltaX;
          y += stepY;
        }

        step += 1;
        const progress = Math.min(1, step / longest);
        const enteredAt = startedAt + ((finishedAt - startedAt) * progress);
        activateCell(x, y, enteredAt);
      }
    };

    const drawMosaicTile = (cell, now) => {
      const age = now - cell.enteredAt;
      const totalLife = REVEAL_MS + HOLD_MS + ERASE_MS;
      if (age >= totalLife) return false;

      const revealProgress = easeOutCubic(Math.min(1, age / REVEAL_MS));
      const eraseProgress = age <= (REVEAL_MS + HOLD_MS)
        ? 1
        : 1 - smoothStep((age - REVEAL_MS - HOLD_MS) / ERASE_MS);

      const opacity = 0.94 * revealProgress * eraseProgress;
      const scale = 0.76 + (0.24 * revealProgress);
      const centerX = (cell.column * CELL_SIZE) + (CELL_SIZE / 2);
      const centerY = (cell.row * CELL_SIZE) + (CELL_SIZE / 2);
      const tileIndex = MOSAIC_LAYOUT[
        positiveMod(cell.row, MOSAIC_LAYOUT.length)
      ][positiveMod(cell.column, MOSAIC_LAYOUT[0].length)];
      const tile = MOSAIC_TILES[tileIndex];

      context.save();
      context.globalAlpha = opacity;
      context.translate(centerX, centerY);
      context.scale(scale, scale);
      context.translate(-centerX, -centerY);

      const left = (cell.column * CELL_SIZE) + INSET;
      const top = (cell.row * CELL_SIZE) + INSET;

      context.fillStyle = tile.background;
      context.fillRect(left, top, TILE_SIZE, TILE_SIZE);

      context.fillStyle = tile.accent;
      tile.blocks.forEach((block) => {
        context.fillRect(
          left + (block[0] * TILE_SIZE),
          top + (block[1] * TILE_SIZE),
          block[2] * TILE_SIZE,
          block[3] * TILE_SIZE
        );
      });

      context.restore();
      return true;
    };

    const draw = (now) => {
      context.clearRect(0, 0, width, height);

      for (const [key, cell] of cells) {
        if (!drawMosaicTile(cell, now)) {
          cells.delete(key);
        }
      }

      if (cells.size > 0) {
        animationFrame = window.requestAnimationFrame(draw);
      } else {
        animationFrame = 0;
      }
    };

    const requestDraw = () => {
      if (!animationFrame) {
        animationFrame = window.requestAnimationFrame(draw);
      }
    };

    const handlePointerMove = (event) => {
      if (event.pointerType === 'touch') return;

      const bounds = section.getBoundingClientRect();
      const localX = event.clientX - bounds.left;
      const localY = event.clientY - bounds.top;

      if (localX < 0 || localY < 0 || localX >= width || localY >= height) {
        previousCell = null;
        return;
      }

      refreshProtectedRects();

      const nextCell = {
        column: Math.floor(localX / CELL_SIZE),
        row: Math.floor(localY / CELL_SIZE),
      };
      const now = performance.now();

      if (!previousCell) {
        activateCell(nextCell.column, nextCell.row, now);
      } else if (
        nextCell.column !== previousCell.column ||
        nextCell.row !== previousCell.row
      ) {
        traceGridLine(previousCell, nextCell, previousCell.time, now);
      }

      previousCell = {
        column: nextCell.column,
        row: nextCell.row,
        time: now,
      };

      requestDraw();
    };

    const handlePointerLeave = () => {
      previousCell = null;
    };

    resizeCanvas();

    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => {
          resizeCanvas();
        })
      : null;

    resizeObserver?.observe(section);
    window.addEventListener('resize', resizeCanvas, { passive: true });
    section.addEventListener('pointermove', handlePointerMove, { passive: true });
    section.addEventListener('pointerleave', handlePointerLeave, { passive: true });

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', resizeCanvas);
      section.removeEventListener('pointermove', handlePointerMove);
      section.removeEventListener('pointerleave', handlePointerLeave);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      cells.clear();
      context.clearRect(0, 0, width, height);
    };
  }, [prefersReducedMotion]);

  // Event date countdown timer
  useEffect(() => {
    const eventDate = new Date(editionData.date);
    const updateCountdown = () => {
      const now = new Date();
      const difference = eventDate - now;

      if (difference > 0) {
        setCountdown({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60)
        });
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0 });
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 60000);
    return () => clearInterval(timer);
  }, [editionData.date]);

  // Animation variants optimized for performance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 20
      }
    }
  };

  // const fadeInVariants = {
  //   hidden: { opacity: 0 },
  //   visible: {
  //     opacity: 1,
  //     transition: { duration: 0.8 }
  //   }
  // };

  return (
    <section
      ref={heroRef}
      className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center overflow-hidden bg-[#242424] text-white"
      aria-label="Hero Section"
    >
{/* Background Image */}

<div
  className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
  style={{
    backgroundImage: "url('/transparent-hero-bg.PNG')",
    opacity: 1,
    filter: "brightness(1) contrast(1) saturate(1)",
  }}
  aria-hidden="true"
/>

{/* Very Light Bottom Gradient — For Text Readability */}
<div
  className="absolute inset-0 z-10 pointer-events-none"
  style={{
    background:
      "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.05) 55%, rgba(0,0,0,0.4) 100%)",
  }}
  aria-hidden="true"
/>
{/* Subtle Red Accent */}
<motion.div
  className="absolute inset-0 z-10 pointer-events-none"
  style={{
    background:
      "radial-gradient(circle at 50% 50%, rgba(235, 0, 40, 0.12), transparent 65%)",
  }}
  animate={
    prefersReducedMotion
      ? {}
      : { opacity: [0.2, 0.6, 0.2] }
  }
  transition={{
    duration: 8,
    repeat: Infinity,
    ease: "easeInOut",
  }}
  aria-hidden="true"
/>

{/* Subtle Grid Pattern */}
<div
  className="absolute inset-0 z-10 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"
  aria-hidden="true"
/>
<canvas
  ref={trailCanvasRef}
  className="absolute inset-0 z-10 pointer-events-none"
  aria-hidden="true"
/>

      {/* Content Container */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20 pt-20 pb-16 md:py-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-5xl mx-auto text-center"
        >
          {/* Eyebrow - Event Type */}
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 mb-4 md:mb-6"
            data-mosaic-exclusion
          >
            <div className="h-px w-8 bg-[#EB0028]" aria-hidden="true"></div>
            <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-gray-400">
              Independently Organized TED Event
            </span>
            <div className="h-px w-8 bg-[#EB0028]" aria-hidden="true"></div>
          </motion.div>

          {/* Main Title - Enhanced Typography */}
          <motion.h1
            variants={itemVariants}
            className="mb-6 md:mb-8"
            data-mosaic-exclusion
          >
            <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none">
              <span className="text-[#EB0028]">TED</span>
              <span className="text-[#EB0028] relative">
                x
                <span className="absolute -bottom-2 left-0 right-0 h-1 bg-[#EB0028]" aria-hidden="true"></span>
              </span>
            </span>
            <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mt-2 md:mt-4 tracking-wide">
              IIMT UNIVERSITY
            </span>
          </motion.h1>

          {/* Value Proposition - Enhanced Clarity */}
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto mb-8 md:mb-10 leading-relaxed font-light"
            data-mosaic-exclusion
          >
            <span className="text-white font-semibold">Theme: {editionData.theme}.</span>
            <br className="hidden sm:block" />
            <span className="block mt-2">
              Experience transformative talks, connect with innovators, and discover perspectives that challenge convention.
            </span>
          </motion.p>

          {/* Countdown Timer - Urgency Element */}
          {countdown.days > 0 && (
            <motion.div
              variants={itemVariants}
              className="mb-8 md:mb-12"
              data-mosaic-exclusion
            >
              <p className="text-xs md:text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">
                Event Starts In
              </p>
              <div className="flex justify-center gap-3 md:gap-6">
                {[
                  { value: countdown.days, label: 'Days' },
                  { value: countdown.hours, label: 'Hours' },
                  { value: countdown.minutes, label: 'Minutes' }
                ].map((item) => (
                  <div 
                    key={item.label}
                    className="bg-[#0a0a0a] border-2 border-[#1a1a1a] px-4 py-3 md:px-6 md:py-4 min-w-[70px] md:min-w-[90px]"
                  >
                    <div className="text-2xl md:text-4xl font-bold text-[#EB0028] tabular-nums">
                      {String(item.value).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-gray-500 mt-1">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Call-to-Action Buttons
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 md:mb-12"
          >
            <a
              href="/register"
              className="group relative w-full sm:w-auto bg-[#EB0028] hover:bg-[#ff1a3d] text-white font-bold px-8 md:px-12 py-4 md:py-5 text-base md:text-lg transition-all duration-300 overflow-hidden cursor-pointer"
              aria-label="Register for TEDxIIMT UNIVERSITY event"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Get Your Tickets
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" aria-hidden="true"></div>
            </a>

            <a
              href="/speakers"
              className="group w-full sm:w-auto bg-transparent border-2 border-white hover:border-[#EB0028] hover:bg-[#EB0028]/10 text-white font-bold px-8 md:px-12 py-4 md:py-5 text-base md:text-lg transition-all duration-300 cursor-pointer"
              aria-label="View TEDxIIMT UNIVERSITY speakers"
            >
              <span className="flex items-center justify-center gap-2">
                Meet Our Speakers
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </a>
          </motion.div> */}

          {/* Social Proof - Trust Signals
          <motion.div
            variants={fadeInVariants}
            className="flex flex-wrap justify-center items-center gap-4 md:gap-8 text-sm text-gray-400"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#EB0028]" aria-hidden="true"></div>
              <span className="font-semibold text-white">{editionData.attendee_capacity}+</span>
              <span>Delegates</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-gray-700" aria-hidden="true"></div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#EB0028]" aria-hidden="true"></div>
              <span className="font-semibold text-white">{editionData.speaker_count}+</span>
              <span>Visionary Speakers</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-gray-700" aria-hidden="true"></div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#EB0028]" aria-hidden="true"></div>
              <span className="font-semibold text-white">6 Hours</span>
              <span>of Inspiration</span>
            </div>
          </motion.div> */}
        </motion.div>

      
      </div>
    </section>
  );
};

export default Hero;
