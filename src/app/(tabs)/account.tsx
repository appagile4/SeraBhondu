import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logoutUser, setAuthModalVisible } from "../../store/slices/authSlice";
import { fetchMyAds } from "../../store/slices/myAdsSlice";
import { loadFavourites } from "../../store/slices/favouritesSlice";
import { THEME } from "../../constants/theme";
import { useLanguage } from "../../hooks/useLanguage";

function LanguageSwitcherCard({
  language,
  setLanguage,
  t,
}: {
  language: string;
  setLanguage: (lang: "bn" | "en") => void;
  t: (key: any, fallback?: string) => string;
}) {
  return (
    <View style={styles.languageCard}>
      <View style={styles.languageHeader}>
        <View style={[styles.menuIconWrap, { backgroundColor: THEME.colors.primaryLight }]}>
          <Ionicons name="globe-outline" size={20} color={THEME.colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.languageTitle}>{t("languageLabel")}</Text>
          <Text style={styles.languageSubtitle}>{t("languageSub")}</Text>
        </View>
      </View>

      <View style={styles.langPillContainer}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.langPill, language === "bn" && styles.langPillActive]}
          onPress={() => setLanguage("bn")}
        >
          <Text style={[styles.langPillText, language === "bn" && styles.langPillTextActive]}>
            🇧🇩 {t("bangla")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.langPill, language === "en" && styles.langPillActive]}
          onPress={() => setLanguage("en")}
        >
          <Text style={[styles.langPillText, language === "en" && styles.langPillTextActive]}>
            🇬🇧 {t("english")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function AccountScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const myAds = useAppSelector((state) => state.myAds.ads);
  const favourites = useAppSelector((state) => state.favourites.favouriteIds);
  const { language, t, setLanguage } = useLanguage();
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    setAvatarError(false);
  }, [user?.avatar]);

  const userInitials = (user?.name || "User")
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "U";

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchMyAds(true));
      dispatch(loadFavourites());
    }
  }, [dispatch, isAuthenticated]);

  const handleLogout = () => {
    Alert.alert(t("logOutConfirmTitle"), t("logOutConfirmDesc"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("logOut"),
        style: "destructive",
        onPress: () => dispatch(logoutUser()),
      },
    ]);
  };

  // Not logged in view (Guest Scenario)
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t("accountTitle")}</Text>
        </View>

        <View style={styles.container}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ flex: 1, backgroundColor: THEME.colors.background }}
            contentContainerStyle={styles.guestContainer}
          >
          <View style={styles.guestAvatar}>
            <Ionicons name="person" size={40} color={THEME.colors.textMuted} />
          </View>
          <Text style={styles.guestTitle}>{t("welcomeGuestTitle")}</Text>
          <Text style={styles.guestSubtitle}>{t("welcomeGuestSub")}</Text>

          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => dispatch(setAuthModalVisible(true))}
          >
            <Ionicons name="log-in-outline" size={20} color="#FFFFFF" />
            <Text style={styles.loginBtnText}>{t("loginOrSignUp")}</Text>
          </TouchableOpacity>

          {/* Global Language Selector (Available without login) */}
          <View style={{ width: "100%", marginTop: 20 }}>
            <LanguageSwitcherCard
              language={language}
              setLanguage={setLanguage}
              t={t}
            />
          </View>

          <View style={[styles.menuCard, { width: "100%", marginTop: 8 }]}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/safety-tips" as any)}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: THEME.colors.primaryLight }]}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color={THEME.colors.primary}
                />
              </View>
              <Text style={styles.menuLabel}>{t("menuSafety")}</Text>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={THEME.colors.textMuted}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/terms" as any)}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: "#F1F5F9" }]}>
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color={THEME.colors.textSecondary}
                />
              </View>
              <Text style={styles.menuLabel}>{t("menuTerms")}</Text>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={THEME.colors.textMuted}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, { borderBottomWidth: 0 }]}
              onPress={() => router.push("/privacy" as any)}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: "#F1F5F9" }]}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={THEME.colors.textSecondary}
                />
              </View>
              <Text style={styles.menuLabel}>{t("menuPrivacy")}</Text>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={THEME.colors.textMuted}
              />
            </TouchableOpacity>
          </View>
        </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  const avatarUrl =
    user?.avatar ||
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("accountTitle")}</Text>
        <TouchableOpacity
          onPress={() => router.push("/edit-profile" as any)}
          style={styles.editBtn}
        >
          <Ionicons name="pencil" size={18} color={THEME.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
        {/* User Card */}
        <View style={styles.profileCard}>
          {avatarError || !user?.avatar ? (
            <View style={[styles.profileAvatar, styles.avatarFallback]}>
              <Text style={styles.avatarFallbackText}>{userInitials}</Text>
            </View>
          ) : (
            <Image
              source={{ uri: user.avatar }}
              style={styles.profileAvatar}
              contentFit="cover"
              transition={200}
              onError={() => setAvatarError(true)}
            />
          )}
          <View style={styles.profileInfo}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={styles.profileName}>{user?.name || "Serabondhu User"}</Text>
              {user?.isVerified && (
                <Ionicons name="checkmark-circle" size={16} color={THEME.colors.primary} />
              )}
            </View>

            {user?.phone ? (
              <Text style={styles.profileMeta}>{user.phone}</Text>
            ) : null}
            {user?.email ? (
              <Text style={styles.profileMeta}>{user.email}</Text>
            ) : null}

            {/* Role & Location Badge */}
            <View style={styles.badgeRow}>
              {user?.role === "superadmin" ? (
                <View style={styles.adminBadge}>
                  <Ionicons name="shield-outline" size={12} color="#FFFFFF" />
                  <Text style={styles.adminBadgeText}>{t("superadmin")}</Text>
                </View>
              ) : (
                <View style={styles.userBadge}>
                  <Text style={styles.userBadgeText}>{t("verifiedMember")}</Text>
                </View>
              )}

              {user?.city && (
                <View style={styles.cityBadge}>
                  <Ionicons name="location-outline" size={12} color={THEME.colors.textMuted} />
                  <Text style={styles.cityBadgeText}>{user.city}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.statsRow}>
          <TouchableOpacity
            style={styles.statBox}
            onPress={() => router.push("/my-ads" as any)}
          >
            <Text style={styles.statNumber}>{myAds.length}</Text>
            <Text style={styles.statLabel}>{t("statMyAds")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statBox}
            onPress={() => router.push("/favourites" as any)}
          >
            <Text style={styles.statNumber}>{favourites.length}</Text>
            <Text style={styles.statLabel}>{t("statFavourites")}</Text>
          </TouchableOpacity>
        </View>

        {/* Global Language Selector (Available with login) */}
        <LanguageSwitcherCard
          language={language}
          setLanguage={setLanguage}
          t={t}
        />

        {/* Menu Section 1: Listings & Favourites */}
        <View style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/my-ads" as any)}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: THEME.colors.primaryLight }]}>
              <Ionicons name="megaphone-outline" size={20} color={THEME.colors.primary} />
            </View>
            <Text style={styles.menuLabel}>{t("menuMyAds")}</Text>
            <Ionicons name="chevron-forward" size={18} color={THEME.colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/favourites" as any)}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: THEME.colors.accentLight }]}>
              <Ionicons name="heart-outline" size={20} color={THEME.colors.accent} />
            </View>
            <Text style={styles.menuLabel}>{t("menuFavourites")}</Text>
            <Ionicons name="chevron-forward" size={18} color={THEME.colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomWidth: 0 }]}
            onPress={() => router.push("/notifications" as any)}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: "#F0F9FF" }]}>
              <Ionicons name="notifications-outline" size={20} color={THEME.colors.info} />
            </View>
            <Text style={styles.menuLabel}>{t("menuNotifications")}</Text>
            <Ionicons name="chevron-forward" size={18} color={THEME.colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Menu Section 2: Account Settings & Support */}
        <View style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/edit-profile" as any)}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: "#F1F5F9" }]}>
              <Ionicons name="person-circle-outline" size={20} color={THEME.colors.text} />
            </View>
            <Text style={styles.menuLabel}>{t("editProfile")}</Text>
            <Ionicons name="chevron-forward" size={18} color={THEME.colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/safety-tips" as any)}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: THEME.colors.primaryLight }]}>
              <Ionicons name="shield-checkmark-outline" size={20} color={THEME.colors.primary} />
            </View>
            <Text style={styles.menuLabel}>{t("menuSafety")}</Text>
            <Ionicons name="chevron-forward" size={18} color={THEME.colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/terms" as any)}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: "#F1F5F9" }]}>
              <Ionicons name="document-text-outline" size={20} color={THEME.colors.textSecondary} />
            </View>
            <Text style={styles.menuLabel}>{t("menuTerms")}</Text>
            <Ionicons name="chevron-forward" size={18} color={THEME.colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomWidth: 0 }]}
            onPress={() => router.push("/privacy" as any)}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: "#F1F5F9" }]}>
              <Ionicons name="lock-closed-outline" size={20} color={THEME.colors.textSecondary} />
            </View>
            <Text style={styles.menuLabel}>{t("menuPrivacy")}</Text>
            <Ionicons name="chevron-forward" size={18} color={THEME.colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={THEME.colors.danger} />
          <Text style={styles.logoutBtnText}>{t("logOut")}</Text>
        </TouchableOpacity>

        {/* Delete Account Link */}
        <TouchableOpacity
          style={styles.deleteAccountLink}
          onPress={() => router.push("/delete-account" as any)}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={16} color={THEME.colors.textMuted} />
          <Text style={styles.deleteAccountLinkText}>{t("deleteAccount")}</Text>
        </TouchableOpacity>
      </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.surface,
  },
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: THEME.colors.text,
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.surface,
    padding: 16,
    borderRadius: THEME.radii.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 16,
    ...THEME.shadows.sm,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#E2E8F0",
  },
  avatarFallback: {
    backgroundColor: THEME.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarFallbackText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
  },
  profileInfo: {
    marginLeft: 14,
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "800",
    color: THEME.colors.text,
  },
  profileMeta: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 6,
  },
  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  adminBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  userBadge: {
    backgroundColor: THEME.colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  userBadgeText: {
    color: THEME.colors.primary,
    fontSize: 10,
    fontWeight: "700",
  },
  cityBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  cityBadgeText: {
    fontSize: 10,
    color: THEME.colors.textMuted,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radii.md,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.sm,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: THEME.colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
    fontWeight: "500",
  },
  languageCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radii.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 16,
    width: "100%",
    ...THEME.shadows.sm,
  },
  languageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  languageTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: THEME.colors.text,
  },
  languageSubtitle: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  langPillContainer: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: THEME.radii.md,
    padding: 4,
    gap: 6,
  },
  langPill: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: THEME.radii.sm,
  },
  langPillActive: {
    backgroundColor: THEME.colors.primary,
    ...THEME.shadows.sm,
  },
  langPillText: {
    fontSize: 13,
    fontWeight: "700",
    color: THEME.colors.textSecondary,
  },
  langPillTextActive: {
    color: "#FFFFFF",
  },
  menuCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radii.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 16,
    overflow: "hidden",
    ...THEME.shadows.sm,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: THEME.colors.text,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: THEME.colors.dangerLight,
    paddingVertical: 14,
    borderRadius: THEME.radii.md,
    gap: 8,
    marginTop: 8,
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: THEME.colors.danger,
  },
  deleteAccountLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    marginTop: 6,
    gap: 6,
  },
  deleteAccountLinkText: {
    fontSize: 13,
    fontWeight: "600",
    color: THEME.colors.textMuted,
  },
  guestContainer: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 36,
  },
  guestAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: THEME.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.sm,
  },
  guestTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: THEME.colors.text,
    marginBottom: 8,
  },
  guestSubtitle: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
  },
  loginBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: THEME.radii.md,
    gap: 8,
    width: "100%",
    justifyContent: "center",
  },
  loginBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
