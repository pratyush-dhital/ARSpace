import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, SHADOWS } from '../assets/styles/theme';

export default function StatusBar({ trackingState, activeObject }) {
  let statusText = 'Initializing AR core engine...';
  let isSuccess = false;

  if (trackingState === 'searching') {
    statusText = 'Scan area. Move camera slowly to find flat surfaces.';
  } else if (trackingState === 'found') {
    statusText = `Surface detected! Tap to place a ${activeObject.toUpperCase()}.`;
    isSuccess = true;
  }

  return (
    <View style={[styles.container, SHADOWS.glass]}>
      <View style={styles.headerRow}>
        <Text style={styles.appName}>AR SPACE PLACER</Text>
        <View style={styles.badgeContainer}>
          <View style={[styles.indicatorDot, isSuccess ? styles.indicatorSuccess : styles.indicatorSearching]} />
          <Text style={[styles.badgeText, isSuccess ? styles.badgeTextSuccess : styles.badgeTextSearching]}>
            {isSuccess ? 'READY' : 'SCANNING'}
          </Text>
        </View>
      </View>
      <Text style={styles.statusDescription}>{statusText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  appName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 1.5,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  indicatorSuccess: {
    backgroundColor: COLORS.success,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  indicatorSearching: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  badgeTextSuccess: {
    color: COLORS.success,
  },
  badgeTextSearching: {
    color: COLORS.primary,
  },
  statusDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});
