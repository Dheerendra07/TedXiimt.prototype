import React from 'react';

/**
 * Signature 01: a proportionate silver I with a solid TEDx-red angled cap.
 * The glyph follows a normal capital's cap-height and narrow stem width so it
 * sits naturally beside M and T instead of reading as an oversized icon.
 */
const SignatureInitial = ({ stemColor = '#E3E6EB' }) => (
  <span
    aria-hidden="true"
    style={{
      display: 'inline-block',
      width: '.25em',
      height: '.72em',
      flex: '0 0 .25em',
      verticalAlign: 'baseline',
      lineHeight: 1,
      overflow: 'visible',
    }}
  >
    <svg
      viewBox="0 0 70 200"
      focusable="false"
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        overflow: 'visible',
      }}
    >
      {/* Flat TEDx-red cap with the exact rising diagonal lower edge. */}
      <path d="M0 0 H70 V42 L0 70 Z" fill="#EB0028" />

      {/* Straight silver stem; restrained highlights keep the finish crisp. */}
      <path d="M0 70 L70 42 V200 H0 Z" fill={stemColor} />
      <path d="M0 70 L9 66.4 V200 H0 Z" fill="#FFFFFF" opacity=".2" />
      <path d="M68.8 42.5 V200" fill="none" stroke="#87929F" strokeWidth="1.15" opacity=".48" />
    </svg>
  </span>
);

const SignatureLetters = ({ stemColor = '#E3E6EB' }) => (
  <span
    aria-hidden="true"
    style={{
      display: 'inline-flex',
      alignItems: 'baseline',
      gap: '.055em',
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
