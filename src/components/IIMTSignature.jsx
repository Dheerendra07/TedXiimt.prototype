import React, { useId } from 'react';

/**
 * Signature 01: a proportionate silver I with a solid TEDx-red angled cap.
 * A normal capital-height silhouette keeps each I balanced beside M and T.
 */
const SignatureInitial = ({ stemColor = '#E3E6EB' }) => {
  const silverGradientId = useId().replace(/[^a-zA-Z0-9_-]/g, '');

  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-block',
        width: '.22em',
        height: '.70em',
        flex: '0 0 .22em',
        verticalAlign: 'baseline',
        lineHeight: 1,
        overflow: 'visible',
      }}
    >
      <svg
        viewBox="0 0 63 200"
        focusable="false"
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          overflow: 'visible',
        }}
      >
        <defs>
          <linearGradient id={silverGradientId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#AEB8C4" />
            <stop offset=".2" stopColor="#F5F7FA" />
            <stop offset=".48" stopColor={stemColor} />
            <stop offset=".78" stopColor="#D2D9E1" />
            <stop offset="1" stopColor="#98A4B1" />
          </linearGradient>
        </defs>

        {/* Flat TEDx-red cap; its lower edge is one clean diagonal. */}
        <path d="M0 0 H63 V42 L0 70 Z" fill="#EB0028" />

        {/* Straight metallic stem, clipped to the same diagonal boundary. */}
        <path d="M0 70 L63 42 V200 H0 Z" fill={'url(#' + silverGradientId + ')'} />
        <path d="M0 70 L7.5 66.7 V200 H0 Z" fill="#FFFFFF" opacity=".18" />
        <path
          d="M61.8 42.8 V199"
          fill="none"
          stroke="#788592"
          strokeWidth="1"
          opacity=".42"
        />
      </svg>
    </span>
  );
};

const SignatureLetters = ({ stemColor = '#E3E6EB' }) => (
  <span
    aria-hidden="true"
    style={{
      display: 'inline-flex',
      alignItems: 'baseline',
      gap: '.08em',
      whiteSpace: 'nowrap',
      font: 'inherit',
      lineHeight: 'inherit',
    }}
  >
    <SignatureInitial stemColor={stemColor} />
    <SignatureInitial stemColor={stemColor} />
    <span style={{ letterSpacing: '-.075em', lineHeight: 'inherit' }}>MT</span>
  </span>
);

/** Both independent I initials use Signature 01 and share the wordmark baseline. */
export const IIMTMark = ({
  className = '',
  stemColor = '#E3E6EB',
  style = {},
}) => (
  <span
    className={className}
    role="img"
    aria-label="IIMT"
    style={{
      display: 'inline-flex',
      alignItems: 'baseline',
      verticalAlign: 'baseline',
      whiteSpace: 'nowrap',
      fontFamily: 'inherit',
      fontSize: 'inherit',
      fontWeight: 'inherit',
      lineHeight: 'inherit',
      ...style,
    }}
  >
    <SignatureLetters stemColor={stemColor} />
  </span>
);

/** Consistent TEDx + IIMT lockup for shared navigation, footer and page headings. */
export const TEDxIIMTWordmark = ({
  className = '',
  subline = '',
  stacked = false,
  fontSize = 'inherit',
  color = 'currentColor',
  prefixColor = '#EB0028',
  stemColor = '#E3E6EB',
  sublineColor = 'currentColor',
  style = {},
}) => (
  <span
    className={className}
    role="img"
    aria-label={subline ? `TEDxIIMT ${subline}` : 'TEDxIIMT'}
    style={{
      display: 'inline-flex',
      flexDirection: stacked ? 'column' : 'row',
      alignItems: stacked ? 'flex-start' : 'baseline',
      gap: stacked ? '.08em' : '.06em',
      whiteSpace: 'nowrap',
      verticalAlign: 'baseline',
      fontSize,
      fontWeight: 'inherit',
      lineHeight: stacked ? '.94' : '1',
      color,
      ...style,
    }}
  >
    <span
      aria-hidden="true"
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        whiteSpace: 'nowrap',
        lineHeight: 'inherit',
      }}
    >
      <span style={{ color: prefixColor, fontWeight: 900, letterSpacing: '-.11em' }}>
        TED<span style={{ fontSize: '.84em', letterSpacing: '-.07em' }}>x</span>
      </span>
      <SignatureLetters stemColor={stemColor} />
    </span>
    {subline ? (
      <span
        aria-hidden="true"
        style={{
          color: sublineColor,
          fontSize: stacked ? '.34em' : '.42em',
          fontWeight: 750,
          letterSpacing: '.22em',
          lineHeight: 1,
          textTransform: 'uppercase',
          marginLeft: stacked ? 0 : '.2em',
        }}
      >
        {subline}
      </span>
    ) : null}
  </span>
);

export default IIMTMark;
