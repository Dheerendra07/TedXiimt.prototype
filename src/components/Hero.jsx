import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion as Motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { useEdition } from '../context/EditionContext';
import './Hero.css';

const CAMPUS_PHOTOS = [
  {
    id: 'main-campus-4k',
    src: 'https://upload.wikimedia.org/wikipedia/commons/7/72/IIMT_University%2C_Meerut.jpg',
    alt: 'Original high-resolution photograph of IIMT University campus, Meerut, with its academic buildings and entrance.',
    label: 'THE UNIVERSITY',
    detail: 'The campus, from the main approach',
    credit: 'Ravi Dwivedi · CC BY-SA 4.0',
    source: 'https://commons.wikimedia.org/wiki/File:IIMT_University,_Meerut.jpg',
    position: 'center 48%',
  },
  {
    id: 'campus-approach',
    src: 'https://iimtu.edu.in/blog/wp-content/uploads/2022/10/PHOTO-2022-07-10-21-47-52.jpg',
    alt: 'IIMT University approach road, pink academic building, landscaped entrance and campus sign.',
    label: 'CAMPUS LIFE',
    detail: 'A familiar view of the university entrance',
    credit: 'IIMT University',
    source: 'https://iimtu.edu.in/blog/iimt-university-gets-appreciation-by-mgncre/',
    position: 'center 52%',
  },
  {
    id: 'aerial-campus',
    src: 'https://iimtu.edu.in/blog/wp-content/uploads/2024/02/11.35.56-AM.png',
    alt: 'Aerial photograph of IIMT University showing the entrance gate, academic blocks and campus grounds.',
    label: 'THE BIGGER PICTURE',
    detail: 'The university from above',
    credit: 'IIMT University',
    source: 'https://iimtu.edu.in/blog/exploring-the-best-pharmacy-college/',
    position: 'center 50%',
  },
  {
    id: 'academic-entrance',
    src: 'https://image-static.collegedunia.com/public/college_data/images/campusimage/1746012490SET.jpg',
    alt: 'Red-brick IIMT University academic building with a curved entrance canopy and landscaped courtyard.',
    label: 'ACADEMIC SPACES',
    detail: 'Architecture, light and open campus spaces',
    credit: 'CollegeDunia campus gallery',
    source: 'https://collegedunia.com/university/59031-iimt-university-iimtu-meerut/gallery',
    position: 'center 48%',
  },
  {
    id: 'glass-campus-block',
    src: 'https://image-static.collegedunia.com/public/college_data/images/campusimage/1684133021artboard-3-8_20230309104811_0.jpg',
    alt: 'IIMT campus building with a glass facade, red architectural accents and a landscaped fountain courtyard.',
    label: 'CAMPUS DETAILS',
    detail: 'A closer look at the university architecture',
    credit: 'CollegeDunia campus gallery',
    source: 'https://collegedunia.com/university/59031-iimt-university-iimtu-meerut/gallery',
    position: 'center 50%',
  },
];


/*
 * Original TED vehicle-to-mech-to-wordmark sequence.
 * The vector characters are purpose-built for this event identity.
 */
