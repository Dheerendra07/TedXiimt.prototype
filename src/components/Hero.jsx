import React, { useMemo } from 'react';
import { motion as Motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, CalendarDays, ChevronDown, MapPin } from 'lucide-react';
import { useEdition } from '../context/EditionContext';
import './Hero.css';

const audience = Array.from({ length: 96 }, (_, index) => {
  const row = Math.floor(index / 32);
  const column = index % 32;
  return {
    x: 22 + (column * 45) + ((row % 2) * 9),
    y: 786 + (row * 43) + ((column % 5) * 3),
    radius: 5.5 + ((column * 3 + row) % 4) * 0.8,
    width: 17 + ((column * 7 + row) % 10),
    shade: (column + row * 2) % 6,
    accent: (column * 5 + row * 3) % 13 === 0,
  };
});

const buildingWindows = Array.from({ length: 56 }, (_, index) => ({
  row: Math.floor(index / 8),
  column: index % 8,
}));

const campusPalms = [
  { x: 1378, y: 652, scale: 1.34, lean: -7 },
  { x: 711, y: 608, scale: 0.92, lean: 5 },
  { x: 1250, y: 573, scale: 0.68, lean: 8 },
];

const PalmTree = ({ x, y, scale, lean }) => (
  <g transform={`translate(${x} ${y}) scale(${scale}) rotate(${lean})`} className="tedx-campus-palm">
    <path d="M0 0 C-5 -48 5 -94 0 -148" fill="none" stroke="#302B2B" strokeWidth="13" strokeLinecap="round" />
    <path d="M-2 -22 C-7 -70 5 -113 2 -148" fill="none" stroke="#6B5548" strokeWidth="3.5" strokeLinecap="round" opacity=".8" />
    <g fill="none" strokeLinecap="round">
      <path d="M0 -148 C-37 -182 -75 -180 -110 -158 C-70 -171 -38 -155 0 -141" stroke="#182D2A" strokeWidth="10" />
      <path d="M0 -148 C-14 -195 -46 -222 -84 -228 C-48 -205 -26 -178 0 -141" stroke="#1B332E" strokeWidth="10" />
      <path d="M0 -148 C7 -199 -7 -234 -28 -265 C-13 -223 -9 -183 0 -141" stroke="#234037" strokeWidth="10" />
      <path d="M0 -148 C32 -192 64 -209 103 -210 C66 -195 37 -171 0 -140" stroke="#1D352F" strokeWidth="10" />
      <path d="M0 -148 C59 -169 95 -163 127 -137 C82 -153 40 -145 0 -140" stroke="#29453B" strokeWidth="10" />
      <path d="M0 -148 C53 -126 84 -98 94 -60 C67 -102 34 -126 0 -140" stroke="#1A302A" strokeWidth="10" />
      <path d="M0 -148 C-28 -123 -49 -88 -48 -48 C-34 -88 -16 -119 0 -140" stroke="#213C32" strokeWidth="10" />
    </g>
    <g stroke="#8AA18A" strokeOpacity=".34" strokeWidth="1.7" fill="none">
      <path d="M-8 -151 Q-65 -166 -95 -159 M-6 -153 Q-49 -207 -75 -220 M0 -155 Q-8 -218 -24 -251 M7 -153 Q60 -194 91 -201 M8 -150 Q83 -164 116 -141 M7 -146 Q65 -119 87 -78 M-2 -145 Q-33 -94 -43 -61" />
    </g>
    <ellipse cx="0" cy="-145" rx="14" ry="8" fill="#9A7051" />
    <g fill="#435742" opacity=".7">
      <ellipse cx="-32" cy="-175" rx="12" ry="4" transform="rotate(25 -32 -175)" />
      <ellipse cx="26" cy="-180" rx="14" ry="4" transform="rotate(-30 26 -180)" />
      <ellipse cx="-9" cy="-207" rx="11" ry="4" transform="rotate(-68 -9 -207)" />
    </g>
  </g>
);

