export const colors = {
  background: '#FAF7F2',
  surface: '#FFFCF7',
  textPrimary: '#1C1917',
  primary: '#B45309',
  surfaceMuted: '#F3EDE4',
  border: '#E7DED3',
  textSecondary: '#57534E',
  textMuted: '#78716C',
  success: '#16A34A',
  danger: '#DC2626',
  warning: '#D97706',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
} as const;

export const typography = {
  title: 28,
  body: 16,
  caption: 14,
} as const;

export const theme = {
  colors,
  spacing,
  radius,
  typography,
} as const;

export type AppTheme = typeof theme;
