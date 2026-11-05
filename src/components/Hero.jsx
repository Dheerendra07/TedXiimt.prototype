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


  // Monochrome pointer trail, clipped to verified transparent artwork space.
  useEffect(() => {
    const section = heroRef.current;
    const canvas = trailCanvasRef.current;
    const imageLayer = section?.querySelector('[data-mosaic-surface]');
    if (!section || !canvas || !imageLayer || prefersReducedMotion) return;

    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return;

    const CELL_SIZE = 64;
    const CELL_INSET = 8;
    const TILE_SIZE = CELL_SIZE - (CELL_INSET * 2);
    const IMAGE_SAFETY_GAP = 3;
    const REVEAL_MS = 90;
    const HOLD_MS = 140;
    const ERASE_MS = 540;
    const MAX_ACTIVE_CELLS = 54;
    const MAX_INTERPOLATED_CELLS = 14;
    const MONOCHROME = '#e4e4e7';

    // Eight restrained monochrome motifs. No coloured tile backgrounds or
    // full-cell fills; every cell is a small, intentional pixel composition.
    const CELL_MOTIFS = [
      [[5,5,8,8,.62],[18,6,15,1.5,.26],[5,19,1.5,15,.24],[19,19,8,8,.42],[32,32,9,9,.46]],
      [[5,5,18,1.5,.26],[5,5,1.5,18,.26],[27,5,9,9,.48],[18,19,18,1.5,.25],[18,27,9,9,.38]],
      [[5,5,8,8,.45],[18,5,8,8,.24],[31,5,8,8,.45],[5,19,1.5,18,.24],[18,19,22,1.5,.30],[31,31,8,8,.42]],
      [[5,5,1.5,22,.28],[5,5,22,1.5,.28],[19,19,8,8,.50],[32,19,8,1.5,.26],[32,19,1.5,15,.26],[19,32,8,8,.34]],
      [[5,5,8,8,.44],[18,5,22,1.5,.24],[18,18,8,8,.38],[31,18,9,9,.44],[5,31,22,1.5,.24],[5,31,8,8,.36]],
      [[5,5,8,22,.30],[18,5,22,1.5,.25],[18,18,8,8,.48],[31,18,9,1.5,.25],[31,25,1.5,14,.25],[18,32,8,8,.40]],
      [[5,5,8,8,.46],[18,5,8,1.5,.25],[31,5,8,8,.40],[5,19,22,1.5,.26],[18,26,8,8,.40],[31,31,8,8,.46]],
      [[5,5,1.5,15,.26],[5,5,15,1.5,.26],[18,18,8,8,.48],[31,18,8,1.5,.24],[31,18,1.5,15,.24],[18,32,22,1.5,.24]],
    ];

    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let animationFrame = 0;
    let previousCell = null;
    let artworkMask = null;
    let coverTransform = null;
    let disposed = false;
    const cells = new Map();

    const mod = (value, divisor) => ((value % divisor) + divisor) % divisor;
    const easeOutCubic = (value) => 1 - Math.pow(1 - value, 3);
    const smoothStep = (value) => value * value * (3 - (2 * value));

    const buildArtworkMask = (image) => {
      const maskWidth = image.naturalWidth;
      const maskHeight = image.naturalHeight;
      if (!maskWidth || !maskHeight) return null;

      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = maskWidth;
      maskCanvas.height = maskHeight;
      const maskContext = maskCanvas.getContext('2d', { willReadFrequently: true });
      if (!maskContext) return null;

      maskContext.drawImage(image, 0, 0);
      const pixels = maskContext.getImageData(0, 0, maskWidth, maskHeight).data;
      const stride = maskWidth + 1;
      const integral = new Uint32Array(stride * (maskHeight + 1));

      // A summed-area table makes artwork checks exact and constant-time.
      for (let y = 1; y <= maskHeight; y += 1) {
        let rowCount = 0;
        const sourceRow = (y - 1) * maskWidth;
        const currentRow = y * stride;
        const previousRow = (y - 1) * stride;

        for (let x = 1; x <= maskWidth; x += 1) {
          if (pixels[((sourceRow + x - 1) * 4) + 3] > 0) rowCount += 1;
          integral[currentRow + x] = integral[previousRow + x] + rowCount;
        }
      }

      maskCanvas.width = 1;
      maskCanvas.height = 1;
      return { width: maskWidth, height: maskHeight, stride, integral };
    };

    const updateCoverTransform = () => {
      if (!artworkMask) {
        coverTransform = null;
        return;
      }

      const sectionRect = section.getBoundingClientRect();
      const imageRect = imageLayer.getBoundingClientRect();
      const scale = Math.max(
        imageRect.width / artworkMask.width,
        imageRect.height / artworkMask.height
      );

      coverTransform = {
        scale,
        offsetX: (imageRect.left - sectionRect.left)
          + ((imageRect.width - (artworkMask.width * scale)) / 2),
        offsetY: (imageRect.top - sectionRect.top)
          + ((imageRect.height - (artworkMask.height * scale)) / 2),
      };
    };

    const regionContainsArtwork = (left, top, right, bottom) => {
      if (!artworkMask || !coverTransform) return true;

      const { scale, offsetX, offsetY } = coverTransform;
      if (!Number.isFinite(scale) || scale <= 0) return true;

      const sourceLeft = (left - offsetX) / scale;
      const sourceTop = (top - offsetY) / scale;
      const sourceRight = (right - offsetX) / scale;
      const sourceBottom = (bottom - offsetY) / scale;

      // Fail closed if any part cannot be mapped to the source image.
      if (
        sourceLeft < 0 || sourceTop < 0 ||
        sourceRight > artworkMask.width ||
        sourceBottom > artworkMask.height
      ) return true;

      const x0 = Math.max(0, Math.floor(sourceLeft));
      const y0 = Math.max(0, Math.floor(sourceTop));
      const x1 = Math.min(artworkMask.width, Math.ceil(sourceRight));
      const y1 = Math.min(artworkMask.height, Math.ceil(sourceBottom));
      if (x0 >= x1 || y0 >= y1) return true;

      const { integral, stride } = artworkMask;
      const count = (
        integral[(y1 * stride) + x1]
        - integral[(y0 * stride) + x1]
        - integral[(y1 * stride) + x0]
        + integral[(y0 * stride) + x0]
      );
      return count > 0;
    };

    const cellIsSafe = (column, row) => {
      const left = (column * CELL_SIZE) + CELL_INSET;
      const top = (row * CELL_SIZE) + CELL_INSET;
      const right = left + TILE_SIZE;
      const bottom = top + TILE_SIZE;

      if (left < 0 || top < 0 || right > width || bottom > height) return false;

      return !regionContainsArtwork(
        left - IMAGE_SAFETY_GAP,
        top - IMAGE_SAFETY_GAP,
        right + IMAGE_SAFETY_GAP,
        bottom + IMAGE_SAFETY_GAP
      );
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
      updateCoverTransform();
      context.clearRect(0, 0, width, height);
    };

    const activateCell = (column, row, enteredAt) => {
      if (
        !Number.isInteger(column) ||
        !Number.isInteger(row) ||
        column < 0 || row < 0 ||
        (column * CELL_SIZE) >= width ||
        (row * CELL_SIZE) >= height ||
        !cellIsSafe(column, row)
      ) return;

      const key = column + ':' + row;
      cells.delete(key);
      cells.set(key, { column, row, enteredAt });

      while (cells.size > MAX_ACTIVE_CELLS) {
        cells.delete(cells.keys().next().value);
      }
    };

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
        activateCell(
          x,
          y,
          startedAt + ((finishedAt - startedAt) * Math.min(1, step / longest))
        );
      }
    };

    const drawCell = (cell, now) => {
      const age = now - cell.enteredAt;
      if (age >= REVEAL_MS + HOLD_MS + ERASE_MS) return false;

      const reveal = easeOutCubic(Math.min(1, age / REVEAL_MS));
      const erase = age <= (REVEAL_MS + HOLD_MS)
        ? 1
        : 1 - smoothStep((age - REVEAL_MS - HOLD_MS) / ERASE_MS);
      const opacity = 0.68 * reveal * erase;
      const scale = 0.94 + (0.06 * reveal);
      const left = (cell.column * CELL_SIZE) + CELL_INSET;
      const top = (cell.row * CELL_SIZE) + CELL_INSET;
      const motif = CELL_MOTIFS[mod(
        (cell.column * 3) + (cell.row * 5),
        CELL_MOTIFS.length
      )];

      context.save();
      context.translate(left + (TILE_SIZE / 2), top + (TILE_SIZE / 2));
      context.scale(scale, scale);
      context.translate(-(left + (TILE_SIZE / 2)), -(top + (TILE_SIZE / 2)));
      context.fillStyle = MONOCHROME;

      motif.forEach(([x, y, blockWidth, blockHeight, weight]) => {
        context.globalAlpha = opacity * weight;
        context.fillRect(left + x, top + y, blockWidth, blockHeight);
      });

      context.globalAlpha = opacity * 0.16;
      context.fillRect(left + 5, top + 43, 18, 1);
      context.restore();
      return true;
    };

    const draw = (now) => {
      animationFrame = 0;
      context.clearRect(0, 0, width, height);
      for (const [key, cell] of cells) {
        if (!drawCell(cell, now)) cells.delete(key);
      }
      if (cells.size > 0) animationFrame = window.requestAnimationFrame(draw);
    };

    const requestDraw = () => {
      if (!animationFrame && cells.size > 0) {
        animationFrame = window.requestAnimationFrame(draw);
      }
    };

    const handlePointerMove = (event) => {
      // Only a direct hit on the background image layer is eligible.
      // Text, navigation, controls, and other content naturally stop the trail.
      if (event.target !== imageLayer || !artworkMask || event.pointerType === 'touch') {
        previousCell = null;
        return;
      }

      const bounds = section.getBoundingClientRect();
      const localX = event.clientX - bounds.left;
      const localY = event.clientY - bounds.top;
      if (localX < 0 || localY < 0 || localX >= width || localY >= height) {
        previousCell = null;
        return;
      }

      const nextCell = {
        column: Math.floor(localX / CELL_SIZE),
        row: Math.floor(localY / CELL_SIZE),
      };

      // The complete cell footprint and its safety margin must be transparent.
      if (!cellIsSafe(nextCell.column, nextCell.row)) {
        previousCell = null;
        return;
      }

      const now = performance.now();
      if (!previousCell) {
        activateCell(nextCell.column, nextCell.row, now);
      } else if (
        nextCell.column !== previousCell.column ||
        nextCell.row !== previousCell.row
      ) {
        const distance = Math.max(
          Math.abs(nextCell.column - previousCell.column),
          Math.abs(nextCell.row - previousCell.row)
        );

        if (distance <= MAX_INTERPOLATED_CELLS) {
          traceGridLine(previousCell, nextCell, previousCell.time, now);
        } else {
          // Avoid a long synthetic streak after a cursor jump or stalled frame.
          activateCell(nextCell.column, nextCell.row, now);
        }
      }

      previousCell = { ...nextCell, time: now };
      requestDraw();
    };

    const handlePointerLeave = () => {
      previousCell = null;
    };

    resizeCanvas();

    const maskImage = new Image();
    maskImage.decoding = 'async';
    maskImage.onload = () => {
      if (disposed) return;
      try {
        artworkMask = buildArtworkMask(maskImage);
        if (artworkMask) resizeCanvas();
      } catch (error) {
        artworkMask = null;
        previousCell = null;
        cells.clear();
        context.clearRect(0, 0, width, height);
        console.warn(
          '[Hero mosaic] Artwork mask could not be verified; pointer trail disabled.',
          error
        );
      }
    };
    maskImage.onerror = () => {
      artworkMask = null;
      previousCell = null;
      cells.clear();
      context.clearRect(0, 0, width, height);
    };

    const backgroundImage = window.getComputedStyle(imageLayer).backgroundImage;
    const backgroundUrl = backgroundImage.match(/url\(["']?(.*?)["']?\)/);
    if (backgroundUrl?.[1]) maskImage.src = backgroundUrl[1];

    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(resizeCanvas)
      : null;

    resizeObserver?.observe(section);
    window.addEventListener('resize', resizeCanvas, { passive: true });
    section.addEventListener('pointermove', handlePointerMove, { passive: true });
    section.addEventListener('pointerleave', handlePointerLeave, { passive: true });

    return () => {
      disposed = true;
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
  data-mosaic-surface
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
