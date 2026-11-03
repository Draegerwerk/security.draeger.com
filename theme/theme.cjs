module.exports = {
  screens: {
    sm: '321px',
    md: '480px',
    lg: '768px',
    xl: '991px',
    '2xl': '1352px',
  },
  fontFamily: {
    display: ['DraegerPangeaDisplay', 'Helvetica', 'Arial', 'Roboto', 'sans-serif'],
    text: ['DraegerPangeaText', 'Helvetica', 'Arial', 'Roboto', 'sans-serif'],
  },
  fontSize: {
    sm: ['0.875rem', { lineHeight: '1.36rem', letterSpacing: '0.01rem' }],
    base: ['0.875rem', { lineHeight: '1.36rem', letterSpacing: '0.01rem' }],
    lg: ['1.125rem', { lineHeight: '1.53rem', letterSpacing: '0.00563rem' }],
    xl: ['1.25rem', { lineHeight: '1.625rem', letterSpacing: '0' }],
    '2xl': ['1.5rem', { lineHeight: '1.95rem', letterSpacing: '0' }],
    '6xl': ['3.375rem', { lineHeight: '3.9825rem', letterSpacing: '0' }],
    'links-header': ['1.125rem', { lineHeight: '1.53rem' }],
    'label-sm': ['0.9375rem', { letterSpacing: '0.01688rem' }],
    'button-text-large': ['1rem', { lineHeight: 'normal', letterSpacing: '0.02rem' }],
    'button-text-small': ['0.875rem', { lineHeight: 'normal', letterSpacing: '0.00875rem' }],
  },
  spacing: {
    'element-height-xs': '1.625rem',
    'element-height-sm': '2.25rem',
    'element-height-md': '2.75rem',
    'element-height-lg': '3.5rem',
    'logo-column': '3rem',
    'footer-nav-horizontal-padding': '3rem',
    'wrapper-top-button-padding': '1.5rem',
  },
  maxWidth: {
    'content-block': '1280px',
  },
  aspectRatio: {
    '1/1': '1/1',
    '3/2': '3/2',
    '4/3': '4/3',
    '9/11': '9/11',
    '16/6': '16/6',
    '16/9': '16/9',
  },
  borderRadius: {
    sm: '0.1875rem',
    controls: '0.1875rem',
  },
  zIndex: {
    overlay: '40',
  },
  boxShadow: {
    'draeger-drop-shadow-level-1': '0px 2px 6px 0px rgba(0,2,5,0.40)',
    'draeger-drop-shadow-level-2': '0px 4px 12px 0px rgba(0,2,5,0.40)',
    'draeger-elevation-2': '0px 3px 7px 0px rgba(0,0,0,0.21)',
  },
  animation: {
    'draeger-floating-button': 'draeger-floating-button 10s normal forwards',
    'draeger-floating-button-text': 'draeger-floating-button-text 10s normal forwards',
    'draeger-floating-button-text-opacity':
      'draeger-floating-button-text-opacity 10s normal forwards',
    'draeger-switch-button-right': 'draeger-switch-button-right 8s 1s infinite normal',
    'draeger-switch-button-left': 'draeger-switch-button-left 8s 1s infinite normal',
    'odx-circular-progress-indicator':
      'odx-circular-progress-indicator 1.75s ease infinite both',
    'odx-circular-progress-inner': 'odx-circular-progress-inner 1.75s linear infinite',
    'dropdown-open': 'dropdown-open 0.2s ease-out',
    'dropdown-closed': 'dropdown-closed 0.2s ease-out',
  },
  keyframes: {
    'draeger-floating-button': {
      '0%': { transform: 'translateX(calc(100% - 4rem))' },
      '5%': { transform: 'translateX(calc(100% - 4rem))' },
      '25%': { transform: 'translateX(0)' },
      '75%': { transform: 'translateX(0)' },
      '100%': { transform: 'translateX(calc(100% - 4rem))' },
    },
    'draeger-floating-button-text': {
      '0%': { transform: 'translateX(calc(-100% - 4rem))' },
      '25%': { transform: 'translateX(calc(-100% - 4rem))' },
      '30%': { transform: 'translateX(0)' },
      '70%': { transform: 'translateX(0)' },
      '75%': { transform: 'translateX(calc(-100% - 4rem))' },
      '100%': { transform: 'translateX(calc(-100% - 4rem))' },
    },
    'draeger-floating-button-text-opacity': {
      '0%': { opacity: '0' },
      '25%': { opacity: '0' },
      '30%': { opacity: '1' },
      '70%': { opacity: '1' },
      '75%': { opacity: '0' },
      '100%': { opacity: '0' },
    },
    'draeger-switch-button-right': {
      '0%': { content: 'var(--tw-content)', transform: 'translateX(0)' },
      '3.75%': { content: 'var(--tw-content)', transform: 'translateX(10px)' },
      '7.5%': { content: 'var(--tw-content)', transform: 'translateX(0)' },
      '100%': { content: 'var(--tw-content)', transform: 'translateX(0)' },
    },
    'draeger-switch-button-left': {
      '0%': { content: 'var(--tw-content)', transform: 'translateX(0)' },
      '3.75%': { content: 'var(--tw-content)', transform: 'translateX(-10px)' },
      '7.5%': { content: 'var(--tw-content)', transform: 'translateX(0)' },
      '100%': { content: 'var(--tw-content)', transform: 'translateX(0)' },
    },
    'odx-circular-progress-indicator': {
      '0%': { strokeDashoffset: '100' },
      '25%': { strokeDashoffset: '250', transform: 'rotate(180deg)' },
      '100%': { strokeDashoffset: '100', transform: 'rotate(270deg)' },
    },
    'odx-circular-progress-inner': {
      '0%': { transform: 'rotate(0)' },
      '100%': { transform: 'rotate(1turn)' },
    },
    'dropdown-open': {
      '0%': { transform: 'scale(0.95)', opacity: '0' },
      '100%': { transform: 'scale(1)', opacity: '1' },
    },
    'dropdown-closed': {
      '0%': { transform: 'scale(1)', opacity: '1' },
      '100%': { transform: 'scale(0.95)', opacity: '0' },
    },
  },
};
