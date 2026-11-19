import axios from "axios";
import storage from "./storage";

// Configured from environment variable or live production fallback
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://api.serabondhu.net/api";

export const SOCKET_URL =
  process.env.EXPO_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  "https://api.serabondhu.net";

console.log("[Serabondhu] Configured API Base URL:", API_BASE_URL);

// Create Axios Instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach JWT Token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token =
        (await storage.getItem("serabondhu_auth_token")) ||
        (await storage.getItem("serabondhu_token"));
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // Storage error non-fatal
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Handle errors & 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await storage.removeItem("serabondhu_auth_token");
        await storage.removeItem("serabondhu_token");
        await storage.removeItem("serabondhu_user");
      } catch (e) {}
    }
    return Promise.reject(error);
  },
);

// ============================================================================
// API MODULES
// ============================================================================

export const authApi = {
  // Google OAuth
  googleAuth: (data: {
    credential?: string;
    idToken?: string;
    accessToken?: string;
    code?: string;
    userInfo?: any;
  }) => apiClient.post("/auth/google", data),

  // Email OTP Flow
  sendEmailOtp: (email: string) =>
    apiClient.post("/auth/email/send-otp", { email }),
  verifyEmailOtp: (email: string, otp: string) =>
    apiClient.post("/auth/email/verify-otp", { email, otp }),
  setEmailPassword: (data: {
    registrationToken: string;
    email: string;
    password: string;
    name?: string;
    phone?: string;
    city?: string;
  }) => apiClient.post("/auth/email/set-password", data),

  // Phone OTP Flow (Passwordless)
  sendPhoneOtp: (phone: string) =>
    apiClient.post("/auth/phone/send-otp", { phone }),
  verifyPhoneOtp: (phone: string, otp: string) =>
    apiClient.post("/auth/phone/verify-otp", { phone, otp }),

  // Legacy Email + Password Login
  login: (email: string, password: string) =>
    apiClient.post("/auth/login", { email, password }),

  // Current User Profile
  getMe: () => apiClient.get("/auth/me"),
  updateProfile: (data: {
    name?: string;
    phone?: string;
    about?: string;
    city?: string;
  }) => apiClient.put("/auth/profile", data),
  uploadAvatar: (formData: FormData) =>
    apiClient.post("/auth/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Account Deletion Flow (Apple Guideline 5.1.1 compliant)
  requestDeleteAccountOtp: (email: string) =>
    apiClient.post("/auth/delete-account/send-otp", { email }),
  confirmDeleteAccount: (data: {
    email: string;
    otp: string;
    reason?: string;
    reasonDetails?: string;
  }) => apiClient.post("/auth/delete-account/confirm", data),
  deleteMyAccount: (data?: { reason?: string; reasonDetails?: string }) =>
    apiClient.delete("/auth/delete-account", { data }),
};

export const listingsApi = {
  // Public Feed
  getApproved: (params?: {
    category?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    condition?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  }) => apiClient.get("/advertisements", { params }),

  // Featured Homepage Carousel
  getFeatured: (limit = 8) =>
    apiClient.get("/advertisements/featured", { params: { limit } }),

  // Full Text Search
  search: (params: {
    q?: string;
    city?: string;
    category?: string;
    page?: number;
    limit?: number;
  }) => apiClient.get("/advertisements/search", { params }),

  // Single Listing Detail
  getBySlug: (slug: string) => apiClient.get(`/advertisements/slug/${slug}`),

  // Related Listings
  getRelated: (id: string) => apiClient.get(`/advertisements/${id}/related`),

  // Seller Protected Actions
  create: (data: any) => apiClient.post("/advertisements", data),

  getMyAds: () => apiClient.get("/advertisements/my"),

  update: (id: string, data: any) =>
    apiClient.put(`/advertisements/${id}`, data),

  delete: (id: string) => apiClient.delete(`/advertisements/${id}`),
};

export const chatApi = {
  // Conversations
  getOrCreateConversation: (advertisementId: string) =>
    apiClient.post("/chat/conversations", { advertisementId }),

  getConversations: () => apiClient.get("/chat/conversations"),

  getConversationById: (id: string) =>
    apiClient.get(`/chat/conversations/${id}`),

  // Messages
  getMessages: (conversationId: string, page = 1, limit = 50) =>
    apiClient.get(`/chat/conversations/${conversationId}/messages`, {
      params: { page, limit },
    }),

  sendMessage: (conversationId: string, text: string, attachment?: any) =>
    apiClient.post(`/chat/conversations/${conversationId}/messages`, {
      text,
      attachment,
    }),

  markRead: (conversationId: string) =>
    apiClient.put(`/chat/conversations/${conversationId}/read`),

  uploadAttachment: (formData: FormData) =>
    apiClient.post("/chat/attachments/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

export const notificationsApi = {
  getAll: () => apiClient.get("/notifications"),
  markAllRead: () => apiClient.put("/notifications/read-all"),
  markRead: (id: string) => apiClient.put(`/notifications/${id}/read`),
  delete: (id: string) => apiClient.delete(`/notifications/${id}`),
};

export const bannersApi = {
  getActive: () => apiClient.get("/banners"),
};

export const uploadApi = {
  uploadSingle: (formData: FormData) =>
    apiClient.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  uploadMultiple: (formData: FormData) =>
    apiClient.post("/upload/multiple", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};
