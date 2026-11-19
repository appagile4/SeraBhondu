import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchMessages,
  sendMessageThunk,
  setActiveConversation,
  receiveMessage,
  markConversationAsReadInState,
} from "../../store/slices/chatSlice";
import { chatApi } from "../../services/api";
import { initSocket } from "../../services/socket";
import { THEME } from "../../constants/theme";

export default function ChatRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const user = useAppSelector((state) => state.auth.user);
  const conversation = useAppSelector((state) =>
    state.chat.conversations.find((c) => c._id === id)
  );
  const messages = useAppSelector((state) =>
    id ? state.chat.messages[id] || [] : []
  );
  const isLoading = useAppSelector((state) => state.chat.isLoadingMessages);

  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Setup conversation, messages, and socket listener
  useEffect(() => {
    if (id) {
      dispatch(setActiveConversation(id));
      dispatch(fetchMessages(id));
      dispatch(markConversationAsReadInState(id));
      chatApi.markRead(id).catch(() => {});

      // Initialize Socket connection and listeners
      initSocket().then((socket) => {
        socket.emit("join", { conversationId: id, userId: user?._id });

        const handleNewMessage = (data: any) => {
          if (data && data.conversation === id) {
            dispatch(receiveMessage(data));
          }
        };

        socket.on("private_message", handleNewMessage);
        socket.on("message_sent", handleNewMessage);

        return () => {
          socket.off("private_message", handleNewMessage);
          socket.off("message_sent", handleNewMessage);
        };
      });
    }

    return () => {
      dispatch(setActiveConversation(null));
    };
  }, [id, dispatch, user?._id]);

  const handleSend = async () => {
    if (!inputText.trim() || sending || !id) return;

    const text = inputText.trim();
    setInputText("");
    setSending(true);

    try {
      await dispatch(sendMessageThunk({ conversationId: id, text })).unwrap();
    } catch (err: any) {
      Alert.alert("ব্যর্থ হয়েছে", err || "বার্তা পাঠানো যায়নি।");
    } finally {
      setSending(false);
    }
  };

  const handlePickAttachment = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("অনুমতি প্রয়োজন", "ছবি পাঠাতে ফটো লাইব্রেরির অনুমতি দিন।");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0] && id) {
        const asset = result.assets[0];
        const formData = new FormData();
        const filename = asset.uri.split("/").pop() || "chat_photo.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";

        formData.append("file", {
          uri: Platform.OS === "ios" ? asset.uri.replace("file://", "") : asset.uri,
          name: filename,
          type,
        } as any);

        setSending(true);
        const uploadRes = await chatApi.uploadAttachment(formData);
        if (uploadRes.data?.attachment) {
          await dispatch(
            sendMessageThunk({
              conversationId: id,
              text: "ছবি পাঠানো হয়েছে",
              attachment: uploadRes.data.attachment,
            })
          ).unwrap();
        }
      }
    } catch (err) {
      console.warn("Attachment error:", err);
    } finally {
      setSending(false);
    }
  };

  // Find other participant
  const otherUser =
    conversation?.participants?.find((p) => p._id !== user?._id) ||
    conversation?.participants?.[0];

  const avatarUrl =
    otherUser?.avatar ||
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={THEME.colors.text} />
        </TouchableOpacity>

        <Image source={{ uri: avatarUrl }} style={styles.headerAvatar} />

        <View style={styles.headerInfo}>
          <Text style={styles.headerName} numberOfLines={1}>
            {otherUser?.name || "Serabondhu User"}
          </Text>
          <Text style={styles.headerStatus}>সেরা বন্ধু নিরাপদ বার্তা</Text>
        </View>

        {conversation?.advertisement && (
          <TouchableOpacity
            style={styles.adHeaderBadge}
            onPress={() => {
              if (conversation.advertisement?.slug) {
                router.push({
                  pathname: "/listing/[slug]",
                  params: { slug: conversation.advertisement.slug },
                } as any);
              }
            }}
          >
            <Text style={styles.adBadgeText} numberOfLines={1}>
              {conversation.advertisement.title}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Message List */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, backgroundColor: THEME.colors.background }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item._id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => {
            const isMe =
              item.sender?._id === user?._id ||
              (typeof item.sender === "string" && item.sender === user?._id);

            return (
              <View
                style={[
                  styles.messageBubbleWrap,
                  isMe ? styles.bubbleRight : styles.bubbleLeft,
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    isMe ? styles.bubbleMe : styles.bubbleOther,
                  ]}
                >
                  {item.attachment && (
                    <Image
                      source={{ uri: item.attachment.url }}
                      style={styles.attachmentImg}
                      contentFit="cover"
                    />
                  )}
                  {item.text ? (
                    <Text
                      style={[
                        styles.messageText,
                        isMe ? styles.messageTextMe : styles.messageTextOther,
                      ]}
                    >
                      {item.text}
                    </Text>
                  ) : null}

                  <Text
                    style={[
                      styles.msgTime,
                      isMe ? styles.msgTimeMe : styles.msgTimeOther,
                    ]}
                  >
                    {new Date(item.createdAt).toLocaleTimeString("bn-BD", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.emptyWrap}>
                <Ionicons name="chatbubbles-outline" size={40} color={THEME.colors.textMuted} />
                <Text style={styles.emptyText}>কোনো পূর্ববর্তী বার্তা নেই</Text>
                <Text style={styles.emptySubtext}>নিচে লিখে সরাসরি বিক্রেতাকে বার্তা পাঠান</Text>
              </View>
            ) : (
              <ActivityIndicator style={{ marginTop: 40 }} color={THEME.colors.primary} />
            )
          }
        />

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TouchableOpacity
            style={styles.attachBtn}
            onPress={handlePickAttachment}
            disabled={sending}
          >
            <Ionicons name="image-outline" size={24} color={THEME.colors.primary} />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="বার্তা লিখুন..."
            placeholderTextColor={THEME.colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
          />

          <TouchableOpacity
            style={[
              styles.sendBtn,
              (!inputText.trim() || sending) && styles.sendBtnDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Ionicons name="send" size={18} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  backBtn: {
    padding: 4,
    marginRight: 8,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E2E8F0",
  },
  headerInfo: {
    flex: 1,
    marginLeft: 10,
  },
  headerName: {
    fontSize: 15,
    fontWeight: "700",
    color: THEME.colors.text,
  },
  headerStatus: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  adHeaderBadge: {
    backgroundColor: THEME.colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: THEME.radii.full,
    maxWidth: 120,
  },
  adBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: THEME.colors.primary,
  },
  messagesList: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageBubbleWrap: {
    marginBottom: 10,
    flexDirection: "row",
  },
  bubbleRight: {
    justifyContent: "flex-end",
  },
  bubbleLeft: {
    justifyContent: "flex-end",
    flexDirection: "row-reverse",
  },
  messageBubble: {
    maxWidth: "78%",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 9,
    ...THEME.shadows.sm,
  },
  bubbleMe: {
    backgroundColor: THEME.colors.primary,
    borderBottomRightRadius: 2,
  },
  bubbleOther: {
    backgroundColor: THEME.colors.surface,
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  attachmentImg: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginBottom: 6,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageTextMe: {
    color: "#FFFFFF",
  },
  messageTextOther: {
    color: THEME.colors.text,
  },
  msgTime: {
    fontSize: 9,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  msgTimeMe: {
    color: "rgba(255, 255, 255, 0.75)",
  },
  msgTimeOther: {
    color: THEME.colors.textMuted,
  },
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "700",
    color: THEME.colors.text,
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    marginTop: 4,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    gap: 8,
  },
  attachBtn: {
    padding: 6,
  },
  input: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.radii.full,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 14,
    color: THEME.colors.text,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
});
