import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, SHADOWS } from '../assets/styles/theme';

export default function ControlButtons({
  onUndo,
  onDeleteSelected,
  selectedObjectId,
  onToggleHelp,
  hasObjects,
}) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, styles.helpButton, SHADOWS.glass]}
        onPress={onToggleHelp}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>?</Text>
      </TouchableOpacity>

      {selectedObjectId != null ? (
        <TouchableOpacity
          style={[styles.button, styles.deleteButton, SHADOWS.glass]}
          onPress={onDeleteSelected}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>🗑️</Text>
        </TouchableOpacity>
      ) : (
        hasObjects && (
          <TouchableOpacity
            style={[styles.button, styles.undoButton, SHADOWS.glass]}
            onPress={onUndo}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>↩️</Text>
          </TouchableOpacity>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    top: 140,
    flexDirection: 'column',
    alignItems: 'center',
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  helpButton: {
    // Info button styles
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 51, 51, 0.15)',
    borderColor: COLORS.danger,
  },
  undoButton: {
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
    borderColor: COLORS.primary,
  },
  buttonText: {
    fontSize: 18,
    color: COLORS.text,
    textAlign: 'center',
  },
});
