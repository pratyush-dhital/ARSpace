import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, SHADOWS } from '../assets/styles/theme';

const ROTATE_STEP = 15;

export default function ObjectEditPanel({
  selectedType,
  onRotateLeft,
  onRotateRight,
  onDelete,
  onDeselect,
  onAdjustDistance,
}) {
  return (
    <View style={[styles.container, SHADOWS.glass]}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>EDITING {selectedType?.toUpperCase()}</Text>
        <TouchableOpacity onPress={onDeselect} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.doneText}>DONE</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.hint}>Drag to move, pinch-rotate, or use the controls below.</Text>
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onRotateLeft(ROTATE_STEP)}
          activeOpacity={0.85}
        >
          <Text style={styles.actionIcon}>↺</Text>
          <Text style={styles.actionLabel}>-{ROTATE_STEP}°</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={onDelete}
          activeOpacity={0.85}
        >
          <Text style={styles.actionIcon}>🗑</Text>
          <Text style={styles.actionLabel}>Remove</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onRotateRight(ROTATE_STEP)}
          activeOpacity={0.85}
        >
          <Text style={styles.actionIcon}>↻</Text>
          <Text style={styles.actionLabel}>+{ROTATE_STEP}°</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.actionsRow, { marginTop: 10 }]}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onAdjustDistance(-0.2)}
          activeOpacity={0.85}
        >
          <Text style={styles.actionIcon}>⏬</Text>
          <Text style={styles.actionLabel}>Pull Closer (-0.2m)</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onAdjustDistance(0.2)}
          activeOpacity={0.85}
        >
          <Text style={styles.actionIcon}>⏫</Text>
          <Text style={styles.actionLabel}>Push Further (+0.2m)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 200,
    left: 16,
    right: 16,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.success,
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
  title: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.success,
    letterSpacing: 1.5,
  },
  doneText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  hint: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 12,
    lineHeight: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  deleteBtn: {
    backgroundColor: 'rgba(255, 51, 51, 0.12)',
    borderColor: COLORS.danger,
  },
  actionIcon: {
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 2,
  },
  actionLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});