const StageArtwork = () => (
  <svg
    className="tedx-hero-artwork"
    viewBox="0 0 1440 900"
    preserveAspectRatio="xMidYMid slice"
    role="presentation"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="tedx-sky" x1="0" y1="0" x2=".96" y2="1">
        <stop offset="0" stopColor="#17212C" />
        <stop offset=".34" stopColor="#353A43" />
        <stop offset=".62" stopColor="#987A79" />
        <stop offset=".82" stopColor="#59464B" />
        <stop offset="1" stopColor="#202831" />
      </linearGradient>
      <radialGradient id="tedx-sunset" cx="74%" cy="43%" r="56%">
        <stop offset="0" stopColor="#F0B49A" stopOpacity=".78" />
        <stop offset=".28" stopColor="#D18F80" stopOpacity=".42" />
        <stop offset=".7" stopColor="#B97870" stopOpacity=".1" />
        <stop offset="1" stopColor="#B87870" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="tedx-campus-front" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#C99C87" />
        <stop offset=".38" stopColor="#A8756D" />
        <stop offset=".76" stopColor="#805D5B" />
        <stop offset="1" stopColor="#624B4D" />
      </linearGradient>
      <linearGradient id="tedx-campus-side" x1="0" y1="0" x2="1" y2=".15">
        <stop offset="0" stopColor="#79595A" />
        <stop offset=".62" stopColor="#604D50" />
        <stop offset="1" stopColor="#343941" />
      </linearGradient>
      <linearGradient id="tedx-campus-cream" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#E5C6AB" />
        <stop offset=".5" stopColor="#C9A58D" />
        <stop offset="1" stopColor="#96796F" />
      </linearGradient>
      <linearGradient id="tedx-glass" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#A8BCC0" stopOpacity=".76" />
        <stop offset=".4" stopColor="#647C83" stopOpacity=".68" />
        <stop offset="1" stopColor="#24343C" stopOpacity=".84" />
      </linearGradient>
      <linearGradient id="tedx-window-light" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#F9D1A4" />
        <stop offset="1" stopColor="#D68B6F" />
      </linearGradient>
      <linearGradient id="tedx-stage-face" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#24252A" />
        <stop offset=".55" stopColor="#11151B" />
        <stop offset="1" stopColor="#10151C" />
      </linearGradient>
      <linearGradient id="tedx-stage-floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#454046" />
        <stop offset=".45" stopColor="#25272C" />
        <stop offset="1" stopColor="#10151A" />
      </linearGradient>
      <linearGradient id="tedx-red-panel" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#750C25" />
        <stop offset=".48" stopColor="#F20A35" />
        <stop offset="1" stopColor="#8F152B" />
      </linearGradient>
      <radialGradient id="tedx-stage-glow">
        <stop offset="0" stopColor="#FF3154" stopOpacity=".55" />
        <stop offset=".36" stopColor="#EB0028" stopOpacity=".18" />
        <stop offset="1" stopColor="#EB0028" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="tedx-courtyard" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#566259" />
        <stop offset=".27" stopColor="#3A4743" />
        <stop offset="1" stopColor="#172126" />
      </linearGradient>
      <linearGradient id="tedx-audience-ground" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#30343A" />
        <stop offset=".34" stopColor="#1D242B" />
        <stop offset="1" stopColor="#0A1118" />
      </linearGradient>
      <filter id="tedx-soft-glow" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="10" />
      </filter>
      <filter id="tedx-light-blur" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="26" />
      </filter>
      <filter id="tedx-building-shadow" x="-30%" y="-30%" width="160%" height="180%">
        <feGaussianBlur stdDeviation="14" />
      </filter>
    </defs>

    {/* Evening sky: warm at the campus horizon, cooler and calmer above. */}
    <rect width="1440" height="900" fill="url(#tedx-sky)" />
    <rect width="1440" height="900" fill="url(#tedx-sunset)" />
    <path d="M0 526 C200 470 345 491 492 522 S770 548 925 499 S1212 501 1440 460" fill="none" stroke="#E5B19A" strokeOpacity=".18" strokeWidth="3" />

    {/* Low campus wings behind the main academic block. */}
    <g opacity=".78">
      <path d="M520 370 L728 328 L794 349 L794 584 L520 604Z" fill="#806263" />
      <path d="M520 370 L728 328 L794 349" fill="none" stroke="#D5AB97" strokeOpacity=".62" strokeWidth="4" />
      {Array.from({ length: 3 }, (_, row) => (
        <g key={'rear-row-' + row}>
          {Array.from({ length: 4 }, (_, col) => (
            <rect key={col} x={544 + col * 58} y={397 + row * 55 + col * 1.5} width="32" height="30" fill="#78919A" opacity=".54" stroke="#D4B49E" strokeOpacity=".42" strokeWidth="3" />
          ))}
        </g>
      ))}
      <path d="M521 478 L794 457 M521 535 L794 516" stroke="#E1C2AC" strokeOpacity=".28" strokeWidth="5" />
    </g>

    {/* Main IIMT-style academic block: terracotta and warm stone, not a generic dark tower. */}
    <g className="tedx-campus-building">
      <ellipse cx="1066" cy="604" rx="438" ry="39" fill="#080E12" opacity=".22" filter="url(#tedx-building-shadow)" />
      <path d="M720 261 L1076 170 L1300 221 L1300 600 L720 625Z" fill="url(#tedx-campus-front)" stroke="#E0B9A3" strokeOpacity=".34" strokeWidth="3" />
      <path d="M1300 221 L1414 264 L1414 575 L1300 600Z" fill="url(#tedx-campus-side)" stroke="#D3A995" strokeOpacity=".24" strokeWidth="2" />
      <path d="M720 261 L1076 170 L1414 264 L1300 221Z" fill="#D5B29F" opacity=".58" />
      <path d="M720 261 L1076 170 L1414 264" fill="none" stroke="#F0C8AD" strokeOpacity=".74" strokeWidth="5" />

      {/* Roof fascia and institutional sign band. */}
      <path d="M754 265 L1078 184 L1277 230 L1277 260 L1077 214 L754 293Z" fill="#E0B69E" opacity=".92" />
      <path d="M900 237 L1076 192 L1204 222 L1204 246 L1075 218 L900 261Z" fill="#9F6B62" opacity=".88" />
      <text x="1058" y="224" textAnchor="middle" fill="#4A3436" fontSize="25" fontFamily="Inter,Arial,sans-serif" fontWeight="900" letterSpacing="1.5">IIMT</text>
      <text x="1058" y="239" textAnchor="middle" fill="#684B4A" fontSize="6.5" fontFamily="Inter,Arial,sans-serif" fontWeight="750" letterSpacing="2.4">UNIVERSITY · MEERUT</text>

      {/* Repeating windows with cream frames and believable floor bands. */}
      {buildingWindows.map(({ row, column }) => {
        const x = 754 + (column * 61) - (row * 1.8);
        const y = 306 + (row * 47) + (column * 1.25);
        const warm = (row * 5 + column * 3) % 8 === 0 || (row === 3 && column === 5);
        return (
          <g key={row + '-' + column}>
            <rect x={x - 3} y={y - 3} width="35" height="33" fill="#D9B69F" opacity=".92" />
            <rect x={x} y={y} width="29" height="27" fill={warm ? 'url(#tedx-window-light)' : 'url(#tedx-glass)'} opacity={warm ? '.82' : '.92'} />
            <path d={`M${x + 14.5} ${y} V${y + 27} M${x} ${y + 20} H${x + 29}`} stroke="#4C4B4D" strokeOpacity=".64" strokeWidth="2" />
            <path d={`M${x + 2} ${y + 2} H${x + 27}`} stroke="#F3D6BE" strokeOpacity=".34" strokeWidth="1" />
          </g>
        );
      })}
      {Array.from({ length: 6 }, (_, index) => (
        <path key={'facade-pier-' + index} d={`M${740 + index * 102} 274 V617`} stroke="#E3BEA7" strokeOpacity=".26" strokeWidth="5" />
      ))}
      {Array.from({ length: 6 }, (_, row) => (
        <path key={'floor-band-' + row} d={`M730 ${300 + row * 48} L1300 ${264 + row * 48}`} stroke="#E6C5AE" strokeOpacity=".24" strokeWidth="5" />
      ))}
      <path d="M1309 253 L1400 288 V548 L1309 571Z" fill="#78595A" opacity=".72" />
      {Array.from({ length: 5 }, (_, row) => (
        <g key={'side-window-row-' + row}>
          {Array.from({ length: 2 }, (_, col) => (
            <rect key={col} x={1323 + col * 39 - row * 2} y={290 + row * 49} width="24" height="30" fill="#78919A" opacity=".68" stroke="#D8B69E" strokeOpacity=".5" strokeWidth="3" />
          ))}
        </g>
      ))}
      <path d="M731 623 L1300 600 L1414 575" fill="none" stroke="#E9C6AB" strokeOpacity=".62" strokeWidth="7" />
      <path d="M750 634 L1300 611 L1414 586" fill="none" stroke="#3C3034" strokeOpacity=".48" strokeWidth="12" />
      <path d="M790 635 L790 654 M1278 614 L1278 635 M1385 589 L1385 611" stroke="#B99686" strokeWidth="9" opacity=".74" />
    </g>

    {/* Campus entrance canopy and illuminated lobby: a recognisable institutional arrival point. */}
    <g className="tedx-campus-entry">
      <path d="M878 510 L1034 500 L1119 519 L963 534Z" fill="#D7B49C" />
      <path d="M963 534 L1119 519 L1119 616 L963 630Z" fill="#6E5050" />
      <path d="M878 510 L963 534 L963 630 L878 609Z" fill="#B78778" />
      <path d="M895 523 L950 537 V601 L895 586Z" fill="url(#tedx-glass)" stroke="#E9C9B2" strokeOpacity=".48" strokeWidth="4" />
      <path d="M980 543 L1100 532 V603 L980 615Z" fill="#24333B" stroke="#DAB9A3" strokeOpacity=".56" strokeWidth="5" />
      <path d="M1040 537 L1040 609" stroke="#D8B59F" strokeOpacity=".55" strokeWidth="4" />
      <path d="M967 534 L967 629" stroke="#E8C8AE" strokeWidth="7" />
      <path d="M1111 522 L1111 603" stroke="#D8B59F" strokeWidth="8" />
      <path d="M876 507 L1030 494 L1124 514" fill="none" stroke="#F6D5B9" strokeOpacity=".8" strokeWidth="5" />
      <rect x="1007" y="556" width="56" height="48" fill="#F0B985" opacity=".12" />
    </g>

    {/* Courtyard depth, walkway, low planters and campus lawns. */}
    <path d="M0 603 C195 573 392 603 554 600 C720 594 876 624 1027 602 C1190 578 1304 588 1440 557 L1440 900 L0 900Z" fill="url(#tedx-courtyard)" opacity=".88" />
    <path d="M0 650 C225 622 426 644 596 637 C770 630 1036 663 1440 619" fill="none" stroke="#C2A18C" strokeOpacity=".24" strokeWidth="4" />
    <path d="M0 707 C280 674 494 695 714 683 S1146 695 1440 653" fill="none" stroke="#D6C0AA" strokeOpacity=".14" strokeWidth="2" />
    <path d="M130 900 L548 610 M300 900 L650 614 M1160 900 L1040 620 M1378 900 L1135 613" stroke="#C2B5A5" strokeOpacity=".13" strokeWidth="2" />
    <path d="M0 728 C145 690 240 705 372 710 C487 715 585 692 688 698 L688 781 C510 775 360 801 0 805Z" fill="#29443B" opacity=".64" />
    <path d="M1260 700 C1340 680 1386 677 1440 664 L1440 794 C1360 800 1308 781 1228 784Z" fill="#2C473B" opacity=".58" />
    <path d="M0 727 C150 696 254 713 372 718 M1270 708 C1348 691 1397 687 1440 678" fill="none" stroke="#92A07E" strokeOpacity=".28" strokeWidth="3" />

    {/* Trees are built from individual fronds and branches rather than large black blobs. */}
    <g className="tedx-campus-foliage" opacity=".78">
      <path d="M0 536 C26 485 55 430 74 364 M39 465 L5 422 M51 427 L101 386 M70 388 L47 340 M18 500 L0 478" fill="none" stroke="#273B35" strokeWidth="13" strokeLinecap="round" />
      {Array.from({ length: 24 }, (_, index) => {
        const x = 12 + ((index * 37) % 148);
        const y = 360 + ((index * 29) % 132);
        const r = 10 + ((index * 7) % 10);
        const leafFill = ['#294039', '#35483E', '#405242', '#253B35'][index % 4];
        return <ellipse key={'leaf-' + index} cx={x} cy={y} rx={r * 1.5} ry={r} fill={leafFill} opacity=".78" transform={`rotate(${(index * 19) % 65 - 32} ${x} ${y})`} />;
      })}
    </g>
    {campusPalms.map((palm) => <PalmTree key={palm.x} {...palm} />)}

    {/* Outdoor event truss follows the building perspective and warm evening light. */}
    <g className="tedx-event-truss">
      <path d="M430 538 L1320 482" fill="none" stroke="#D5C1B3" strokeOpacity=".72" strokeWidth="4" />
      <path d="M430 544 L1320 488" fill="none" stroke="#20232A" strokeOpacity=".82" strokeWidth="7" />
      {Array.from({ length: 21 }, (_, index) => {
        const x = 450 + index * 42;
        const y = 537 - (index * 2.65);
        return (
          <g key={'bulb-' + index}>
            <path d={`M${x} ${y - 12} V${y + 3}`} stroke="#E0C3A9" strokeOpacity=".55" strokeWidth="1.5" />
            <circle cx={x} cy={y + 5} r="3.6" fill="#FFE1B6" />
            <circle cx={x} cy={y + 5} r="12" fill="#FFD09B" opacity=".26" filter="url(#tedx-soft-glow)" />
          </g>
        );
      })}
    </g>

    {/* Light cones remain soft and local: no opaque black patches. */}
    <g className="tedx-stage-lights">
      <path d="M610 535 L500 764 L646 760Z" fill="#F02A4D" opacity=".12" />
      <path d="M870 522 L806 764 L948 760Z" fill="#FFD0A3" opacity=".15" />
      <path d="M1168 506 L1230 752 L1370 739Z" fill="#F52A48" opacity=".13" />
      <ellipse cx="924" cy="746" rx="520" ry="76" fill="url(#tedx-stage-glow)" filter="url(#tedx-light-blur)" />
    </g>

    {/* Event stage is physically grounded in the courtyard with a visible deck, screen and red wings. */}
    <g className="tedx-event-stage">
      <path d="M462 551 L1262 500 L1360 547 L1360 716 L462 746Z" fill="#27262B" opacity=".74" />
      <path d="M462 551 L1262 500 L1360 547 L568 604Z" fill="#675A59" opacity=".7" />
      <path d="M568 604 L1360 547 L1360 700 L568 746Z" fill="url(#tedx-stage-face)" stroke="#D8B8A5" strokeOpacity=".34" strokeWidth="2" />
      <path d="M462 551 L568 604 L568 746 L462 697Z" fill="#34353B" />
      <path d="M462 697 L568 746 L1360 700" fill="none" stroke="#D6B7A4" strokeOpacity=".38" strokeWidth="3" />
      <path d="M486 707 L567 743 L1359 699" fill="none" stroke="#EB0028" strokeOpacity=".78" strokeWidth="3" />

      {[496, 640, 782, 1088, 1268].map((x, index) => (
        <g key={'stage-wing-' + index}>
          <path d={`M${x} ${566 - index * 3} L${x + 29} ${564 - index * 3} L${x + 29} 708 L${x} 712Z`} fill="url(#tedx-red-panel)" opacity={index % 2 ? '.86' : '1'} />
          <path d={`M${x + 29} ${564 - index * 3} L${x + 34} ${566 - index * 3} L${x + 34} 705 L${x + 29} 708Z`} fill="#5D1526" opacity=".86" />
          <path d={`M${x + 4} ${573 - index * 3} V${701}`} stroke="#FF8B91" strokeOpacity=".2" strokeWidth="2" />
        </g>
      ))}

      <path d="M684 589 L1197 555 L1197 667 L684 699Z" fill="#10151B" stroke="#D9B9A7" strokeOpacity=".46" strokeWidth="2" />
      <path d="M684 589 L1197 555" stroke="#F0C4AB" strokeOpacity=".38" strokeWidth="3" />
      <path d="M700 600 L1180 569" stroke="#EB0028" strokeOpacity=".8" strokeWidth="3" />
      <text x="940" y="627" textAnchor="middle" fill="#F20A35" fontSize="57" fontFamily="Inter,Arial,sans-serif" fontWeight="900" letterSpacing="-5">TEDx</text>
      <text x="940" y="656" textAnchor="middle" fill="#F8F2ED" fontSize="22" fontFamily="Inter,Arial,sans-serif" fontWeight="420" letterSpacing="-.5">IIMT University</text>
      <path d="M916 671 H964" stroke="#EB0028" strokeWidth="2" />

      {/* Speaker, podium and front stage monitors add scale and a lived-in event feel. */}
      <g transform="translate(936 646)">
        <ellipse cx="0" cy="63" rx="25" ry="6" fill="#EB0028" opacity=".3" />
        <circle cx="0" cy="0" r="7" fill="#30333A" />
        <path d="M-9 9 Q0 5 9 9 L12 43 L-12 43Z" fill="#343A43" />
        <path d="M-8 15 L-23 34 L-20 37 L-3 25 M8 15 L21 30 L18 34 L3 25" fill="none" stroke="#454C53" strokeWidth="5.5" strokeLinecap="round" />
        <path d="M-6 42 L-9 60 M6 42 L10 60" stroke="#212831" strokeWidth="6" strokeLinecap="round" />
        <path d="M-2 7 L-11 14" stroke="#EB0028" strokeWidth="2" />
      </g>
      <path d="M876 681 L901 680 L905 695 L872 697Z" fill="#070A0E" stroke="#68717A" strokeOpacity=".48" />
      <path d="M1070 672 L1105 669 L1110 687 L1067 690Z" fill="#070A0E" stroke="#68717A" strokeOpacity=".48" />
      <path d="M1104 671 L1114 663 L1118 686 L1110 687Z" fill="#161B22" />
    </g>

    {/* Softly-lit campus footpath lights and landscaped edges. */}
    <g className="tedx-campus-lights">
      {[342, 414, 1270, 1350].map((x, index) => (
        <g key={'path-light-' + index} transform={`translate(${x} ${index < 2 ? 713 : 692})`}>
          <path d="M0 0 V-38" stroke="#333C40" strokeWidth="4" />
          <path d="M-8 -38 H8" stroke="#C8B49C" strokeWidth="3" />
          <circle cx="0" cy="-39" r="4.5" fill="#FFDDB5" />
          <circle cx="0" cy="-39" r="15" fill="#FFD39B" opacity=".2" filter="url(#tedx-soft-glow)" />
        </g>
      ))}
      <path d="M0 748 C80 725 152 733 223 721 M1260 730 Q1350 705 1440 698" fill="none" stroke="#A4AF8E" strokeOpacity=".3" strokeWidth="5" />
    </g>

    {/* Audience rows use charcoal and blue-grey midtones with occasional red reflections, not solid black cut-outs. */}
    <path d="M0 780 C160 742 276 768 406 767 C568 757 690 787 837 770 C1000 751 1120 780 1255 753 C1320 742 1385 752 1440 741 L1440 900 L0 900Z" fill="url(#tedx-audience-ground)" />
    {audience.map((person, index) => {
      const tones = ['#171F29', '#202A34', '#25303A', '#141D26', '#30313A', '#20242B'];
      const tone = tones[person.shade];
      return (
        <g key={'guest-' + index} opacity={index < 32 ? '.92' : index < 64 ? '.84' : '.76'}>
          <path
            d={`M${person.x - person.width} ${person.y + 40} Q${person.x - person.width - 2} ${person.y + 11} ${person.x - 7} ${person.y + 9} L${person.x + 7} ${person.y + 9} Q${person.x + person.width + 3} ${person.y + 11} ${person.x + person.width} ${person.y + 40}Z`}
            fill={tone}
          />
          <ellipse cx={person.x} cy={person.y} rx={person.radius} ry={person.radius * 1.18} fill="#333943" />
          <path d={`M${person.x - 3} ${person.y - 2} Q${person.x} ${person.y - person.radius - 2} ${person.x + 3} ${person.y - 2}`} stroke="#B5A29A" strokeOpacity=".22" strokeWidth="2" fill="none" />
          {person.accent && (
            <path d={`M${person.x - 8} ${person.y + 14} Q${person.x} ${person.y + 10} ${person.x + 8} ${person.y + 14}`} fill="none" stroke="#B72943" strokeOpacity=".65" strokeWidth="3" />
          )}
        </g>
      );
    })}
  </svg>
);

