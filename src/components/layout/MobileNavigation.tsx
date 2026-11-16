"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMarketplace } from "@/context/MarketplaceContext";
import { useLanguage } from "@/context/LanguageContext";
import { useAppSelector } from "@/store";
import { selectTotalUnreadCount } from "@/store/slices/chatSlice";
import { Home, Heart, Plus, MessageSquare, User } from "lucide-react";

export function MobileNavigation() {
  const pathname = usePathname();
  const { wishlistCount, user, openAuthModal } = useMarketplace();
  const { t } = useLanguage();
  const totalUnreadChats = useAppSelector(selectTotalUnreadCount);

  const isHome = pathname === "/";
  const isWishlist = pathname === "/wishlist";
  const isChat = pathname === "/chat";
  const isProfile = pathname.startsWith("/profile");

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 md:hidden pb-safe">
      <div className="flex items-center justify-around h-14 px-2">
        {/* Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            isHome ? "text-[#014923] font-bold" : "text-slate-500"
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{t("navHome")}</span>
        </Link>

        {/* Wishlist */}
        <Link
          href="/wishlist"
          className={`relative flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            isWishlist ? "text-[#014923] font-bold" : "text-slate-500"
          }`}
        >
          <div className="relative">
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-[#E30613] text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">{t("navWishlist")}</span>
        </Link>

        {/* SELL Center CTA Button */}
        <div className="flex flex-col items-center justify-center flex-1 -mt-5">
          <Link
            href="/post-ad"
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#E30613] to-[#F42A41] border-3 border-white shadow-lg flex items-center justify-center text-white active:scale-95 transition-transform"
            aria-label="Post Advertisement"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </Link>
          <span className="text-[10px] font-black text-slate-800 mt-0.5">{t("navSell")}</span>
        </div>

        {/* Chat */}
        <Link
          href="/chat"
          className={`relative flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            isChat ? "text-[#014923] font-bold" : "text-slate-500"
          }`}
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5" />
            {totalUnreadChats > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-3.5 h-3.5 px-0.5 bg-[#25D366] text-white rounded-full text-[9px] font-black flex items-center justify-center shadow-xs">
                {totalUnreadChats > 99 ? "99+" : totalUnreadChats}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">{t("navChat")}</span>
        </Link>

        {/* Profile / Login */}
        {user ? (
          <Link
            href="/profile"
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              isProfile ? "text-[#014923] font-bold" : "text-slate-500"
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">{t("navProfile")}</span>
          </Link>
        ) : (
          <button
            onClick={openAuthModal}
            className="flex flex-col items-center justify-center flex-1 py-1 text-slate-500"
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">{t("login")}</span>
          </button>
        )}
      </div>
    </div>
  );
}

