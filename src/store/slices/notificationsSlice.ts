import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { notificationsApi } from "../../services/api";

export interface NotificationItem {
  _id: string;
  user: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

interface NotificationsState {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
};

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await notificationsApi.getAll();
      return res.data.notifications || [];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to load notifications");
    }
  }
);

export const markAllNotificationsReadThunk = createAsyncThunk(
  "notifications/markAllRead",
  async (_, { rejectWithValue }) => {
    try {
      await notificationsApi.markAllRead();
      return true;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to mark notifications read");
    }
  }
);

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    markNotificationAsReadInState(state, action: PayloadAction<string>) {
      const item = state.notifications.find((n) => n._id === action.payload);
      if (item && !item.isRead) {
        item.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchNotifications.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchNotifications.fulfilled, (state, action) => {
      state.isLoading = false;
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter((n: NotificationItem) => !n.isRead).length;
    });
    builder.addCase(fetchNotifications.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    builder.addCase(markAllNotificationsReadThunk.fulfilled, (state) => {
      state.notifications.forEach((n) => {
        n.isRead = true;
      });
      state.unreadCount = 0;
    });
  },
});

export const { markNotificationAsReadInState } = notificationsSlice.actions;
export default notificationsSlice.reducer;
