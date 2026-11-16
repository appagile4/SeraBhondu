"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { useMarketplace } from "@/context/MarketplaceContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Info,
  Check,
  X,
  ExternalLink,
} from "lucide-react";

export interface AppNotification {
  _id: string;
  type: "ad_approved" | "ad_rejected" | "chat_message" | "ad_status_changed" | "system";
  title: string;
  message: string;
  isRead: boolean;
  relatedAdvertisement?: {
    _id: string;
    title: string;
    slug: string;
    price: number;
    images?: Array<{ url: string }>;
  };
  createdAt: string;
}

export function NotificationBell() {
  const { user } = useMarketplace();
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const loadNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    loadNotifications();

    // Attach Socket.IO listeners
    const socket = getSocket();

    const handleNewNotification = (data: any) => {
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    const handleAdApproved = (data: any) => {
      const newNotif: AppNotification = {
        _id: `approved-${Date.now()}`,
        type: "ad_approved",
        title: "Advertisement Approved! 🎉",
        message: data.message || `Your advertisement "${data.title}" is now live on Serabondhu.`,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    const handleAdRejected = (data: any) => {
      const newNotif: AppNotification = {
        _id: `rejected-${Date.now()}`,
        type: "ad_rejected",
        title: "Advertisement Rejected ⚠️",
        message:
          data.reason
            ? `Your ad "${data.title}" was rejected. Reason: ${data.reason}`
            : `Your ad "${data.title}" was rejected. Please review community guidelines.`,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    const handleChatAlert = (data: any) => {
      const isChatPage = typeof window !== "undefined" && window.location.pathname === "/chat";
      if (!isChatPage) {
        const newNotif: AppNotification = {
          _id: `chat-${data.message?._id || Date.now()}`,
          type: "chat_message",
          title: `Message from ${data.senderName || "Seller"}`,
          message: data.message?.text || data.message?.message || "Sent you a message",
          isRead: false,
          createdAt: new Date().toISOString(),
        };
        setNotifications((prev) => [newNotif, ...prev]);
        setUnreadCount((prev) => prev + 1);
      }
    };

    socket.on("notification:new", handleNewNotification);
    socket.on("ad:approved", handleAdApproved);
    socket.on("ad:rejected", handleAdRejected);
    socket.on("chat:new_message_alert", handleChatAlert);

    return () => {
      socket.off("notification:new", handleNewNotification);
      socket.off("ad:approved", handleAdApproved);
      socket.off("ad:rejected", handleAdRejected);
      socket.off("chat:new_message_alert", handleChatAlert);
    };
  }, [user]);

  // Outside click handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  if (!user) return null;

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl text-slate-700 hover:text-[#014923] hover:bg-slate-100 transition-colors cursor-pointer"
        title={t("notificationsTitle")}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-black flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                {t("notificationsTitle")}
              </span>
              {unreadCount > 0 && (
                <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} {t("notificationsUnread")}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] font-semibold text-[#014923] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3 h-3" />
                <span>{t("notificationsMarkAllRead")}</span>
              </button>
            )}
          </div>

          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {notifications.length > 0 ? (
              notifications.map((n) => {
                const isApproved = n.type === "ad_approved";
                const isRejected = n.type === "ad_rejected";
                const isChat = n.type === "chat_message";

                return (
                  <div
                    key={n._id}
                    onClick={() => !n.isRead && handleMarkAsRead(n._id)}
                    className={`p-3.5 hover:bg-slate-50 transition-colors text-left flex items-start gap-3 cursor-pointer ${
                      !n.isRead ? "bg-emerald-50/40" : ""
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        isApproved
                          ? "bg-emerald-100 text-emerald-600"
                          : isRejected
                          ? "bg-rose-100 text-rose-600"
                          : isChat
                          ? "bg-emerald-100 text-[#014923]"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {isApproved && <CheckCircle2 className="w-4 h-4" />}
                      {isRejected && <AlertTriangle className="w-4 h-4" />}
                      {isChat && <MessageSquare className="w-4 h-4" />}
                      {!isApproved && !isRejected && !isChat && <Info className="w-4 h-4" />}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-xs text-slate-900 truncate">
                          {n.title}
                        </p>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-[#014923] shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                      <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                        <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        {isApproved && n.relatedAdvertisement?.slug && (
                          <Link
                            href={`/product/${n.relatedAdvertisement.slug}`}
                            className="text-[#014923] font-bold hover:underline flex items-center gap-0.5"
                            onClick={() => setIsOpen(false)}
                          >
                            <span>{t("notificationsViewAd")}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                        )}
                        {isChat && (
                          <Link
                            href="/chat"
                            className="text-[#00A884] font-bold hover:underline flex items-center gap-0.5"
                            onClick={() => setIsOpen(false)}
                          >
                            <span>{t("notificationsOpenChat")}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                        )}
                        {isRejected && (
                          <Link
                            href="/profile"
                            className="text-rose-600 font-bold hover:underline"
                            onClick={() => setIsOpen(false)}
                          >
                            {t("notificationsEditResubmit")}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-slate-400 space-y-1">
                <Bell className="w-6 h-6 mx-auto stroke-[1.5]" />
                <p className="text-xs">{t("notificationsNoFound")}</p>
              </div>
            )}
          </div>

          <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-slate-600 hover:text-slate-900"
            >
              {t("notificationsGoToProfile")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

