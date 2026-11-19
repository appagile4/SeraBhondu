import React from "react";
import { Text, StyleSheet, TouchableOpacity, View, Image } from "react-native";
import { Category } from "../../constants/categories";
import { THEME } from "../../constants/theme";
import { useLanguage } from "../../hooks/useLanguage";

interface CategoryCardProps {
  category: Category;
  isSelected?: boolean;
  onPress: () => void;
  variant?: "circular" | "grid";
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  isSelected,
  onPress,
  variant = "circular",
}) => {
  const { isBn } = useLanguage();
  const displayName = isBn && category.nameBn ? category.nameBn : category.name;

  if (variant === "grid") {
    return (
      <TouchableOpacity
        style={[styles.gridCard, isSelected && styles.selectedGridCard]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={styles.gridIconWrap}>
          <Image source={category.image} style={styles.gridImage} resizeMode="contain" />
        </View>
        <Text style={[styles.gridTitle, isSelected && styles.selectedText]} numberOfLines={2}>
          {displayName}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.circularContainer}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.circle, isSelected && styles.selectedCircle]}>
        <Image source={category.image} style={styles.circleImage} resizeMode="contain" />
      </View>
      <Text style={[styles.circularTitle, isSelected && styles.selectedText]} numberOfLines={1}>
        {displayName}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  circularContainer: {
    alignItems: "center",
    width: 76,
    marginRight: 12,
  },
  circle: {
    width: 66,
    height: 66,
    borderRadius: 18,
    backgroundColor: "#F4F6F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
    borderWidth: 1.5,
    borderColor: "transparent",
    ...THEME.shadows.sm,
  },
  selectedCircle: {
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.primaryLight,
  },
  circleImage: {
    width: 44,
    height: 44,
  },
  circularTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: THEME.colors.textSecondary,
    textAlign: "center",
  },
  selectedText: {
    color: THEME.colors.primary,
    fontWeight: "700",
  },
  gridCard: {
    flex: 1,
    margin: 6,
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.radii.lg,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: THEME.colors.border,
    minHeight: 116,
    ...THEME.shadows.sm,
  },
  selectedGridCard: {
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.primaryLight,
  },
  gridIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  gridImage: {
    width: 38,
    height: 38,
  },
  gridTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: THEME.colors.text,
    textAlign: "center",
  },
});
