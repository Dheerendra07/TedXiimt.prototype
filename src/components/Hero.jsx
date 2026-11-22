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
    viewBox="0 0 1200 560"
    preserveAspectRatio="xMidYMid meet"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <linearGradient id="tedx-mech-crimson" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#ff8495" />
        <stop offset=".38" stopColor="#e51a3e" />
        <stop offset=".72" stopColor="#a0072a" />
        <stop offset="1" stopColor="#500617" />
      </linearGradient>
      <linearGradient id="tedx-mech-ivory" x1="0" y1="0" x2=".8" y2="1">
        <stop offset="0" stopColor="#fff9f0" />
        <stop offset=".48" stopColor="#b9c3ca" />
        <stop offset="1" stopColor="#53616d" />
      </linearGradient>
      <linearGradient id="tedx-mech-carbon" x1="0" y1="0" x2=".9" y2="1">
        <stop offset="0" stopColor="#73818e" />
        <stop offset=".38" stopColor="#303c49" />
        <stop offset=".78" stopColor="#111923" />
        <stop offset="1" stopColor="#080c12" />
      </linearGradient>
      <linearGradient id="tedx-mech-amber" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#fff0a1" />
        <stop offset=".42" stopColor="#ffc52e" />
        <stop offset=".76" stopColor="#e58a12" />
        <stop offset="1" stopColor="#713609" />
      </linearGradient>
      <linearGradient id="tedx-car-crimson" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ff8a9b" />
        <stop offset=".32" stopColor="#ef2449" />
        <stop offset="1" stopColor="#700820" />
      </linearGradient>
      <linearGradient id="tedx-car-titanium" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#9baab4" />
        <stop offset=".35" stopColor="#4d5c69" />
        <stop offset=".8" stopColor="#1a2530" />
        <stop offset="1" stopColor="#080d14" />
      </linearGradient>
      <linearGradient id="tedx-car-saffron" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffe990" />
        <stop offset=".38" stopColor="#ffc329" />
        <stop offset="1" stopColor="#9a4d08" />
      </linearGradient>
      <linearGradient id="tedx-car-glass" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#667c8d" />
        <stop offset=".48" stopColor="#1c2a38" />
        <stop offset="1" stopColor="#070c12" />
      </linearGradient>
      <linearGradient id="tedx-core-cyan" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#b4fbff" />
        <stop offset=".48" stopColor="#35d6e5" />
        <stop offset="1" stopColor="#08798d" />
      </linearGradient>
      <filter id="tedx-dust-cloud" x="-80%" y="-140%" width="260%" height="380%">
        <feGaussianBlur stdDeviation="9" />
      </filter>
      <filter id="tedx-mech-light" x="-90%" y="-90%" width="280%" height="280%">
        <feGaussianBlur stdDeviation="4" result="glow" />
        <feMerge>
          <feMergeNode in="glow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    <path className="tedx-transform-floor" d="M28 488 H1172" />
    <path className="tedx-transform-floor-glow" d="M65 488 H1135" />

    {/* VEHICLE 01 — heavy crimson expedition hauler */}
    <g className="tedx-transform-car tedx-transform-car--t" transform="translate(25 366)">
      <g className="tedx-transform-car__motion">
        <g className="tedx-transform-car__dust">
          <ellipse cx="182" cy="112" rx="192" ry="25" fill="#c6b2ad" opacity=".6" filter="url(#tedx-dust-cloud)" />
          <ellipse cx="32" cy="105" rx="57" ry="18" fill="#e2d0c8" opacity=".62" filter="url(#tedx-dust-cloud)" />
          <ellipse cx="330" cy="101" rx="74" ry="22" fill="#bba8a4" opacity=".54" filter="url(#tedx-dust-cloud)" />
          <circle cx="73" cy="80" r="10" fill="#e2c8c0" opacity=".62" filter="url(#tedx-dust-cloud)" />
          <circle cx="285" cy="75" r="13" fill="#d9c5bd" opacity=".62" filter="url(#tedx-dust-cloud)" />
          <circle cx="44" cy="61" r="4" fill="#f6ded4" />
          <circle cx="310" cy="58" r="5" fill="#eed4ca" />
          <path d="M5 94q40-28 78-8m174 10q38-30 76-12" fill="none" stroke="#f2d7ce" strokeWidth="4" opacity=".62" />
        </g>
        <g className="tedx-transform-car__body">
          <path d="M14 72 23 43Q29 31 51 28H115L145 43 174 46H300Q319 48 329 68L341 87 337 105H12Z" fill="url(#tedx-car-crimson)" stroke="#ff9aab" strokeWidth="3" />
          <path d="M32 40Q38 16 58 12H116Q136 15 146 42L145 70H27Z" fill="url(#tedx-car-crimson)" stroke="#ffc0c8" strokeWidth="3" />
          <path d="M45 39 57 19H105Q121 22 129 41Z" fill="url(#tedx-car-glass)" stroke="#d4e1e8" strokeWidth="2.2" />
          <path d="M79 20v21m-29-3 3-14m75 14-5-15" stroke="#c5d0d7" strokeWidth="2" opacity=".75" />
          <path d="M148 51h144l20 19H148Z" fill="#9d0b2b" stroke="#ff6c84" strokeWidth="2" />
          <path d="M159 58h131m-122 9h120" stroke="#ffc0c8" strokeWidth="2" opacity=".52" />
          <path d="M18 77h322v14H18Z" fill="#4b111e" opacity=".82" />
          <path d="M21 72h30v7H21Zm283 0h24v7h-24Z" fill="#fff1d9" stroke="#ff9aa7" strokeWidth="1.2" />
          <path d="M56 88h230" stroke="#ffb5c0" strokeWidth="2" opacity=".72" />
          <path d="M43 48h69m-69 7h69" stroke="#e9eef0" strokeWidth="2" opacity=".44" />
          <path d="M170 46v39m12-39v39m12-39v39" stroke="#61091c" strokeWidth="2" opacity=".74" />
          <path d="M22 95h316" stroke="#f7a0ae" strokeWidth="3" opacity=".72" />
          <path d="M237 53h40" stroke="#ffd7dc" strokeWidth="3" strokeLinecap="round" opacity=".6" />
        </g>
        <g className="tedx-transform-car__wheel">
          <circle cx="75" cy="100" r="27" fill="#070b10" stroke="#aebac3" strokeWidth="4" />
          <circle cx="75" cy="100" r="15" fill="#273541" stroke="#eaf0f3" strokeWidth="3" />
          <circle cx="75" cy="100" r="5" fill="#dfe7ea" />
          <path d="M75 85v30m-15-15h30m-26-11 22 22m0-22-22 22" stroke="#9caab4" strokeWidth="2.5" />
        </g>
        <g className="tedx-transform-car__wheel">
          <circle cx="282" cy="100" r="27" fill="#070b10" stroke="#aebac3" strokeWidth="4" />
          <circle cx="282" cy="100" r="15" fill="#273541" stroke="#eaf0f3" strokeWidth="3" />
          <circle cx="282" cy="100" r="5" fill="#dfe7ea" />
          <path d="M282 85v30m-15-15h30m-26-11 22 22m0-22-22 22" stroke="#9caab4" strokeWidth="2.5" />
        </g>
        <g className="tedx-transform-car__wheel">
          <circle cx="333" cy="100" r="22" fill="#070b10" stroke="#aebac3" strokeWidth="3.5" />
          <circle cx="333" cy="100" r="12" fill="#273541" stroke="#eaf0f3" strokeWidth="2.5" />
          <circle cx="333" cy="100" r="4" fill="#dfe7ea" />
        </g>
      </g>
    </g>

    {/* VEHICLE 02 — low, wide titanium performance coupe */}
    <g className="tedx-transform-car tedx-transform-car--e" transform="translate(424 385)">
      <g className="tedx-transform-car__motion">
        <g className="tedx-transform-car__dust">
          <ellipse cx="184" cy="94" rx="186" ry="22" fill="#9cabb2" opacity=".58" filter="url(#tedx-dust-cloud)" />
          <ellipse cx="35" cy="91" rx="63" ry="18" fill="#c0c6c5" opacity=".54" filter="url(#tedx-dust-cloud)" />
          <ellipse cx="326" cy="87" rx="69" ry="22" fill="#8998a0" opacity=".5" filter="url(#tedx-dust-cloud)" />
          <circle cx="67" cy="69" r="9" fill="#d9e0df" opacity=".65" filter="url(#tedx-dust-cloud)" />
          <circle cx="293" cy="65" r="12" fill="#bcc7c9" opacity=".58" filter="url(#tedx-dust-cloud)" />
        </g>
        <g className="tedx-transform-car__body">
          <path d="M8 67 37 51 85 42 122 19Q139 8 177 8H233Q256 12 280 42L326 48Q344 54 350 74L346 89H9Z" fill="url(#tedx-car-titanium)" stroke="#c8d4db" strokeWidth="3" />
          <path d="M106 43 136 20Q149 13 177 13H226Q245 18 265 44Z" fill="url(#tedx-car-glass)" stroke="#aabac5" strokeWidth="2.3" />
          <path d="m174 15-10 30m51-30 13 30" stroke="#c0cbd1" strokeWidth="2" opacity=".7" />
          <path d="M20 65h322" stroke="#e9f0f2" strokeWidth="2" opacity=".7" />
          <path d="m14 73 50-9 23 9-6 12H18Zm288 0 40-7 15 12-5 7h-50Z" fill="#0b151f" stroke="#7f919e" strokeWidth="2" />
          <path d="M20 83h44m244 0h35" stroke="#e2f9ff" strokeWidth="4" strokeLinecap="round" />
          <path d="M122 58h111" stroke="#38d9e7" strokeWidth="3" strokeLinecap="round" filter="url(#tedx-mech-light)" />
          <path d="M95 91h156" stroke="#c4d0d6" strokeWidth="3" opacity=".54" />
          <path d="m285 43 58 7-19 8-38-5Z" fill="#273746" stroke="#adbdc8" strokeWidth="2" />
          <path d="M329 46 354 37 350 58 337 63Z" fill="#354553" stroke="#aabac6" strokeWidth="2" />
        </g>
        <g className="tedx-transform-car__wheel">
          <circle cx="78" cy="86" r="24" fill="#060a0f" stroke="#9baab5" strokeWidth="4" />
          <circle cx="78" cy="86" r="12" fill="#263743" stroke="#dce5e9" strokeWidth="3" />
          <path d="M78 74v24m-12-12h24m-20-8 16 16m0-16L70 94" stroke="#a8bac3" strokeWidth="2" />
        </g>
        <g className="tedx-transform-car__wheel">
          <circle cx="294" cy="86" r="24" fill="#060a0f" stroke="#9baab5" strokeWidth="4" />
          <circle cx="294" cy="86" r="12" fill="#263743" stroke="#dce5e9" strokeWidth="3" />
          <path d="M294 74v24m-12-12h24m-20-8 16 16m0-16-16 16" stroke="#a8bac3" strokeWidth="2" />
        </g>
      </g>
    </g>

    {/* VEHICLE 03 — bright saffron electric rally buggy */}
    <g className="tedx-transform-car tedx-transform-car--d" transform="translate(822 364)">
      <g className="tedx-transform-car__motion">
        <g className="tedx-transform-car__dust">
          <ellipse cx="165" cy="111" rx="185" ry="26" fill="#d3b98d" opacity=".58" filter="url(#tedx-dust-cloud)" />
          <ellipse cx="20" cy="101" rx="66" ry="21" fill="#e5cfaa" opacity=".62" filter="url(#tedx-dust-cloud)" />
          <ellipse cx="313" cy="101" rx="78" ry="22" fill="#cfb58c" opacity=".56" filter="url(#tedx-dust-cloud)" />
          <circle cx="66" cy="74" r="10" fill="#f1dcb5" opacity=".62" filter="url(#tedx-dust-cloud)" />
          <circle cx="280" cy="75" r="12" fill="#f1dcb5" opacity=".58" filter="url(#tedx-dust-cloud)" />
        </g>
        <g className="tedx-transform-car__body">
          <path d="M15 75 34 45 70 35 97 9H198L224 33 272 40 306 62 320 84 314 106H8Z" fill="url(#tedx-car-saffron)" stroke="#ffe49a" strokeWidth="3" />
          <path d="M81 35 105 13H188L213 38Z" fill="url(#tedx-car-glass)" stroke="#fff0bb" strokeWidth="2.5" />
          <path d="M126 14v25m35-25 7 25" stroke="#c5ced0" strokeWidth="2" opacity=".75" />
          <path d="M28 56 74 39 69 73H23Zm234-17 38 19 9 16h-43Z" fill="#303b43" stroke="#edc766" strokeWidth="2" />
          <path d="M19 81h295" stroke="#fff5cc" strokeWidth="2" opacity=".78" />
          <path d="M17 91h46m231 0h22" stroke="#fffbdc" strokeWidth="5" strokeLinecap="round" />
          <path d="M91 72h132" stroke="#8c4e12" strokeWidth="4" opacity=".8" />
          <path d="m104 8-9-15h112l-12 15" fill="none" stroke="#ffc93d" strokeWidth="7" strokeLinejoin="round" />
          <path d="m44 43-8-20h84m101-2h41l16 26" fill="none" stroke="#ffe28b" strokeWidth="4" strokeLinecap="round" />
          <path d="m293 43 26-8 4 12-23 7Z" fill="#272f37" stroke="#e8ca83" strokeWidth="2" />
        </g>
        <g className="tedx-transform-car__wheel">
          <circle cx="70" cy="100" r="29" fill="#05090e" stroke="#d2d9dc" strokeWidth="4" />
          <circle cx="70" cy="100" r="15" fill="#424b4f" stroke="#f4e8c3" strokeWidth="3" />
          <path d="M70 85v30m-15-15h30m-25-10 20 20m0-20-20 20" stroke="#e6d6a9" strokeWidth="2.4" />
          <circle cx="70" cy="100" r="5" fill="#f9edc7" />
        </g>
        <g className="tedx-transform-car__wheel">
          <circle cx="265" cy="100" r="29" fill="#05090e" stroke="#d2d9dc" strokeWidth="4" />
          <circle cx="265" cy="100" r="15" fill="#424b4f" stroke="#f4e8c3" strokeWidth="3" />
          <path d="M265 85v30m-15-15h30m-25-10 20 20m0-20-20 20" stroke="#e6d6a9" strokeWidth="2.4" />
          <circle cx="265" cy="100" r="5" fill="#f9edc7" />
        </g>
      </g>
    </g>

    {/* MECH 01 — broad industrial sentinel with an offset power-pack shoulder */}
    <g className="tedx-transform-robot tedx-transform-robot--t" transform="translate(35 72)">
      <g className="tedx-transform-robot__pose">
        <g className="tedx-transform-robot__arm tedx-transform-robot__arm--left">
          <path d="m69 147-38 30-18 75 25 11 30-59 39-23" fill="url(#tedx-mech-ivory)" stroke="#f8fbfc" strokeWidth="4" />
          <path d="m28 190-15 50 21 11 23-47" fill="url(#tedx-mech-crimson)" stroke="#ff9bab" strokeWidth="3" />
          <circle cx="35" cy="179" r="17" fill="#202c37" stroke="#f04e69" strokeWidth="4" />
          <path d="m9 250 33 13 10 18-35-4Z" fill="#303d48" stroke="#e4ebee" strokeWidth="3" />
        </g>
        <g className="tedx-transform-robot__arm tedx-transform-robot__arm--right">
          <path d="m210 145 40 27 17 72-25 13-31-57-40-24" fill="url(#tedx-mech-crimson)" stroke="#ff9bab" strokeWidth="4" />
          <path d="m251 185 18 50-21 14-25-46" fill="url(#tedx-mech-ivory)" stroke="#dce6eb" strokeWidth="3" />
          <circle cx="243" cy="174" r="17" fill="#202c37" stroke="#f04e69" strokeWidth="4" />
          <path d="m240 249 34 3 13 22-38 8Z" fill="#303d48" stroke="#e4ebee" strokeWidth="3" />
        </g>
        <g className="tedx-transform-robot__legs">
          <path d="m92 294-2 72-19 41h58l18-48 2-65" fill="url(#tedx-mech-ivory)" stroke="#e8eef0" strokeWidth="4" />
          <path d="m167 294 8 72 26 40h-57l-22-48-2-66" fill="url(#tedx-mech-crimson)" stroke="#ff9bab" strokeWidth="4" />
          <path d="m76 393 54 0-4 22H63Z" fill="#131b24" stroke="#b8c6ce" strokeWidth="3" />
          <path d="m143 393 59 0 17 22h-70Z" fill="#131b24" stroke="#b8c6ce" strokeWidth="3" />
          <circle cx="122" cy="319" r="12" fill="#eb1740" filter="url(#tedx-mech-light)" />
          <circle cx="154" cy="319" r="12" fill="#eb1740" filter="url(#tedx-mech-light)" />
        </g>
        <path d="m67 121 33-24h82l36 25 12 169-29 25H83l-28-27Z" fill="url(#tedx-mech-crimson)" stroke="#ff9dad" strokeWidth="4" />
        <path d="m91 141 37-18h38l36 18-10 76H100Z" fill="url(#tedx-mech-ivory)" stroke="#f8fafb" strokeWidth="3" />
        <path d="m114 153 31-14 32 14-8 46h-48Z" fill="#273542" stroke="#9cabb6" strokeWidth="3" />
        <path d="m126 167 19-11 19 11-19 27Z" fill="#f0f3f4" stroke="#9baab4" strokeWidth="2" />
        <path d="m89 235 126 0-8 38H98Z" fill="#293743" stroke="#a7b5bf" strokeWidth="3" />
        <path d="M104 250h98m-87 12h76" stroke="#ffb3bf" strokeWidth="3" opacity=".8" />
        <path d="m78 127-48 16-10 51 45 17 26-28Z" fill="url(#tedx-mech-ivory)" stroke="#f4f7f8" strokeWidth="4" />
        <path d="m188 119 44-15 31 22-5 44-48 13-23-25Z" fill="url(#tedx-mech-crimson)" stroke="#ff9bab" strokeWidth="4" />
        <path d="m205 124 29-8 16 13-5 20-33 7Z" fill="#283743" stroke="#f9d8de" strokeWidth="2" />
        <g className="tedx-transform-robot__head">
          <path d="m111 36 23-22h43l25 24-6 56-24 20h-39l-25-20Z" fill="url(#tedx-mech-ivory)" stroke="#f4f7f8" strokeWidth="4" />
          <path d="m125 53 16-11h34l16 11-7 22h-52Z" fill="#121a24" stroke="#e8a8b3" strokeWidth="3" />
          <path d="m136 62 11-4m20 0 11 4" stroke="#ff526f" strokeWidth="6" strokeLinecap="round" filter="url(#tedx-mech-light)" />
          <path d="m112 46-19-10 4-18 28 12m77 16 20-10-3-18-26 12" fill="url(#tedx-mech-crimson)" stroke="#ff9bab" strokeWidth="3" />
          <path d="m132 20 17-13 18 0 15 13" fill="none" stroke="#7d8790" strokeWidth="4" />
          <path d="M142 89h28" stroke="#65727d" strokeWidth="4" strokeLinecap="round" />
        </g>
      </g>
    </g>

    {/* MECH 02 — narrow graphite tactician with a cyan chest core */}
    <g className="tedx-transform-robot tedx-transform-robot--e" transform="translate(438 90)">
      <g className="tedx-transform-robot__pose">
        <g className="tedx-transform-robot__arm tedx-transform-robot__arm--left">
          <path d="m77 146-45 44-11 65 24 9 27-52 40-27" fill="url(#tedx-mech-carbon)" stroke="#aebbc4" strokeWidth="4" />
          <path d="m26 215-10 37 26 12 22-39" fill="#172632" stroke="#718997" strokeWidth="3" />
          <circle cx="53" cy="185" r="17" fill="#0b1720" stroke="#36d9e7" strokeWidth="3" />
          <path d="m16 253 32 8 12 18-42-2Z" fill="#101821" stroke="#9eabb3" strokeWidth="3" />
        </g>
        <g className="tedx-transform-robot__arm tedx-transform-robot__arm--right">
          <path d="m193 144 34 26 31 64-21 17-36-48-35-18" fill="url(#tedx-mech-carbon)" stroke="#aebbc4" strokeWidth="4" />
          <path d="m238 208 26 30-17 24-30-34" fill="#253543" stroke="#8ea2ae" strokeWidth="3" />
          <circle cx="218" cy="173" r="16" fill="#0b1720" stroke="#36d9e7" strokeWidth="3" />
          <path d="m245 244 33 1 12 20-39 8Z" fill="#101821" stroke="#9eabb3" strokeWidth="3" />
        </g>
        <g className="tedx-transform-robot__legs">
          <path d="m93 286-9 83-22 39h56l22-48 9-69" fill="url(#tedx-mech-carbon)" stroke="#9baab5" strokeWidth="4" />
          <path d="m157 286 11 82 24 39h-54l-21-46-8-71" fill="#1e2b37" stroke="#91a4b1" strokeWidth="4" />
          <path d="m59 397 59 0-4 22H48Z" fill="#090f17" stroke="#788b98" strokeWidth="3" />
          <path d="m141 397 53 0 19 22h-68Z" fill="#090f17" stroke="#788b98" strokeWidth="3" />
          <circle cx="126" cy="313" r="9" fill="#32d5e2" filter="url(#tedx-mech-light)" />
        </g>
        <path d="m77 120 39-26h63l34 28 1 154-27 28H96l-27-30Z" fill="url(#tedx-mech-carbon)" stroke="#9cabb4" strokeWidth="4" />
        <path d="m103 142 31-21 39 4 26 21-8 75H110Z" fill="#182733" stroke="#5d7788" strokeWidth="3" />
        <path d="m126 151 31-7 25 19-20 38h-34l-18-33Z" fill="#0b151f" stroke="#36d9e7" strokeWidth="3" />
        <path d="m137 159 17-5 16 9-12 27h-18Z" fill="url(#tedx-core-cyan)" filter="url(#tedx-mech-light)" />
        <path d="m88 231 117-4-8 37-101 4Z" fill="#0b151e" stroke="#586e7d" strokeWidth="3" />
        <path d="M103 244h86" stroke="#39d9e7" strokeWidth="3" filter="url(#tedx-mech-light)" />
        <path d="m76 125-38 18-13 48 45 17 27-28Z" fill="#263440" stroke="#aebbc4" strokeWidth="4" />
        <path d="m192 119 35-24 34 20-2 48-41 19-23-30Z" fill="url(#tedx-mech-carbon)" stroke="#91a3ae" strokeWidth="4" />
        <path d="m208 120 25-11 17 11-6 24-31 7Z" fill="#111923" stroke="#36d9e7" strokeWidth="2.5" />
        <g className="tedx-transform-robot__head">
          <path d="m111 35 20-19h36l20 22-7 47-21 18h-28l-22-20Z" fill="url(#tedx-mech-carbon)" stroke="#b1c0c9" strokeWidth="4" />
          <path d="m121 52 18-11h30l13 12-9 18h-43Z" fill="#070e15" stroke="#36d9e7" strokeWidth="3" />
          <path d="M132 59h32" stroke="#7af5fc" strokeWidth="5" strokeLinecap="round" filter="url(#tedx-mech-light)" />
          <path d="m115 42-16-13 7-18 23 18m60 10 15-13-6-18-23 18" fill="#344550" stroke="#b6c1c8" strokeWidth="3" />
          <path d="m143 85 22 0" stroke="#5a6f7e" strokeWidth="4" strokeLinecap="round" />
        </g>
      </g>
    </g>

    {/* MECH 03 — agile saffron utility runner, rounded armour and compact stance */}
    <g className="tedx-transform-robot tedx-transform-robot--d" transform="translate(835 72)">
      <g className="tedx-transform-robot__pose">
        <g className="tedx-transform-robot__arm tedx-transform-robot__arm--left">
          <path d="m71 149-40 31-11 68 23 12 27-53 39-24" fill="url(#tedx-mech-amber)" stroke="#ffe59a" strokeWidth="4" />
          <path d="m26 216-10 39 26 12 24-42" fill="#303c43" stroke="#edc85f" strokeWidth="3" />
          <circle cx="50" cy="181" r="16" fill="#252e35" stroke="#ffd14b" strokeWidth="4" />
          <path d="m13 254 31 8 11 18-40-2Z" fill="#202a31" stroke="#f0ca64" strokeWidth="3" />
        </g>
        <g className="tedx-transform-robot__arm tedx-transform-robot__arm--right">
          <path d="m197 150 41 27 22 65-25 14-29-53-39-20" fill="url(#tedx-mech-amber)" stroke="#ffe59a" strokeWidth="4" />
          <path d="m242 211 21 39-20 20-29-42" fill="#303c43" stroke="#edc85f" strokeWidth="3" />
          <circle cx="226" cy="180" r="16" fill="#252e35" stroke="#ffd14b" strokeWidth="4" />
          <path d="m246 251 35 4 12 19-41 7Z" fill="#202a31" stroke="#f0ca64" strokeWidth="3" />
        </g>
        <g className="tedx-transform-robot__legs">
          <path d="m91 293-3 68-18 42h52l20-48 2-62" fill="url(#tedx-mech-amber)" stroke="#ffdf83" strokeWidth="4" />
          <path d="m161 293 9 68 24 42h-54l-22-47-6-63" fill="#343e45" stroke="#f2d16f" strokeWidth="4" />
          <path d="m68 393 55 0-6 22H57Z" fill="#111920" stroke="#c4b37c" strokeWidth="3" />
          <path d="m143 393 54 0 17 22h-67Z" fill="#111920" stroke="#c4b37c" strokeWidth="3" />
          <circle cx="124" cy="315" r="10" fill="#ffe078" filter="url(#tedx-mech-light)" />
          <circle cx="154" cy="315" r="10" fill="#ffe078" filter="url(#tedx-mech-light)" />
        </g>
        <path d="m70 127 34-27h74l34 29 5 146-30 31H96l-30-31Z" fill="url(#tedx-mech-amber)" stroke="#ffe89b" strokeWidth="4" />
        <path d="m95 148 35-19h38l30 19-12 73h-78Z" fill="#303b42" stroke="#ffe38c" strokeWidth="3" />
        <path d="m112 159 36-13 29 14-14 43h-43l-17-29Z" fill="#f7bd36" stroke="#94601e" strokeWidth="3" />
        <path d="m126 168 22-8 18 9-10 26h-22Z" fill="#303941" stroke="#fce9aa" strokeWidth="2" />
        <path d="m83 235 129 0-9 36H94Z" fill="#343d43" stroke="#f4d06e" strokeWidth="3" />
        <path d="M103 249h88" stroke="#fff0ad" strokeWidth="3" opacity=".85" />
        <path d="m71 131-39 16-12 45 44 18 27-28Z" fill="#ffcf46" stroke="#f9e2a0" strokeWidth="4" />
        <path d="m194 126 36-15 31 18 1 40-44 16-24-29Z" fill="#303b42" stroke="#f5d16e" strokeWidth="4" />
        <g className="tedx-transform-robot__head">
          <path d="m112 39 17-20h42l20 21-5 45-25 18h-27l-22-21Z" fill="url(#tedx-mech-amber)" stroke="#ffe99e" strokeWidth="4" />
          <path d="m122 54 15-9h29l15 10-7 19h-44Z" fill="#202b33" stroke="#ffdd70" strokeWidth="3" />
          <path d="m132 60 10-3h15l10 4" fill="none" stroke="#ffe980" strokeWidth="5" strokeLinecap="round" filter="url(#tedx-mech-light)" />
          <path d="m116 47-14-8 5-17 22 13m58 12 15-9-5-18-22 14" fill="#e8a32e" stroke="#fff0ad" strokeWidth="3" />
          <path d="M140 88h24" stroke="#92601e" strokeWidth="4" strokeLinecap="round" />
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
                <svg className="tedx-hero__t-shades" viewBox="0 0 110 72" aria-hidden="true" focusable="false">
                  <defs>
                    <linearGradient id="tedx-shades-glass" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#718092" />
                      <stop offset=".28" stopColor="#263444" />
                      <stop offset="1" stopColor="#080d14" />
                    </linearGradient>
                    <linearGradient id="tedx-shades-metal" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="#dce5eb" />
                      <stop offset=".45" stopColor="#657381" />
                      <stop offset="1" stopColor="#111820" />
                    </linearGradient>
                  </defs>
                  <g transform="translate(110 0) scale(-1 1)">
                  <g stroke="#070b11" strokeWidth="4" strokeLinejoin="round">
                    <path d="M7 10Q8 5 14 6L38 9Q45 10 43 17L38 34Q36 39 30 38L12 35Q6 34 6 27Z" fill="url(#tedx-shades-glass)" />
                    <path d="M53 15Q54 9 60 10L86 13Q93 14 91 21L85 38Q83 43 77 42L59 39Q53 38 52 31Z" fill="url(#tedx-shades-glass)" />
                    <path d="M43 15Q48 12 53 16M4 11 1 10" fill="none" />
                  </g>
                  <path d="m13 11 18 3m31 1 19 3" fill="none" stroke="#e5f0f7" strokeWidth="2.2" opacity=".76" strokeLinecap="round" />
                  <path d="M90 17Q105 18 105 30L101 44 97 63" fill="none" stroke="url(#tedx-shades-metal)" strokeWidth="5" strokeLinecap="round" />
                  <path d="M97 62q-1 5-6 6" fill="none" stroke="#111820" strokeWidth="4" strokeLinecap="round" />
                  <circle cx="91" cy="18" r="3.2" fill="#d9e4eb" stroke="#111820" strokeWidth="1.4" />
                  <path d="M96 44 93 57" stroke="#d8e3e9" strokeWidth="1.4" opacity=".65" strokeLinecap="round" />
                  </g>
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
