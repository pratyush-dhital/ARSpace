import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
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
        <Text style={styles.title}>Editing {selectedType}</Text>
        <TouchableOpacity onPress={onDeselect} style={styles.doneBtn} activeOpacity={0.8}>
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.iconBtn, SHADOWS.glass]}
          onPress={() => onRotateLeft(ROTATE_STEP)}
          activeOpacity={0.7}
        >
          <Text style={styles.iconText}>↺</Text>
          <Text style={styles.btnLabel}>Left</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconBtn, SHADOWS.glass]}
          onPress={() => onAdjustDistance(-0.2)}
          activeOpacity={0.7}
        >
          <Text style={styles.iconText}>⏬</Text>
          <Text style={styles.btnLabel}>Pull</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconBtn, styles.deleteBtn, SHADOWS.glowDanger]}
          onPress={onDelete}
          activeOpacity={0.7}
        >
          <Text style={styles.deleteIconText}>🗑</Text>
          <Text style={styles.deleteBtnLabel}>Delete</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconBtn, SHADOWS.glass]}
          onPress={() => onAdjustDistance(0.2)}
          activeOpacity={0.7}
        >
          <Text style={styles.iconText}>⏫</Text>
          <Text style={styles.btnLabel}>Push</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconBtn, SHADOWS.glass]}
          onPress={() => onRotateRight(ROTATE_STEP)}
          activeOpacity={0.7}
        >
          <Text style={styles.iconText}>↻</Text>
          <Text style={styles.btnLabel}>Right</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    left: 16,
    right: 16,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
  doneBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderColor: COLORS.border,
    borderWidth: 1,
  },
  doneText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconBtn: {
    flex: 1,
    marginHorizontal: 4,
    height: 52,
    backgroundColor: COLORS.surfaceLight,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    backgroundColor: 'rgba(255, 77, 157, 0.12)',
    borderColor: COLORS.accent,
    borderWidth: 1,
  },
  iconText: {
    fontSize: 16,
    color: COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
  deleteIconText: {
    fontSize: 16,
    color: COLORS.accent,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
  btnLabel: {
    fontSize: 9,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
  deleteBtnLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.accent,
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
});
