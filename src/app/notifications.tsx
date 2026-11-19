import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchNotifications,
  markAllNotificationsReadThunk,
  markNotificationAsReadInState,
} from "../store/slices/notificationsSlice";
import { notificationsApi } from "../services/api";
import { THEME } from "../constants/theme";

export default function NotificationsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { notifications, unreadCount, isLoading } = useAppSelector(
    (state) => state.notifications
  );

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const onRefresh = () => {
    dispatch(fetchNotifications());
  };

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsReadThunk());
  };

  const handleNotificationPress = async (item: any) => {
    if (!item.isRead) {
      dispatch(markNotificationAsReadInState(item._id));
      notificationsApi.markRead(item._id).catch(() => {});
    }

    if (item.link) {
      if (item.link.startsWith("/listing/")) {
        const slug = item.link.replace("/listing/", "");
        router.push({ pathname: "/listing/[slug]", params: { slug } } as any);
      } else if (item.link.startsWith("/chat/")) {
        const id = item.link.replace("/chat/", "");
        router.push({ pathname: "/chat/[id]", params: { id } } as any);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={THEME.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>নোটিফিকেশন (Notifications)</Text>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={styles.readAllText}>সব পঠিত</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 44 }} />
        )}
      </View>

      <View style={styles.container}>
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            colors={[THEME.colors.primary]}
            tintColor={THEME.colors.primary}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
            onPress={() => handleNotificationPress(item)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrap, !item.isRead && styles.unreadIconWrap]}>
              <Ionicons
                name={
                  item.type === "message"
                    ? "chatbubbles"
                    : item.type === "ad_approved"
                    ? "checkmark-circle"
                    : "notifications"
                }
                size={20}
                color={!item.isRead ? THEME.colors.primary : THEME.colors.textSecondary}
              />
            </View>

            <View style={styles.contentWrap}>
              <View style={styles.topRow}>
                <Text style={[styles.title, !item.isRead && styles.unreadTitle]}>
                  {item.title}
                </Text>
                {!item.isRead && <View style={styles.unreadDot} />}
              </View>
              <Text style={styles.message}>{item.message}</Text>
              <Text style={styles.time}>
                {new Date(item.createdAt).toLocaleDateString("bn-BD", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="notifications-off-outline" size={44} color={THEME.colors.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>কোনো নোটিফিকেশন নেই</Text>
              <Text style={styles.emptySubtitle}>
                বিজ্ঞাপনের আপডেট বা নতুন মেসেজ আসলে আপনি এখানে দেখতে পাবেন।
              </Text>
            </View>
          ) : (
            <ActivityIndicator style={{ marginTop: 40 }} color={THEME.colors.primary} />
          )
        }
      />
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
    paddingVertical: 12,
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: THEME.colors.text,
  },
  readAllText: {
    fontSize: 12,
    fontWeight: "700",
    color: THEME.colors.primary,
  },
  listContent: {
    paddingVertical: 8,
  },
  notificationCard: {
    flexDirection: "row",
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
  },
  unreadCard: {
    backgroundColor: THEME.colors.primaryLight,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  unreadIconWrap: {
    backgroundColor: "#FFFFFF",
  },
  contentWrap: {
    flex: 1,
    marginLeft: 12,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
    color: THEME.colors.text,
    flex: 1,
  },
  unreadTitle: {
    fontWeight: "800",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.accent,
    marginLeft: 6,
  },
  message: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    lineHeight: 18,
    marginTop: 2,
  },
  time: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: THEME.colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    textAlign: "center",
    lineHeight: 18,
  },
});
