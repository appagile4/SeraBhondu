import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { THEME } from "../../constants/theme";
import { useLanguage } from "../../hooks/useLanguage";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setAuthModalVisible } from "../../store/slices/authSlice";
import { setLocationModalVisible } from "../../store/slices/locationSlice";

export const Header: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { logoSource } = useLanguage();
  const selectedCity = useAppSelector((state) => state.location.selectedCity);
  const unreadCount = useAppSelector(
    (state) => state.notifications.unreadCount,
  );
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const handleNotificationsPress = () => {
    if (!isAuthenticated) {
      dispatch(setAuthModalVisible(true));
      return;
    }
    router.push("/notifications" as any);
  };

  const handleLocationPress = () => {
    dispatch(setLocationModalVisible(true));
  };

  const handleSearchPress = () => {
    router.push("/search" as any);
  };

  return (
    <View style={styles.container}>
      {/* Top Row: Logo & Right Actions */}
      <View style={styles.topRow}>
        <TouchableOpacity
          onPress={() => router.push("/" as any)}
          activeOpacity={0.8}
          style={styles.logoContainer}
        >
          <Image
            source={logoSource}
            style={styles.logo}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <View style={styles.actions}>
          {/* Location Selector Pill */}
          <TouchableOpacity
            style={styles.locationPill}
            onPress={handleLocationPress}
            activeOpacity={0.7}
          >
            <Ionicons name="location" size={14} color={THEME.colors.primary} />
            <Text style={styles.locationText} numberOfLines={1}>
              {selectedCity}
            </Text>
            <Ionicons
              name="chevron-down"
              size={14}
              color={THEME.colors.textSecondary}
            />
          </TouchableOpacity>

          {/* Search Icon */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleSearchPress}
            activeOpacity={0.7}
          >
            <Ionicons
              name="search-outline"
              size={22}
              color={THEME.colors.primary}
            />
          </TouchableOpacity>

          {/* Notifications Bell */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleNotificationsPress}
            activeOpacity={0.7}
          >
            <Ionicons
              name="notifications-outline"
              size={22}
              color={THEME.colors.primary}
            />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: -8,
  },
  logo: {
    width: 140,
    height: 38,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  locationPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: THEME.radii.full,
    maxWidth: 130,
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    fontWeight: "600",
    color: THEME.colors.primary,
    flexShrink: 1,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: THEME.radii.full,
    backgroundColor: THEME.colors.background,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderWidth: 1,
    borderColor: THEME.colors.borderLight,
  },
  badge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: THEME.colors.accent,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "700",
  },
});
