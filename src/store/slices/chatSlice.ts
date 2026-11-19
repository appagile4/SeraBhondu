import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { chatApi } from "../../services/api";

export interface ChatMessage {
  _id: string;
  conversation: string;
  sender: {
    _id: string;
    name: string;
    avatar?: string;
  };
  text: string;
  attachment?: {
    url: string;
    fileType: string;
    fileName?: string;
  };
  isRead: boolean;
  createdAt: string;
}

export interface ConversationItem {
  _id: string;
  participants: Array<{
    _id: string;
    name: string;
    avatar?: string;
    phone?: string;
    isVerified?: boolean;
  }>;
  advertisement?: {
    _id: string;
    title: string;
    price: number;
    images?: Array<{ url: string }>;
    slug?: string;
    status?: string;
  };
  lastMessage?: {
    text: string;
    sender: string;
    createdAt: string;
    isRead: boolean;
  };
  unreadCount?: number;
  updatedAt: string;
}

interface ChatState {
  conversations: ConversationItem[];
  messages: Record<string, ChatMessage[]>; // keyed by conversationId
  activeConversationId: string | null;
  unreadTotal: number;
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isSendingMessage: boolean;
  error: string | null;
}

const initialState: ChatState = {
  conversations: [],
  messages: {},
  activeConversationId: null,
  unreadTotal: 0,
  isLoadingConversations: false,
  isLoadingMessages: false,
  isSendingMessage: false,
  error: null,
};

// Fetch conversations list
export const fetchConversations = createAsyncThunk(
  "chat/fetchConversations",
  async (_, { rejectWithValue }) => {
    try {
      const res = await chatApi.getConversations();
      return res.data.conversations || [];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to load chats");
    }
  }
);

// Fetch messages for a conversation
export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async (conversationId: string, { rejectWithValue }) => {
    try {
      const res = await chatApi.getMessages(conversationId);
      return {
        conversationId,
        messages: res.data.messages || [],
      };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to load messages");
    }
  }
);

// Send message
export const sendMessageThunk = createAsyncThunk(
  "chat/sendMessage",
  async (
    payload: { conversationId: string; text: string; attachment?: any },
    { rejectWithValue }
  ) => {
    try {
      const res = await chatApi.sendMessage(
        payload.conversationId,
        payload.text,
        payload.attachment
      );
      return res.data.message;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to send message");
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setActiveConversation(state, action: PayloadAction<string | null>) {
      state.activeConversationId = action.payload;
    },
    receiveMessage(state, action: PayloadAction<ChatMessage>) {
      const msg = action.payload;
      const convId = msg.conversation;

      if (!state.messages[convId]) {
        state.messages[convId] = [];
      }

      // Avoid duplicate
      if (!state.messages[convId].some((m) => m._id === msg._id)) {
        state.messages[convId].push(msg);
      }

      // Update conversation in list
      const conv = state.conversations.find((c) => c._id === convId);
      if (conv) {
        conv.lastMessage = {
          text: msg.text,
          sender: typeof msg.sender === "object" ? msg.sender._id : msg.sender,
          createdAt: msg.createdAt,
          isRead: false,
        };
        conv.updatedAt = msg.createdAt;
        if (state.activeConversationId !== convId) {
          conv.unreadCount = (conv.unreadCount || 0) + 1;
          state.unreadTotal += 1;
        }
      }
    },
    markConversationAsReadInState(state, action: PayloadAction<string>) {
      const convId = action.payload;
      const conv = state.conversations.find((c) => c._id === convId);
      if (conv && conv.unreadCount) {
        state.unreadTotal = Math.max(0, state.unreadTotal - conv.unreadCount);
        conv.unreadCount = 0;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch conversations
    builder.addCase(fetchConversations.pending, (state) => {
      state.isLoadingConversations = true;
    });
    builder.addCase(fetchConversations.fulfilled, (state, action) => {
      state.isLoadingConversations = false;
      state.conversations = action.payload;
      state.unreadTotal = action.payload.reduce(
        (sum: number, c: ConversationItem) => sum + (c.unreadCount || 0),
        0
      );
    });
    builder.addCase(fetchConversations.rejected, (state, action) => {
      state.isLoadingConversations = false;
      state.error = action.payload as string;
    });

    // Fetch messages
    builder.addCase(fetchMessages.pending, (state) => {
      state.isLoadingMessages = true;
    });
    builder.addCase(fetchMessages.fulfilled, (state, action) => {
      state.isLoadingMessages = false;
      const { conversationId, messages } = action.payload;
      state.messages[conversationId] = messages;
    });
    builder.addCase(fetchMessages.rejected, (state, action) => {
      state.isLoadingMessages = false;
      state.error = action.payload as string;
    });

    // Send message
    builder.addCase(sendMessageThunk.pending, (state) => {
      state.isSendingMessage = true;
    });
    builder.addCase(sendMessageThunk.fulfilled, (state, action) => {
      state.isSendingMessage = false;
      const msg = action.payload;
      if (msg && msg.conversation) {
        const convId = msg.conversation;
        if (!state.messages[convId]) {
          state.messages[convId] = [];
        }
        if (!state.messages[convId].some((m) => m._id === msg._id)) {
          state.messages[convId].push(msg);
        }

        const conv = state.conversations.find((c) => c._id === convId);
        if (conv) {
          conv.lastMessage = {
            text: msg.text,
            sender: typeof msg.sender === "object" ? msg.sender._id : msg.sender,
            createdAt: msg.createdAt,
            isRead: true,
          };
          conv.updatedAt = msg.createdAt;
        }
      }
    });
    builder.addCase(sendMessageThunk.rejected, (state, action) => {
      state.isSendingMessage = false;
      state.error = action.payload as string;
    });
  },
});

export const {
  setActiveConversation,
  receiveMessage,
  markConversationAsReadInState,
} = chatSlice.actions;

export default chatSlice.reducer;
