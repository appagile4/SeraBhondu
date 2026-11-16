import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api";
import { ChatConversation, ChatMessage, MessageAttachment } from "@/types/chat";

interface ChatState {
  conversations: ChatConversation[];
  activeConversationId: string | null;
  messagesByConversation: Record<string, ChatMessage[]>;
  hasMoreByConversation: Record<string, boolean>;
  typingUsers: Record<string, { isTyping: boolean; userName?: string }>;
  onlineUsers: Record<string, { isOnline: boolean; lastSeen?: string | null }>;
  replyingToMessage: ChatMessage | null;
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isUploadingAttachment: boolean;
  error: string | null;
}

const initialState: ChatState = {
  conversations: [],
  activeConversationId: null,
  messagesByConversation: {},
  hasMoreByConversation: {},
  typingUsers: {},
  onlineUsers: {},
  replyingToMessage: null,
  isLoadingConversations: false,
  isLoadingMessages: false,
  isUploadingAttachment: false,
  error: null,
};

// 1. Fetch Conversations
export const fetchConversations = createAsyncThunk(
  "chat/fetchConversations",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/chat/conversations");
      if (res.data?.success) {
        return res.data.conversations;
      }
      return [];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to load chats");
    }
  }
);

// 2. Fetch Messages for a conversation
export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async (
    { conversationId, before }: { conversationId: string; before?: string },
    { rejectWithValue }
  ) => {
    try {
      const url = before
        ? `/chat/conversations/${conversationId}/messages?before=${encodeURIComponent(before)}`
        : `/chat/conversations/${conversationId}/messages`;
      const res = await api.get(url);
      if (res.data?.success) {
        return {
          conversationId,
          messages: res.data.messages,
          hasMore: res.data.hasMore,
          isLoadMore: Boolean(before),
        };
      }
      return { conversationId, messages: [], hasMore: false, isLoadMore: false };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to load messages");
    }
  }
);

// 3. Upload Attachment to Cloudinary
export const uploadAttachment = createAsyncThunk(
  "chat/uploadAttachment",
  async (file: File, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post("/chat/attachments/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success && res.data.attachment) {
        return res.data.attachment as MessageAttachment;
      }
      return rejectWithValue("Upload failed");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to upload image");
    }
  }
);

