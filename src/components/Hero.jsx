import React, { useMemo } from 'react';
import { motion as Motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, CalendarDays, ChevronDown, MapPin } from 'lucide-react';
import { useEdition } from '../context/EditionContext';
import './Hero.css';

const audience = Array.from({ length: 52 }, (_, index) => {
  const row = Math.floor(index / 26);
  const column = index % 26;
  return {
    x: 270 + (column * 46) + (row * 18) + ((column % 3) * 6),
    y: 796 + (row * 43) + ((column % 4) * 7),
    radius: 7 + ((column * 3 + row) % 5),
    width: 24 + ((column * 7 + row) % 15),
    shade: (column + row) % 4,
  };
});

const buildingWindows = Array.from({ length: 48 }, (_, index) => ({
  row: Math.floor(index / 8),
  column: index % 8,
}));

const StageArtwork = () => (
  <svg
    className="tedx-hero-artwork"
    viewBox="0 0 1440 900"
    preserveAspectRatio="xMidYMid slice"
    role="presentation"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="tedx-sky" x1="0" y1="0" x2="0.9" y2="1">
        <stop offset="0" stopColor="#10151D" />
        <stop offset=".42" stopColor="#3A3036" />
        <stop offset=".72" stopColor="#9B655E" />
        <stop offset="1" stopColor="#17171B" />
      </linearGradient>
      <radialGradient id="tedx-sunset" cx="73%" cy="42%" r="58%">
        <stop offset="0" stopColor="#E6A28A" stopOpacity=".7" />
        <stop offset=".34" stopColor="#B87870" stopOpacity=".29" />
        <stop offset="1" stopColor="#B87870" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="tedx-building-front" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#76636A" />
        <stop offset=".42" stopColor="#4F454C" />
        <stop offset="1" stopColor="#292A31" />
      </linearGradient>
      <linearGradient id="tedx-building-side" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#302E36" />
        <stop offset="1" stopColor="#171A21" />
      </linearGradient>
      <linearGradient id="tedx-window" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#F4C4A7" stopOpacity=".52" />
        <stop offset="1" stopColor="#9DB0BC" stopOpacity=".16" />
      </linearGradient>
      <linearGradient id="tedx-stage-face" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#171719" />
        <stop offset="1" stopColor="#050506" />
      </linearGradient>
      <linearGradient id="tedx-red-panel" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#7B001B" />
        <stop offset=".5" stopColor="#F20A35" />
        <stop offset="1" stopColor="#8E001F" />
      </linearGradient>
      <radialGradient id="tedx-stage-glow">
        <stop offset="0" stopColor="#FF2449" stopOpacity=".65" />
        <stop offset=".34" stopColor="#EB0028" stopOpacity=".18" />
        <stop offset="1" stopColor="#EB0028" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="tedx-ground" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#17171B" />
        <stop offset="1" stopColor="#030405" />
      </linearGradient>
      <filter id="tedx-soft-glow" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="12" />
      </filter>
      <filter id="tedx-light-blur" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="24" />
      </filter>
    </defs>

    <rect width="1440" height="900" fill="url(#tedx-sky)" />
    <rect width="1440" height="900" fill="url(#tedx-sunset)" />
    <path d="M0 535 C150 455 244 472 354 530 S560 561 690 500 S980 490 1100 525 S1310 545 1440 475 L1440 900 L0 900Z" fill="#0B1117" opacity=".56" />

    {/* Distant campus skyline */}
    <g fill="#1B2027" opacity=".65">
      <path d="M0 462 L58 425 L112 453 L165 402 L224 445 L273 414 L330 458 L330 594 L0 620Z" />
      <path d="M1040 443 L1090 404 L1132 436 L1175 394 L1220 435 L1276 402 L1320 442 L1380 416 L1440 454 L1440 640 L1030 640Z" />
    </g>

    {/* IIMT campus facade */}
    <g className="tedx-campus-building">
      <path d="M748 236 L1106 154 L1309 206 L1309 588 L748 588Z" fill="url(#tedx-building-front)" stroke="#B9978F" strokeOpacity=".3" />
      <path d="M1309 206 L1415 252 L1415 584 L1309 588Z" fill="url(#tedx-building-side)" stroke="#B9978F" strokeOpacity=".18" />
      <path d="M748 236 L1106 154 L1415 252 L1309 206Z" fill="#8C7374" opacity=".52" />
      <path d="M748 236 L1106 154 L1415 252" fill="none" stroke="#E0B1A0" strokeOpacity=".42" strokeWidth="3" />
      <path d="M748 588 L1309 588 L1415 584" fill="none" stroke="#D9B1A1" strokeOpacity=".19" strokeWidth="4" />
      {buildingWindows.map(({ row, column }) => {
        const x = 780 + (column * 64) - (row * 3);
        const y = 270 + (row * 49) + (column * 1.1);
        const warm = (row * 5 + column * 3) % 7 === 0;
        return (
          <g key={row + '-' + column}>
            <rect x={x} y={y} width="34" height="29" fill={warm ? '#F1B996' : 'url(#tedx-window)'} opacity={warm ? '.48' : '.62'} />
            <path d={`M${x + 17} ${y} V${y + 29} M${x} ${y + 22} H${x + 34}`} stroke="#20232A" strokeOpacity=".5" strokeWidth="2" />
          </g>
        );
      })}
      {Array.from({ length: 5 }, (_, index) => (
        <path key={'column-' + index} d={`M${755 + index * 111} 236 V588`} stroke="#E1C1B6" strokeOpacity=".18" strokeWidth="5" />
      ))}
      <path d="M1327 259 L1391 284 V562 L1327 566Z" fill="#121720" opacity=".6" />
      {Array.from({ length: 5 }, (_, row) => (
        <g key={'side-' + row} opacity=".55">
          {Array.from({ length: 2 }, (_, column) => (
            <rect key={column} x={1336 + column * 37 - row * 2} y={286 + row * 51} width="22" height="30" fill="#B7A5A5" opacity=".36" />
          ))}
        </g>
      ))}
      <path d="M1044 169 L1044 126 L1175 126 L1175 188" fill="none" stroke="#25252B" strokeWidth="7" />
      <text x="1105" y="145" textAnchor="middle" fill="#17191F" fontSize="43" fontFamily="Inter,Arial,sans-serif" fontWeight="900" letterSpacing="-4">IIMT</text>
      <text x="1107" y="164" textAnchor="middle" fill="#25232A" fontSize="8" fontFamily="Inter,Arial,sans-serif" fontWeight="700" letterSpacing="2">UNIVERSITY</text>
    </g>

    {/* Tree silhouettes frame the campus without covering the stage */}
    <g fill="#070D12" opacity=".88">
      <path d="M0 100 C76 48 124 86 163 56 C199 29 242 54 267 90 C312 76 350 111 354 154 C412 145 436 191 413 235 C457 247 459 287 428 312 C455 352 415 393 362 375 C325 427 270 407 240 380 C199 418 149 389 144 357 C97 384 45 357 48 320 C5 307 -7 272 29 236 C-7 206 -7 155 25 136Z" />
      <path d="M1380 120 C1325 80 1281 113 1257 81 C1214 68 1174 96 1173 133 C1124 130 1090 166 1110 205 C1062 222 1075 267 1117 279 C1085 322 1124 357 1165 340 C1196 386 1250 365 1271 339 C1320 371 1371 341 1368 304 C1422 298 1446 250 1405 221 C1441 180 1428 143 1380 120Z" />
      <path d="M34 350 C45 286 51 224 65 162 M65 229 L18 179 M63 260 L108 199 M1374 356 L1370 187 M1370 246 L1323 202 M1371 276 L1423 220" fill="none" stroke="#070D12" strokeWidth="17" strokeLinecap="round" />
    </g>

    {/* Event truss and warm festoon lights */}
    <path d="M420 530 L1325 470" fill="none" stroke="#D0B9AC" strokeOpacity=".48" strokeWidth="3" />
    <path d="M420 536 L1325 476" fill="none" stroke="#0A0B0E" strokeWidth="8" opacity=".72" />
    {Array.from({ length: 20 }, (_, index) => {
      const x = 445 + index * 45;
      const y = 532 - (index * 3);
      return (
        <g key={'bulb-' + index}>
          <path d={`M${x} ${y - 11} V${y + 4}`} stroke="#D5BCAD" strokeOpacity=".28" />
          <circle cx={x} cy={y + 5} r="4.2" fill="#FFD8A6" opacity=".9" />
          <circle cx={x} cy={y + 5} r="14" fill="#FFC58A" opacity=".23" filter="url(#tedx-soft-glow)" />
        </g>
      );
    })}

    {/* Stage lights: fixed, slow breathing glow */}
    <g className="tedx-stage-lights">
      <path d="M620 535 L470 766 L570 768Z" fill="#E11A3C" opacity=".08" />
      <path d="M850 520 L780 765 L900 765Z" fill="#F6B58D" opacity=".09" />
      <path d="M1130 506 L1215 765 L1320 765Z" fill="#EB0028" opacity=".1" />
      <ellipse cx="884" cy="744" rx="520" ry="80" fill="url(#tedx-stage-glow)" filter="url(#tedx-light-blur)" />
    </g>

    {/* TEDx stage, designed as a real layered scene rather than a flattened image */}
    <g className="tedx-event-stage">
      <path d="M470 552 L1268 500 L1360 548 L1360 728 L470 728Z" fill="#060608" opacity=".88" />
      <path d="M470 552 L1268 500 L1360 548 L566 603Z" fill="#343034" opacity=".65" />
      <path d="M566 603 L1360 548 L1360 710 L566 744Z" fill="#0B0C10" stroke="#C8A8A0" strokeOpacity=".18" />
      <path d="M470 552 L566 603 L566 744 L470 696Z" fill="#131419" />
      <path d="M566 603 L1360 548" stroke="#E8B9A4" strokeOpacity=".4" strokeWidth="2" />
      <path d="M566 744 L1360 710" stroke="#F3C3A7" strokeOpacity=".22" strokeWidth="2" />

      {[510, 655, 805, 1080, 1265].map((x, index) => (
        <g key={'red-pillar-' + index}>
          <path d={`M${x} ${568 - index * 3} L${x + 26} ${566 - index * 3} L${x + 26} 710 L${x} 714Z`} fill="url(#tedx-red-panel)" opacity={index % 2 ? '.78' : '.96'} />
          <path d={`M${x + 26} ${566 - index * 3} L${x + 31} ${568 - index * 3} L${x + 31} 707 L${x + 26} 710Z`} fill="#3E0B17" />
        </g>
      ))}

      <path d="M690 590 L1190 558 L1190 673 L690 699Z" fill="url(#tedx-stage-face)" stroke="#BBA09C" strokeOpacity=".22" />
      <path d="M690 590 L1190 558" stroke="#EB0028" strokeOpacity=".6" strokeWidth="2" />
      <text x="940" y="632" textAnchor="middle" fill="#F20A35" fontSize="58" fontFamily="Inter,Arial,sans-serif" fontWeight="900" letterSpacing="-5">TEDx</text>
      <text x="940" y="661" textAnchor="middle" fill="#F5F1EF" fontSize="23" fontFamily="Inter,Arial,sans-serif" fontWeight="400" letterSpacing="-.5">IIMT University</text>
      <path d="M915 677 H965" stroke="#EB0028" strokeWidth="2" />

      {/* One speaker silhouette, kept intentionally understated */}
      <g transform="translate(937 651)">
        <ellipse cx="0" cy="58" rx="24" ry="5" fill="#EB0028" opacity=".24" />
        <circle cx="0" cy="0" r="7" fill="#11151A" />
        <path d="M-9 9 Q0 5 9 9 L12 43 L-12 43Z" fill="#141920" />
        <path d="M-8 15 L-22 34 L-19 37 L-3 25 M8 15 L21 30 L18 34 L3 25" fill="none" stroke="#202833" strokeWidth="6" strokeLinecap="round" />
        <path d="M-6 42 L-9 59 M6 42 L10 59" stroke="#11161C" strokeWidth="6" strokeLinecap="round" />
        <path d="M-3 7 L-11 14" stroke="#EB0028" strokeWidth="2" />
      </g>

      <path d="M440 735 L1370 703 L1440 738 L508 780Z" fill="#111318" />
      <path d="M508 780 L1440 738" stroke="#D3B1A4" strokeOpacity=".2" strokeWidth="3" />
      <path d="M510 781 L1440 742" stroke="#EB0028" strokeOpacity=".62" strokeWidth="2" />
    </g>

    {/* Foreground audience */}
    <path d="M0 790 C150 748 253 770 366 782 C512 763 619 812 775 787 C931 758 1065 806 1185 777 C1284 758 1370 777 1440 755 L1440 900 L0 900Z" fill="url(#tedx-ground)" />
    {audience.map((person, index) => {
      const tone = ['#080B10', '#10151B', '#151820', '#1B1B22'][person.shade];
      return (
        <g key={'guest-' + index} opacity={index < 26 ? '.94' : '.8'}>
          <path
            d={`M${person.x - person.width} ${person.y + 37} Q${person.x - person.width - 2} ${person.y + 8} ${person.x - 8} ${person.y + 8} L${person.x + 8} ${person.y + 8} Q${person.x + person.width + 5} ${person.y + 10} ${person.x + person.width} ${person.y + 37}Z`}
            fill={tone}
          />
          <ellipse cx={person.x} cy={person.y} rx={person.radius} ry={person.radius * 1.18} fill="#080B10" />
          <path d={`M${person.x - 2} ${person.y - 3} Q${person.x} ${person.y - 8} ${person.x + 4} ${person.y - 2}`} stroke="#77717A" strokeOpacity=".18" strokeWidth="2" fill="none" />
        </g>
      );
    })}
    <path d="M0 850 C230 812 373 845 532 826 S865 850 1020 824 S1285 830 1440 812" fill="none" stroke="#29282E" strokeOpacity=".34" strokeWidth="3" />
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