const Hero = () => {
  const prefersReducedMotion = useReducedMotion();
  const { activeEdition, loading } = useEdition();

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

  const venueLabel = 'IIMT University, Meerut';

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.13, delayChildren: 0.18 },
    },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 22, filter: 'blur(7px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.76, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section className="tedx-hero" aria-label="TEDxIIMT University opening">
      <div className="tedx-hero__atmosphere" aria-hidden="true" />
      <StageArtwork />
      <div className="tedx-hero__vignette" aria-hidden="true" />
      <div className="tedx-hero__grid" aria-hidden="true" />

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
              <span>TED</span><sup>x</sup>
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
              <span className="tedx-hero__play" aria-hidden="true"><span /></span>
              Meet the Speakers
            </a>
          </Motion.div>

          <Motion.div variants={itemVariants} className="tedx-hero__meta">
            {formattedEventDate && (
              <span><CalendarDays aria-hidden="true" />{formattedEventDate}</span>
            )}
            <span><MapPin aria-hidden="true" />{venueLabel}</span>
          </Motion.div>
        </Motion.div>
      </div>

      <a className="tedx-hero__scroll" href="#home-statement-heading" aria-label="Scroll to explore the homepage">
        <span className="tedx-hero__scroll-icon"><ChevronDown aria-hidden="true" /></span>
        <span>SCROLL TO EXPLORE</span>
        <i aria-hidden="true" />
      </a>
    </section>
  );
};

export default Hero;
