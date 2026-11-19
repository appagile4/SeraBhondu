import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import storage from "../../services/storage";
import { authApi } from "../../services/api";

export interface UserProfile {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  about?: string;
  city?: string;
  isVerified?: boolean;
  role?: "user" | "superadmin" | string;
  authProvider?: string;
  createdAt?: string;
}

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  authModalVisible: boolean;
}

const initialState: AuthState = {
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true, // starts true while checking stored session
  error: null,
  authModalVisible: false,
};

// Check local storage for persistent session
export const checkAuthSession = createAsyncThunk(
  "auth/checkSession",
  async (_, { rejectWithValue }) => {
    try {
      const token =
        (await storage.getItem("serabondhu_auth_token")) ||
        (await storage.getItem("serabondhu_token"));
      if (!token) return null;

      // Verify token with backend
      const res = await authApi.getMe();
      if (res.data?.success && res.data?.user) {
        return { token, user: res.data.user };
      }

      // If token invalid, remove
      await storage.removeItem("serabondhu_auth_token");
      await storage.removeItem("serabondhu_token");
      await storage.removeItem("serabondhu_user");
      return null;
    } catch (err: any) {
      await storage.removeItem("serabondhu_auth_token");
      await storage.removeItem("serabondhu_token");
      await storage.removeItem("serabondhu_user");
      return rejectWithValue(err.response?.data?.message || "Session expired");
    }
  }
);

// Login / Register with Google
export const loginWithGoogle = createAsyncThunk(
  "auth/loginWithGoogle",
  async (
    payload: {
      credential?: string;
      idToken?: string;
      accessToken?: string;
      code?: string;
      userInfo?: any;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await authApi.googleAuth(payload);
      const { token, user } = res.data;
      if (token && user) {
        await storage.setItem("serabondhu_auth_token", token);
        await storage.setItem("serabondhu_user", JSON.stringify(user));
        return { token, user };
      }
      return rejectWithValue("Failed to retrieve user data from Google");
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Google authentication failed"
      );
    }
  }
);

// Legacy Email + Password Login
export const loginWithEmail = createAsyncThunk(
  "auth/loginWithEmail",
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await authApi.login(email, password);
      const { token, user } = res.data;
      if (token && user) {
        await storage.setItem("serabondhu_auth_token", token);
        await storage.setItem("serabondhu_user", JSON.stringify(user));
        return { token, user };
      }
      return rejectWithValue("Invalid response from server");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Invalid email or password");
    }
  }
);

// Send Email OTP
export const sendEmailOtp = createAsyncThunk(
  "auth/sendEmailOtp",
  async (email: string, { rejectWithValue }) => {
    try {
      const res = await authApi.sendEmailOtp(email);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to send email OTP");
    }
  }
);

// Verify Email OTP
export const verifyEmailOtpThunk = createAsyncThunk(
  "auth/verifyEmailOtp",
  async ({ email, otp }: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      const res = await authApi.verifyEmailOtp(email, otp);
      if (res.data?.token && res.data?.user) {
        // Existing user logged in directly
        await storage.setItem("serabondhu_auth_token", res.data.token);
        await storage.setItem("serabondhu_user", JSON.stringify(res.data.user));
        return { isNewUser: false, token: res.data.token, user: res.data.user };
      }
      // New user requires set-password step
      return {
        isNewUser: true,
        registrationToken: res.data?.registrationToken,
        email: res.data?.email || email,
      };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Invalid verification code");
    }
  }
);

// Set Email Password (complete registration)
export const setEmailPasswordThunk = createAsyncThunk(
  "auth/setEmailPassword",
  async (
    data: {
      registrationToken: string;
      email: string;
      password: string;
      name?: string;
      phone?: string;
      city?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await authApi.setEmailPassword(data);
      const { token, user } = res.data;
      if (token && user) {
        await storage.setItem("serabondhu_auth_token", token);
        await storage.setItem("serabondhu_user", JSON.stringify(user));
        return { token, user };
      }
      return rejectWithValue("Failed to complete registration");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Registration failed");
    }
  }
);

// Send Phone OTP
export const sendPhoneOtp = createAsyncThunk(
  "auth/sendPhoneOtp",
  async (phone: string, { rejectWithValue }) => {
    try {
      const res = await authApi.sendPhoneOtp(phone);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to send phone OTP");
    }
  }
);

// Verify Phone OTP
export const verifyPhoneOtpThunk = createAsyncThunk(
  "auth/verifyPhoneOtp",
  async ({ phone, otp }: { phone: string; otp: string }, { rejectWithValue }) => {
    try {
      const res = await authApi.verifyPhoneOtp(phone, otp);
      const { token, user } = res.data;
      if (token && user) {
        await storage.setItem("serabondhu_auth_token", token);
        await storage.setItem("serabondhu_user", JSON.stringify(user));
        return { token, user };
      }
      return rejectWithValue("Failed to verify phone OTP");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Invalid SMS verification code");
    }
  }
);

