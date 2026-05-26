export const COLORS = {
  background: '#121212',
  surface: 'rgba(24, 24, 28, 0.82)', // Dark, moody glass background
  surfaceLight: 'rgba(255, 255, 255, 0.08)',
  border: 'rgba(255, 255, 255, 0.12)', // Subtle glass border
  primary: '#00E5FF', // High-tech cyan
  primaryGlow: 'rgba(0, 229, 255, 0.35)',
  accent: '#FF007F', // Cyberpunk neon pink
  text: '#FFFFFF',
  textSecondary: '#B3B3B3',
  success: '#39FF14', // Neon green for positive feedback (plane detected)
  danger: '#FF3333', // Neon red for clear/delete actions
};

export const SHADOWS = {
  glow: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },
  glass: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  }
};
