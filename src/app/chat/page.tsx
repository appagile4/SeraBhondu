"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { UserAvatar } from "@/components/common/UserAvatar";
import { formatPrice } from "@/lib/utils";
import api from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { useMarketplace } from "@/context/MarketplaceContext";
import { useLanguage } from "@/context/LanguageContext";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  fetchConversations,
  setActiveConversation,
  addIncomingMessage,
  updateMessageStatus,
  setUserPresence,
} from "@/store/slices/chatSlice";
import {
  MessageSquare,
  Search,
  CheckCheck,
  RefreshCw,
  ShoppingBag,
  Lock,
  BadgeCheck,
} from "lucide-react";

function ChatContent() {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { user, openAuthModal } = useMarketplace();
  const { t, language } = useLanguage();

  const queryConvId = searchParams.get("conversationId");
  const queryAdId = searchParams.get("adId");
  const querySellerId = searchParams.get("sellerId");

  const conversations = useAppSelector((state) => state.chat.conversations);
  const isLoading = useAppSelector((state) => state.chat.isLoadingConversations);
  const selectedConvId = useAppSelector((state) => state.chat.activeConversationId);
  const onlineUsers = useAppSelector((state) => state.chat.onlineUsers);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "unread">("all");
  const [showMobileChat, setShowMobileChat] = useState(false);

  // 1. Initial conversations fetch
  const handleRefresh = async () => {
    if (!user) return;
    setIsRefreshing(true);
    await dispatch(fetchConversations());
    setIsRefreshing(false);
  };

  useEffect(() => {
    if (user) {
      dispatch(fetchConversations());
    }
  }, [user, dispatch]);

  // If query params specify an ad, initiate or select it
  useEffect(() => {
    async function initAdConversation() {
      if (!user || !queryAdId) return;
      try {
        const res = await api.post("/chat/conversations", {
          advertisementId: queryAdId,
          sellerId: querySellerId || undefined,
        });

        if (res.data?.conversation?._id) {
          const newId = res.data.conversation._id;
          dispatch(setActiveConversation(newId));
          setShowMobileChat(true);
          dispatch(fetchConversations());
        }
      } catch (err) {
        console.error("Failed to initiate conversation from ad:", err);
      }
    }

    initAdConversation();
  }, [queryAdId, querySellerId, user, dispatch]);

  // Set selected conversation from queryConvId or default to first
  useEffect(() => {
    if (queryConvId && conversations.some((c) => c.id === queryConvId || c._id === queryConvId)) {
      dispatch(setActiveConversation(queryConvId));
      setShowMobileChat(true);
    } else if (!selectedConvId && conversations.length > 0) {
      dispatch(setActiveConversation(conversations[0].id || conversations[0]._id || null));
    }
  }, [queryConvId, conversations, selectedConvId, dispatch]);

  // 2. Real-time Socket.IO synchronization for chat list
  useEffect(() => {
    if (!user) return;
    const socket = getSocket();

    const handleNewMessageAlert = (data: { conversationId: string; message: any }) => {
      dispatch(addIncomingMessage(data.message));
    };

    const handleMessageDelivered = (data: { conversationId: string; messageId: string }) => {
      dispatch(
        updateMessageStatus({
          conversationId: data.conversationId,
          messageId: data.messageId,
          status: "delivered",
        })
      );
    };

    const handleMessagesRead = (data: { conversationId: string; readerId: string }) => {
      dispatch(
        updateMessageStatus({
          conversationId: data.conversationId,
          status: "read",
        })
      );
    };

    const handleOnlineStatus = (data: { userId: string; isOnline: boolean; lastSeen?: string | null }) => {
      dispatch(setUserPresence(data));
    };

    socket.on("chat:new_message_alert", handleNewMessageAlert);
    socket.on("message:delivered", handleMessageDelivered);
    socket.on("messages:read", handleMessagesRead);
    socket.on("user:online_status", handleOnlineStatus);

    return () => {
      socket.off("chat:new_message_alert", handleNewMessageAlert);
      socket.off("message:delivered", handleMessageDelivered);
      socket.off("messages:read", handleMessagesRead);
      socket.off("user:online_status", handleOnlineStatus);
    };
  }, [user, dispatch]);

  // Filter conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      const partnerName = conv.sellerName || "User";
      const adTitle = conv.productTitle || "";
      const matchesSearch =
        partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        adTitle.toLowerCase().includes(searchQuery.toLowerCase());

      if (filterTab === "unread") {
        return matchesSearch && (conv.unreadCount || 0) > 0;
      }
      return matchesSearch;
    });
  }, [conversations, searchQuery, filterTab]);

  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === selectedConvId || c._id === selectedConvId);
  }, [conversations, selectedConvId]);

  const handleSelect = (convId: string) => {
    dispatch(setActiveConversation(convId));
    setShowMobileChat(true);
  };

  const formatWhatsAppTime = (isoString?: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      return isoString;
    }

    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    if (isYesterday) return t("chatYesterday", "গতকাল");
    return date.toLocaleDateString(language === "bn" ? "bn-BD" : "en-US", { month: "short", day: "numeric" });
  };

  const breadcrumbItems = [{ label: t("chat", "বার্তা") }];

  return (
    <div className="space-y-4">
      <Breadcrumb items={breadcrumbItems} />

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs h-[720px] max-h-[85vh] flex flex-col min-h-0">
        {!user ? (
          <div className="p-12 text-center max-w-md mx-auto space-y-4 my-auto">
            <div className="w-16 h-16 rounded-full bg-[#014923]/10 text-[#014923] flex items-center justify-center mx-auto">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {t("chatSignInRequired")}
            </h2>
            <p className="text-sm text-slate-500">
              {t("chatSignInDesc")}
            </p>
            <button
              onClick={openAuthModal}
              className="px-6 py-2.5 bg-[#014923] hover:bg-[#003893] text-white font-bold rounded-xl text-sm transition-colors shadow-xs"
            >
              {t("chatSignInBtn")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 h-full min-h-0 flex-1 overflow-hidden">
            {/* LEFT COLUMN: WhatsApp Web Conversation List */}
            <div
              className={`md:col-span-5 lg:col-span-4 border-r border-slate-200 flex flex-col bg-white h-full min-h-0 overflow-hidden ${
                showMobileChat ? "hidden md:flex" : "flex"
              }`}
            >
              {/* WhatsApp Left Top Header */}
              <div className="bg-[#F0F2F5] px-4 py-3 border-b border-slate-200 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <UserAvatar
                    src={user.avatar}
                    name={user.name}
                    size={36}
                    borderClassName="border border-slate-300 shadow-2xs"
                  />
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">{t("chatTitle")}</h2>
                    <span className="text-[11px] text-slate-500">
                      {conversations.length} {conversations.length === 1 ? t("chatCountSingular") : t("chatCountPlural")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 rounded-full transition-colors cursor-pointer"
                    title={t("chatRefreshTooltip")}
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-[#00A884]" : ""}`} />
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="p-2.5 bg-white border-b border-slate-100 shrink-0 space-y-2">
                <div className="relative flex items-center bg-[#F0F2F5] rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-[#00A884]/30 focus-within:bg-white transition-all">
                  <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("chatSearchPlaceholder")}
                    className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 outline-none"
                  />
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 pt-0.5">
                  <button
                    onClick={() => setFilterTab("all")}
                    className={`text-xs px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                      filterTab === "all"
                        ? "bg-[#E7FCE3] text-[#008069] font-bold"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {t("chatTabAll")}
                  </button>
                  <button
                    onClick={() => setFilterTab("unread")}
                    className={`text-xs px-3 py-1 rounded-full font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                      filterTab === "unread"
                        ? "bg-[#E7FCE3] text-[#008069] font-bold"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <span>{t("chatTabUnread")}</span>
                    {conversations.some((c) => (c.unreadCount || 0) > 0) && (
                      <span className="w-2 h-2 rounded-full bg-[#25D366]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {isLoading ? (
                  <div className="p-8 text-center space-y-2">
                    <div className="w-6 h-6 border-2 border-[#00A884] border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-slate-500">{t("chatLoading")}</p>
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-8 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-700">{t("chatNoFound")}</p>
                    <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto">
                      {t("chatNoFoundDesc")}
                    </p>
                    <Link
                      href="/"
                      className="inline-flex items-center gap-1 text-xs text-[#014923] font-bold hover:underline pt-1"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{t("chatBrowseClassifieds")}</span>
                    </Link>
                  </div>
                ) : (
                  filteredConversations.map((conv) => {
                    const convId = conv.id || conv._id || "";
                    const isSelected = selectedConvId === convId;
                    const partnerOnline = onlineUsers[conv.sellerId]?.isOnline;
                    const unread = conv.unreadCount || 0;

                    return (
                      <div
                        key={convId}
                        onClick={() => handleSelect(convId)}
                        className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors relative ${
                          isSelected ? "bg-[#F0F2F5]" : "hover:bg-slate-50"
                        }`}
                      >
                        {/* Partner Avatar with Online Dot */}
                        <div className="relative shrink-0">
                          <UserAvatar
                            src={conv.sellerAvatar}
                            name={conv.sellerName}
                            size={48}
                            borderClassName="border border-slate-200 shadow-2xs"
                          />
                          {partnerOnline && (
                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#25D366] border-2 border-white rounded-full z-10" />
                          )}
                        </div>

                        {/* Middle Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 min-w-0">
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                {conv.sellerName}
                              </h4>
                              {conv.sellerVerified && (
                                <BadgeCheck className="w-3.5 h-3.5 text-[#014923] shrink-0" />
                              )}
                            </div>
                            <span
                              className={`text-[10px] shrink-0 ${
                                unread > 0 ? "text-[#25D366] font-bold" : "text-slate-400"
                              }`}
                            >
                              {formatWhatsAppTime(conv.lastMessageTime || conv.updatedAt)}
                            </span>
                          </div>

                          {/* Product Chip */}
                          {conv.productTitle && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] font-semibold text-[#014923] bg-emerald-50/80 px-1.5 py-0.5 rounded truncate max-w-[170px]">
                                🏷️ {conv.productTitle}
                              </span>
                              <span className="text-[10px] font-bold text-slate-700">
                                {formatPrice(conv.productPrice, language)}
                              </span>
                            </div>
                          )}

                          {/* Last message preview */}
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                              <span>{conv.lastMessage || t("chatClickToOpen")}</span>
                            </p>

                            {unread > 0 && (
                              <span className="min-w-5 h-5 px-1.5 bg-[#25D366] text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0 ml-1 shadow-2xs">
                                {unread}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Product Thumbnail */}
                        {conv.productImage && (
                          <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0 ml-1">
                            <Image
                              src={conv.productImage}
                              alt="Ad"
                              fill
                              sizes="36px"
                              className="object-cover"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Active WhatsApp Chat Window */}
            <div
              className={`md:col-span-7 lg:col-span-8 flex flex-col h-full min-h-0 overflow-hidden bg-[#EFEAE2] ${
                !showMobileChat ? "hidden md:flex" : "flex"
              }`}
            >
              {activeConversation ? (
                <ChatWindow
                  key={activeConversation.id || activeConversation._id}
                  conversationId={activeConversation.id || activeConversation._id}
                  initialConversation={activeConversation}
                  onBack={() => setShowMobileChat(false)}
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#F0F2F5] border-b-4 border-[#00A884]">
                  <div className="max-w-md space-y-4">
                    <div className="w-24 h-24 rounded-full bg-white shadow-xs flex items-center justify-center mx-auto border border-slate-200">
                      <MessageSquare className="w-12 h-12 text-[#00A884]" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">
                      {t("chatMessengerTitle")}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                      {t("chatMessengerDesc")}
                    </p>
                    <div className="pt-8 flex items-center justify-center gap-1.5 text-xs text-slate-400">
                      <Lock className="w-3.5 h-3.5" />
                      <span>{t("chatEncrypted")}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatPage() {
  const { t } = useLanguage();
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-500">
          <div className="w-6 h-6 border-2 border-[#00A884] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span>{t("chatPageLoading")}</span>
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
