"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product";
import { ChatMessage, MessageAttachment } from "@/types/chat";
import { MessageBubble } from "./MessageBubble";
import { formatPrice } from "@/lib/utils";
import api from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { useMarketplace } from "@/context/MarketplaceContext";
import { useLanguage } from "@/context/LanguageContext";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  setReplyingTo,
  clearReplyingTo,
  uploadAttachment,
  deleteMessageThunk,
  setActiveConversation,
  markConversationReadLocally,
} from "@/store/slices/chatSlice";
import {
  Send,
  Sparkles,
  ShieldCheck,
  Phone,
  CheckCircle2,
  ExternalLink,
  Smile,
  Paperclip,
  ArrowLeft,
  X,
  Loader2,
  Reply,
  ChevronDown,
} from "lucide-react";

interface ChatWindowProps {
  product?: Product;
  conversationId?: string;
  initialConversation?: any;
  onClose?: () => void;
  onBack?: () => void;
  onNewMessageSent?: (convId: string, lastMsg: string) => void;
}

export function ChatWindow({
  product: propProduct,
  conversationId: propConversationId,
  initialConversation,
  onClose,
  onBack,
  onNewMessageSent,
}: ChatWindowProps) {
  const dispatch = useAppDispatch();
  const { user, openAuthModal } = useMarketplace();
  const { t, language } = useLanguage();
  const replyingTo = useAppSelector((state) => state.chat.replyingToMessage);

  const [activeConvId, setActiveConvId] = useState<string | null>(
    propConversationId || initialConversation?._id || null
  );

  const myId = (user?.id || (user as any)?._id || "").toString();

  const resolvePartner = () => {
    if (propProduct?.seller) {
      return {
        id: propProduct.seller.id,
        name: propProduct.seller.name,
        avatar: propProduct.seller.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
        phone: propProduct.seller.phone,
        isVerified: propProduct.seller.verified,
        lastSeen: null,
      };
    }

    const otherParticipant =
      initialConversation?.participants?.find(
        (p: any) => (p._id || p.id || "").toString() !== myId
      ) ||
      initialConversation?.participants?.[0] ||
      null;

    return {
      id: (otherParticipant?._id || otherParticipant?.id || initialConversation?.sellerId || "").toString(),
      name: otherParticipant?.name || initialConversation?.sellerName || "Chat Partner",
      avatar: otherParticipant?.avatar || initialConversation?.sellerAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
      phone: otherParticipant?.phone || initialConversation?.sellerPhone,
      isVerified: otherParticipant?.isVerified || initialConversation?.sellerVerified,
      lastSeen: otherParticipant?.lastSeen || null,
    };
  };

  const [partner, setPartner] = useState<{
    id: string;
    name: string;
    avatar: string;
    phone?: string;
    isVerified?: boolean;
    city?: string;
    lastSeen?: string | null;
  }>(resolvePartner());

  const [adInfo, setAdInfo] = useState<{
    id?: string;
    title: string;
    price: number;
    image: string;
    location?: string;
    slug?: string;
  }>({
    id: propProduct?.id || initialConversation?.advertisement?._id,
    title: propProduct?.title || initialConversation?.advertisement?.title || "Classified Item",
    price: propProduct?.price || initialConversation?.advertisement?.price || 0,
    image: propProduct?.images?.[0] || initialConversation?.advertisement?.images?.[0]?.url || "",
    location: propProduct?.location?.city || initialConversation?.advertisement?.location?.city || "Bangladesh",
    slug: propProduct?.slug || initialConversation?.advertisement?.slug,
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [isPartnerOnline, setIsPartnerOnline] = useState(false);
  const [partnerLastSeen, setPartnerLastSeen] = useState<string | null>(null);

  // Attachment states
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [showEmojis, setShowEmojis] = useState(false);
  const [showPhoneInfo, setShowPhoneInfo] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);
  const [newMessagesWhileScrolledUp, setNewMessagesWhileScrolledUp] = useState(0);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSendingRef = useRef(false);
  const isInitialLoadRef = useRef(true);

  // Synchronize active conversation with Redux store to mark messages as read
  useEffect(() => {
    if (activeConvId) {
      dispatch(setActiveConversation(activeConvId));
      dispatch(markConversationReadLocally(activeConvId));
    }
    return () => {
      dispatch(setActiveConversation(null));
    };
  }, [activeConvId, dispatch]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const atBottom = distanceFromBottom < 80;

    setIsAtBottom(atBottom);
    setShowScrollBottomBtn(!atBottom);

    if (atBottom) {
      setNewMessagesWhileScrolledUp(0);
    }

    if (scrollTop === 0 && hasMore && !isLoadingMore) {
      handleLoadMore();
    }
  };

  // Robust Auto-Scroll to Bottom on Message Receive / Send / Page Refresh (Container-Only, Never Scrolls Window)
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    const performScroll = () => {
      const container = messagesContainerRef.current;
      if (container) {
        if (behavior === "smooth") {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: "smooth",
          });
        } else {
          container.scrollTop = container.scrollHeight;
        }
      }
    };

    performScroll();

    if (typeof window !== "undefined") {
      requestAnimationFrame(performScroll);
      setTimeout(performScroll, 50);
      setTimeout(performScroll, 150);
    }
  };

  // 1. Initialize or load conversation & message history
  useEffect(() => {
    let isMounted = true;

    async function loadOrCreate() {
      if (!user) return;
      setIsLoadingMessages(true);
      setChatError(null);

      try {
        let convId = activeConvId;

        if (!convId && propProduct?.id) {
          const res = await api.post("/chat/conversations", {
            advertisementId: propProduct.id,
            sellerId: propProduct.seller.id,
          });

          if (!isMounted) return;

          if (res.data?.conversation?._id) {
            convId = res.data.conversation._id;
            setActiveConvId(convId);

            const foundPartner = res.data.conversation.participants?.find(
              (p: any) => p._id !== user.id && p._id !== (user as any)._id
            );
            if (foundPartner) {
              setPartner({
                id: foundPartner._id,
                name: foundPartner.name,
                avatar: foundPartner.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
                phone: foundPartner.phone,
                isVerified: foundPartner.isVerified,
                city: foundPartner.city,
                lastSeen: foundPartner.lastSeen,
              });
              setPartnerLastSeen(foundPartner.lastSeen || null);
            }

            if (res.data.conversation.advertisement) {
              const ad = res.data.conversation.advertisement;
              setAdInfo({
                id: ad._id,
                title: ad.title,
                price: ad.price,
                image: ad.images?.[0]?.url || ad.images?.[0] || "",
                location: ad.location?.city || "Bangladesh",
                slug: ad.slug,
              });
            }

            if (res.data.messages) {
              setMessages(res.data.messages);
            }
          }
        } else if (convId) {
          try {
            const convRes = await api.get(`/chat/conversations/${convId}`);
            if (convRes.data?.conversation && isMounted) {
              const c = convRes.data.conversation;
              const other = c.participants?.find(
                (p: any) => (p._id || p.id || "").toString() !== myId
              );
              if (other) {
                setPartner({
                  id: (other._id || other.id).toString(),
                  name: other.name,
                  avatar: other.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
                  phone: other.phone,
                  isVerified: other.isVerified,
                  city: other.city,
                  lastSeen: other.lastSeen,
                });
                if (other.lastSeen) setPartnerLastSeen(other.lastSeen);
              }

              if (c.advertisement) {
                const ad = c.advertisement;
                setAdInfo({
                  id: ad._id,
                  title: ad.title,
                  price: ad.price,
                  image: ad.images?.[0]?.url || ad.images?.[0] || "",
                  location: ad.location?.city || "Bangladesh",
                  slug: ad.slug,
                });
              }
            }
          } catch {
            // non-fatal if conversation info is already present
          }

          const res = await api.get(`/chat/conversations/${convId}/messages?limit=40`);
          if (!isMounted) return;

          if (res.data?.messages) {
            setMessages(res.data.messages);
            setHasMore(Boolean(res.data.hasMore));
          }
        }
      } catch (err: any) {
        if (!isMounted) return;
        setChatError(err.response?.data?.message || "Failed to load chat history.");
      } finally {
        if (isMounted) setIsLoadingMessages(false);
      }
    }

    loadOrCreate();

    return () => {
      isMounted = false;
    };
  }, [propProduct?.id, propProduct?.seller?.id, propConversationId, user]);

  // 2. Socket.IO Listeners and Delivery Tracking
  useEffect(() => {
    if (!activeConvId) return;

    const socket = getSocket();
    const token = typeof window !== "undefined" ? localStorage.getItem("serabondhu_token") || "" : "";

    socket.emit("chat:join", { conversationId: activeConvId, token });
    socket.emit("chat:read", { conversationId: activeConvId, token });

    if (partner.id) {
      socket.emit("user:check_online", { userId: partner.id }, (res: any) => {
        if (res?.isOnline !== undefined) setIsPartnerOnline(res.isOnline);
        if (res?.lastSeen) setPartnerLastSeen(res.lastSeen);
      });
    }

    const handleNewMessage = (msg: any) => {
      if (msg.conversation && activeConvId && msg.conversation.toString() !== activeConvId.toString()) {
        return;
      }

      const senderId = msg.sender?._id || msg.sender;
      const isMe = senderId === user?.id || senderId === (user as any)?._id;

      const normalizedMsg: ChatMessage = {
        ...msg,
        id: (msg._id || msg.id).toString(),
        _id: (msg._id || msg.id).toString(),
        clientMessageId: msg.clientMessageId,
        text: msg.text || msg.message || "",
        message: msg.text || msg.message || "",
        isMe,
      };

      setMessages((prev) => {
        // 1. Try matching by clientMessageId against optimistic message
        if (normalizedMsg.clientMessageId) {
          const clientIdx = prev.findIndex(
            (m) =>
              m.clientMessageId === normalizedMsg.clientMessageId ||
              m.id === normalizedMsg.clientMessageId ||
              m._id === normalizedMsg.clientMessageId
          );
          if (clientIdx !== -1) {
            const updated = [...prev];
            updated[clientIdx] = {
              ...updated[clientIdx],
              ...normalizedMsg,
              isMe,
            };
            return updated;
          }
        }

        // 2. Try matching by database ID
        const idIdx = prev.findIndex(
          (m) => m.id === normalizedMsg.id || m._id === normalizedMsg._id
        );
        if (idIdx !== -1) {
          const updated = [...prev];
          updated[idIdx] = {
            ...updated[idIdx],
            ...normalizedMsg,
            isMe,
          };
          return updated;
        }

        // 3. Prevent duplicate: same sender and identical text within recent window (4 seconds)
        if (isMe) {
          const duplicateIdx = prev.findIndex(
            (m) =>
              m.isMe &&
              (m.text === normalizedMsg.text || m.message === normalizedMsg.message) &&
              Math.abs(new Date(m.createdAt || 0).getTime() - new Date(normalizedMsg.createdAt || 0).getTime()) < 4000
          );
          if (duplicateIdx !== -1) {
            const updated = [...prev];
            updated[duplicateIdx] = {
              ...updated[duplicateIdx],
              ...normalizedMsg,
              isMe,
            };
            return updated;
          }
        }

        return [...prev, normalizedMsg];
      });

      if (!isMe) {
        // Acknowledge delivery and read
        socket.emit("message:delivered", { messageId: msg._id || msg.id, conversationId: activeConvId });
        socket.emit("chat:read", { conversationId: activeConvId, token });
        setIsPartnerTyping(false);

        if (!isAtBottom) {
          setNewMessagesWhileScrolledUp((prev) => prev + 1);
        } else {
          setTimeout(() => scrollToBottom("smooth"), 50);
        }
      } else {
        setTimeout(() => scrollToBottom("smooth"), 50);
      }
    };

    const handleMessageDelivered = (data: { messageId: string; conversationId: string; deliveredAt: string }) => {
      if (data.conversationId === activeConvId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.isMe && m.status === "sent" ? { ...m, status: "delivered", deliveredAt: data.deliveredAt } : m
          )
        );
      }
    };

    const handleMessagesRead = (data: { conversationId: string; readerId: string }) => {
      if (data.conversationId === activeConvId) {
        setMessages((prev) =>
          prev.map((m) => (m.isMe ? { ...m, status: "read", isRead: true } : m))
        );
      }
    };

    const handleTypingUpdate = (data: { conversationId: string; isTyping: boolean; userId: string }) => {
      if (data.conversationId === activeConvId && data.userId !== user?.id) {
        setIsPartnerTyping(data.isTyping);
      }
    };

    const handleOnlineStatus = (data: { userId: string; isOnline: boolean; lastSeen?: string | null }) => {
      if (data.userId === partner.id) {
        setIsPartnerOnline(data.isOnline);
        if (data.lastSeen) setPartnerLastSeen(data.lastSeen);
      }
    };

    const handleMessageDeleted = (data: { messageId: string; conversationId: string }) => {
      if (data.conversationId === activeConvId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === data.messageId || m._id === data.messageId
              ? { ...m, isDeleted: true, text: "This message was deleted", message: "This message was deleted", attachments: [] }
              : m
          )
        );
      }
    };

    socket.on("message:new", handleNewMessage);
    socket.on("message:delivered", handleMessageDelivered);
    socket.on("messages:read", handleMessagesRead);
    socket.on("typing:update", handleTypingUpdate);
    socket.on("user:online_status", handleOnlineStatus);
    socket.on("message:deleted", handleMessageDeleted);

    return () => {
      socket.emit("chat:leave", { conversationId: activeConvId });
      socket.off("message:new", handleNewMessage);
      socket.off("message:delivered", handleMessageDelivered);
      socket.off("messages:read", handleMessagesRead);
      socket.off("typing:update", handleTypingUpdate);
      socket.off("user:online_status", handleOnlineStatus);
      socket.off("message:deleted", handleMessageDeleted);
    };
  }, [activeConvId, partner.id, user]);

  // Auto-scroll to bottom on initial load, refresh, or when new message arrives (respecting scroll position)
  useEffect(() => {
    if (messages.length > 0) {
      if (isInitialLoadRef.current) {
        scrollToBottom("auto");
        isInitialLoadRef.current = false;
      } else if (isAtBottom) {
        scrollToBottom("smooth");
      }
    }
  }, [messages.length, isAtBottom]);

  // Reset initial load flag whenever active conversation changes
  useEffect(() => {
    isInitialLoadRef.current = true;
  }, [activeConvId]);

  // 3. Load Older Messages (Pagination)
  const handleLoadMore = async () => {
    if (!activeConvId || isLoadingMore || !hasMore || messages.length === 0) return;
    setIsLoadingMore(true);

    try {
      const oldestMessage = messages[0];
      const res = await api.get(
        `/chat/conversations/${activeConvId}/messages?before=${encodeURIComponent(
          oldestMessage.createdAt || ""
        )}&limit=30`
      );

      if (res.data?.success && res.data.messages.length > 0) {
        const container = messagesContainerRef.current;
        const prevScrollHeight = container ? container.scrollHeight : 0;

        setMessages((prev) => [...res.data.messages, ...prev]);
        setHasMore(Boolean(res.data.hasMore));

        // Preserve scroll position
        setTimeout(() => {
          if (container) {
            container.scrollTop = container.scrollHeight - prevScrollHeight;
          }
        }, 50);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Pagination error:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // 4. Typing Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (!activeConvId) return;

    const socket = getSocket();
    if (!isTyping) {
      setIsTyping(true);
      socket.emit("typing:start", { conversationId: activeConvId });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit("typing:stop", { conversationId: activeConvId });
    }, 1500);
  };

  // 5. Attachment Selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10MB limit.");
      return;
    }

    setPendingFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const removePendingFile = () => {
    setPendingFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // 6. Send Message with Socket.IO & Cloudinary Attachments
  const handleSendMessage = async (textOverride?: string) => {
    if (isSendingRef.current) return;
    const textToSend = (textOverride || inputText).trim();
    if (!textToSend && !pendingFile) return;

    if (!user) {
      openAuthModal();
      return;
    }

    isSendingRef.current = true;

    setInputText("");
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setIsTyping(false);
    if (activeConvId) getSocket().emit("typing:stop", { conversationId: activeConvId });

    let attachments: MessageAttachment[] = [];

    // Upload attachment to Cloudinary if selected
    if (pendingFile) {
      setIsUploading(true);
      try {
        const uploadRes = await dispatch(uploadAttachment(pendingFile)).unwrap();
        if (uploadRes) {
          attachments = [uploadRes];
        }
      } catch (err: any) {
        alert("Failed to upload image attachment.");
        setIsUploading(false);
        isSendingRef.current = false;
        return;
      } finally {
        setIsUploading(false);
        removePendingFile();
      }
    }

    const clientMessageId = `cmsg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Optimistic message
    const optimisticMsg: ChatMessage = {
      id: clientMessageId,
      _id: clientMessageId,
      clientMessageId,
      conversation: activeConvId || undefined,
      senderId: user.id || (user as any)._id,
      senderName: user.name,
      text: textToSend || (attachments.length > 0 ? "Photo" : ""),
      message: textToSend || (attachments.length > 0 ? "Photo" : ""),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isMe: true,
      status: "sent",
      attachments,
      replyTo: replyingTo
        ? {
            _id: replyingTo.id,
            text: replyingTo.text,
            message: replyingTo.message,
            sender: { _id: replyingTo.senderId, name: replyingTo.senderName },
          }
        : undefined,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setIsAtBottom(true);
    setShowScrollBottomBtn(false);
    setNewMessagesWhileScrolledUp(0);
    scrollToBottom("auto");
    if (onNewMessageSent && activeConvId) {
      onNewMessageSent(activeConvId, textToSend || "Photo");
    }

    // Clear reply preview after queueing
    dispatch(clearReplyingTo());

    const token = typeof window !== "undefined" ? localStorage.getItem("serabondhu_token") || "" : "";

    try {
      if (activeConvId) {
        getSocket().emit("message:send", {
          conversationId: activeConvId,
          text: textToSend,
          attachments,
          replyTo: optimisticMsg.replyTo?._id,
          clientMessageId,
          token,
        });
      } else if (propProduct?.id) {
        const res = await api.post("/chat/conversations", {
          advertisementId: propProduct.id,
          sellerId: propProduct.seller.id,
        });

        if (res.data?.conversation?._id) {
          const newConvId = res.data.conversation._id;
          setActiveConvId(newConvId);

          await api.post(`/chat/conversations/${newConvId}/messages`, {
            text: textToSend,
            attachments,
            replyTo: optimisticMsg.replyTo?._id,
            clientMessageId,
          });

          getSocket().emit("chat:join", { conversationId: newConvId, token });
        }
      }
    } catch (err: any) {
      console.error("Failed to send message:", err);
      if (activeConvId) {
        try {
          await api.post(`/chat/conversations/${activeConvId}/messages`, {
            text: textToSend,
            attachments,
            replyTo: optimisticMsg.replyTo?._id,
            clientMessageId,
          });
        } catch {
          setChatError("Could not deliver message. Please check connection.");
        }
      }
    } finally {
      setTimeout(() => {
        isSendingRef.current = false;
      }, 350);
    }
  };

  const handleDeleteMessage = (msg: ChatMessage) => {
    if (window.confirm("Do you want to delete this message for everyone?")) {
      dispatch(deleteMessageThunk({ messageId: msg.id, deleteForEveryone: true }));
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msg.id
            ? { ...m, isDeleted: true, text: "This message was deleted", message: "This message was deleted", attachments: [] }
            : m
        )
      );
    }
  };

  const formatPresence = () => {
    if (isPartnerTyping) {
      return <span className="text-[#00A884] font-semibold animate-pulse">{t("chatTyping")}</span>;
    }
    if (isPartnerOnline) {
      return <span className="text-[#00A884] font-medium">{t("chatOnline")}</span>;
    }
    if (partnerLastSeen) {
      const d = new Date(partnerLastSeen);
      return (
        <span className="text-slate-500">
          {t("chatLastSeen")} {d.toLocaleDateString(language === "bn" ? "bn-BD" : "en-US", { month: "short", day: "numeric" })} at{" "}
          {d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      );
    }
    return <span className="text-slate-500">{t("chatAvailableOnSerabondhu")}</span>;
  };

  const QUICK_REPLIES = language === "bn" ? [
    "এটি কি এখনো পাওয়া যাবে?",
    "সর্বনিম্ন কত দামে দেওয়া যাবে?",
    "পণ্যটি সরাসরি দেখার সুযোগ আছে?",
    "অরিজিনাল মেমো ও ওয়ারেন্টি আছে?",
  ] : [
    "Is this still available?",
    "What is your final price?",
    "Can I inspect it today in person?",
    "Do you have original bill & warranty?",
  ];

  const EMOJI_LIST = ["😊", "👍", "🙏", "🤝", "🔥", "👌", "🚗", "📱", "🏠", "💯", "📍", "💰"];

  return (
    <div className="flex flex-col h-full w-full bg-[#EFEAE2] relative overflow-hidden min-h-0 font-sans">
      {/* 1. WHATSAPP STYLE TOP HEADER */}
      <div className="bg-[#F0F2F5] px-3.5 py-2.5 sm:px-4 sm:py-3 border-b border-slate-300/80 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-1.5 -ml-1 text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-200"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          {/* Partner Avatar with Online Dot */}
          <div className="relative shrink-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border border-slate-200 bg-white">
              <Image
                src={partner.avatar}
                alt={partner.name}
                width={44}
                height={44}
                className="w-full h-full object-cover"
              />
            </div>
            {isPartnerOnline && (
              <span
                className="absolute bottom-0 right-0 w-3 h-3 bg-[#25D366] border-2 border-white rounded-full"
                title="Online now"
              />
            )}
          </div>

          {/* Name & Online Status / Last Seen */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">{partner.name}</h3>
              {partner.isVerified && (
                <span title={t("chatVerifiedSeller")}>
                  <CheckCircle2 className="w-4 h-4 text-[#014923] shrink-0" />
                </span>
              )}
            </div>
            <p className="text-[11px] sm:text-xs truncate font-medium">{formatPresence()}</p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-2">
          {partner.phone && (
            <button
              onClick={() => setShowPhoneInfo(!showPhoneInfo)}
              className="p-2 text-slate-600 hover:text-[#014923] hover:bg-slate-200/70 rounded-full transition-colors cursor-pointer"
              title={t("chatShowPhone")}
            >
              <Phone className="w-4 h-4" />
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 rounded-full transition-colors cursor-pointer"
              title="Close Chat"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Phone popup banner if toggled */}
      {showPhoneInfo && partner.phone && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between text-xs text-amber-900 animate-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-amber-700" />
            <span>
              Contact: <strong>{partner.phone}</strong>
            </span>
          </div>
          <a
            href={`tel:${partner.phone}`}
            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[11px]"
          >
            {t("chatCallNow")}
          </a>
        </div>
      )}

      {/* 2. PRODUCT CONTEXT BANNER (PINNED TO TOP) */}
      {adInfo.title && (
        <div className="bg-white/95 backdrop-blur-xs border-b border-slate-200/90 px-3.5 py-2 flex items-center justify-between shadow-2xs z-10 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {adInfo.image ? (
              <div className="relative w-11 h-11 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                <Image src={adInfo.image} alt={adInfo.title} fill sizes="44px" className="object-cover" />
              </div>
            ) : null}
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                {t("chatNegotiatingItem")}
              </span>
              <p className="text-xs font-bold text-slate-900 truncate max-w-[200px] sm:max-w-sm">
                {adInfo.title}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-extrabold text-[#014923]">{formatPrice(adInfo.price)}</span>
                <span className="text-[10px] text-slate-400">• {adInfo.location}</span>
              </div>
            </div>
          </div>

          {adInfo.slug && (
            <Link
              href={`/product/${adInfo.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#014923] hover:text-[#E30613] bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100 shrink-0 transition-colors"
            >
              <span>{t("chatViewAd")}</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>
      )}

      {/* 3. WHATSAPP CHAT STREAM AREA */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-1 relative whatsapp-scrollbar overscroll-contain"
        style={{
          backgroundImage: `radial-gradient(#CBD5E1 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
          backgroundColor: "#EFEAE2",
        }}
      >
        {/* Load More Indicator */}
        {hasMore && (
          <div className="flex justify-center my-2">
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="text-xs text-slate-600 bg-white/90 hover:bg-white px-3 py-1 rounded-full shadow-2xs border border-slate-200 flex items-center gap-1.5"
            >
              {isLoadingMore ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00A884]" /> : null}
              <span>{isLoadingMore ? "Loading earlier messages..." : "Load earlier messages"}</span>
            </button>
          </div>
        )}

        {/* Security & Safety WhatsApp Pill */}
        <div className="flex justify-center my-2">
          <div className="bg-[#FFF9C4]/90 text-amber-900 border border-amber-200/80 rounded-lg px-3.5 py-1.5 text-[11px] text-center max-w-md shadow-2xs flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>{t("chatSafetyWarning")}</span>
          </div>
        </div>

        {isLoadingMessages && (
          <div className="flex justify-center py-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-slate-200 text-xs text-slate-600 shadow-2xs">
              <span className="w-3.5 h-3.5 border-2 border-[#00A884] border-t-transparent rounded-full animate-spin" />
              <span>Loading messages...</span>
            </div>
          </div>
        )}

        {chatError && (
          <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 text-center">
            {chatError}
          </div>
        )}

        {/* Message Stream */}
        {messages.map((message) => (
          <MessageBubble
            key={message.id || message._id}
            message={message}
            onReply={(msg) => dispatch(setReplyingTo(msg))}
            onDelete={handleDeleteMessage}
          />
        ))}

        {/* Partner Typing Bubble */}
        {isPartnerTyping && (
          <div className="flex justify-start my-1 px-2">
            <div className="bg-white rounded-2xl rounded-tl-xs px-3.5 py-2.5 shadow-[0_1px_0.5px_rgba(11,20,26,0.12)] border border-slate-100/80 flex items-center gap-1.5">
              <span className="text-[12px] text-slate-500 font-medium">{partner.name} is typing</span>
              <div className="flex items-center gap-1 pl-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00A884] animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#00A884] animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#00A884] animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        {/* Floating WhatsApp Scroll-to-Bottom Button */}
        {showScrollBottomBtn && (
          <button
            type="button"
            onClick={() => {
              scrollToBottom("smooth");
              setIsAtBottom(true);
              setShowScrollBottomBtn(false);
              setNewMessagesWhileScrolledUp(0);
            }}
            className="sticky bottom-3 float-right mr-1 z-30 w-10 h-10 rounded-full bg-white text-slate-700 shadow-xl border border-slate-300 flex items-center justify-center hover:bg-slate-50 transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer"
            title="Scroll to bottom"
          >
            <ChevronDown className="w-5 h-5 text-slate-700" />
            {newMessagesWhileScrolledUp > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#25D366] text-white text-[10px] font-black rounded-full min-w-5 h-5 px-1 flex items-center justify-center shadow-xs animate-pulse">
                {newMessagesWhileScrolledUp}
              </span>
            )}
          </button>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 4. REPLY PREVIEW BANNER (IF REPLYING) */}
      {replyingTo && (
        <div className="bg-white border-t border-slate-200 px-4 py-2 flex items-center justify-between text-xs border-l-4 border-l-[#00A884] shrink-0 animate-in slide-in-from-bottom-2">
          <div className="min-w-0 pr-2">
            <span className="font-bold text-[#00A884] block flex items-center gap-1">
              <Reply className="w-3 h-3" /> {t("chatReplyingTo")} {replyingTo.senderName}
            </span>
            <p className="text-slate-600 truncate text-[11.5px] italic">
              {replyingTo.text || replyingTo.message || "Attachment"}
            </p>
          </div>
          <button
            onClick={() => dispatch(clearReplyingTo())}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-full cursor-pointer"
            title={t("chatCancelReply")}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 5. IMAGE PREVIEW (BEFORE SENDING) */}
      {previewUrl && (
        <div className="bg-white border-t border-slate-200 px-4 py-2.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-300">
              <Image src={previewUrl} alt="Preview" fill className="object-cover" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block truncate max-w-[200px]">
                {pendingFile?.name}
              </span>
              <span className="text-[10px] text-slate-400">{t("chatReadyToSend")}</span>
            </div>
          </div>
          <button
            onClick={removePendingFile}
            className="p-1.5 text-slate-400 hover:text-red-600 rounded-full hover:bg-slate-100 cursor-pointer"
            title={t("chatRemoveAttachment")}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 6. QUICK OFFER CHIPS */}
      <div className="bg-[#F0F2F5]/95 border-t border-slate-200/90 px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        <span className="text-[10px] font-bold uppercase text-slate-500 shrink-0 flex items-center gap-1 mr-1">
          <Sparkles className="w-3 h-3 text-[#E30613]" /> {t("chatQuickRepliesTitle")}
        </span>
        {QUICK_REPLIES.map((reply, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(reply)}
            className="text-xs bg-white hover:bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-300/80 shrink-0 transition-colors shadow-2xs font-medium cursor-pointer"
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Emoji Picker Row */}
      {showEmojis && (
        <div className="bg-white border-t border-slate-200 px-3 py-2 flex items-center gap-2 overflow-x-auto shrink-0 shadow-xs">
          {EMOJI_LIST.map((emoji, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setInputText((prev) => prev + emoji);
                setShowEmojis(false);
              }}
              className="text-lg hover:scale-125 transition-transform p-1"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* 7. WHATSAPP INPUT TOOLBAR */}
      <div className="bg-[#F0F2F5] p-2.5 sm:p-3 border-t border-slate-300/80 flex items-center gap-2 shrink-0">
        {/* Emoji Button */}
        <button
          type="button"
          onClick={() => setShowEmojis(!showEmojis)}
          className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-200/70 rounded-full transition-colors shrink-0"
          title="Add Emoji"
        >
          <Smile className="w-5 h-5" />
        </button>

        {/* Paperclip Attachment Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-200/70 rounded-full transition-colors shrink-0"
          title="Attach Image or Document"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Text Input Field */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={pendingFile ? t("chatAddCaption") : t("chatTypeMessage")}
            className="w-full bg-white text-slate-900 text-sm rounded-full py-2.5 px-4 outline-none border border-transparent focus:border-slate-300 placeholder:text-slate-400 shadow-2xs transition-all"
          />
        </div>

        {/* WhatsApp Round Send Button */}
        <button
          type="button"
          onClick={() => handleSendMessage()}
          disabled={(!inputText.trim() && !pendingFile) || isUploading}
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all shadow-xs ${
            (inputText.trim() || pendingFile) && !isUploading
              ? "bg-[#00A884] hover:bg-[#008f6f] text-white cursor-pointer transform active:scale-95"
              : "bg-slate-300 text-slate-500 cursor-not-allowed opacity-60"
          }`}
          title={t("chatSendTooltip")}
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <Send className="w-4 h-4 translate-x-0.5" />
          )}
        </button>
      </div>
    </div>
  );
}

export default ChatWindow;
