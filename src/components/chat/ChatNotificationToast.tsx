"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useMarketplace } from "@/context/MarketplaceContext";
import { useLanguage } from "@/context/LanguageContext";
import { useAppDispatch, useAppSelector } from "@/store";
import { getSocket } from "@/lib/socket";
import {
  addIncomingMessage,
  fetchConversations,
  updateMessageStatus,
} from "@/store/slices/chatSlice";
import { MessageSquare, X, ExternalLink, Sparkles } from "lucide-react";
import { ChatMessage } from "@/types/chat";

interface ActiveToast {
  id: string;
  conversationId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  adTitle?: string;
  adImage?: string;
}

// Gentle Web Audio API synthesizer chime (zero external dependencies)
function playNotificationChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    // Pleasant dual-tone chime (WhatsApp / iOS style)
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // Audio autoplay restrictions before interaction - silently ignore
  }
}

export function ChatNotificationToast() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user, isChatModalOpen, activeChatProduct } = useMarketplace();
  const { t, language } = useLanguage();

  const activeConversationId = useAppSelector((state) => state.chat.activeConversationId);
  const [activeToast, setActiveToast] = useState<ActiveToast | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initial load of conversations when user is logged in
  useEffect(() => {
    if (user) {
      dispatch(fetchConversations());
    }
  }, [user, dispatch]);

  useEffect(() => {
    if (!user) return;

    const socket = getSocket();
    const myId = (user.id || (user as any)._id || "").toString();

    const handleChatNewMessageAlert = (data: {
      conversationId: string;
      message: any;
      senderName?: string;
    }) => {
      const convId = data.conversationId;
      const msg = data.message;
      const senderId = (msg.sender?._id || msg.sender || "").toString();
      const isMe = senderId === myId;

      if (isMe) return;

      const normalizedMsg: ChatMessage = {
        id: (msg._id || msg.id || `msg-${Date.now()}`).toString(),
        _id: (msg._id || msg.id || `msg-${Date.now()}`).toString(),
        conversation: convId,
        senderId,
        receiverId: myId,
        senderName: data.senderName || msg.sender?.name || "Chat Partner",
        senderAvatar:
          msg.sender?.avatar ||
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
        text: msg.text || msg.message || "Sent an attachment",
        message: msg.text || msg.message || "Sent an attachment",
        messageType: msg.messageType || "text",
        attachments: msg.attachments || [],
        status: "delivered",
        isRead: false,
        isMe: false,
        timestamp: msg.createdAt || new Date().toISOString(),
        createdAt: msg.createdAt || new Date().toISOString(),
      };

      // Check whether this conversation's chat is CURRENTLY OPEN
      const isChatPage = pathname === "/chat";
      const isChatPageForThisConv = isChatPage && activeConversationId === convId;
      const isModalOpenForThisConv = isChatModalOpen && activeChatProduct?.id === msg.advertisement;

      const isChatOpen = isChatPageForThisConv || isModalOpenForThisConv;

      // 1. If chat is NOT open: treat message as UNREAD and notify
      if (!isChatOpen) {
        // Dispatch incoming message to Redux so unread counts and conversation list update
        dispatch(addIncomingMessage(normalizedMsg));

        // Display floating Toast Notification
        const toastData: ActiveToast = {
          id: normalizedMsg.id,
          conversationId: convId,
          senderName: normalizedMsg.senderName || "Chat Partner",
          senderAvatar: normalizedMsg.senderAvatar || "",
          text: normalizedMsg.text || "Sent a message",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          adTitle: msg.advertisement?.title,
          adImage: msg.advertisement?.images?.[0]?.url || msg.advertisement?.images?.[0],
        };

        setActiveToast(toastData);
        playNotificationChime();

        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = setTimeout(() => {
          setActiveToast(null);
        }, 6000);
      }
    };

    socket.on("chat:new_message_alert", handleChatNewMessageAlert);

    return () => {
      socket.off("chat:new_message_alert", handleChatNewMessageAlert);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, [user, pathname, activeConversationId, isChatModalOpen, activeChatProduct, dispatch]);

  if (!activeToast) return null;

  const handleOpenChat = () => {
    const convId = activeToast.conversationId;
    setActiveToast(null);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    router.push(`/chat?conversationId=${convId}`);
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveToast(null);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
  };

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm sm:max-w-md w-full animate-in slide-in-from-top-4 fade-in duration-200">
      <div
        onClick={handleOpenChat}
        className="bg-white rounded-2xl shadow-2xl border-2 border-[#00A884]/40 hover:border-[#00A884] p-3.5 transition-all cursor-pointer relative overflow-hidden backdrop-blur-md bg-white/95"
      >
        {/* Subtle Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00A884] via-[#25D366] to-[#014923]" />

        <div className="flex items-start gap-3">
          {/* Sender Avatar with Online Dot */}
          <div className="relative shrink-0">
            <div className="w-11 h-11 rounded-full overflow-hidden border border-slate-200 bg-slate-100">
              <Image
                src={activeToast.senderAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
                alt={activeToast.senderName}
                width={44}
                height={44}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#25D366] border-2 border-white rounded-full" />
          </div>

          {/* Toast Body */}
          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-bold text-slate-900 truncate">
                {activeToast.senderName}
              </span>
              <span className="text-[10px] text-slate-400 shrink-0">
                {activeToast.timestamp}
              </span>
            </div>

            {/* Ad Context if available */}
            {activeToast.adTitle && (
              <span className="inline-block text-[10px] font-semibold text-[#014923] bg-emerald-50 px-1.5 py-0.5 rounded mt-0.5 truncate max-w-[200px]">
                🏷️ {activeToast.adTitle}
              </span>
            )}

            <p className="text-xs text-slate-700 font-medium line-clamp-2 mt-1">
              {activeToast.text}
            </p>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={handleOpenChat}
                className="px-2.5 py-1 bg-[#00A884] hover:bg-[#008f6f] text-white text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <MessageSquare className="w-3 h-3" />
                <span>{language === "bn" ? "চ্যাট খুলুন" : "Open Chat"}</span>
              </button>
              <span className="text-[10px] text-slate-400">
                {language === "bn" ? "উত্তর দিতে ক্লিক করুন" : "Click to reply"}
              </span>
            </div>
          </div>

          {/* Dismiss Button */}
          <button
            type="button"
            onClick={handleDismiss}
            className="absolute top-2.5 right-2.5 p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            title={language === "bn" ? "বাতিল" : "Dismiss"}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

