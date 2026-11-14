import React, { useMemo, useState } from 'react';

const MOSAIC_COLUMNS = 18;
const MOSAIC_ROWS = 17;

// Small, repeatable pixel compositions based on the supplied video reference.
const PIXEL_PATTERNS = [
  [
    '0000110000', '0001111000', '0011111100', '0001111000', '0000110000',
    '0000110000', '0011111100', '0001111000', '0000110000', '0000000000',
  ],
  [
    '0000000000', '1111000011', '0000000000', '1111111111', '0000000000',
    '0011111100', '0000000000', '1111000011', '0000000000', '0000000000',
  ],
  [
    '0000000000', '0000000011', '0000000110', '0000001100', '0000011000',
    '0000110000', '0001100000', '0011000000', '0110000000', '1100000000',
  ],
  [
    '0000000000', '0011001100', '0011001100', '0000000000', '1111111111',
    '1111111111', '0000000000', '0011001100', '0011001100', '0000000000',
  ],
  [
    '0000000000', '0000000000', '0011000000', '0011000000', '0011000000',
    '0011111111', '0000000011', '0000000011', '0000000011', '0000000000',
  ],
  [
    '0000000000', '0110000000', '0110000000', '0110000000', '0111111000',
    '0000011000', '0000011000', '0000011000', '0000011000', '0000000000',
  ],
];

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
  const cells = useMemo(
    () => Array.from({ length: MOSAIC_COLUMNS * MOSAIC_ROWS }, (_, index) => ({
      index,
      row: Math.floor(index / MOSAIC_COLUMNS),
      column: index % MOSAIC_COLUMNS,
    })),
    [],
  );

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

  const focusedRow = focusedCellIndex >= 0
    ? Math.floor(focusedCellIndex / MOSAIC_COLUMNS)
    : -1;
  const focusedColumn = focusedCellIndex >= 0
    ? focusedCellIndex % MOSAIC_COLUMNS
    : -1;

  return (
    <div
      className="tedx-hero__mosaic"
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => setFocusedCellIndex(-1)}
      onPointerLeave={() => setFocusedCellIndex(-1)}
    >
      {cells.map(({ index, row, column }) => {
        const distance = focusedCellIndex < 0
          ? -1
          : Math.abs(row - focusedRow) + Math.abs(column - focusedColumn);
        const isWave = distance === 2
          || (distance === 3 && (row + column + focusedRow + focusedColumn) % 2 === 0);
        const visualState = distance === 0
          ? 'is-active'
          : distance === 1
            ? 'is-near'
            : isWave
              ? 'is-wave'
              : '';
        const patternIndex = (index + Math.max(0, focusedCellIndex) + Math.max(0, distance)) % PIXEL_PATTERNS.length;
        const revealDelay = distance >= 0 ? Math.min(distance * 22, 66) : 0;

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
