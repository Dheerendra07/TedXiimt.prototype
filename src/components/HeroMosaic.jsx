import React, { useState } from 'react';

const COLUMNS = 8;
const ROWS = 6;

// Opening state: the two tiles visible in the source video's first frame.
const FIRST_FRAME = new Map([
  [13, { pattern: 0, tone: 'is-violet' }],
  [20, { pattern: 1, tone: 'is-lilac' }],
]);

// Irregular connected tile clusters: the active patch follows the pointer.
const CLUSTERS = [
  ['0010', '1111', '1011', '1000'],
  ['0110', '1110', '0111', '0010'],
  ['1110', '0010', '0111', '0100'],
  ['1100', '1110', '0011', '0110'],
];

// 12 × 12 bitmap textures based on the reference: staggered bands, pixel
// fragments and stepped edges. 1 = white, 2 = cool white, 3 = soft lavender.
const PIXEL_PATTERNS = [
  [
    '000110001100', '000110001100', '001100011000', '001100011000',
    '000011100110', '000011100110', '001100011100', '001100001100',
    '000111000110', '000111000110', '000011001100', '000000000000',
  ],
  [
    '222222000000', '000000000000', '111111111000', '000000000000',
    '111100000000', '000000000000', '111111111111', '000000000000',
    '222222000000', '000000000000', '111100000000', '000000000000',
  ],
  [
    '111100000000', '111111000000', '001111111000', '000011111110',
    '000001111110', '000000111100', '000000000000', '000001100000',
    '000011110000', '000111111000', '001111111100', '000000000000',
  ],
  [
    '000000000000', '000000000000', '000000000000', '000001100000',
    '000011110000', '000110011000', '001100001100', '011000000110',
    '111111111111', '222222222222', '000000000000', '000000000000',
  ],
  [
    '000000000000', '111111000000', '000000000000', '111111111000',
    '000000000000', '111100000000', '000000000000', '222222222000',
    '000000000000', '111111111111', '000000000000', '000000000000',
  ],
  [
    '000000000000', '000000000000', '000000000000', '000003300000',
    '000003300000', '000000000000', '000000000000', '001100001100',
    '011110011110', '110011110011', '111111111111', '000000000000',
  ],
  [
    '000000000000', '111100000000', '111111100000', '000011111000',
    '000000111100', '000000011110', '000000001111', '000000011110',
    '000000111100', '000011111000', '111111100000', '111100000000',
  ],
  [
    '000000000000', '111111111000', '000000000000', '001111111111',
    '000000000000', '111111100000', '000000000000', '000011111111',
    '000000000000', '111111111000', '000000000000', '000000000000',
  ],
];

const GRID = Array.from({ length: COLUMNS * ROWS }, (_, index) => ({
  index,
  row: Math.floor(index / COLUMNS),
  column: index % COLUMNS,
}));

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const PixelPattern = ({ patternIndex }) => {
  const runs = [];

  PIXEL_PATTERNS[patternIndex].forEach((line, y) => {
    let x = 0;
    while (x < line.length) {
      const tone = line[x];
      if (tone === '0') {
        x += 1;
        continue;
      }

      let end = x + 1;
      while (end < line.length && line[end] === tone) end += 1;
      runs.push({ x, y, width: end - x, tone });
      x = end;
    }
  });

  return (
    <svg
      className="tedx-hero__mosaic-pattern"
      viewBox="0 0 12 12"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      {runs.map(({ x, y, width, tone }) => (
        <rect
          key={x + '-' + y}
          className={'tedx-hero__mosaic-pixel tedx-hero__mosaic-pixel--' + tone}
          x={x}
          y={y}
          width={width}
          height="1"
        />
      ))}
    </svg>
  );
};

const HeroMosaic = () => {
  const [focusedCellIndex, setFocusedCellIndex] = useState(-1);

  const getCellVisual = ({ index, row, column }) => {
    if (focusedCellIndex < 0) {
      const restingTile = FIRST_FRAME.get(index);
      return restingTile
        ? { state: 'is-active ' + restingTile.tone, pattern: restingTile.pattern, delay: 0 }
        : null;
    }

    const pointerRow = Math.floor(focusedCellIndex / COLUMNS);
    const pointerColumn = focusedCellIndex % COLUMNS;
    const shapeIndex = (pointerRow + pointerColumn) % CLUSTERS.length;
    const shape = CLUSTERS[shapeIndex];
    const top = clamp(pointerRow - 1, 0, ROWS - 4);
    const left = clamp(pointerColumn - 2, 0, COLUMNS - 4);
    const localRow = row - top;
    const localColumn = column - left;

    if (localRow < 0 || localRow >= 4 || localColumn < 0 || localColumn >= 4) return null;
    if (shape[localRow][localColumn] !== '1') return null;

    const pattern = (localRow * 3 + localColumn * 5 + shapeIndex) % PIXEL_PATTERNS.length;
    const tone = (localRow + localColumn + shapeIndex) % 6 === 0 ? 'is-lilac' : 'is-violet';
    const delay = (Math.abs(localRow - 1) + Math.abs(localColumn - 2)) * 18;

    return {
      state: 'is-active ' + tone,
      pattern,
      delay: Math.min(delay, 72),
    };
  };

  const cellFromEvent = (event) => {
    if (event.pointerType === 'touch') return;
    const cell = event.target?.closest?.('[data-mosaic-index]');
    if (!cell) return;
    const nextIndex = Number(cell.dataset.mosaicIndex);
    setFocusedCellIndex((current) => (current === nextIndex ? current : nextIndex));
  };

  const handlePointerLeave = () => setFocusedCellIndex(-1);

  return (
    <div
      className="tedx-hero__mosaic"
      data-testid="tedx-hero-mosaic"
      aria-hidden="true"
      onPointerMove={cellFromEvent}
      onPointerDown={cellFromEvent}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerLeave}
    >
      {GRID.map((cell) => {
        const visual = getCellVisual(cell);

        return (
          <span
            key={cell.index}
            className={'tedx-hero__mosaic-cell' + (visual ? ' ' + visual.state : '')}
            data-mosaic-index={cell.index}
            style={{ '--mosaic-delay': (visual?.delay ?? 0) + 'ms' }}
          >
            {visual && <PixelPattern patternIndex={visual.pattern} />}
          </span>
        );
      })}
    </div>
  );
};

export default HeroMosaic;
