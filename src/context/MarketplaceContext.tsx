"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "@/types/product";
import { MOCK_PRODUCTS } from "@/data/products";
import { useAppDispatch, useAppSelector } from "@/store";
import { logoutUser, updateUserProfile, uploadUserAvatar } from "@/store/slices/authSlice";

export interface MockUser {
  id: string;
  name: string;
  email?: string;
  phone: string;
  avatar: string;
  city: string;
  about?: string;
  isPhoneVerified?: boolean;
  isGoogleLinked?: boolean;
}

interface MarketplaceContextType {
  selectedLocation: string;
  setSelectedLocation: (city: string) => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  wishlistCount: number;
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  user: MockUser | null;
  login: (userData?: Partial<MockUser>) => void;
  logout: () => void;
  updateUser: (updatedData: Partial<MockUser>) => void;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  isLocationModalOpen: boolean;
  openLocationModal: () => void;
  closeLocationModal: () => void;
  activeChatProduct: Product | null;
  isChatModalOpen: boolean;
  openChat: (product?: Product) => void;
  closeChat: () => void;
  userAds: Product[];
  addCustomAd: (ad: Product) => void;
  uploadAvatar: (file: File) => Promise<string | null>;
  isUploadingAvatar: boolean;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export function MarketplaceProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const reduxUser = useAppSelector((state) => state.auth.user);

