import React from 'react';

const SignatureGlyph = ({ stemColor = 'currentColor' }) => (
  <svg
    viewBox="0 0 42 72"
    aria-hidden="true"
    focusable="false"
    style={{
      display: 'inline-block',
      width: '0.43em',
      height: '1.08em',
      marginRight: '-0.025em',
      verticalAlign: '-0.13em',
      flex: '0 0 auto',
      overflow: 'visible',
    }}
  >
    {/* Signature 01: the red angled cap is the only transformed initial. */}
    <path d="M8 23 L33 16 V68 H8 Z" fill={stemColor} />
    <path d="M8 7 H34 V18 L8 26 Z" fill="#EB0028" />
    <path d="M8 7 H34" stroke="#FF7186" strokeWidth="1.25" strokeLinecap="round" />
    <path d="M10.8 28 V65" stroke="#FFFFFF" strokeOpacity=".24" strokeWidth="1.2" />
    <path d="M32.5 17 V68" stroke="#000000" strokeOpacity=".2" strokeWidth="1.25" />
    <path d="M8 23 L33 16" stroke="#A90020" strokeOpacity=".72" strokeWidth=".8" />
  </svg>
);

const SignatureLetters = ({ stemColor = 'currentColor' }) => (
  <span
    aria-hidden="true"
    style={{
      display: 'inline-flex',
      alignItems: 'baseline',
      whiteSpace: 'nowrap',
      font: 'inherit',
      lineHeight: 'inherit',
    }}
  >
    <SignatureGlyph stemColor={stemColor} />
    <span style={{ letterSpacing: '-.095em', lineHeight: 1 }}>IMT</span>
  </span>
);

/** First I in IIMT uses Signature 01; the second I remains ordinary typography. */
export const IIMTMark = ({ className = '', stemColor = 'currentColor', style = {} }) => (
  <span
    className={className}
    role="img"
    aria-label="IIMT"
    style={{
      display: 'inline-flex',
      alignItems: 'baseline',
      whiteSpace: 'nowrap',
      verticalAlign: 'baseline',
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
  stemColor = 'currentColor',
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
        lineHeight: 1,
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
