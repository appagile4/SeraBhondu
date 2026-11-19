import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import { Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { THEME } from "../../constants/theme";
import { useAppSelector } from "../../store/hooks";
import { useLanguage } from "../../hooks/useLanguage";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const unreadTotal = useAppSelector((state) => state.chat.unreadTotal);
  const { t } = useLanguage();

  // Tailored paddingBottom: compact on iOS, spacious on Android
  const paddingBottom =
    Platform.OS === "ios"
      ? insets.bottom > 0
        ? 22
        : 12
      : Math.max(insets.bottom, 16) + 8;
  const tabHeight = 52 + paddingBottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: THEME.colors.primary,
        tabBarInactiveTintColor: THEME.colors.textMuted,
        tabBarStyle: {
          backgroundColor: THEME.colors.surface,
          borderTopColor: THEME.colors.border,
          borderTopWidth: 1,
          height: tabHeight,
          paddingBottom: paddingBottom,
          paddingTop: 8,
          ...THEME.shadows.md,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      {/* 1. Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabHome"),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={22}
              color={color as any}
            />
          ),
        }}
      />

      {/* 2. Categories Tab */}
      <Tabs.Screen
        name="categories"
        options={{
          title: t("tabCategories"),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "grid" : "grid-outline"}
              size={22}
              color={color as any}
            />
          ),
        }}
      />

      {/* 3. Post Ad / SELL Tab (Elevated Center Button) */}
      <Tabs.Screen
        name="post-ad"
        options={{
          title: t("tabSell"),
          tabBarLabel: ({ focused }) => (
            <Text
              style={[
                styles.sellLabel,
                {
                  color: focused
                    ? THEME.colors.accentDark
                    : THEME.colors.accent,
                },
              ]}
            >
              {t("tabSell")}
            </Text>
          ),
          tabBarIcon: () => (
            <View style={styles.sellButtonWrap}>
              <View style={styles.sellButtonInner}>
                <Ionicons name="add" size={26} color="#FFFFFF" />
              </View>
            </View>
          ),
        }}
      />

      {/* 4. Messages / Chats Tab */}
      <Tabs.Screen
        name="messages"
        options={{
          title: t("tabChat"),
          tabBarIcon: ({ color, focused }) => (
            <View style={{ position: "relative" }}>
              <Ionicons
                name={focused ? "chatbubbles" : "chatbubbles-outline"}
                size={22}
                color={color as any}
              />
              {unreadTotal > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>
                    {unreadTotal > 9 ? "9+" : unreadTotal}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />

      {/* 5. Account / Profile Tab */}
      <Tabs.Screen
        name="account"
        options={{
          title: t("tabAccount"),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={22}
              color={color as any}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  sellButtonWrap: {
    top: -14,
    justifyContent: "center",
    alignItems: "center",
  },
  sellButtonInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: THEME.colors.accent,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    ...THEME.shadows.md,
  },
  sellLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginTop: -4,
  },
  unreadBadge: {
    position: "absolute",
    top: -4,
    right: -6,
    backgroundColor: THEME.colors.accent,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  unreadBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "700",
  },
});
