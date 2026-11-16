import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api";
import { updateSocketAuth, disconnectSocket } from "@/lib/socket";

export interface UserProfile {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar: string;
  about?: string;
  city?: string;
  isVerified: boolean;
  isGoogleLinked?: boolean;
  authProvider?: string;
  role?: string;
  createdAt?: string;
}

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  // OTP flow states
  otpPendingEmail: string | null;
  otpPendingPhone: string | null;
  otpExpiresIn: number; // in seconds
  isOtpExpired: boolean;
  isOtpPending: boolean;
  isUploadingAvatar: boolean;
  // Unified authentication state
  registrationToken: string | null;
  isNewEmailUser: boolean;
  accountExists: boolean | null;
}

// Initial hydration from localStorage
const getInitialToken = (): string | null => {
  if (typeof window !== "undefined") {
    try {
      return localStorage.getItem("serabondhu_token");
    } catch {
      return null;
    }
  }
  return null;
};

const getInitialUser = (): UserProfile | null => {
  if (typeof window !== "undefined") {
    try {
      const token = localStorage.getItem("serabondhu_token");
      if (!token) {
        localStorage.removeItem("serabondhu_user");
        return null;
      }
      const saved = localStorage.getItem("serabondhu_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }
  return null;
};

const initialToken = getInitialToken();
const initialUser = getInitialUser();

const initialState: AuthState = {
  user: initialUser,
  token: initialToken,
  isAuthenticated: Boolean(initialToken && initialUser),
  isLoading: false,
  error: null,
  successMessage: null,
  otpPendingEmail: null,
  otpPendingPhone: null,
  otpExpiresIn: 60,
  isOtpExpired: false,
  isOtpPending: false,
  isUploadingAvatar: false,
  registrationToken: null,
  isNewEmailUser: false,
  accountExists: null,
};

// ============================================================================
// UNIFIED AUTHENTICATION THUNKS
// ============================================================================

// 1. Google OAuth
export const googleAuthUser = createAsyncThunk(
  "auth/googleAuth",
  async (
    payload: { credential?: string; idToken?: string; accessToken?: string; userInfo?: any },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post("/auth/google", payload);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Google authentication failed. Please try again."
      );
    }
  }
);

// 2. Email OTP Send
export const sendEmailOtpUnified = createAsyncThunk(
  "auth/sendEmailOtpUnified",
  async (payload: { email: string }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/email/send-otp", payload);
      return response.data; // { success, message, email, exists, expiresIn }
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to send email verification code."
      );
    }
  }
);

// 3. Email OTP Verify
export const verifyEmailOtpUnified = createAsyncThunk(
  "auth/verifyEmailOtpUnified",
  async (payload: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/email/verify-otp", payload);
      return response.data; // { success, isNewUser, email, registrationToken, token?, user? }
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Invalid or expired verification code."
      );
    }
  }
);

// 4. Email Set Password (for new user)
export const setEmailPasswordUnified = createAsyncThunk(
  "auth/setEmailPasswordUnified",
  async (
    payload: {
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
      const response = await api.post("/auth/email/set-password", payload);
      return response.data; // { success, message, token, user }
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to create account with password."
      );
    }
  }
);

// 5. Phone OTP Send
export const sendPhoneOtpUnified = createAsyncThunk(
  "auth/sendPhoneOtpUnified",
  async (payload: { phone: string }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/phone/send-otp", payload);
      return response.data; // { success, message, phone, exists, expiresIn }
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to send SMS verification code."
      );
    }
  }
);

// 6. Phone OTP Verify (NO PASSWORD EVER)
export const verifyPhoneOtpUnified = createAsyncThunk(
  "auth/verifyPhoneOtpUnified",
  async (payload: { phone: string; otp: string }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/phone/verify-otp", payload);
      return response.data; // { success, message, token, user }
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Invalid or expired SMS verification code."
      );
    }
  }
);

// ============================================================================
// LEGACY & COMMON THUNKS
// ============================================================================

export const signupUser = createAsyncThunk(
  "auth/signup",
  async (
    payload: { name: string; email: string; password: string; phone?: string; city?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post("/auth/signup", payload);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to register. Please try again."
      );
    }
  }
);

export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async (payload: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/verify-otp", payload);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to verify OTP. Please try again."
      );
    }
  }
);