const TEDVehicleSequence = () => (
  <svg
    className="tedx-hero__transform-scene"
    viewBox="0 0 600 300"
    preserveAspectRatio="none"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <linearGradient id="tedx-mech-red" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#ff657b" />
        <stop offset=".42" stopColor="#ed1239" />
        <stop offset="1" stopColor="#85051f" />
      </linearGradient>
      <linearGradient id="tedx-mech-steel" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#f5f7f8" />
        <stop offset=".34" stopColor="#8c9aa7" />
        <stop offset=".7" stopColor="#34414d" />
        <stop offset="1" stopColor="#151c25" />
      </linearGradient>
      <linearGradient id="tedx-car-graphite" x1="0" y1="0" x2=".9" y2="1">
        <stop offset="0" stopColor="#64717d" />
        <stop offset=".42" stopColor="#252f39" />
        <stop offset="1" stopColor="#0b1016" />
      </linearGradient>
      <linearGradient id="tedx-car-red" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ff6178" />
        <stop offset=".45" stopColor="#e50931" />
        <stop offset="1" stopColor="#79051d" />
      </linearGradient>
      <linearGradient id="tedx-glass" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#344454" />
        <stop offset=".45" stopColor="#111923" />
        <stop offset="1" stopColor="#05080d" />
      </linearGradient>
      <filter id="tedx-dust-soft" x="-60%" y="-100%" width="220%" height="300%">
        <feGaussianBlur stdDeviation="5" />
      </filter>
      <filter id="tedx-mech-glow" x="-80%" y="-80%" width="260%" height="260%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    <path className="tedx-transform-floor" d="M8 258 H592" />
    <path className="tedx-transform-floor-glow" d="M32 258 H568" />

    <g className="tedx-transform-car tedx-transform-car--t" transform="translate(45 207)">
      <g className="tedx-transform-car__motion">
        <g className="tedx-transform-car__dust">
          <ellipse cx="56" cy="42" rx="65" ry="12" fill="#c5aeb0" opacity=".55" filter="url(#tedx-dust-soft)" />
          <circle cx="8" cy="34" r="10" fill="#d8c5c1" opacity=".54" filter="url(#tedx-dust-soft)" />
          <circle cx="108" cy="36" r="13" fill="#bca6a3" opacity=".5" filter="url(#tedx-dust-soft)" />
          <circle cx="20" cy="24" r="4" fill="#f0d8d1" />
          <circle cx="100" cy="19" r="3" fill="#f0d8d1" />
        </g>
        <g className="tedx-transform-car__body">
          <path d="M5 31 18 17Q23 10 37 9H77Q88 9 97 21L109 24Q115 27 116 34L114 43H4L3 36Z" fill="url(#tedx-car-red)" stroke="#ff8b9d" strokeWidth="1.2" />
          <path d="m28 17 9-6h38q9 0 15 10H24Z" fill="#17232d" stroke="#aab5c0" strokeWidth="1" />
          <path d="m48 12-4 9m25-9 3 9" stroke="#9aaab8" strokeWidth="1.4" opacity=".75" />
          <path d="M7 30h101" stroke="#ffb4bd" strokeWidth="1.4" opacity=".7" />
          <path d="M10 35h13m82 0h8" stroke="#ffecdd" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M42 26h30" stroke="#520719" strokeWidth="2" opacity=".7" />
          <path d="m16 29 9-3m75 3 7 2" stroke="#fff" strokeWidth="1.1" opacity=".65" />
        </g>
        <g className="tedx-transform-car__wheel">
          <circle cx="27" cy="41" r="11" fill="#05080c" stroke="#99a5af" strokeWidth="2" />
          <circle cx="27" cy="41" r="5.3" fill="#26323d" stroke="#e4e7e9" strokeWidth="1.2" />
          <path d="M27 36v10m-5-5h10m-8.5-3.5 7 7m0-7-7 7" stroke="#bcc5cb" strokeWidth="1" />
        </g>
        <g className="tedx-transform-car__wheel">
          <circle cx="91" cy="41" r="11" fill="#05080c" stroke="#99a5af" strokeWidth="2" />
          <circle cx="91" cy="41" r="5.3" fill="#26323d" stroke="#e4e7e9" strokeWidth="1.2" />
          <path d="M91 36v10m-5-5h10m-8.5-3.5 7 7m0-7-7 7" stroke="#bcc5cb" strokeWidth="1" />
        </g>
      </g>
    </g>

    <g className="tedx-transform-car tedx-transform-car--e" transform="translate(245 207)">
      <g className="tedx-transform-car__motion">
        <g className="tedx-transform-car__dust">
          <ellipse cx="56" cy="42" rx="65" ry="12" fill="#c5aeb0" opacity=".55" filter="url(#tedx-dust-soft)" />
          <circle cx="8" cy="34" r="10" fill="#d8c5c1" opacity=".54" filter="url(#tedx-dust-soft)" />
          <circle cx="108" cy="36" r="13" fill="#bca6a3" opacity=".5" filter="url(#tedx-dust-soft)" />
          <circle cx="20" cy="24" r="4" fill="#f0d8d1" />
          <circle cx="100" cy="19" r="3" fill="#f0d8d1" />
        </g>
        <g className="tedx-transform-car__body">
          <path d="M5 31 18 17Q23 10 37 9H77Q88 9 97 21L109 24Q115 27 116 34L114 43H4L3 36Z" fill="url(#tedx-car-graphite)" stroke="#b3c0ca" strokeWidth="1.2" />
          <path d="m28 17 9-6h38q9 0 15 10H24Z" fill="#17232d" stroke="#aab5c0" strokeWidth="1" />
          <path d="m48 12-4 9m25-9 3 9" stroke="#9aaab8" strokeWidth="1.4" opacity=".75" />
          <path d="M7 30h101" stroke="#e1e8ed" strokeWidth="1.4" opacity=".58" />
          <path d="M10 35h13m82 0h8" stroke="#ffecdd" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M42 26h30" stroke="#080d13" strokeWidth="2" opacity=".7" />
          <path d="m16 29 9-3m75 3 7 2" stroke="#fff" strokeWidth="1.1" opacity=".65" />
          <path d="M52 29h18" stroke="#eb123a" strokeWidth="2.2" strokeLinecap="round" />
        </g>
        <g className="tedx-transform-car__wheel">
          <circle cx="27" cy="41" r="11" fill="#05080c" stroke="#99a5af" strokeWidth="2" />
          <circle cx="27" cy="41" r="5.3" fill="#26323d" stroke="#e4e7e9" strokeWidth="1.2" />
          <path d="M27 36v10m-5-5h10m-8.5-3.5 7 7m0-7-7 7" stroke="#bcc5cb" strokeWidth="1" />
        </g>
        <g className="tedx-transform-car__wheel">
          <circle cx="91" cy="41" r="11" fill="#05080c" stroke="#99a5af" strokeWidth="2" />
          <circle cx="91" cy="41" r="5.3" fill="#26323d" stroke="#e4e7e9" strokeWidth="1.2" />
          <path d="M91 36v10m-5-5h10m-8.5-3.5 7 7m0-7-7 7" stroke="#bcc5cb" strokeWidth="1" />
        </g>
      </g>
    </g>

    <g className="tedx-transform-car tedx-transform-car--d" transform="translate(445 207)">
      <g className="tedx-transform-car__motion">
        <g className="tedx-transform-car__dust">
          <ellipse cx="56" cy="42" rx="65" ry="12" fill="#c5aeb0" opacity=".55" filter="url(#tedx-dust-soft)" />
          <circle cx="8" cy="34" r="10" fill="#d8c5c1" opacity=".54" filter="url(#tedx-dust-soft)" />
          <circle cx="108" cy="36" r="13" fill="#bca6a3" opacity=".5" filter="url(#tedx-dust-soft)" />
          <circle cx="20" cy="24" r="4" fill="#f0d8d1" />
          <circle cx="100" cy="19" r="3" fill="#f0d8d1" />
        </g>
        <g className="tedx-transform-car__body">
          <path d="M5 31 18 17Q23 10 37 9H77Q88 9 97 21L109 24Q115 27 116 34L114 43H4L3 36Z" fill="url(#tedx-car-red)" stroke="#ff8b9d" strokeWidth="1.2" />
          <path d="m28 17 9-6h38q9 0 15 10H24Z" fill="#17232d" stroke="#aab5c0" strokeWidth="1" />
          <path d="m48 12-4 9m25-9 3 9" stroke="#9aaab8" strokeWidth="1.4" opacity=".75" />
          <path d="M7 30h101" stroke="#ffb4bd" strokeWidth="1.4" opacity=".7" />
          <path d="M10 35h13m82 0h8" stroke="#ffecdd" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M42 26h30" stroke="#520719" strokeWidth="2" opacity=".7" />
          <path d="m16 29 9-3m75 3 7 2" stroke="#fff" strokeWidth="1.1" opacity=".65" />
        </g>
        <g className="tedx-transform-car__wheel">
          <circle cx="27" cy="41" r="11" fill="#05080c" stroke="#99a5af" strokeWidth="2" />
          <circle cx="27" cy="41" r="5.3" fill="#26323d" stroke="#e4e7e9" strokeWidth="1.2" />
          <path d="M27 36v10m-5-5h10m-8.5-3.5 7 7m0-7-7 7" stroke="#bcc5cb" strokeWidth="1" />
        </g>
        <g className="tedx-transform-car__wheel">
          <circle cx="91" cy="41" r="11" fill="#05080c" stroke="#99a5af" strokeWidth="2" />
          <circle cx="91" cy="41" r="5.3" fill="#26323d" stroke="#e4e7e9" strokeWidth="1.2" />
          <path d="M91 36v10m-5-5h10m-8.5-3.5 7 7m0-7-7 7" stroke="#bcc5cb" strokeWidth="1" />
        </g>
      </g>
    </g>

    <g className="tedx-transform-robot tedx-transform-robot--t" transform="translate(53 79)">
      <g className="tedx-transform-robot__pose">
        <g className="tedx-transform-robot__arm tedx-transform-robot__arm--left">
          <path d="M27 53 9 70 3 96 16 101 25 81 42 72" fill="url(#tedx-mech-steel)" stroke="#d4dce1" strokeWidth="2" />
          <circle cx="12" cy="75" r="8" fill="#1a2732" stroke="#f04a62" strokeWidth="2" />
          <path d="m5 92 10 3" stroke="#ff8b9c" strokeWidth="3" strokeLinecap="round" />
        </g>
        <g className="tedx-transform-robot__arm tedx-transform-robot__arm--right">
          <path d="m72 53 18 17 6 26-13 5-9-20-17-9" fill="url(#tedx-mech-steel)" stroke="#d4dce1" strokeWidth="2" />
          <circle cx="91" cy="75" r="8" fill="#1a2732" stroke="#f04a62" strokeWidth="2" />
          <path d="m86 92 10-2" stroke="#ff8b9c" strokeWidth="3" strokeLinecap="round" />
        </g>
        <g className="tedx-transform-robot__legs">
          <path d="m38 115-3 23-8 15h20l7-18 5-20" fill="url(#tedx-mech-steel)" stroke="#d4dce1" strokeWidth="2" />
          <path d="m61 115 5 23 12 15H58l-8-18-3-20" fill="url(#tedx-mech-steel)" stroke="#d4dce1" strokeWidth="2" />
          <path d="M25 151h23l-2 8H23Zm34 0h22l4 8H58Z" fill="#111923" stroke="#e5e8eb" strokeWidth="1.5" />
          <circle cx="46" cy="127" r="5" fill="#e80b34" />
          <circle cx="57" cy="127" r="5" fill="#e80b34" />
        </g>
        <path d="m26 45 15-10h19l15 10 3 70H23Z" fill="url(#tedx-mech-red)" stroke="#ff9aaa" strokeWidth="2" />
        <path d="m39 50 12-6 12 6-4 29H43Z" fill="#171f29" stroke="#aab7c1" strokeWidth="1.5" />
        <path d="m44 61 7-5 7 5-7 15Z" fill="#f5f6f7" opacity=".92" />
        <path d="m28 91 47 0-2 16H30Z" fill="#293541" stroke="#a6b3be" strokeWidth="1" />
        <path d="M35 96h32" stroke="#ff8195" strokeWidth="2" />
        <g className="tedx-transform-robot__head">
          <path d="M35 9 42 2h18l8 8-2 25-8 7H42l-8-8Z" fill="url(#tedx-mech-steel)" stroke="#e0e6e9" strokeWidth="2" />
          <path d="M39 17h22l-1 10H40Z" fill="#111a24" stroke="#f0415c" strokeWidth="1.5" />
          <path d="M43 22h5m7 0h5" stroke="#ff4764" strokeWidth="2.8" strokeLinecap="round" filter="url(#tedx-mech-glow)" />
          <path d="m34 14-7-5m38 5 7-5" stroke="#9aa9b5" strokeWidth="3" strokeLinecap="round" />
          <path d="M48 2V-5m8 7 4-5" stroke="#eb123a" strokeWidth="2" strokeLinecap="round" />
        </g>
      </g>
    </g>

    <g className="tedx-transform-robot tedx-transform-robot--e" transform="translate(253 79)">
      <g className="tedx-transform-robot__pose">
        <g className="tedx-transform-robot__arm tedx-transform-robot__arm--left">
          <path d="M27 53 9 70 3 96 16 101 25 81 42 72" fill="url(#tedx-mech-steel)" stroke="#d4dce1" strokeWidth="2" />
          <circle cx="12" cy="75" r="8" fill="#1a2732" stroke="#f04a62" strokeWidth="2" />
          <path d="m5 92 10 3" stroke="#ff8b9c" strokeWidth="3" strokeLinecap="round" />
        </g>
        <g className="tedx-transform-robot__arm tedx-transform-robot__arm--right">
          <path d="m72 53 18 17 6 26-13 5-9-20-17-9" fill="url(#tedx-mech-steel)" stroke="#d4dce1" strokeWidth="2" />
          <circle cx="91" cy="75" r="8" fill="#1a2732" stroke="#f04a62" strokeWidth="2" />
          <path d="m86 92 10-2" stroke="#ff8b9c" strokeWidth="3" strokeLinecap="round" />
        </g>
        <g className="tedx-transform-robot__legs">
          <path d="m38 115-3 23-8 15h20l7-18 5-20" fill="url(#tedx-mech-steel)" stroke="#d4dce1" strokeWidth="2" />
          <path d="m61 115 5 23 12 15H58l-8-18-3-20" fill="url(#tedx-mech-steel)" stroke="#d4dce1" strokeWidth="2" />
          <path d="M25 151h23l-2 8H23Zm34 0h22l4 8H58Z" fill="#111923" stroke="#e5e8eb" strokeWidth="1.5" />
          <circle cx="46" cy="127" r="5" fill="#e80b34" />
          <circle cx="57" cy="127" r="5" fill="#e80b34" />
        </g>
        <path d="m26 45 15-10h19l15 10 3 70H23Z" fill="url(#tedx-mech-steel)" stroke="#f1f3f4" strokeWidth="2" />
        <path d="m39 50 12-6 12 6-4 29H43Z" fill="#171f29" stroke="#eb123a" strokeWidth="1.5" />
        <path d="m44 61 7-5 7 5-7 15Z" fill="#eb123a" opacity=".92" />
        <path d="m28 91 47 0-2 16H30Z" fill="#293541" stroke="#a6b3be" strokeWidth="1" />
        <path d="M35 96h32" stroke="#ff8195" strokeWidth="2" />
        <g className="tedx-transform-robot__head">
          <path d="M35 9 42 2h18l8 8-2 25-8 7H42l-8-8Z" fill="url(#tedx-mech-steel)" stroke="#e0e6e9" strokeWidth="2" />
          <path d="M39 17h22l-1 10H40Z" fill="#111a24" stroke="#f0415c" strokeWidth="1.5" />
          <path d="M43 22h5m7 0h5" stroke="#ff4764" strokeWidth="2.8" strokeLinecap="round" filter="url(#tedx-mech-glow)" />
          <path d="m34 14-7-5m38 5 7-5" stroke="#9aa9b5" strokeWidth="3" strokeLinecap="round" />
          <path d="M48 2V-5m8 7 4-5" stroke="#eb123a" strokeWidth="2" strokeLinecap="round" />
        </g>
      </g>
    </g>

    <g className="tedx-transform-robot tedx-transform-robot--d" transform="translate(453 79)">
      <g className="tedx-transform-robot__pose">
        <g className="tedx-transform-robot__arm tedx-transform-robot__arm--left">
          <path d="M27 53 9 70 3 96 16 101 25 81 42 72" fill="url(#tedx-mech-steel)" stroke="#d4dce1" strokeWidth="2" />
          <circle cx="12" cy="75" r="8" fill="#1a2732" stroke="#f04a62" strokeWidth="2" />
          <path d="m5 92 10 3" stroke="#ff8b9c" strokeWidth="3" strokeLinecap="round" />
        </g>
        <g className="tedx-transform-robot__arm tedx-transform-robot__arm--right">
          <path d="m72 53 18 17 6 26-13 5-9-20-17-9" fill="url(#tedx-mech-steel)" stroke="#d4dce1" strokeWidth="2" />
          <circle cx="91" cy="75" r="8" fill="#1a2732" stroke="#f04a62" strokeWidth="2" />
          <path d="m86 92 10-2" stroke="#ff8b9c" strokeWidth="3" strokeLinecap="round" />
        </g>
        <g className="tedx-transform-robot__legs">
          <path d="m38 115-3 23-8 15h20l7-18 5-20" fill="url(#tedx-mech-steel)" stroke="#d4dce1" strokeWidth="2" />
          <path d="m61 115 5 23 12 15H58l-8-18-3-20" fill="url(#tedx-mech-steel)" stroke="#d4dce1" strokeWidth="2" />
          <path d="M25 151h23l-2 8H23Zm34 0h22l4 8H58Z" fill="#111923" stroke="#e5e8eb" strokeWidth="1.5" />
          <circle cx="46" cy="127" r="5" fill="#e80b34" />
          <circle cx="57" cy="127" r="5" fill="#e80b34" />
        </g>
        <path d="m26 45 15-10h19l15 10 3 70H23Z" fill="url(#tedx-mech-red)" stroke="#ff9aaa" strokeWidth="2" />
        <path d="m39 50 12-6 12 6-4 29H43Z" fill="#171f29" stroke="#aab7c1" strokeWidth="1.5" />
        <path d="m44 61 7-5 7 5-7 15Z" fill="#f5f6f7" opacity=".92" />
        <path d="m28 91 47 0-2 16H30Z" fill="#293541" stroke="#a6b3be" strokeWidth="1" />
        <path d="M35 96h32" stroke="#ff8195" strokeWidth="2" />
        <g className="tedx-transform-robot__head">
          <path d="M35 9 42 2h18l8 8-2 25-8 7H42l-8-8Z" fill="url(#tedx-mech-steel)" stroke="#e0e6e9" strokeWidth="2" />
          <path d="M39 17h22l-1 10H40Z" fill="#111a24" stroke="#f0415c" strokeWidth="1.5" />
          <path d="M43 22h5m7 0h5" stroke="#ff4764" strokeWidth="2.8" strokeLinecap="round" filter="url(#tedx-mech-glow)" />
          <path d="m34 14-7-5m38 5 7-5" stroke="#9aa9b5" strokeWidth="3" strokeLinecap="round" />
          <path d="M48 2V-5m8 7 4-5" stroke="#eb123a" strokeWidth="2" strokeLinecap="round" />
        </g>
      </g>
    </g>
  </svg>
);