// 4. Mark Conversation as Read
export const markConversationReadThunk = createAsyncThunk(
  "chat/markConversationRead",
  async (conversationId: string, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/chat/conversations/${conversationId}/read`);
      return { conversationId, success: res.data?.success };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to mark read");
    }
  }
);

// 5. Delete Message
export const deleteMessageThunk = createAsyncThunk(
  "chat/deleteMessage",
  async (
    { messageId, deleteForEveryone = false }: { messageId: string; deleteForEveryone?: boolean },
    { rejectWithValue }
  ) => {
    try {
      await api.delete(`/chat/messages/${messageId}`, {
        data: { deleteForEveryone },
      });
      return { messageId, deleteForEveryone };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete message");
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setActiveConversation(state, action: PayloadAction<string | null>) {
      state.activeConversationId = action.payload;
      state.replyingToMessage = null;

      if (action.payload) {
        const conv = state.conversations.find((c) => c.id === action.payload || c._id === action.payload);
        if (conv) conv.unreadCount = 0;
      }
    },
    setReplyingTo(state, action: PayloadAction<ChatMessage | null>) {
      state.replyingToMessage = action.payload;
    },
    clearReplyingTo(state) {
      state.replyingToMessage = null;
    },
    addIncomingMessage(state, action: PayloadAction<ChatMessage>) {
      const msg = action.payload;
      const convId = msg.conversation || state.activeConversationId;
      if (!convId) return;

      if (!state.messagesByConversation[convId]) {
        state.messagesByConversation[convId] = [];
      }

      const list = state.messagesByConversation[convId];
      const exists = list.some((m) => m.id === msg.id || (msg.clientMessageId && m.clientMessageId === msg.clientMessageId));

      if (exists) {
        // Update existing message
        const idx = list.findIndex((m) => m.id === msg.id || (msg.clientMessageId && m.clientMessageId === msg.clientMessageId));
        if (idx !== -1) list[idx] = msg;
      } else {
        list.push(msg);
      }

      // Update conversation in list
      const convIdx = state.conversations.findIndex((c) => c.id === convId || c._id === convId);
      if (convIdx !== -1) {
        const updated = { ...state.conversations[convIdx] };
        updated.lastMessage = msg.text || msg.message || "";
        updated.lastMessageTime = msg.timestamp;
        updated.updatedAt = msg.createdAt;

        // If not active conversation, increment unread
        if (state.activeConversationId !== convId && !msg.isMe) {
          updated.unreadCount = (updated.unreadCount || 0) + 1;
        }

        state.conversations.splice(convIdx, 1);
        state.conversations.unshift(updated);
      } else {
        // Conversation doesn't exist in state list yet, create a conversation card
        const sender = (msg as any).sender;
        const senderName = typeof sender === "object" ? sender?.name : (msg as any).senderName || "New Chat";
        const senderAvatar = typeof sender === "object" ? sender?.avatar : "";

        state.conversations.unshift({
          id: convId,
          _id: convId,
          productId: "",
          productTitle: "Classified Inquiry",
          productPrice: 0,
          productImage: "",
          buyerId: "",
          sellerId: typeof sender === "object" ? (sender?._id || "") : (sender || ""),
          sellerName: senderName,
          sellerAvatar: senderAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
          lastMessage: msg.text || msg.message || "",
          lastMessageTime: msg.timestamp || new Date().toISOString(),
          unreadCount: state.activeConversationId !== convId && !msg.isMe ? 1 : 0,
          updatedAt: msg.createdAt || new Date().toISOString(),
        });
      }
    },
    markConversationReadLocally(state, action: PayloadAction<string>) {
      const convId = action.payload;
      const conv = state.conversations.find((c) => c.id === convId || c._id === convId);
      if (conv) {
        conv.unreadCount = 0;
      }
    },
    updateMessageStatus(
      state,
      action: PayloadAction<{
        conversationId: string;
        messageId?: string;
        status: "delivered" | "read";
      }>
    ) {
      const { conversationId, messageId, status } = action.payload;
      const list = state.messagesByConversation[conversationId];
      if (!list) return;

      if (status === "read") {
        list.forEach((m) => {
          if (m.isMe) {
            m.status = "read";
            m.isRead = true;
          }
        });
      } else if (status === "delivered") {
        list.forEach((m) => {
          if (m.isMe && m.status === "sent") {
            if (!messageId || m.id === messageId || m._id === messageId) {
              m.status = "delivered";
            }
          }
        });
      }
    },
    setTypingStatus(
      state,
      action: PayloadAction<{
        conversationId: string;
        isTyping: boolean;
        userName?: string;
      }>
    ) {
      const { conversationId, isTyping, userName } = action.payload;
      state.typingUsers[conversationId] = { isTyping, userName };
    },
    setUserPresence(
      state,
      action: PayloadAction<{
        userId: string;
        isOnline: boolean;
        lastSeen?: string | null;
      }>
    ) {
      const { userId, isOnline, lastSeen } = action.payload;
      state.onlineUsers[userId] = { isOnline, lastSeen };
    },
  },
  extraReducers: (builder) => {
    // Fetch conversations
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.isLoadingConversations = true;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.isLoadingConversations = false;
        const currentUserId = typeof window !== "undefined"
          ? (() => {
              try {
                const u = JSON.parse(
                  localStorage.getItem("khojobangla_user") ||
                  localStorage.getItem("khojobangla_admin_user") ||
                  "{}"
                );
                return (u.id || u._id || "").toString();
              } catch {
                return "";
              }
            })()
          : "";

        state.conversations = action.payload.map((conv: any) => {
          const participants = conv.participants || [];
          // Resolve partner as the other participant who is not the current user
          const partner =
            participants.find(
              (p: any) => (p._id || p.id || "").toString() !== currentUserId
            ) ||
            participants.find(
              (p: any) => (p._id || p.id || "").toString() === conv.seller?.toString()
            ) ||
            participants[0] ||
            {};

          const partnerName = partner.name || "User";
          const partnerAvatar =
            partner.avatar ||
            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80";

          return {
            id: conv._id,
            _id: conv._id,
            productId: conv.advertisement?._id || "",
            productTitle: conv.advertisement?.title || "Classified Item",
            productPrice: conv.advertisement?.price || 0,
            productImage:
              conv.advertisement?.images?.[0]?.url ||
              (typeof conv.advertisement?.images?.[0] === "string" ? conv.advertisement.images[0] : ""),
            productSlug: conv.advertisement?.slug,
            productLocation: conv.advertisement?.location?.city || "Nepal",
            buyerId: conv.buyer,
            sellerId: (partner._id || partner.id || "").toString(),
            sellerName: partnerName,
            sellerAvatar: partnerAvatar,
            sellerPhone: partner.phone,
            sellerVerified: partner.isVerified,
            lastMessage: conv.lastMessage || conv.lastMessageText || "",
            lastMessageTime: conv.lastMessageAt || conv.updatedAt || "",
            unreadCount: conv.unreadCount || 0,
            updatedAt: conv.lastMessageAt || conv.updatedAt,
          };
        });
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoadingConversations = false;
        state.error = action.payload as string;
      });

    // Fetch messages
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.isLoadingMessages = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoadingMessages = false;
        const { conversationId, messages, hasMore, isLoadMore } = action.payload;

        if (isLoadMore) {
          const current = state.messagesByConversation[conversationId] || [];
          state.messagesByConversation[conversationId] = [...messages, ...current];
        } else {
          state.messagesByConversation[conversationId] = messages;
        }
        state.hasMoreByConversation[conversationId] = hasMore;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoadingMessages = false;
        state.error = action.payload as string;
      });

    // Upload attachment
    builder
      .addCase(uploadAttachment.pending, (state) => {
        state.isUploadingAttachment = true;
      })
      .addCase(uploadAttachment.fulfilled, (state) => {
        state.isUploadingAttachment = false;
      })
      .addCase(uploadAttachment.rejected, (state, action) => {
        state.isUploadingAttachment = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setActiveConversation,
  setReplyingTo,
  clearReplyingTo,
  addIncomingMessage,
  updateMessageStatus,
  setTypingStatus,
  setUserPresence,
  markConversationReadLocally,
} = chatSlice.actions;

export const selectTotalUnreadCount = (state: { chat: ChatState }) =>
  state.chat.conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);

export default chatSlice.reducer;