export const resendOtp = createAsyncThunk(
  "auth/resendOtp",
  async (payload: { email: string }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/resend-otp", payload);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to resend OTP."
      );
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/login", payload);
      return response.data;
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.requiresVerification) {
        return rejectWithValue({
          message: data.message,
          requiresVerification: true,
          email: data.email,
        });
      }
      return rejectWithValue(
        err.response?.data?.message || "Invalid email or password."
      );
    }
  }
);

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  try {
    await api.post("/auth/logout");
  } catch {
    // Ignore error
  }
  if (typeof window !== "undefined") {
    localStorage.removeItem("serabondhu_token");
    localStorage.removeItem("serabondhu_user");
  }
  return true;
});

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/auth/me");
      return response.data.user;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Session invalid");
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  "auth/updateProfile",
  async (
    payload: {
      name?: string;
      about?: string;
      phone?: string;
      city?: string;
      avatar?: string;
      isGoogleLinked?: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put("/auth/profile", payload);
      return response.data.user;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update profile."
      );
    }
  }
);

export const uploadUserAvatar = createAsyncThunk(
  "auth/uploadAvatar",
  async (file: File, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await api.post("/auth/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to upload avatar to Cloudinary."
      );
    }
  }
);

// ============================================================================
// AUTH SLICE
// ============================================================================

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    clearAuthSuccess: (state) => {
      state.successMessage = null;
    },
    setOtpPendingEmail: (state, action: PayloadAction<string>) => {
      state.isOtpPending = true;
      state.otpPendingEmail = action.payload;
      state.otpExpiresIn = 60;
      state.isOtpExpired = false;
      state.error = null;
    },
    setOtpPendingPhone: (state, action: PayloadAction<string>) => {
      state.isOtpPending = true;
      state.otpPendingPhone = action.payload;
      state.otpExpiresIn = 60;
      state.isOtpExpired = false;
      state.error = null;
    },
    clearOtpPending: (state) => {
      state.isOtpPending = false;
      state.otpPendingEmail = null;
      state.otpPendingPhone = null;
      state.otpExpiresIn = 60;
      state.isOtpExpired = false;
    },
    decrementTimer: (state) => {
      if (state.otpExpiresIn > 0) {
        state.otpExpiresIn -= 1;
        if (state.otpExpiresIn === 0) {
          state.isOtpExpired = true;
          state.error = "Verification code expired. Please click 'Resend Code'.";
        }
      }
    },
    resetOtpTimer: (state, action: PayloadAction<number | undefined>) => {
      state.otpExpiresIn = action.payload || 60;
      state.isOtpExpired = false;
      state.error = null;
    },
    setRegistrationToken: (state, action: PayloadAction<string | null>) => {
      state.registrationToken = action.payload;
    },
  },
  extraReducers: (builder) => {
    // -------------------------------------------------------------
    // Google Auth
    // -------------------------------------------------------------
    builder
      .addCase(googleAuthUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(googleAuthUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.successMessage = action.payload.message;
        if (typeof window !== "undefined") {
          localStorage.setItem("serabondhu_token", action.payload.token);
          localStorage.setItem("serabondhu_user", JSON.stringify(action.payload.user));
          updateSocketAuth(action.payload.token);
        }
      })
      .addCase(googleAuthUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Google authentication failed.";
      });

    // -------------------------------------------------------------
    // Email OTP Send
    // -------------------------------------------------------------
    builder
      .addCase(sendEmailOtpUnified.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(sendEmailOtpUnified.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isOtpPending = true;
        state.otpPendingEmail = action.payload.email;
        state.accountExists = action.payload.exists;
        state.otpExpiresIn = action.payload.expiresIn || 60;
        state.isOtpExpired = false;
        state.successMessage = action.payload.message;
      })
      .addCase(sendEmailOtpUnified.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Failed to send email verification code.";
      });

    // -------------------------------------------------------------
    // Email OTP Verify
    // -------------------------------------------------------------
    builder
      .addCase(verifyEmailOtpUnified.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyEmailOtpUnified.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.isNewUser) {
          state.isNewEmailUser = true;
          state.registrationToken = action.payload.registrationToken;
          state.successMessage = action.payload.message;
        } else if (action.payload.user && action.payload.token) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
          state.isOtpPending = false;
          state.otpPendingEmail = null;
          state.successMessage = action.payload.message;
          if (typeof window !== "undefined") {
            localStorage.setItem("serabondhu_token", action.payload.token);
            localStorage.setItem("serabondhu_user", JSON.stringify(action.payload.user));
            updateSocketAuth(action.payload.token);
          }
        }
      })
      .addCase(verifyEmailOtpUnified.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Invalid verification code.";
      });

    // -------------------------------------------------------------
    // Email Set Password
    // -------------------------------------------------------------
    builder
      .addCase(setEmailPasswordUnified.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(setEmailPasswordUnified.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isOtpPending = false;
        state.otpPendingEmail = null;
        state.registrationToken = null;
        state.isNewEmailUser = false;
        state.successMessage = action.payload.message;
        if (typeof window !== "undefined") {
          localStorage.setItem("serabondhu_token", action.payload.token);
          localStorage.setItem("serabondhu_user", JSON.stringify(action.payload.user));
          updateSocketAuth(action.payload.token);
        }
      })
      .addCase(setEmailPasswordUnified.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Failed to complete account registration.";
      });

    // -------------------------------------------------------------
    // Phone OTP Send
    // -------------------------------------------------------------
    builder
      .addCase(sendPhoneOtpUnified.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(sendPhoneOtpUnified.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isOtpPending = true;
        state.otpPendingPhone = action.payload.phone;
        state.accountExists = action.payload.exists;
        state.otpExpiresIn = action.payload.expiresIn || 60;
        state.isOtpExpired = false;
        state.successMessage = action.payload.message;
      })
      .addCase(sendPhoneOtpUnified.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Failed to send SMS verification code.";
      });

    // -------------------------------------------------------------
    // Phone OTP Verify (Passwordless)
    // -------------------------------------------------------------
    builder
      .addCase(verifyPhoneOtpUnified.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyPhoneOtpUnified.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isOtpPending = false;
        state.otpPendingPhone = null;
        state.successMessage = action.payload.message;
        if (typeof window !== "undefined") {
          localStorage.setItem("serabondhu_token", action.payload.token);
          localStorage.setItem("serabondhu_user", JSON.stringify(action.payload.user));
          updateSocketAuth(action.payload.token);
        }
      })
      .addCase(verifyPhoneOtpUnified.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Invalid verification code.";
      });

    // -------------------------------------------------------------
    // Legacy Handlers
    // -------------------------------------------------------------
    builder
      .addCase(signupUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isOtpPending = true;
        state.otpPendingEmail = action.payload.email;
        state.otpExpiresIn = action.payload.expiresIn || 60;
        state.isOtpExpired = false;
        state.successMessage = action.payload.message;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Registration failed.";
      });

    builder
      .addCase(verifyOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isOtpPending = false;
        state.otpPendingEmail = null;
        state.successMessage = action.payload.message;
        if (typeof window !== "undefined") {
          localStorage.setItem("serabondhu_token", action.payload.token);
          localStorage.setItem("serabondhu_user", JSON.stringify(action.payload.user));
          updateSocketAuth(action.payload.token);
        }
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Invalid OTP code.";
      });

    builder
      .addCase(resendOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resendOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.otpExpiresIn = action.payload.expiresIn || 60;
        state.isOtpExpired = false;
        state.successMessage = action.payload.message;
      })
      .addCase(resendOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Failed to resend OTP.";
      });

    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isOtpPending = false;
        state.otpPendingEmail = null;
        state.successMessage = action.payload.message;
        if (typeof window !== "undefined") {
          localStorage.setItem("serabondhu_token", action.payload.token);
          localStorage.setItem("serabondhu_user", JSON.stringify(action.payload.user));
          updateSocketAuth(action.payload.token);
        }
      })
      .addCase(loginUser.rejected, (state, action: any) => {
        state.isLoading = false;
        if (action.payload?.requiresVerification) {
          state.isOtpPending = true;
          state.otpPendingEmail = action.payload.email;
          state.otpExpiresIn = 60;
          state.isOtpExpired = false;
          state.error = action.payload.message;
        } else {
          state.error = (action.payload as string) || "Invalid email or password.";
        }
      });

    builder.addCase(logoutUser.fulfilled, (state) => {
      disconnectSocket();
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isOtpPending = false;
      state.otpPendingEmail = null;
      state.otpPendingPhone = null;
      state.registrationToken = null;
      state.isNewEmailUser = false;
      state.accountExists = null;
      state.error = null;
      state.successMessage = null;
    });

    builder
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        if (typeof window !== "undefined") {
          localStorage.setItem("serabondhu_user", JSON.stringify(action.payload));
        }
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });

    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.successMessage = "Profile updated successfully!";
        if (typeof window !== "undefined") {
          localStorage.setItem("serabondhu_user", JSON.stringify(action.payload));
        }
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Failed to update profile.";
      });

    builder
      .addCase(uploadUserAvatar.pending, (state) => {
        state.isUploadingAvatar = true;
        state.error = null;
      })
      .addCase(uploadUserAvatar.fulfilled, (state, action) => {
        state.isUploadingAvatar = false;
        state.user = action.payload.user;
        state.successMessage = "Profile picture updated!";
        if (typeof window !== "undefined") {
          localStorage.setItem("serabondhu_user", JSON.stringify(action.payload.user));
        }
      })
      .addCase(uploadUserAvatar.rejected, (state, action) => {
        state.isUploadingAvatar = false;
        state.error = (action.payload as string) || "Failed to upload avatar.";
      });
  },
});

export const {
  clearAuthError,
  clearAuthSuccess,
  setOtpPendingEmail,
  setOtpPendingPhone,
  clearOtpPending,
  decrementTimer,
  resetOtpTimer,
  setRegistrationToken,
} = authSlice.actions;

export default authSlice.reducer;