// Update Profile
export const updateUserProfile = createAsyncThunk(
  "auth/updateProfile",
  async (
    data: { name?: string; phone?: string; about?: string; city?: string },
    { getState, rejectWithValue }
  ) => {
    try {
      const res = await authApi.updateProfile(data);
      if (res.data?.user) {
        const state: any = getState();
        const mergedUser = { ...state.auth?.user, ...res.data.user };
        await storage.setItem("serabondhu_user", JSON.stringify(mergedUser));
        return mergedUser;
      }
      return rejectWithValue("Failed to update profile");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Update profile failed");
    }
  }
);

// Upload Avatar
export const uploadAvatarImage = createAsyncThunk(
  "auth/uploadAvatar",
  async (formData: FormData, { getState, rejectWithValue }) => {
    try {
      const res = await authApi.uploadAvatar(formData);
      const avatarUrl = res.data?.avatar || res.data?.url || res.data?.user?.avatar;
      if (avatarUrl) {
        const state: any = getState();
        if (state.auth?.user) {
          const updatedUser = { ...state.auth.user, avatar: avatarUrl };
          await storage.setItem("serabondhu_user", JSON.stringify(updatedUser));
        }
        return avatarUrl;
      }
      return rejectWithValue("Failed to upload avatar");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Avatar upload failed");
    }
  }
);

// Logout User
export const logoutUser = createAsyncThunk("auth/logout", async () => {
  await storage.removeItem("serabondhu_auth_token");
  await storage.removeItem("serabondhu_token");
  await storage.removeItem("serabondhu_user");
  return null;
});

// Delete Account Permanently (Apple Guideline 5.1.1 compliant)
export const deleteAccountThunk = createAsyncThunk(
  "auth/deleteAccount",
  async (
    payload: {
      email?: string;
      otp?: string;
      reason?: string;
      reasonDetails?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      if (payload.otp && payload.email) {
        await authApi.confirmDeleteAccount({
          email: payload.email,
          otp: payload.otp,
          reason: payload.reason,
          reasonDetails: payload.reasonDetails,
        });
      } else {
        await authApi.deleteMyAccount({
          reason: payload.reason,
          reasonDetails: payload.reasonDetails,
        });
      }
      await storage.removeItem("serabondhu_auth_token");
      await storage.removeItem("serabondhu_token");
      await storage.removeItem("serabondhu_user");
      return null;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to delete account"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthModalVisible(state, action: PayloadAction<boolean>) {
      state.authModalVisible = action.payload;
      if (!action.payload) {
        state.error = null;
      }
    },
    clearAuthError(state) {
      state.error = null;
    },
    setUserData(state, action: PayloadAction<UserProfile>) {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Check session
    builder.addCase(checkAuthSession.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(checkAuthSession.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      } else {
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
      }
    });
    builder.addCase(checkAuthSession.rejected, (state) => {
      state.isLoading = false;
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
    });

    // Google Login
    builder.addCase(loginWithGoogle.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loginWithGoogle.fulfilled, (state, action) => {
      state.isLoading = false;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.authModalVisible = false;
    });
    builder.addCase(loginWithGoogle.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Email Login
    builder.addCase(loginWithEmail.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loginWithEmail.fulfilled, (state, action) => {
      state.isLoading = false;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.authModalVisible = false;
    });
    builder.addCase(loginWithEmail.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Verify Email OTP
    builder.addCase(verifyEmailOtpThunk.fulfilled, (state, action) => {
      if (!action.payload.isNewUser && action.payload.token && action.payload.user) {
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.authModalVisible = false;
      }
    });

    // Set Email Password
    builder.addCase(setEmailPasswordThunk.fulfilled, (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.authModalVisible = false;
    });

    // Verify Phone OTP
    builder.addCase(verifyPhoneOtpThunk.fulfilled, (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.authModalVisible = false;
    });

    // Update Profile
    builder.addCase(updateUserProfile.fulfilled, (state, action) => {
      state.user = action.payload;
    });

    // Upload Avatar
    builder.addCase(uploadAvatarImage.fulfilled, (state, action) => {
      if (state.user) {
        state.user.avatar = action.payload;
      }
    });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
    });

    // Delete Account
    builder.addCase(deleteAccountThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(deleteAccountThunk.fulfilled, (state) => {
      state.isLoading = false;
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
    });
    builder.addCase(deleteAccountThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { setAuthModalVisible, clearAuthError, setUserData } = authSlice.actions;
export default authSlice.reducer;
