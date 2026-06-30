import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Animated, Pressable, Platform, Image, TouchableOpacity } from 'react-native';
import { COLORS, SHADOWS } from '../assets/styles/theme';
import { THEME_CONFIGS, THEME_CATEGORY_MAPPINGS } from '../utils/modelLoader';

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
    if (disabled || obj.isPlaceholder) return;
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 80,
      friction: 5,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled || obj.isPlaceholder) return;
    Animated.spring(scale, {
      toValue: isSelected ? 1.05 : 1.0,
      useNativeDriver: true,
      tension: 60,
      friction: 6,
    }).start();
  };

  if (obj.isPlaceholder) {
    return (
      <View style={[styles.card, styles.placeholderCard]}>
        <View style={styles.thumbnailWrapper}>
          <Text style={[styles.icon, { opacity: 0.2, fontSize: 16 }]}>🔒</Text>
        </View>
        <Text style={[styles.label, { color: 'rgba(255, 255, 255, 0.35)', fontSize: 10 }]} numberOfLines={1}>
          {obj.name}
        </Text>
        <Text style={[styles.desc, { color: 'rgba(255, 255, 255, 0.2)', fontSize: 7 }]} numberOfLines={1}>
          {obj.desc}
        </Text>
      </View>
    );
  }

  const renderThumbnail = () => {
    if (isAddCard) {
      return (
        <Text style={[styles.icon, { color: COLORS.gold, fontSize: 18 }]}>
          ＋
        </Text>
      );
    }

    const thumb = obj.thumbnail;
    if (typeof thumb === 'string') {
      return (
        <Text style={[styles.icon, isSelected ? styles.selectedIcon : null]}>
          {thumb}
        </Text>
      );
    } else if (thumb !== undefined && thumb !== null) {
      return (
        <Image
          source={thumb}
          style={[styles.thumbnailImage, isSelected ? styles.selectedThumbnailImage : null]}
          resizeMode="contain"
        />
      );
    }
    return (
      <Text style={[styles.icon, isSelected ? styles.selectedIcon : null]}>
        📦
      </Text>
    );
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
        <View style={styles.thumbnailWrapper}>
          {renderThumbnail()}
        </View>
        <Text style={[
          styles.label,
          isAddCard ? { color: COLORS.gold } : null,
          isSelected ? styles.selectedText : null
        ]} numberOfLines={1}>
          {obj.name || obj.label}
        </Text>
        <Text style={[
          styles.desc,
          isAddCard ? { color: COLORS.gold, opacity: 0.6 } : null,
          isSelected ? styles.selectedTextSecondary : null
        ]} numberOfLines={1}>
          {obj.desc || ''}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export default function ObjectSelector({
  assets = [],
  activeObject,
  onSelect,
  disabled,
  onAddCustomPress,
  onConstructPress,
  activeObjectLabel,
  activeTheme = 'medieval',
  onThemeChange,
}) {
  const categories = THEME_CATEGORY_MAPPINGS[activeTheme] || [];
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || 'buildings');

  // Auto-switch category tab to match changes in activeObject (e.g. when placing or importing)
  useEffect(() => {
    if (activeObject) {
      const match = assets.find((o) => (o.id || o.type) === activeObject);
      if (match && match.category && match.category !== activeCategory) {
        // Only switch category if the asset belongs to the current theme
        if (match.theme === activeTheme || match.category === 'custom') {
          setActiveCategory(match.category);
        }
      }
    }
  }, [activeObject, assets, activeTheme]);

  // Handle activeCategory switching when activeTheme changes
  useEffect(() => {
    const validCategory = categories.find((c) => c.id === activeCategory);
    if (!validCategory && categories.length > 0) {
      setActiveCategory(categories[0].id);
    }
  }, [activeTheme, categories]);

  const filteredAssets = assets.filter(
    (o) => o.category === activeCategory && (o.theme === activeTheme || o.category === 'custom')
  );

  // Append placeholder cards for active category
  const displayAssets = [...filteredAssets];
  if (activeCategory !== 'custom') {
    displayAssets.push(
      { id: 'placeholder_1', name: 'More assets', desc: 'Locked', isPlaceholder: true },
      { id: 'placeholder_2', name: 'More assets', desc: 'Locked', isPlaceholder: true }
    );
  }

  return (
    <View style={[styles.container, SHADOWS.glass, disabled && styles.containerDisabled]}>
      {/* 1. Centered Construct Button inside the card */}
      {activeObjectLabel && !disabled && (
        <TouchableOpacity
          style={[styles.constructButton, SHADOWS.glow]}
          onPress={onConstructPress}
          activeOpacity={0.85}
        >
          <Text style={styles.constructButtonText}>🔨 CONSTRUCT {activeObjectLabel.toUpperCase()}</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.title}>
        {disabled ? 'FINISH MODIFYING TO CHANGE ELEMENT' : 'SELECT WORLD ELEMENT'}
      </Text>

      {/* 1.5. Theme Selector Row */}
      <View style={styles.themeContainer}>
        {THEME_CONFIGS.map((theme) => {
          const isThemeActive = activeTheme === theme.id;
          return (
            <Pressable
              key={theme.id}
              disabled={disabled}
              onPress={() => onThemeChange && onThemeChange(theme.id)}
              style={[
                styles.themeItem,
                isThemeActive ? styles.themeItemActive : null,
              ]}
            >
              <Text style={[styles.themeIcon, isThemeActive ? styles.themeIconActive : null]}>
                {theme.icon}
              </Text>
              <Text style={[styles.themeLabel, isThemeActive ? styles.themeLabelActive : null]}>
                {theme.label.toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* 2. Scrollable Category Tabs */}
      <View style={styles.tabContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBar}
        >
          {categories.map((cat) => {
            const isCatSelected = activeCategory === cat.id;
            return (
              <Pressable
                key={cat.id}
                disabled={disabled}
                onPress={() => setActiveCategory(cat.id)}
                style={[
                  styles.tabItem,
                  isCatSelected ? styles.tabItemActive : null,
                ]}
              >
                <Text style={[styles.tabIcon, isCatSelected ? styles.tabIconActive : null]}>
                  {cat.icon}
                </Text>
                <Text style={[styles.tabLabel, isCatSelected ? styles.tabLabelActive : null]}>
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* 3. Horizontal Asset Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.selectorRow}
      >
        {displayAssets.map((obj) => {
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
        {activeCategory === 'custom' && !disabled && onAddCustomPress && (
          <SelectorCard
            obj={{ id: 'add_custom', name: 'Import', desc: 'File/URL' }}
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
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(18, 22, 28, 0.92)', // Deep charcoal glass
    borderColor: 'rgba(197, 160, 89, 0.25)', // Warm gold trim
    borderWidth: 1.5,
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    zIndex: 10,
  },
  constructButton: {
    backgroundColor: '#262423', // Stone dark color
    borderColor: '#C5A059', // Gold trim
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    flexDirection: 'row',
  },
  constructButtonText: {
    color: '#EADBB6', // Parchment gold text
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
  title: {
    fontSize: 9,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 2,
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
  tabContainer: {
    width: '100%',
    marginBottom: 12,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginHorizontal: 3,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabItemActive: {
    backgroundColor: '#1E2026', // Dark stone tab
    borderColor: '#C5A059', // Gold tab outline
  },
  tabIcon: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
    marginRight: 6,
  },
  tabIconActive: {
    color: '#C5A059',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.4)',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
  tabLabelActive: {
    color: '#C5A059',
  },
  selectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  card: {
    width: 76,
    height: 96,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCard: {
    backgroundColor: 'rgba(197, 160, 89, 0.08)', // Gold-tinted card background
    borderColor: '#C5A059', // Gold outline
  },
  addCard: {
    borderStyle: 'dashed',
    borderColor: '#C5A059',
    backgroundColor: 'rgba(197, 160, 89, 0.02)',
    borderWidth: 1,
  },
  placeholderCard: {
    opacity: 0.4,
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    borderColor: 'rgba(255, 255, 255, 0.03)',
  },
  thumbnailWrapper: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  icon: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.5)',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
  selectedIcon: {
    color: '#C5A059',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    tintColor: 'rgba(255, 255, 255, 0.5)',
  },
  selectedThumbnailImage: {
    tintColor: '#C5A059',
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
  selectedText: {
    color: '#C5A059',
  },
  desc: {
    fontSize: 7,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 2,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
  selectedTextSecondary: {
    color: '#EADBB6',
  },
  themeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: 10,
    width: '100%',
  },
  themeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  themeItemActive: {
    backgroundColor: 'rgba(197, 160, 89, 0.12)',
    borderColor: '#C5A059',
  },
  themeIcon: {
    fontSize: 10,
    marginRight: 4,
    opacity: 0.6,
  },
  themeIconActive: {
    opacity: 1.0,
  },
  themeLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
  themeLabelActive: {
    color: '#C5A059',
  },
});
