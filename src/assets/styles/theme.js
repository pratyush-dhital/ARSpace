export const COLORS = {
  background: '#0B0D10',
  surface: 'rgba(18, 22, 28, 0.9)', // Deep charcoal glass
  surfaceLight: 'rgba(255, 255, 255, 0.03)',
  border: 'rgba(255, 255, 255, 0.08)',
  borderGold: 'rgba(197, 160, 89, 0.35)',
  primary: '#C5A059', // Warm gold
  primaryGlow: 'rgba(197, 160, 89, 0.35)',
  accent: '#FF4D9D',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  success: '#00FF88', // Active Lime Green
  warning: '#FFB800', // Warning/Scanning Yellow-Orange
  danger: '#FF4D4D',
  gold: '#C5A059',
  goldLight: '#EADBB6',
  charcoal: '#12161C',
};

export const SHADOWS = {
  glow: {
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  glowDanger: {
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  glass: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
};
