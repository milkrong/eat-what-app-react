export const colors = {
  primary: '#4D63F5',
  secondary: '#00B6DF',
  background: '#ffffff',
  surface: '#F6F8F9',
  error: '#ff4b4b',
  text: '#191D38',
  textSecondary: '#7E8A8C',
  active: '#00B6DF',
  success: '#00B6DF',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const typography = {
  h1: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 34,
  },
  h2: {
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 30,
  },
  h3: {
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: 'normal',
    lineHeight: 28,
  },
  caption: {
    fontSize: 14,
    fontWeight: 'normal',
    lineHeight: 22,
  },
  small: {
    fontSize: 12,
    fontWeight: 'normal',
    lineHeight: 18,
  },
  tiny: {
    fontSize: 10,
    fontWeight: 'normal',
    lineHeight: 16,
  },
} as const;

export const theme = {
  colors,
  spacing,
  typography,
} as const;

export type Theme = typeof theme;
