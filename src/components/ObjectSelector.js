import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, SHADOWS } from '../assets/styles/theme';

export default function ObjectSelector({ activeObject, onSelect }) {
  const objects = [
    { type: 'cube', label: 'Cube', icon: '■', desc: 'Geometric Box' },
    { type: 'sphere', label: 'Sphere', icon: '●', desc: 'Smooth Orb' },
    { type: 'chair', label: 'Chair', icon: '🪑', desc: 'Virtual Seat' },
  ];

  return (
    <View style={[styles.container, SHADOWS.glass]}>
      <Text style={styles.title}>SELECT OBJECT TO PLACE</Text>
      <View style={styles.selectorRow}>
        {objects.map((obj) => {
          const isSelected = activeObject === obj.type;
          return (
            <TouchableOpacity
              key={obj.type}
              style={[
                styles.card,
                isSelected ? styles.selectedCard : null,
                isSelected ? SHADOWS.glow : null
              ]}
              onPress={() => onSelect(obj.type)}
              activeOpacity={0.8}
            >
              <Text style={[styles.icon, isSelected ? styles.selectedIcon : null]}>
                {obj.icon}
              </Text>
              <Text style={[styles.label, isSelected ? styles.selectedText : null]}>
                {obj.label}
              </Text>
              <Text style={styles.desc}>{obj.desc}</Text>
            </TouchableOpacity>
          );
        })}
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
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 2,
    marginBottom: 12,
  },
  selectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  card: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: COLORS.surfaceLight,
    borderColor: 'transparent',
    borderWidth: 1.5,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCard: {
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    borderColor: COLORS.primary,
  },
  icon: {
    fontSize: 22,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  selectedIcon: {
    color: COLORS.primary,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  selectedText: {
    color: COLORS.primary,
  },
  desc: {
    fontSize: 9,
    color: COLORS.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
});
