import React from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { COLORS, SHADOWS } from '../assets/styles/theme';

export default function StatusBar({ trackingState, selectedObjectId }) {
  let stateLabel = 'SCANNING TERRAIN';
  let color = COLORS.warning; // Yellow/Orange scanning color

  if (selectedObjectId != null) {
    stateLabel = 'REFINING STRUCTURE';
    color = '#00C2FF'; // Blue refining color
  } else if (trackingState === 'found') {
    stateLabel = 'READY TO BUILD';
    color = COLORS.success; // Lime Green ready color
  }

  return (
    <View style={[styles.container, SHADOWS.glass]}>
      <View style={styles.badgeContainer}>
        <View style={[styles.indicatorDot, { backgroundColor: color, shadowColor: color }]} />
        <Text style={[styles.badgeText, { color }]}>
          {stateLabel}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 55,
    alignSelf: 'center',
    backgroundColor: 'rgba(18, 22, 28, 0.85)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
});
