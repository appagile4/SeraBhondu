"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import api from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/common/Button";
import { UserAvatar } from "@/components/common/UserAvatar";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { useMarketplace } from "@/context/MarketplaceContext";
import { useAppSelector } from "@/store";
import { selectTotalUnreadCount } from "@/store/slices/chatSlice";
import {
  MapPin,
  Search,
  Heart,
  User,
  Plus,
  ChevronDown,
  ChevronRight,
  History,
  TrendingUp,
  X,
  MessageSquare,
  Bell,
  Menu,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Check,
  ExternalLink,
} from "lucide-react";
import { POPULAR_SEARCH_KEYWORDS } from "@/data/searchSuggestions";
import { POPULAR_CITIES } from "@/data/locations";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";

export function MainHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    selectedLocation,
    setSelectedLocation,
    openLocationModal,
    wishlistCount,
    user,
    openAuthModal,
    recentSearches,
    addRecentSearch,
    logout,
  } = useMarketplace();

  const { language, t } = useLanguage();

  const totalUnreadChats = useAppSelector(selectTotalUnreadCount);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [locationSearchInput, setLocationSearchInput] = useState("");

  // Mobile quick dropdown menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [notificationsList, setNotificationsList] = useState<any[]>([]);
  const [isNotifsOpenInMenu, setIsNotifsOpenInMenu] = useState(false);

  const searchBoxRef = useRef<HTMLDivElement>(null);
  const locationBoxRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsNotifsOpenInMenu(false);
  }, [pathname]);

  // Fetch real-time notifications for mobile dropdown
  useEffect(() => {
    if (!user) {
      setUnreadNotifs(0);
      setNotificationsList([]);
      return;
    }

    const loadNotifs = async () => {
      try {
        const res = await api.get("/notifications");
        setNotificationsList(res.data.notifications || []);
        setUnreadNotifs(res.data.unreadCount || 0);
      } catch {}
    };

    loadNotifs();

    const socket = getSocket();
    const handleNewNotif = (data: any) => {
      setNotificationsList((prev) => [data, ...prev]);
      setUnreadNotifs((prev) => prev + 1);
    };
    const handleApproved = (data: any) => {
      const notif = {
        _id: `approved-${Date.now()}`,
        type: "ad_approved",
        title: "Advertisement Approved! 🎉",
        message: data.message || `Your advertisement "${data.title}" is now live.`,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setNotificationsList((prev) => [notif, ...prev]);
      setUnreadNotifs((prev) => prev + 1);
    };
    const handleRejected = (data: any) => {
      const notif = {
        _id: `rejected-${Date.now()}`,
        type: "ad_rejected",
        title: "Advertisement Rejected ⚠️",
        message: data.reason || `Your advertisement "${data.title}" was rejected.`,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setNotificationsList((prev) => [notif, ...prev]);
      setUnreadNotifs((prev) => prev + 1);
    };

    socket.on("notification:new", handleNewNotif);
    socket.on("ad:approved", handleApproved);
    socket.on("ad:rejected", handleRejected);

    return () => {
      socket.off("notification:new", handleNewNotif);
      socket.off("ad:approved", handleApproved);
      socket.off("ad:rejected", handleRejected);
    };
  }, [user]);

  const handleMarkNotifRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotificationsList((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadNotifs((prev) => Math.max(0, prev - 1));
    } catch {}
  };

  const handleMarkAllNotifsRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotificationsList((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadNotifs(0);
    } catch {}
  };

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
      if (locationBoxRef.current && !locationBoxRef.current.contains(event.target as Node)) {
        setIsLocationDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    addRecentSearch(searchQuery);
    setIsSearchFocused(false);
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleSuggestionClick = (keyword: string) => {
    setSearchQuery(keyword);
    addRecentSearch(keyword);
    setIsSearchFocused(false);
    router.push(`/search?q=${encodeURIComponent(keyword)}`);
  };

  const filteredDropdownCities = POPULAR_CITIES.filter((c) =>
    c.name.toLowerCase().includes(locationSearchInput.toLowerCase())
  );

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 w-full shadow-xs">
      <div className="w-full px-3 sm:px-6 lg:px-8 relative">
        <div className="flex items-center justify-between min-h-[64px] sm:min-h-[84px] py-2 gap-2 sm:gap-4 lg:gap-6">
          {/* Logo */}
          <div className="shrink-0 flex items-center">
            <Logo size="md" />
          </div>

          {/* Location Picker (Desktop & Tablet) */}
          <div ref={locationBoxRef} className="relative hidden md:block w-40 lg:w-48 shrink-0">
            <button
              onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border-2 border-slate-300 hover:border-[#014923] bg-white text-left text-sm transition-colors"
            >
              <div className="flex items-center gap-2 truncate">
                <MapPin className="w-4 h-4 text-[#E30613] shrink-0" />
                <span className="truncate font-semibold text-slate-800">
                  {selectedLocation === "All Bangladesh" ? t("allBangladesh") : selectedLocation}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                  isLocationDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Quick Location Dropdown */}
            {isLocationDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="p-1 mb-2">
                  <input
                    type="text"
                    placeholder="Search city..."
                    value={locationSearchInput}
                    onChange={(e) => setLocationSearchInput(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-[#014923] focus:ring-1 focus:ring-[#014923]"
                    autoFocus
                  />
                </div>

                <div className="max-h-56 overflow-y-auto space-y-1">
                  {filteredDropdownCities.slice(0, 10).map((city) => (
                    <button
                      key={city.id}
                      onClick={() => {
                        setSelectedLocation(city.name);
                        setIsLocationDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between hover:bg-slate-100 transition-colors ${
                        selectedLocation.toLowerCase() === city.name.toLowerCase()
                          ? "bg-[#014923]/10 text-[#014923] font-bold"
                          : "text-slate-700"
                      }`}
                    >
                      <span>{city.name}</span>
                      <span className="text-[10px] text-slate-400">{city.state}</span>
                    </button>
                  ))}
                </div>

                <div className="pt-2 mt-1 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setIsLocationDropdownOpen(false);
                      openLocationModal();
                    }}
                    className="w-full text-center text-xs text-[#014923] hover:underline font-semibold py-1"
                  >
                    {t("viewAllCities")}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Main Search Bar */}
          <div ref={searchBoxRef} className="relative flex-1 min-w-0">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                className="w-full rounded-xl border-2 border-slate-300 bg-white pl-3.5 sm:pl-4 pr-10 sm:pr-12 py-2 sm:py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#014923] focus:outline-hidden transition-colors truncate"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-10 sm:right-12 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                </button>
              )}
              <button
                type="submit"
                aria-label={t("searchBtn")}
                className="absolute right-1 top-1 bottom-1 px-2.5 sm:px-3.5 bg-[#014923] hover:bg-[#003819] text-white rounded-lg flex items-center justify-center transition-colors cursor-pointer"
              >
                <Search className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
              </button>
            </form>

            {/* Search Suggestions Dropdown */}
            {isSearchFocused && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t("recentSearches")}</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {recentSearches.map((term, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSuggestionClick(term)}
                          className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1 transition-colors"
                        >
                          <span>{term}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Keywords */}
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-[#E30613]" />
                    <span>{t("popularSearches")}</span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    {POPULAR_SEARCH_KEYWORDS.map((item, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSuggestionClick(item.text)}
                        className="text-left px-2 py-1.5 text-xs text-slate-700 hover:text-[#014923] hover:bg-slate-50 rounded-md transition-colors flex items-center justify-between"
                      >
                        <span className="truncate">{item.text}</span>
                        <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                          in {item.categorySlug}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Desktop User Actions (Visible on Tablet & Desktop sm: and above) */}
          <div className="hidden sm:flex items-center space-x-2 sm:space-x-2.5 lg:space-x-3 shrink-0">
            {/* Language Switcher Button (🇧🇩 বাংলা / 🇬🇧 English) */}
            <LanguageSwitcher variant="pill" />

            {/* Wishlist Link */}
            <Link
              href="/wishlist"
              className="relative p-2.5 rounded-xl text-slate-700 hover:text-[#014923] hover:bg-slate-100 transition-colors"
              title={t("wishlist")}
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#E30613] text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-in zoom-in">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Chat Link */}
            <Link
              href="/chat"
              className="relative p-2.5 rounded-xl text-slate-700 hover:text-[#014923] hover:bg-slate-100 transition-colors"
              title={t("chat")}
            >
              <MessageSquare className="w-5 h-5" />
              {totalUnreadChats > 0 && (
                <span className="absolute top-1 right-1 min-w-4 h-4 px-1 bg-[#25D366] text-white rounded-full text-[10px] font-black flex items-center justify-center animate-pulse shadow-xs">
                  {totalUnreadChats > 99 ? "99+" : totalUnreadChats}
                </span>
              )}
            </Link>

            {/* Real-time Notification Bell */}
            <NotificationBell />

            {/* Login or User Profile */}
            {user ? (
              <Link
                href="/profile"
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <UserAvatar
                  src={user.avatar}
                  name={user.name}
                  size="sm"
                  borderClassName="border border-slate-300"
                />
                <span className="hidden lg:inline text-xs font-bold text-slate-800 truncate max-w-[90px]">
                  {user.name.split(" ")[0]}
                </span>
              </Link>
            ) : (
              <button
                onClick={openAuthModal}
                className="px-3 py-2 text-sm font-bold text-slate-800 hover:text-[#014923] hover:underline transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>{t("login")}</span>
              </button>
            )}

            {/* + SELL Primary CTA Button (Desktop only!) */}
            <Link href="/post-ad" className="hidden sm:inline-flex">
              <Button
                variant="sell"
                size="md"
                leftIcon={<Plus className="w-4 h-4 stroke-[3]" />}
                className="shadow-md"
              >
                {t("sellBtn")}
              </Button>
            </Link>
          </div>

          {/* Mobile Actions Dropdown Trigger (Visible ONLY on Mobile < sm) */}
          <div className="flex sm:hidden items-center shrink-0">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="relative p-2 rounded-xl text-slate-700 hover:text-[#014923] hover:bg-slate-100 border border-slate-200/90 active:scale-95 transition-all flex items-center gap-1 cursor-pointer bg-white shadow-2xs"
              aria-label="Toggle Quick Navigation Menu"
            >
              {user ? (
                <UserAvatar
                  src={user.avatar}
                  name={user.name}
                  size={24}
                  borderClassName="border border-slate-300"
                />
              ) : (
                <Menu className="w-5 h-5 text-slate-700" />
              )}
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  isMobileMenuOpen ? "rotate-180" : ""
                }`}
              />

              {/* Combined Alert Dot */}
              {(totalUnreadChats > 0 || unreadNotifs > 0 || wishlistCount > 0) && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-[#E30613] text-white rounded-full text-[9px] font-black flex items-center justify-center animate-pulse shadow-xs">
                  {totalUnreadChats + unreadNotifs || wishlistCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Quick Dropdown Panel */}
        {isMobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="absolute top-full right-3 left-3 mt-1.5 bg-white rounded-3xl shadow-2xl border border-slate-200/90 p-4 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3 sm:hidden"
          >
            {/* User Profile or Welcome Banner */}
            {user ? (
              <div className="p-3 bg-slate-50/90 rounded-2xl border border-slate-100 flex items-center justify-between">
                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 flex-1 min-w-0"
                >
                  <UserAvatar
                    src={user.avatar}
                    name={user.name}
                    size="md"
                    borderClassName="border-2 border-white shadow-xs"
                  />
                  <div className="truncate">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-black text-slate-900 truncate">{user.name}</p>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono truncate">
                      {user.phone || user.email}
                    </p>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="p-2 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50/60 rounded-2xl border border-blue-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-slate-900">{t("welcomeMessage")}</p>
                  <p className="text-[10px] text-slate-500">{t("tagline")}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openAuthModal();
                  }}
                  className="px-3.5 py-1.5 bg-[#014923] text-white text-xs font-black rounded-xl shadow-xs cursor-pointer hover:bg-[#003819] transition-colors"
                >
                  {t("login")}
                </button>
              </div>
            )}

            {/* Language Switcher in Mobile Drawer (🇧🇩 বাংলা / 🇬🇧 English) */}
            <div className="pt-1 pb-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-1">
                {t("languageLabel")}
              </p>
              <LanguageSwitcher variant="mobile" />
            </div>

            {/* The 3 Hubs: Chat, Notifications, Wishlist */}
            <div className="space-y-2">
              {/* 1. Messages / Chat Link */}
              <Link
                href="/chat"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-slate-100 active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#25D366] flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900">Messages &amp; Chat</p>
                    <p className="text-[11px] text-slate-500">Instant buyer-to-seller chats</p>
                  </div>
                </div>
                {totalUnreadChats > 0 ? (
                  <span className="px-2 py-0.5 rounded-full bg-[#25D366] text-white text-[10px] font-black animate-pulse">
                    {totalUnreadChats > 99 ? "99+" : totalUnreadChats} unread
                  </span>
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </Link>

              {/* 2. Notifications & Alerts (Collapsible live panel) */}
              <div className="rounded-2xl border border-slate-100 overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() => setIsNotifsOpenInMenu(!isNotifsOpenInMenu)}
                  className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#014923] flex items-center justify-center shrink-0">
                      <Bell className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900">{t("notificationsAndAlerts")}</p>
                      <p className="text-[11px] text-slate-500">{t("notificationsDesc")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadNotifs > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse">
                        {unreadNotifs} {t("notificationsUnread")}
                      </span>
                    )}
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                        isNotifsOpenInMenu ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {/* Collapsible Notifications List */}
                {isNotifsOpenInMenu && (
                  <div className="p-2.5 bg-slate-50 border-t border-slate-100 space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        {t("notificationsRecentAlerts")}
                      </span>
                      {unreadNotifs > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllNotifsRead}
                          className="text-[10px] font-bold text-[#014923] hover:underline cursor-pointer"
                        >
                          {t("notificationsMarkAllRead")}
                        </button>
                      )}
                    </div>

                    <div className="max-h-52 overflow-y-auto space-y-1.5 divide-y divide-slate-100">
                      {notificationsList.length > 0 ? (
                        notificationsList.slice(0, 5).map((n) => (
                          <div
                            key={n._id}
                            onClick={() => !n.isRead && handleMarkNotifRead(n._id)}
                            className={`p-2.5 rounded-xl bg-white border border-slate-200/80 text-left space-y-1 cursor-pointer transition-colors ${
                              !n.isRead ? "border-blue-300 bg-emerald-50/30" : ""
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-black text-xs text-slate-900 truncate">{n.title}</p>
                              {!n.isRead && (
                                <span className="w-2 h-2 rounded-full bg-[#014923] shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                              {n.message}
                            </p>
                            <div className="flex items-center justify-between pt-0.5 text-[9px] text-slate-400">
                              <span>
                                {new Date(n.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              {n.type === "chat_message" && (
                                <Link
                                  href="/chat"
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className="text-[#00A884] font-bold flex items-center gap-0.5"
                                >
                                  <span>{t("notificationsOpenChat")}</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </Link>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-xs text-slate-400 py-3">{t("notificationsNoFound")}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 3. My Wishlist (Heart) Link */}
              <Link
                href="/wishlist"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-slate-100 active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-[#E30613] flex items-center justify-center shrink-0">
                    <Heart className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900">My Wishlist</p>
                    <p className="text-[11px] text-slate-500">Saved items &amp; price alerts</p>
                  </div>
                </div>
                {wishlistCount > 0 ? (
                  <span className="px-2 py-0.5 rounded-full bg-[#E30613] text-white text-[10px] font-black">
                    {wishlistCount} saved
                  </span>
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </Link>
            </div>

            {/* Location Switcher in Mobile Dropdown */}
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                openLocationModal();
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-slate-100 text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900">Location: {selectedLocation}</p>
                  <p className="text-[11px] text-slate-500">Tap to select city or province</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Informative SELL button hint */}
            <div className="px-3 py-2 bg-red-50/60 rounded-xl border border-orange-100/80 text-[10px] text-slate-600 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E30613] shrink-0 animate-pulse" />
              <span>
                To list a new product, tap the large orange <strong>SELL</strong> button in the bottom navigation bar.
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

