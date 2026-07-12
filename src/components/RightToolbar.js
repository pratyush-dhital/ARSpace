import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { COLORS, SHADOWS } from '../assets/styles/theme';

export default function RightToolbar({
  onUndo,
  onDeleteSelected,
  selectedObjectId,
  onToggleHelp,
  onAdjustDistance,
  hasObjects,
}) {
  const isSelected = selectedObjectId != null;

  return (
    <View style={styles.container}>
      {isSelected && (
        <>
          <TouchableOpacity
            style={[styles.button, SHADOWS.glass]}
            onPress={() => onAdjustDistance(0.2)}
            activeOpacity={0.7}
          >
            <Text style={styles.iconText}>⏫</Text>
            <Text style={styles.btnLabel}>Zoom Out</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, SHADOWS.glass]}
            onPress={() => onAdjustDistance(-0.2)}
            activeOpacity={0.7}
          >
            <Text style={styles.iconText}>⏬</Text>
            <Text style={styles.btnLabel}>Zoom In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              SHADOWS.glass,
              styles.buttonDanger,
              SHADOWS.glowDanger,
            ]}
            onPress={onDeleteSelected}
            activeOpacity={0.7}
          >
            <Text style={[styles.iconText, { color: COLORS.accent }]}>🗑</Text>
            <Text style={[styles.btnLabel, { color: COLORS.accent }]}>Delete</Text>
          </TouchableOpacity>
        </>
      )}

      {!isSelected && (
        <TouchableOpacity
          style={[
            styles.button,
            SHADOWS.glass,
            !hasObjects && styles.buttonDisabled,
          ]}
          onPress={onUndo}
          disabled={!hasObjects}
          activeOpacity={0.7}
        >
          <Text style={[styles.iconText, !hasObjects && styles.textDisabled]}>↩</Text>
          <Text style={[styles.btnLabel, !hasObjects && styles.textDisabled]}>Undo</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.button, SHADOWS.glass]}
        onPress={onToggleHelp}
        activeOpacity={0.7}
      >
        <Text style={styles.iconText}>❓</Text>
        <Text style={styles.btnLabel}>Help</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    top: '22%',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 10,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.35,
  },
  buttonDanger: {
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(255, 77, 157, 0.12)',
  },
  iconText: {
    fontSize: 18,
    color: COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
  textDisabled: {
    color: COLORS.textSecondary,
  },
  btnLabel: {
    fontSize: 8,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginTop: 1,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
});
