import React from 'react';

/**
 * Signature 01: a clean silver I with a solid TEDx-red cap.
 * The cap has a single diagonal lower edge, exactly like the supplied reference.
 * Each I is a separate glyph; no shared cap, bevel, roof or extra foot.
 */
const SignatureInitial = ({ stemColor = '#E3E6EB' }) => (
  <span
    aria-hidden="true"
    style={{
      display: 'inline-block',
      width: '.5em',
      height: '1em',
      flex: '0 0 .5em',
      verticalAlign: 'baseline',
      lineHeight: 1,
      overflow: 'visible',
    }}
  >
    <svg
      viewBox="0 0 100 200"
      preserveAspectRatio="none"
      focusable="false"
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        overflow: 'visible',
      }}
    >
      {/* Solid red cap: flat top, vertical sides, one rising diagonal lower edge. */}
      <path d="M0 0 H100 V38 L0 70 Z" fill="#EC002B" />

      {/* One uninterrupted silver stem, cut cleanly along the cap's diagonal. */}
      <path d="M0 70 L100 38 V200 H0 Z" fill={stemColor} />
    </svg>
  </span>
);

const SignatureLetters = ({ stemColor = '#E3E6EB' }) => (
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