const Hero = () => {
  const prefersReducedMotion = useReducedMotion();
  const { activeEdition, loading } = useEdition();
  const [photos, setPhotos] = useState(CAMPUS_PHOTOS);
  const [activePhoto, setActivePhoto] = useState(0);
  const [photosReady, setPhotosReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const preloadPhoto = (photo) => new Promise((resolve) => {
      const image = new Image();
      image.decoding = 'async';
      image.onload = () => resolve(photo);
      image.onerror = () => resolve(null);
      image.src = photo.src;

      if (image.complete && image.naturalWidth > 0) {
        resolve(photo);
      }
    });

    Promise.all(CAMPUS_PHOTOS.map(preloadPhoto)).then((results) => {
      if (cancelled) return;

      const availablePhotos = results.filter(Boolean);
      setPhotos(availablePhotos.length ? availablePhotos : [CAMPUS_PHOTOS[0]]);
      setActivePhoto(0);
      setPhotosReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!photosReady || photos.length < 2 || prefersReducedMotion) return undefined;

    const rotation = window.setInterval(() => {
      setActivePhoto((current) => (current + 1) % photos.length);
    }, 3800);

    return () => window.clearInterval(rotation);
  }, [photos, photosReady, prefersReducedMotion]);

  const formattedEventDate = useMemo(() => {
    if (loading || !activeEdition?.date) return null;

    const rawDate = String(activeEdition.date);
    const normalizedDate = /^\d{4}-\d{2}-\d{2}$/.test(rawDate)
      ? rawDate + 'T09:00:00'
      : rawDate;
    const date = new Date(normalizedDate);

    if (Number.isNaN(date.getTime())) return null;

    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  }, [activeEdition, loading]);

  const currentPhoto = photos[activePhoto] || photos[0];
  const goToPhoto = (direction) => {
    setActivePhoto((current) => (current + direction + photos.length) % photos.length);
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.12, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 18, filter: 'blur(4px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.68, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section className="tedx-hero" aria-label="TEDxIIMT University — Break the Flow">
      <div className="tedx-hero__ambient" aria-hidden="true" />
      <div className="tedx-hero__grid" aria-hidden="true" />
      <div className="tedx-hero__split-line" aria-hidden="true" />

      <div className="tedx-hero__content-wrap">
        <Motion.div
          className="tedx-hero__content"
          initial={prefersReducedMotion ? false : 'hidden'}
          animate="visible"
          variants={containerVariants}
        >
          <Motion.div variants={itemVariants} className="tedx-hero__eyebrow">
            <span>IDEAS</span><i aria-hidden="true" /><span>INSPIRATION</span><i aria-hidden="true" /><span>IMPACT</span>
          </Motion.div>

          <Motion.div variants={itemVariants} className="tedx-hero__identity">
            <div className="tedx-hero__wordmark" aria-label="TEDx">
              <TEDVehicleSequence />
              <span className="tedx-hero__letter-wrap tedx-hero__letter-wrap--t">
                <span className="tedx-hero__letter tedx-hero__letter--t" aria-hidden="true">T</span>
                <svg className="tedx-hero__t-shades" viewBox="0 0 92 34" aria-hidden="true" focusable="false">
                  <defs>
                    <linearGradient id="tedx-shades-glass" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#425466" />
                      <stop offset=".46" stopColor="#101a25" />
                      <stop offset="1" stopColor="#05080d" />
                    </linearGradient>
                  </defs>
                  <path d="M4 8Q4 4 9 4H37Q42 4 42 9L39 22Q38 27 32 27H14Q9 27 8 22Z" fill="url(#tedx-shades-glass)" stroke="#070b11" strokeWidth="3" />
                  <path d="M50 9Q50 4 55 4H83Q88 4 88 8L84 22Q83 27 77 27H60Q54 27 53 22Z" fill="url(#tedx-shades-glass)" stroke="#070b11" strokeWidth="3" />
                  <path d="M42 10Q46 7 50 10M2 8 8 10M88 8l3-2" fill="none" stroke="#080d14" strokeWidth="3" strokeLinecap="round" />
                  <path d="m13 8 13 0m39 0h13" stroke="#d9e5ed" strokeWidth="2" opacity=".68" strokeLinecap="round" />
                </svg>
              </span><span className="tedx-hero__letter tedx-hero__letter--e" aria-hidden="true">E</span><span className="tedx-hero__letter tedx-hero__letter--d" aria-hidden="true">D</span><sup className="tedx-hero__wordmark-x" aria-hidden="true">x</sup>
            </div>
            <h1>IIMT University</h1>
          </Motion.div>

          <Motion.div variants={itemVariants} className="tedx-hero__message">
            <p className="tedx-hero__theme">Break the <em>Flow.</em></p>
            <span className="tedx-hero__rule" aria-hidden="true" />
            <p className="tedx-hero__description">
              A platform to share ideas that challenge,<br className="tedx-desktop-break" />
              inspire and create change.
            </p>
          </Motion.div>

          <Motion.div variants={itemVariants} className="tedx-hero__actions">
            <a href="/register" className="tedx-hero__button tedx-hero__button--primary">
              Register Now <ArrowRight aria-hidden="true" />
            </a>
            <a href="/speakers" className="tedx-hero__button tedx-hero__button--secondary">
              Meet the Speakers
            </a>
          </Motion.div>

          <Motion.div variants={itemVariants} className="tedx-hero__meta">
            {formattedEventDate && (
              <span><CalendarDays aria-hidden="true" />{formattedEventDate}</span>
            )}
            <span><MapPin aria-hidden="true" />IIMT University, Meerut</span>
          </Motion.div>

          <Motion.div variants={itemVariants} className="tedx-hero__signature">
            <span className="tedx-hero__signature-mark">TED<span>x</span></span>
            <span className="tedx-hero__signature-divider" aria-hidden="true" />
            <span className="tedx-hero__signature-copy">INDEPENDENTLY ORGANIZED<br />TED EVENT</span>
          </Motion.div>
        </Motion.div>
      </div>

      <div className="tedx-hero__visual-wrap">
        <div className="tedx-hero__photo-frame">
          <AnimatePresence initial={false} mode="sync">
            <Motion.img
              key={currentPhoto.id}
              className="tedx-hero__photo"
              src={currentPhoto.src}
              alt={currentPhoto.alt}
              fetchPriority={activePhoto === 0 ? 'high' : 'auto'}
              loading="eager"
              decoding="async"
              draggable="false"
              initial={prefersReducedMotion ? false : { opacity: 0, scale: 1.035 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 1.012 }}
              transition={{
                opacity: { duration: prefersReducedMotion ? 0 : 1.05, ease: [0.22, 1, 0.36, 1] },
                scale: { duration: prefersReducedMotion ? 0 : 4.6, ease: 'linear' },
              }}
              style={{ objectPosition: currentPhoto.position }}
            />
          </AnimatePresence>

          <div className="tedx-hero__photo-shade" aria-hidden="true" />
          <div className="tedx-hero__photo-topline">
            <span>TEDxIIMT UNIVERSITY</span>
            <span>MEERUT · INDIA</span>
          </div>

          <div className="tedx-hero__photo-caption" aria-live="off">
            <div className="tedx-hero__photo-caption-copy">
              <span>{currentPhoto.label}</span>
              <strong>{currentPhoto.detail}</strong>
            </div>
            <div className="tedx-hero__photo-credit">
              <span>PHOTO</span>
              <a href={currentPhoto.source} target="_blank" rel="noreferrer">{currentPhoto.credit}</a>
            </div>
          </div>

          <div className="tedx-hero__photo-controls" aria-label="Campus photo carousel controls">
            <div className="tedx-hero__photo-count">
              <strong>{String(activePhoto + 1).padStart(2, '0')}</strong>
              <span>/ {String(photos.length).padStart(2, '0')}</span>
            </div>
            <div className="tedx-hero__photo-progress" aria-hidden="true">
              {photos.map((photo, index) => (
                <span key={photo.id} className={index === activePhoto ? 'is-active' : ''}>
                  {index === activePhoto && !prefersReducedMotion && <i />}
                </span>
              ))}
            </div>
            <div className="tedx-hero__photo-arrows">
              <button type="button" onClick={() => goToPhoto(-1)} aria-label="Previous campus photo">
                <ChevronLeft aria-hidden="true" />
              </button>
              <button type="button" onClick={() => goToPhoto(1)} aria-label="Next campus photo">
                <ChevronRight aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
        <div className="tedx-hero__visual-foot">
          <span>THE CAMPUS, THROUGH DIFFERENT PERSPECTIVES</span>
          <span>01 — 05 / IIMT UNIVERSITY</span>
        </div>
      </div>

      <a className="tedx-hero__scroll" href="#home-statement-heading" aria-label="Scroll to explore the homepage">
        <span className="tedx-hero__scroll-icon"><ChevronDown aria-hidden="true" /></span>
        <span>SCROLL TO EXPLORE</span>
      </a>
    </section>
  );
};

export default Hero;
