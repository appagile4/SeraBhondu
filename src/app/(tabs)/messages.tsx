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
import { Image } from "expo-image";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchConversations, ConversationItem } from "../../store/slices/chatSlice";
import { setAuthModalVisible } from "../../store/slices/authSlice";
import { THEME } from "../../constants/theme";
import { useLanguage } from "../../hooks/useLanguage";

export default function MessagesScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { conversations, isLoadingConversations } = useAppSelector((state) => state.chat);
  const { t, isEn } = useLanguage();

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchConversations());
    }
  }, [dispatch, isAuthenticated]);

  const onRefresh = () => {
    if (isAuthenticated) {
      dispatch(fetchConversations());
    }
  };

  const handleOpenConversation = (conversation: ConversationItem) => {
    router.push({
      pathname: "/chat/[id]",
      params: { id: conversation._id },
    } as any);
  };

  // Not logged in view
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.authPromptContainer}>
          <View style={styles.authIconCircle}>
            <Ionicons name="chatbubbles" size={32} color={THEME.colors.primary} />
          </View>
          <Text style={styles.authPromptTitle}>{t("chatsAuthPromptTitle")}</Text>
          <Text style={styles.authPromptSubtitle}>
            {t("chatsAuthPromptDesc")}
          </Text>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => dispatch(setAuthModalVisible(true))}
          >
            <Ionicons name="log-in-outline" size={20} color="#FFFFFF" />
            <Text style={styles.signInButtonText}>{t("loginOrSignUp")}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("chatsTitle")}</Text>
        <Text style={styles.headerSubtitle}>
          {t("chatsSub")}
        </Text>
      </View>

      <View style={styles.container}>
        <FlatList
          data={conversations}
          keyExtractor={(item) => item._id}
          style={{ flex: 1, backgroundColor: THEME.colors.background }}
          contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoadingConversations}
            onRefresh={onRefresh}
            colors={[THEME.colors.primary]}
            tintColor={THEME.colors.primary}
          />
        }
        renderItem={({ item }) => {
          // Identify the other participant
          const otherUser =
            item.participants?.find((p) => p._id !== user?._id) || item.participants?.[0];

          const avatarUrl =
            otherUser?.avatar ||
            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80";

          const adImage =
            item.advertisement?.images?.[0]?.url ||
            "https://images.unsplash.com/photo-1581291518655-9523c932edcf?auto=format&fit=crop&w=200&q=80";

          const hasUnread = (item.unreadCount || 0) > 0;

          return (
            <TouchableOpacity
              style={[styles.conversationRow, hasUnread && styles.conversationRowUnread]}
              onPress={() => handleOpenConversation(item)}
              activeOpacity={0.7}
            >
              {/* User Avatar */}
              <View style={styles.avatarWrap}>
                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                {otherUser?.isVerified && (
                  <View style={styles.verifiedDot}>
                    <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                  </View>
                )}
              </View>

              {/* Message Details */}
              <View style={styles.contentWrap}>
                <View style={styles.topRow}>
                  <Text style={[styles.userName, hasUnread && styles.userNameBold]} numberOfLines={1}>
                    {otherUser?.name || (isEn ? "Serabondhu User" : "সেরা বন্ধু ব্যবহারকারী")}
                  </Text>
                  <Text style={styles.timeText}>
                    {item.lastMessage?.createdAt
                      ? new Date(item.lastMessage.createdAt).toLocaleDateString(isEn ? "en-US" : "bn-BD", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </Text>
                </View>

                {item.advertisement?.title && (
                  <Text style={styles.adTitle} numberOfLines={1}>
                    {item.advertisement.title}
                  </Text>
                )}

                <View style={styles.bottomRow}>
                  <Text
                    style={[styles.lastMsg, hasUnread && styles.lastMsgUnread]}
                    numberOfLines={1}
                  >
                    {item.lastMessage?.text || t("attachmentSent", isEn ? "Photo or attachment sent" : "ছবি বা এটাচমেন্ট পাঠানো হয়েছে")}
                  </Text>

                  {hasUnread && (
                    <View style={styles.unreadCountBadge}>
                      <Text style={styles.unreadCountText}>{item.unreadCount}</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Ad Thumbnail */}
              {item.advertisement && (
                <Image source={{ uri: adImage }} style={styles.adThumbnail} />
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          !isLoadingConversations ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={44}
                  color={THEME.colors.primary}
                />
              </View>
              <Text style={styles.emptyTitle}>{t("noChatsTitle")}</Text>
              <Text style={styles.emptySubtitle}>
                {t("noChatsSub")}
              </Text>
              <TouchableOpacity
                style={styles.browseBtn}
                onPress={() => router.push("/(tabs)" as any)}
              >
                <Text style={styles.browseBtnText}>{t("browseAds", isEn ? "Browse Classifieds" : "বিজ্ঞাপন দেখুন")}</Text>
              </TouchableOpacity>
            </View>
          ) : undefined
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
  headerSubtitle: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  listContent: {
    paddingVertical: 8,
  },
  conversationRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.divider,
  },
  conversationRowUnread: {
    backgroundColor: THEME.colors.primaryLight,
  },
  avatarWrap: {
    position: "relative",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E2E8F0",
  },
  verifiedDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: THEME.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  contentWrap: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userName: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.colors.text,
    flex: 1,
  },
  userNameBold: {
    fontWeight: "800",
  },
  timeText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginLeft: 6,
  },
  adTitle: {
    fontSize: 11,
    color: THEME.colors.primary,
    fontWeight: "600",
    marginTop: 1,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 3,
  },
  lastMsg: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    flex: 1,
  },
  lastMsgUnread: {
    color: THEME.colors.text,
    fontWeight: "700",
  },
  unreadCountBadge: {
    backgroundColor: THEME.colors.accent,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    marginLeft: 6,
  },
  unreadCountText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  adThumbnail: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: THEME.colors.primaryLight,
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
    marginBottom: 20,
  },
  browseBtn: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: THEME.radii.md,
  },
  browseBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  authPromptContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  authIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: THEME.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  authPromptTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: THEME.colors.text,
    marginBottom: 8,
  },
  authPromptSubtitle: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
  },
  signInButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: THEME.radii.md,
    gap: 8,
  },
  signInButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
