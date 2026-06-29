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
        <Text style={styles.title}>MODIFYING {selectedType.toUpperCase()}</Text>
        <TouchableOpacity onPress={onDeselect} style={styles.doneBtn} activeOpacity={0.85}>
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
          <Text style={styles.deleteBtnLabel}>Deconstruct</Text>
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
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(18, 22, 28, 0.92)',
    borderColor: 'rgba(197, 160, 89, 0.25)',
    borderWidth: 1.5,
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 16,
    zIndex: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C5A059',
    letterSpacing: 1.5,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
  doneBtn: {
    backgroundColor: '#262423',
    borderColor: '#C5A059',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  doneText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EADBB6',
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
    marginHorizontal: 3,
    height: 52,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    backgroundColor: 'rgba(255, 77, 157, 0.15)',
    borderColor: '#FF4D9D',
    borderWidth: 1,
  },
  iconText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
  deleteIconText: {
    fontSize: 15,
    color: '#FF4D9D',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
  btnLabel: {
    fontSize: 8,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
  deleteBtnLabel: {
    fontSize: 8,
    fontWeight: '600',
    color: '#FF4D9D',
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
});
