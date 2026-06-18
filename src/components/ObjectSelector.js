import React, { useRef, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Animated, Pressable, Platform } from 'react-native';
import { COLORS, SHADOWS } from '../assets/styles/theme';

function SelectorCard({ obj, isSelected, onPress, disabled, isAddCard }) {
  const scale = useRef(new Animated.Value(isSelected ? 1.05 : 1.0)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: isSelected ? 1.05 : 1.0,
      useNativeDriver: true,
      tension: 60,
      friction: 6,
    }).start();
  }, [isSelected]);

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 80,
      friction: 5,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: isSelected ? 1.05 : 1.0,
      useNativeDriver: true,
      tension: 60,
      friction: 6,
    }).start();
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled}
      style={{ marginHorizontal: 6 }}
    >
      <Animated.View
        style={[
          styles.card,
          { transform: [{ scale }] },
          isAddCard ? styles.addCard : null,
          isSelected ? styles.selectedCard : null,
          isSelected ? SHADOWS.glow : null,
        ]}
      >
        <Text style={[
          styles.icon,
          isAddCard ? { color: COLORS.primary } : null,
          isSelected ? styles.selectedIcon : null
        ]}>
          {obj.icon}
        </Text>
        <Text style={[
          styles.label,
          isAddCard ? { color: COLORS.primary } : null,
          isSelected ? styles.selectedText : null
        ]} numberOfLines={1}>
          {obj.label}
        </Text>
        <Text style={[
          styles.desc,
          isAddCard ? { color: COLORS.primary, opacity: 0.8 } : null
        ]} numberOfLines={1}>
          {obj.desc}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export default function ObjectSelector({
  activeObject,
  onSelect,
  disabled,
  customModels = [],
  onAddCustomPress,
}) {
  const baseObjects = [
    { type: 'cube', label: 'Cube', icon: '□', desc: 'Box' },
    { type: 'sphere', label: 'Sphere', icon: '○', desc: 'Orb' },
    { type: 'chair', label: 'Chair', icon: '🪑', desc: 'Seat' },
    { type: 'table', label: 'Table', icon: '┳', desc: 'Surface' },
    { type: 'lamp', label: 'Lamp', icon: '☼', desc: 'Light' },
    { type: 'plant', label: 'Plant', icon: '⚘', desc: 'Flora' },
  ];

  const objects = [...baseObjects, ...customModels];

  return (
    <View style={[styles.container, SHADOWS.glass, disabled && styles.containerDisabled]}>
      <Text style={styles.title}>
        {disabled ? 'Finish editing to change object' : 'Select object to place'}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.selectorRow}
      >
        {objects.map((obj) => {
          const typeKey = obj.id || obj.type;
          const isSelected = activeObject === typeKey;
          return (
            <SelectorCard
              key={typeKey}
              obj={obj}
              isSelected={isSelected}
              onPress={() => onSelect(typeKey)}
              disabled={disabled}
              isAddCard={false}
            />
          );
        })}
        {!disabled && onAddCustomPress && (
          <SelectorCard
            obj={{ type: 'add_custom', label: 'Import', icon: '＋', desc: 'File/URL' }}
            isSelected={false}
            onPress={onAddCustomPress}
            disabled={false}
            isAddCard={true}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  containerDisabled: {
    opacity: 0.55,
  },
  scrollView: {
    width: '100%',
  },
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
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  title: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    letterSpacing: 2,
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
  selectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  card: {
    width: 72,
    backgroundColor: COLORS.surfaceLight,
    borderColor: 'transparent',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCard: {
    backgroundColor: 'rgba(0, 194, 255, 0.08)',
    borderColor: COLORS.primary,
  },
  addCard: {
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(0, 194, 255, 0.03)',
    borderWidth: 1,
  },
  icon: {
    fontSize: 20,
    color: COLORS.textSecondary,
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
  selectedIcon: {
    color: COLORS.primary,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
  selectedText: {
    color: COLORS.primary,
  },
  desc: {
    fontSize: 8,
    color: COLORS.textSecondary,
    marginTop: 2,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
});
