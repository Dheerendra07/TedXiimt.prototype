import React from 'react';

/**
 * Signature 01: each I is its own silver stem and its own red, beveled cap.
 * The SVG occupies one em and sits on the text baseline, so neither initial
 * floats above or shrinks relative to the letters beside it.
 */
const SignatureInitial = ({ stemColor = '#E9EDF1' }) => (
  <span
    aria-hidden="true"
    style={{
      display: 'inline-block',
      width: '.4em',
      height: '1em',
      flex: '0 0 .4em',
      verticalAlign: 'baseline',
      lineHeight: 1,
      overflow: 'visible',
    }}
  >
    <svg
      viewBox="0 0 48 100"
      preserveAspectRatio="none"
      focusable="false"
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        overflow: 'visible',
      }}
    >
      {/* One distinct red cap per I — intentionally separated from its neighbour. */}
      <path d="M3 7 L45 2 L41 19 L7 23 Z" fill="#B90025" />
      <path d="M3 7 L45 2 L43 9 L4.5 14 Z" fill="#F12A49" />
      <path d="M4.5 14 L43 9" fill="none" stroke="#FF8296" strokeWidth="1.25" strokeLinecap="round" />
      <path d="M7 23 L41 19" fill="none" stroke="#760018" strokeWidth="1.7" />

      {/* Metallic upright and foot complete the I, sharing the same baseline. */}
      <path d="M17 22 L30 19 V91 H17 Z" fill={stemColor} />
      <path d="M17 22 L21 21.1 V89 H17 Z" fill="#FFFFFF" opacity=".34" />
      <path d="M29 19.3 V91" fill="none" stroke="#7C8792" strokeWidth="1.5" opacity=".55" />
      <path d="M10 90 H37 V100 H10 Z" fill={stemColor} />
      <path d="M10 90 H37" fill="none" stroke="#FFFFFF" strokeWidth="1.2" opacity=".42" />
      <path d="M35 92 V99" fill="none" stroke="#7C8792" strokeWidth="1.2" opacity=".65" />
    </svg>
  </span>
);

const SignatureLetters = ({ stemColor = '#E9EDF1' }) => (
  <span
    aria-hidden="true"
    style={{
      display: 'inline-flex',
      alignItems: 'baseline',
      gap: '.035em',
      whiteSpace: 'nowrap',
      font: 'inherit',
      lineHeight: 'inherit',
    }}
  >
    <SignatureInitial stemColor={stemColor} />
    <SignatureInitial stemColor={stemColor} />
    <span style={{ letterSpacing: '-.095em', lineHeight: 'inherit' }}>MT</span>
  </span>
);

/** Both independent I initials use Signature 01 and share the wordmark baseline. */
export const IIMTMark = ({
  className = '',
  stemColor = '#E9EDF1',
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
  stemColor = '#E9EDF1',
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
      gap: stacked ? '.08em' : '.035em',
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
