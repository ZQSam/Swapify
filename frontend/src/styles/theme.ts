// Design System Theme Configuration
// Based on UI design specifications

export const colors = {
  // Primary Colors
  primary: '#FF5F05',
  primaryDark: '#E54D00',
  primaryLight: '#FF7A33',

  // Navy
  navy: '#13294B',
  navyLight: '#1E3A5F',

  // Neutral Colors
  gray50: '#F4F4F4',
  gray100: '#C8C6C7',
  gray200: '#9C9A9D',
  gray300: '#707372',
  gray900: '#252525',

  // Semantic Colors
  error: '#C84113',
  warning: '#FCB316',
  success: '#00A14F',

  // Status Colors
  statusAvailable: '#00A14F',
  statusPending: '#FCB316',
  statusSold: '#707372',

  // Background
  background: '#FFFFFF',
  backgroundGray: '#F4F4F4',
} as const;

export const typography = {
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",

  // Font Sizes
  header: '32px',
  subHeaderBold: '24px',
  subHeader: '24px',
  bodyBold: '16px',
  body: '16px',
  caption: '14px',
  small: '12px',

  // Font Weights
  weightRegular: 400,
  weightBold: 700,
} as const;

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
} as const;

export const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
} as const;

export const breakpoints = {
  mobile: '640px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1200px',
} as const;

export const shadows = {
  card: '0 2px 8px rgba(0, 0, 0, 0.08)',
  cardHover: '0 4px 16px rgba(0, 0, 0, 0.12)',
  input: '0 0 0 3px rgba(255, 95, 5, 0.1)',
} as const;

export const heights = {
  header: '64px',
  buttonSmall: '32px',
  buttonMedium: '40px',
  buttonLarge: '48px',
  input: '40px',
} as const;

// Status badge colors
export const statusColors = {
  available: {
    bg: '#E8F5E9',
    text: '#00A14F',
  },
  pending: {
    bg: '#FFF4E5',
    text: '#FCB316',
  },
  sold: {
    bg: '#F4F4F4',
    text: '#707372',
  },
} as const;

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  breakpoints,
  shadows,
  heights,
  statusColors,
} as const;

export type Theme = typeof theme;
