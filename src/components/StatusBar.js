import React from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { COLORS, SHADOWS } from '../assets/styles/theme';

export default function StatusBar({ trackingState, selectedObjectId }) {
  let isReady = trackingState === 'found' || selectedObjectId != null;
  let stateLabel = trackingState === 'found' ? 'Ready' : 'Scanning';

  if (selectedObjectId != null) {
    stateLabel = 'Editing';
  }

  return (
    <View style={[styles.container, SHADOWS.glass]}>
      <View style={styles.badgeContainer}>
        <View style={[styles.indicatorDot, isReady ? styles.indicatorSuccess : styles.indicatorSearching]} />
        <Text style={[styles.badgeText, isReady ? styles.badgeTextSuccess : styles.badgeTextSearching]}>
          {stateLabel}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
  badgeTextSuccess: {
    color: COLORS.success,
  },
  badgeTextSearching: {
    color: COLORS.primary,
  },
});
