export const ROBOT_TYPES = {
  GO2: 'go2',
  G1: 'g1',
};

export const robotColors = {
  go2: {
    primary: '#FF6B00',
    accent: '#FF9240',
  },
  g1: {
    primary: '#1A73E8',
    accent: '#4DA3FF',
  },
};

export const colors = {
  background: '#0F1115',
  surface: '#1A1D24',
  surfaceAlt: '#252A33',
  text: '#F5F5F7',
  textMuted: '#9AA3B2',
  border: '#2E3540',
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
  white: '#FFFFFF',
  black: '#000000',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const fonts = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  sizes: {
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
    xxl: 28,
  },
};

export function getRobotTheme(robotType) {
  return robotColors[robotType] ?? robotColors.go2;
}
