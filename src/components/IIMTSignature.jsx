import React from 'react';

/**
 * Signature 01 uses the native I glyph so it shares the exact font size,
 * cap-height and baseline with the surrounding wordmark. The red angled cap
 * is an absolute overlay and therefore never changes line layout.
 */
const SignatureInitial = () => (
  <span
    aria-hidden="true"
    style={{
      position: 'relative',
      display: 'inline-block',
      verticalAlign: 'baseline',
      fontFamily: 'inherit',
      fontSize: '1em',
      fontWeight: 'inherit',
      lineHeight: 'inherit',
      color: 'transparent',
      WebkitTextFillColor: 'transparent',
      backgroundImage: 'linear-gradient(90deg, #BFC6CE 0%, #F7F8F9 48%, #D9DEE4 100%)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      marginRight: '-.015em',
    }}
  >
    I
    <svg
      viewBox="0 0 48 16"
      aria-hidden="true"
      focusable="false"
      style={{
        position: 'absolute',
        top: '.045em',
        left: '-.09em',
        width: '.72em',
        height: '.19em',
        overflow: 'visible',
        pointerEvents: 'none',
      }}
    >
      <path d="M0 1 H48 V8 L0 15 Z" fill="#EB0028" />
      <path d="M1.5 1.5 H46" stroke="#FF7186" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M47 2 V7" stroke="#A90020" strokeWidth="1" />
    </svg>
  </span>
);

const SignatureLetters = ({ stemColor }) => (
  <span
    aria-hidden="true"
    style={{
      display: 'inline',
      whiteSpace: 'nowrap',
      font: 'inherit',
      lineHeight: 'inherit',
    }}
  >
    <SignatureInitial />
    <SignatureInitial />
    <span style={{ letterSpacing: '-.095em', lineHeight: 'inherit' }}>MT</span>
  </span>
);

/** Both I initials use the same Signature 01 form and the native text baseline. */
export const IIMTMark = ({ className = '', style = {} }) => (
  <span
    className={className}
    role="img"
    aria-label="IIMT"
    style={{
      display: 'inline',
      verticalAlign: 'baseline',
      fontFamily: 'inherit',
      fontSize: 'inherit',
      fontWeight: 'inherit',
      lineHeight: 'inherit',
      ...style,
    }}
  >
    <SignatureLetters />
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
        display: 'inline',
        whiteSpace: 'nowrap',
        lineHeight: 'inherit',
      }}
    >
      <span style={{ color: prefixColor, fontWeight: 900, letterSpacing: '-.11em' }}>
        TED<span style={{ fontSize: '.84em', letterSpacing: '-.07em' }}>x</span>
      </span>
      <SignatureLetters />
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