  const [selectedLocation, setSelectedLocationState] = useState<string>("All Bangladesh");
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    "iPhone 14 Pro",
    "Royal Enfield Classic 350",
    "Puma sneakers",
  ]);
  const [user, setUser] = useState<MockUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [activeChatProduct, setActiveChatProduct] = useState<Product | null>(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState<boolean>(false);
  const [userAds, setUserAds] = useState<Product[]>([]);

  // Synchronize local user state with Redux user state
  useEffect(() => {
    if (reduxUser) {
      setUser({
        id: reduxUser._id || "user-101",
        name: reduxUser.name,
        email: reduxUser.email || "",
        phone: reduxUser.phone || "",
        avatar: reduxUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
        city: reduxUser.city || "Kathmandu",
        about: reduxUser.about || "",
        isPhoneVerified: reduxUser.isVerified,
        isGoogleLinked: reduxUser.isGoogleLinked || false,
      });
    } else {
      setUser(null);
    }
  }, [reduxUser]);

  // Hydrate from localStorage on client mount
  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem("khojobangla_wishlist");
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      }

      const savedLocation = localStorage.getItem("khojobangla_location");
      if (savedLocation) {
        setSelectedLocationState(savedLocation);
      }

      const savedSearches = localStorage.getItem("khojobangla_recent_searches");
      if (savedSearches) {
        setRecentSearches(JSON.parse(savedSearches));
      }

      // Strictly verify khojobangla_token before restoring any user session
      const token = localStorage.getItem("khojobangla_token");
      const savedUser = localStorage.getItem("khojobangla_user");
      if (token && savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        // If unauthenticated, ensure user is null and clear old mock data
        setUser(null);
        localStorage.removeItem("khojobangla_user");
      }

      const savedAds = localStorage.getItem("khojobangla_user_ads");
      if (savedAds) {
        setUserAds(JSON.parse(savedAds));
      }
    } catch {
      // Fallback if localStorage fails or in private mode
    }
  }, []);

  const setSelectedLocation = (city: string) => {
    setSelectedLocationState(city);
    try {
      localStorage.setItem("khojobangla_location", city);
    } catch {
      // ignore
    }
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      const updated = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      try {
        localStorage.setItem("khojobangla_wishlist", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  const addRecentSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((q) => q.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 8);
      try {
        localStorage.setItem("khojobangla_recent_searches", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem("khojobangla_recent_searches");
    } catch {
      // ignore
    }
  };

  const login = (userData?: Partial<MockUser>) => {
    if (!userData) return;
    const newUser: MockUser = {
      id: userData.id || `user-${Date.now()}`,
      name: userData.name || "User",
      email: userData.email || "",
      phone: userData.phone || "",
      avatar: userData.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
      city: userData.city || "Kathmandu",
      about: userData.about || "",
      isPhoneVerified: userData.isPhoneVerified || false,
      isGoogleLinked: userData.isGoogleLinked || false,
      ...userData,
    };
    setUser(newUser);
    try {
      localStorage.setItem("khojobangla_user", JSON.stringify(newUser));
    } catch {
      // ignore
    }
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    dispatch(logoutUser());
    setUser(null);
    try {
      localStorage.removeItem("khojobangla_user");
      localStorage.removeItem("khojobangla_token");
    } catch {
      // ignore
    }
  };

  const updateUser = (updatedData: Partial<MockUser>) => {
    // Email cannot be changed - protect existing user email
    const { email: _ignoredEmail, ...safeUpdatedData } = updatedData;

    dispatch(
      updateUserProfile({
        name: safeUpdatedData.name,
        about: safeUpdatedData.about,
        phone: safeUpdatedData.phone,
        city: safeUpdatedData.city,
        avatar: safeUpdatedData.avatar,
        isGoogleLinked: safeUpdatedData.isGoogleLinked,
      })
    );
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...safeUpdatedData, email: prev.email };
      try {
        localStorage.setItem("khojobangla_user", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const openLocationModal = () => setIsLocationModalOpen(true);
  const closeLocationModal = () => setIsLocationModalOpen(false);

  const openChat = (product?: Product) => {
    if (product) {
      const currentUserId = user ? String(user.id || (user as any)._id || "") : "";
      const currentUserEmail = user?.email ? user.email.toLowerCase().trim() : "";
      const sellerId = String((product.seller as any)?._id || product.seller?.id || (product as any)?.seller || "");
      const sellerEmail = (product.seller?.email || (product as any)?.sellerContact?.email || "").toLowerCase().trim();

      const isOwner = Boolean(
        user && (
          (currentUserId && sellerId && currentUserId === sellerId) ||
          (currentUserEmail && sellerEmail && currentUserEmail === sellerEmail)
        )
      );

      if (isOwner) {
        return; // Prevent user from chatting on their own product
      }

      setActiveChatProduct(product);
    } else {
      setActiveChatProduct(MOCK_PRODUCTS[0]);
    }
    setIsChatModalOpen(true);
  };

  const closeChat = () => {
    setIsChatModalOpen(false);
  };

  const isUploadingAvatar = useAppSelector((state) => state.auth.isUploadingAvatar);

  const uploadAvatar = async (file: File): Promise<string | null> => {
    try {
      const resultAction = await dispatch(uploadUserAvatar(file));
      if (uploadUserAvatar.fulfilled.match(resultAction)) {
        const url = resultAction.payload.url;
        setUser((prev) => (prev ? { ...prev, avatar: url } : null));
        return url;
      }
      return null;
    } catch {
      return null;
    }
  };

  const addCustomAd = (ad: Product) => {
    setUserAds((prev) => {
      const updated = [ad, ...prev];
      try {
        localStorage.setItem("khojobangla_user_ads", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  return (
    <MarketplaceContext.Provider
      value={{
        selectedLocation,
        setSelectedLocation,
        wishlist,
        toggleWishlist,
        isWishlisted,
        wishlistCount: wishlist.length,
        recentSearches,
        addRecentSearch,
        clearRecentSearches,
        user,
        login,
        logout,
        updateUser,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        isLocationModalOpen,
        openLocationModal,
        closeLocationModal,
        activeChatProduct,
        isChatModalOpen,
        openChat,
        closeChat,
        userAds,
        addCustomAd,
        uploadAvatar,
        isUploadingAvatar,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
}

export function useMarketplace() {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error("useMarketplace must be used within a MarketplaceProvider");
  }
  return context;
}

