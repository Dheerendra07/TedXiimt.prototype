import React, { useState } from 'react';

const MOSAIC_COLUMNS = 8;
const MOSAIC_ROWS = 6;

// The resting layout is the first-frame composition from the supplied reference.
// Pointer movement temporarily rebuilds the same compact cluster around the cursor.
const DEFAULT_COMPOSITION = new Map([
  [11, { state: 'is-near', pattern: 3 }],
  [13, { state: 'is-active', pattern: 1 }],
  [18, { state: 'is-near', pattern: 4 }],
  [19, { state: 'is-active', pattern: 5 }],
  [20, { state: 'is-near', pattern: 2 }],
  [26, { state: 'is-wave', pattern: 0 }],
  [27, { state: 'is-active', pattern: 6 }],
  [28, { state: 'is-near', pattern: 7 }],
  [34, { state: 'is-wave', pattern: 4 }],
]);

const PIXEL_PATTERNS = [
  [
    '0000011000', '0000011000', '0000011000', '1111111111',
    '1111111111', '0000011000', '0000011000', '0000011000',
    '0000011000', '0000000000',
  ],
  [
    '0000000000', '0000000011', '0000001110', '0000111000',
    '0011100000', '0110000000', '1100000000', '0000000000',
    '0000000000', '0000000000',
  ],
  [
    '0000000000', '1111000011', '0000000000', '1111111111',
    '0000000000', '0011111100', '0000000000', '1111000011',
    '0000000000', '0000000000',
  ],
  [
    '0000000000', '0011001100', '0011001100', '0000000000',
    '1111111111', '1111111111', '0000000000', '0011001100',
    '0011001100', '0000000000',
  ],
  [
    '0000000000', '0000000000', '0011000000', '0011000000',
    '0011000000', '0011111111', '0000000011', '0000000011',
    '0000000011', '0000000000',
  ],
  [
    '0000000000', '0110000000', '0110000000', '0110000000',
    '0111111000', '0000011000', '0000011000', '0000011000',
    '0000011000', '0000000000',
  ],
  [
    '0000000000', '0011111100', '0111111110', '1110011011',
    '1110011011', '0111111110', '0011111100', '0001100000',
    '0011110000', '0000000000',
  ],
  [
    '0000000000', '1100000011', '0110000110', '0011001100',
    '0001111000', '0001111000', '0011001100', '0110000110',
    '1100000011', '0000000000',
  ],
];

const GRID_CELLS = Array.from({ length: MOSAIC_COLUMNS * MOSAIC_ROWS }, (_, index) => ({
  index,
  row: Math.floor(index / MOSAIC_COLUMNS),
  column: index % MOSAIC_COLUMNS,
}));

const PixelPattern = ({ patternIndex }) => {
  const pixels = [];
  PIXEL_PATTERNS[patternIndex].forEach((line, y) => {
    line.split('').forEach((bit, x) => {
      if (bit !== '1') return;
      const tone = (x + y + patternIndex) % 11 === 0
        ? 'soft'
        : (x * 2 + y + patternIndex) % 13 === 0
          ? 'dim'
          : 'bright';
      pixels.push({ x, y, tone });
    });
  });

  return (
    <svg
      className="tedx-hero__mosaic-pattern"
      viewBox="0 0 10 10"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      {pixels.map(({ x, y, tone }) => (
        <rect
          key={x + '-' + y}
          className={'tedx-hero__mosaic-pixel tedx-hero__mosaic-pixel--' + tone}
          x={x + 0.08}
          y={y + 0.08}
          width="0.84"
          height="0.84"
        />
      ))}
    </svg>
  );
};

const HeroMosaic = () => {
  const [focusedCellIndex, setFocusedCellIndex] = useState(-1);

  const focusCellFromEvent = (event) => {
    const target = event.target;
    const cell = target && typeof target.closest === 'function'
      ? target.closest('[data-mosaic-index]')
      : null;
    if (!cell) return;

    const nextIndex = Number(cell.dataset.mosaicIndex);
    setFocusedCellIndex((current) => (current === nextIndex ? current : nextIndex));
  };

  const handlePointerMove = (event) => {
    if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    focusCellFromEvent(event);
  };

  const handlePointerDown = (event) => {
    if (event.pointerType === 'touch') focusCellFromEvent(event);
  };

  const handlePointerUp = (event) => {
    if (event.pointerType === 'touch') setFocusedCellIndex(-1);
  };

  const handlePointerLeave = () => setFocusedCellIndex(-1);

  const focusedRow = focusedCellIndex >= 0
    ? Math.floor(focusedCellIndex / MOSAIC_COLUMNS)
    : -1;
  const focusedColumn = focusedCellIndex >= 0
    ? focusedCellIndex % MOSAIC_COLUMNS
    : -1;

  return (
    <div
      className="tedx-hero__mosaic"
      data-testid="tedx-hero-mosaic"
      aria-hidden="true"
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerLeave}
      onPointerLeave={handlePointerLeave}
    >
      {GRID_CELLS.map(({ index, row, column }) => {
        let visualState = '';
        let patternIndex = 0;
        let revealDelay = 0;

        if (focusedCellIndex < 0) {
          const restingCell = DEFAULT_COMPOSITION.get(index);
          if (restingCell) {
            visualState = restingCell.state;
            patternIndex = restingCell.pattern;
          }
        } else {
          const distance = Math.abs(row - focusedRow) + Math.abs(column - focusedColumn);
          const isWave = distance === 2
            && (row + column + focusedRow + focusedColumn) % 2 === 0;

          visualState = distance === 0
            ? 'is-active'
            : distance === 1
              ? 'is-near'
              : isWave
                ? 'is-wave'
                : '';

          if (visualState) {
            patternIndex = (index * 3 + focusedCellIndex * 5 + distance) % PIXEL_PATTERNS.length;
            revealDelay = Math.min(distance * 24, 72);
          }
        }

        return (
          <span
            key={index}
            className={'tedx-hero__mosaic-cell' + (visualState ? ' ' + visualState : '')}
            data-mosaic-index={index}
            style={{ '--mosaic-delay': revealDelay + 'ms' }}
          >
            {visualState && <PixelPattern patternIndex={patternIndex} />}
          </span>
        );
      })}
    </div>
  );
};

export default HeroMosaic;
