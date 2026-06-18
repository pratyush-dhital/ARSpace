export const COLORS = {
  background: '#0B0D10',
  surface: 'rgba(255, 255, 255, 0.08)',
  surfaceLight: 'rgba(255, 255, 255, 0.04)',
  border: 'rgba(255, 255, 255, 0.15)',
  primary: '#00C2FF',
  primaryGlow: 'rgba(0, 194, 255, 0.35)',
  accent: '#FF4D9D',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  success: '#00FF88',
  warning: '#FFC857',
  danger: '#FF5C5C',
};

export const SHADOWS = {
  glow: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  glowDanger: {
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  glass: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  }
};
