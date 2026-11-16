"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  setLanguage as setLanguageAction,
  toggleLanguage as toggleLanguageAction,
  selectLanguage,
  selectCurrencySymbol,
  Language,
} from "@/store/slices/languageSlice";

export type { Language };

export interface Translations {
  [key: string]: {
    bn: string;
    en: string;
  };
}

export const TRANSLATIONS: Translations = {
  // Brand & Slogan
  brandName: {
    bn: "খোঁজবাংলা",
    en: "KhojoBangla",
  },
  tagline: {
    bn: "কিনুন • বিক্রি করুন • খুঁজে নিন বাংলায়",
    en: "Buy • Sell • Find in Bangla",
  },
  welcomeMessage: {
    bn: "খোঁজবাংলায় স্বাগতম",
    en: "Welcome to KhojoBangla",
  },

  // Header & Navigation
  allAds: {
    bn: "সকল বিজ্ঞাপন",
    en: "All Listings",
  },
  allBangladesh: {
    bn: "সমগ্র বাংলাদেশ",
    en: "All Bangladesh",
  },
  searchPlaceholder: {
    bn: "গাড়ি, বাইক, মোবাইল, ফ্ল্যাট বা চাকরি খুঁজুন...",
    en: "Find Cars, Mobiles, Properties, Jobs...",
  },
  searchBtn: {
    bn: "অনুসন্ধান",
    en: "Search",
  },
  recentSearches: {
    bn: "সাম্প্রতিক অনুসন্ধান",
    en: "Recent Searches",
  },
  popularSearches: {
    bn: "জনপ্রিয় অনুসন্ধান",
    en: "Popular Searches",
  },
  allCategories: {
    bn: "সকল ক্যাটাগরি",
    en: "All Categories",
  },
  viewAllCities: {
    bn: "সকল বিভাগ ও জেলা দেখুন →",
    en: "View all cities & divisions →",
  },

  // Header Actions
  wishlist: {
    bn: "পছন্দের তালিকা",
    en: "Wishlist",
  },
  chat: {
    bn: "বার্তা",
    en: "Chat",
  },
  notifications: {
    bn: "বিজ্ঞপ্তি",
    en: "Notifications",
  },
  login: {
    bn: "লগইন",
    en: "Login",
  },
  signOut: {
    bn: "লগআউট",
    en: "Sign Out",
  },
  profile: {
    bn: "আমার প্রোফাইল",
    en: "My Profile",
  },
  myAds: {
    bn: "আমার বিজ্ঞাপন",
    en: "My Listings",
  },
  sellBtn: {
    bn: "বিজ্ঞাপন দিন",
    en: "SELL",
  },
  languageLabel: {
    bn: "ভাষা পরিবর্তন",
    en: "Language",
  },

  // Quick Categories
  popularCategoriesTitle: {
    bn: "জনপ্রিয় ক্যাটাগরি",
    en: "Popular Categories",
  },
  popularCategoriesSub: {
    bn: "সমগ্র বাংলাদেশের শীর্ষ ক্যাটাগরির বিজ্ঞাপনগুলো দেখুন",
    en: "Browse top marketplace departments across Bangladesh",
  },
  catCars: {
    bn: "গাড়ি",
    en: "Cars",
  },
  catBikes: {
    bn: "মোটরসাইকেল",
    en: "Motorcycles",
  },
  catMobiles: {
    bn: "মোবাইল ফোন",
    en: "Mobile Phones",
  },
  catHouseSale: {
    bn: "বাড়ি ও ফ্ল্যাট বিক্রয়",
    en: "Houses & Apartments for Sale",
  },
  catHouseRent: {
    bn: "বাড়ি ও ফ্ল্যাট ভাড়া",
    en: "Houses & Apartments for Rent",
  },
  catFurniture: {
    bn: "আসবাবপত্র ও খাট",
    en: "Beds & Wardrobes",
  },
  catElectronics: {
    bn: "টিভি ও গ্যাজেট",
    en: "TVs, Video & Audio",
  },

  // Hero Banner
  heroTitle: {
    bn: "বাংলাদেশে যেকোনো কিছু খুঁজুন, কিনুন এবং বিক্রি করুন",
    en: "Buy, Sell & Discover Anything in Bangladesh",
  },
  heroSubtitle: {
    bn: "ঢাকা, চট্টগ্রাম, সিলেট সহ ৬৪ জেলার হাজার হাজার যাচাইকৃত ক্রেতা ও বিক্রেতার সাথে সহজে যোগাযোগ করুন।",
    en: "Thousands of verified listings across Dhaka, Chattogram, Sylhet, and all 64 districts.",
  },
  postFreeAd: {
    bn: "বিনামূল্যে বিজ্ঞাপন দিন",
    en: "Post a Free Ad",
  },
  exploreDeals: {
    bn: "বিজ্ঞাপন দেখুন",
    en: "Explore Deals",
  },

  // Fresh Recommendations
  freshRecommendationsTitle: {
    bn: "নতুন সংগৃহীত বিজ্ঞাপন",
    en: "Fresh Recommendations",
  },
  freshRecommendationsSub: {
    bn: "সমগ্র বাংলাদেশ থেকে সাম্প্রতিক যোগ হওয়া আকর্ষণীয় ডিলসমূহ",
    en: "Handpicked newly listed advertisements across Bangladesh",
  },
  freshInCity: {
    bn: "এলাকার সাম্প্রতিক বিজ্ঞাপনসমূহ",
    en: "Recently posted advertisements in",
  },
  newBadge: {
    bn: "নতুন",
    en: "New",
  },
  showingAds: {
    bn: "বিজ্ঞাপন প্রদর্শন",
    en: "Showing",
  },
  ofAds: {
    bn: "টির মধ্যে",
    en: "of",
  },
  loadMore: {
    bn: "আরও বিজ্ঞাপন লোড করুন",
    en: "Load More Advertisements",
  },

  // Featured
  featuredTitle: {
    bn: "ফিচার্ড বিজ্ঞাপন",
    en: "Featured Advertisements",
  },
  featuredSubtitle: {
    bn: "শীর্ষস্থানীয় এবং ভেরিফাইড বিক্রেতাদের প্রিমিয়াম বিজ্ঞাপনসমূহ",
    en: "Top promoted verified listings with maximum buyer interest",
  },
  featuredBadge: {
    bn: "ফিচার্ড",
    en: "Featured",
  },
  viewAll: {
    bn: "সকল দেখুন",
    en: "View All",
  },

  // Sell CTA
  sellCtaTitle: {
    bn: "আপনার কি কিছু বিক্রির আছে?",
    en: "Have something to sell?",
  },
  sellCtaSub: {
    bn: "অব্যবহৃত পণ্যগুলো সেরা দামে বিক্রি করুন। মাত্র ২ মিনিটে আপনার বিজ্ঞাপন দিন এবং সরাসরি ক্রেতার সাথে যোগাযোগ করুন।",
    en: "Turn your unused products into great deals. List your advertisement on KhojoBangla in less than 2 minutes and connect with genuine buyers across Bangladesh.",
  },
  sellCtaBtn: {
    bn: "এখনই বিজ্ঞাপন দিন",
    en: "Post an Ad Now",
  },
  sellFeature1: {
    bn: "নিরাপদ ও ভেরিফাইড ক্রেতা",
    en: "Safe & Verified Buyers",
  },
  sellFeature2: {
    bn: "সরাসরি চ্যাট ও মেসেজ",
    en: "Direct Chat Connection",
  },
  sellFeature3: {
    bn: "১০০% বিনামূল্যে ছবি আপলোড",
    en: "Unlimited Free Photos",
  },
  sellCtaBadge: {
    bn: "দ্রুত, সহজ ও ১০০% ফ্রি",
    en: "Fast, Easy & 100% Free",
  },

  // Location Explorer
  locationExplorerTitle: {
    bn: "শহর ও বিভাগ অনুযায়ী খুঁজুন",
    en: "Browse by City & Division",
  },
  locationExplorerSub: {
    bn: "বাংলাদেশের প্রধান শহর ও বিভাগের সক্রিয় স্থানীয় বিজ্ঞাপনগুলো দেখুন",
    en: "Explore active local advertisements across major cities and divisions of Bangladesh",
  },

  // Product Card
  conditionUsed: {
    bn: "ব্যবহৃত",
    en: "Used",
  },
  conditionNew: {
    bn: "নতুন",
    en: "New",
  },
  verifiedSeller: {
    bn: "ভেরিফাইড বিক্রেতা",
    en: "Verified Seller",
  },
  chatWithSeller: {
    bn: "মেসেজ পাঠান",
    en: "Chat",
  },
  callSeller: {
    bn: "কল করুন",
    en: "Call",
  },

  // Mobile Bottom Navigation
  navHome: {
    bn: "হোম",
    en: "Home",
  },
  navChat: {
    bn: "চ্যাট",
    en: "Chat",
  },
  navSell: {
    bn: "বিক্রি",
    en: "Sell",
  },
  navWishlist: {
    bn: "পছন্দ",
    en: "Saved",
  },
  navProfile: {
    bn: "প্রোফাইল",
    en: "Account",
  },

  // Footer
  footerAboutText: {
    bn: "খোঁজবাংলা (KhojoBangla.com) হলো বাংলাদেশের আধুনিক অনলাইন ক্লাসিফাইড মার্কেটপ্লেস—গাড়ি, মোটরসাইকেল, জমি-ফ্ল্যাট, স্মার্টফোন, ইলেকট্রনিক্স, আসবাবপত্র এবং স্থানীয় সেবা কেনাবেচার সেরা প্ল্যাটফর্ম।",
    en: "KhojoBangla (KhojoBangla.com) is Bangladesh's modern online marketplace for buying and selling pre-owned vehicles, properties, smartphones, electronics, furniture, and local services.",
  },
  footerPopularCategories: {
    bn: "জনপ্রিয় ক্যাটাগরি",
    en: "Popular Categories",
  },
  footerTrendingLocations: {
    bn: "শীর্ষ বিভাগ ও শহর",
    en: "Trending Locations",
  },
  footerAboutUs: {
    bn: "খোঁজবাংলা",
    en: "About KhojoBangla",
  },
  footerHelpSupport: {
    bn: "সাহায্য ও নিরাপত্তা",
    en: "Help & Support",
  },
  footerSafetyTips: {
    bn: "নিরাপত্তা টিপস",
    en: "Safety Tips",
  },
  footerContactUs: {
    bn: "যোগাযোগ করুন",
    en: "Contact Us",
  },
  footerCareers: {
    bn: "ক্যারিয়ার",
    en: "Careers",
  },
  footerTerms: {
    bn: "ব্যবহারের শর্তাবলী",
    en: "Terms of Use",
  },
  footerPrivacy: {
    bn: "গোপনীয়তা নীতি",
    en: "Privacy Policy",
  },
  footerSitemap: {
    bn: "সাইটম্যাপ",
    en: "Sitemap",
  },
  footerCopyright: {
    bn: "সর্বস্বত্ব সংরক্ষিত।",
    en: "All rights reserved.",
  },

  // Footer Links - Popular Categories
  footerUsedCars: {
    bn: "ব্যবহৃত গাড়ি",
    en: "Used Cars",
  },
  footerBikesScooters: {
    bn: "বাইক ও স্কুটার",
    en: "Bikes & Scooters",
  },
  footerMobiles: {
    bn: "মোবাইল ফোন",
    en: "Mobile Phones",
  },
  footerPropertiesSale: {
    bn: "জমি ও ফ্ল্যাট বিক্রয়",
    en: "Properties for Sale",
  },
  footerElectronics: {
    bn: "ল্যাপটপ ও ইলেকট্রনিক্স",
    en: "Laptops & Electronics",
  },
  footerFurniture: {
    bn: "আসবাবপত্র ও ফার্নিচার",
    en: "Home & Office Furniture",
  },

  // Footer Links - Trending Locations
  cityDhaka: {
    bn: "ঢাকা",
    en: "Dhaka",
  },
  cityChattogram: {
    bn: "চট্টগ্রাম",
    en: "Chattogram",
  },
  citySylhet: {
    bn: "সিলেট",
    en: "Sylhet",
  },
  cityRajshahi: {
    bn: "রাজশাহী",
    en: "Rajshahi",
  },
  cityKhulna: {
    bn: "খুলনা",
    en: "Khulna",
  },
  cityBarishal: {
    bn: "বরিশাল",
    en: "Barishal",
  },

  // Footer Links - Company & About
  footerAboutCompany: {
    bn: "খোঁজবাংলা সম্পর্কে",
    en: "About KhojoBangla",
  },
  footerCareersCulture: {
    bn: "ক্যারিয়ার ও সংস্কৃতি",
    en: "Careers & Culture",
  },
  footerContactSupport: {
    bn: "সাপোর্ট যোগাযোগ",
    en: "Contact Support",
  },
  footerBusiness: {
    bn: "ব্যবসার জন্য খোঁজবাংলা",
    en: "KhojoBangla for Businesses",
  },
  footerSitemapLink: {
    bn: "সাইটম্যাপ",
    en: "Sitemap",
  },

  // Footer Links - Help & Safety
  footerBuyerSafety: {
    bn: "নিরাপত্তা টিপস",
    en: "Safety Tips for Buyers",
  },
  footerFraudAwareness: {
    bn: "প্রতারণা সচেতনতা গাইড",
    en: "Fraud Awareness Guide",
  },
  footerHelpCenter: {
    bn: "হেল্প সেন্টার ও সাধারণ জিজ্ঞাসা",
    en: "Help Center & FAQ",
  },
  footerTermsOfUse: {
    bn: "ব্যবহারের শর্তাবলী",
    en: "Terms of Use",
  },
  footerPrivacyPolicy: {
    bn: "গোপনীয়তা নীতি",
    en: "Privacy Policy",
  },

  // Footer Bottom Legal
  footerSecurity: {
    bn: "নিরাপত্তা",
    en: "Security",
  },
  footerTermsShort: {
    bn: "শর্তাবলী",
    en: "Terms",
  },
  footerPrivacyShort: {
    bn: "গোপনীয়তা",
    en: "Privacy",
  },
  footerCookiesShort: {
    bn: "কুকিজ",
    en: "Cookies",
  },

  // Chat & Messaging
  chatTitle: {
    bn: "চ্যাটসমূহ",
    en: "Chats",
  },
  chatCountSingular: {
    bn: "টি চ্যাট",
    en: "chat",
  },
  chatCountPlural: {
    bn: "টি চ্যাট",
    en: "chats",
  },
  chatSearchPlaceholder: {
    bn: "খুঁজুন বা নতুন চ্যাট শুরু করুন...",
    en: "Search or start new chat",
  },
  chatTabAll: {
    bn: "সকল",
    en: "All",
  },
  chatTabUnread: {
    bn: "অপঠিত",
    en: "Unread",
  },
  chatLoading: {
    bn: "চ্যাট লোড হচ্ছে...",
    en: "Loading chats...",
  },
  chatNoFound: {
    bn: "কোনো চ্যাট পাওয়া যায়নি",
    en: "No chats found",
  },
  chatNoFoundDesc: {
    bn: "খোঁজবাংলায় আপনার পছন্দের বিজ্ঞাপনটি খুঁজুন এবং দরদাম শুরু করতে 'বিক্রেতার সাথে চ্যাট করুন'-এ ক্লিক করুন।",
    en: "Find an ad you like on KhojoBangla and click 'Chat with Seller' to start negotiating.",
  },
  chatBrowseClassifieds: {
    bn: "বিজ্ঞাপন ব্রাউজ করুন",
    en: "Browse Classifieds",
  },
  chatMessengerTitle: {
    bn: "খোঁজবাংলা ওয়েব মেসেঞ্জার",
    en: "KhojoBangla Web Messenger",
  },
  chatMessengerDesc: {
    bn: "সমগ্র বাংলাদেশের ভেরিফাইড ক্রেতা ও বিক্রেতাদের সাথে তাৎক্ষণিক বার্তা আদান-প্রদান করুন। পণ্যের দরদাম, পণ্য পরিদর্শন নির্ধারণ এবং নিরাপদে লেনদেন করুন।",
    en: "Send and receive real-time messages with verified sellers and buyers across Bangladesh. Negotiate prices, schedule product inspections, and chat safely.",
  },
  chatEncrypted: {
    bn: "এন্ড-টু-এন্ড এনক্রিপ্ট করা নিরাপদ ক্লাসিফাইড বার্তালাপ",
    en: "End-to-end encrypted classified conversations",
  },
  chatRefreshTooltip: {
    bn: "চ্যাট রিফ্রেশ করুন",
    en: "Refresh chats",
  },
  chatClickToOpen: {
    bn: "চ্যাট খুলতে ক্লিক করুন",
    en: "Click to open chat",
  },
  chatYesterday: {
    bn: "গতকাল",
    en: "Yesterday",
  },
  chatSignInRequired: {
    bn: "বার্তা দেখতে সাইন ইন করুন",
    en: "Sign in to view messages",
  },
  chatSignInDesc: {
    bn: "নিরাপদে কেনাবেচা ও পণ্য যাচাইয়ের জন্য বাংলাদেশের যাচাইকৃত ক্রেতা ও বিক্রেতাদের সাথে তাৎক্ষণিক যোগাযোগ করুন।",
    en: "Connect in real-time with verified buyers and sellers across Bangladesh to negotiate prices and inspect items safely.",
  },
  chatSignInBtn: {
    bn: "খোঁজবাংলায় সাইন ইন করুন",
    en: "Sign In to KhojoBangla",
  },
  chatPageLoading: {
    bn: "খোঁজবাংলা চ্যাট লোড হচ্ছে...",
    en: "Loading KhojoBangla Chat...",
  },
  chatTypeMessage: {
    bn: "একটি বার্তা লিখুন...",
    en: "Type a message...",
  },
  chatAddCaption: {
    bn: "ক্যাপশন যোগ করুন...",
    en: "Add a caption...",
  },
  chatSendTooltip: {
    bn: "বার্তা পাঠান",
    en: "Send message",
  },
  chatQuickRepliesTitle: {
    bn: "দ্রুত উত্তর:",
    en: "Quick:",
  },
  chatOnline: {
    bn: "অনলাইন",
    en: "online",
  },
  chatTyping: {
    bn: "টাইপ করছেন...",
    en: "typing...",
  },
  chatLastSeen: {
    bn: "সর্বশেষ সক্রিয়",
    en: "Last seen",
  },
  chatAvailableOnKhojoBangla: {
    bn: "খোঁজবাংলায় সক্রিয়",
    en: "Available on KhojoBangla",
  },
  chatVerifiedSeller: {
    bn: "ভেরিফাইড বিক্রেতা",
    en: "Verified Seller",
  },
  chatNegotiatingItem: {
    bn: "বিজ্ঞাপনের পণ্য",
    en: "Negotiating Item",
  },
  chatViewAd: {
    bn: "বিজ্ঞাপন দেখুন",
    en: "View Ad",
  },
  chatSafetyWarning: {
    bn: "🔒 বার্তাগুলো ব্যক্তিগত ও নিরাপদে আদান-প্রদান করা হচ্ছে। সকল লেনদেন নিরাপদ রাখুন!",
    en: "🔒 Messages are private & securely exchanged. Keep payments inside KhojoBangla!",
  },
  chatReplyingTo: {
    bn: "উত্তর দিচ্ছেন:",
    en: "Replying to",
  },
  chatCancelReply: {
    bn: "উত্তর বাতিল করুন",
    en: "Cancel reply",
  },
  chatCallNow: {
    bn: "এখনই কল করুন",
    en: "Call Now",
  },
  chatShowPhone: {
    bn: "ফোন নম্বর দেখুন",
    en: "Show Phone Number",
  },
  chatReadyToSend: {
    bn: "বার্তার সাথে পাঠানোর জন্য প্রস্তুত",
    en: "Ready to send with message",
  },
  chatRemoveAttachment: {
    bn: "সংযুক্তি মুছুন",
    en: "Remove attachment",
  },

  // Notifications
  notificationsTitle: {
    bn: "বিজ্ঞপ্তি",
    en: "Notifications",
  },
  notificationsAndAlerts: {
    bn: "বিজ্ঞপ্তি ও সতর্কতা",
    en: "Notifications & Alerts",
  },
  notificationsDesc: {
    bn: "বিজ্ঞাপন অনুমোদন, সতর্কতা ও আপডেট",
    en: "Ad approvals, alerts & updates",
  },
  notificationsUnread: {
    bn: "টি অপঠিত",
    en: "unread",
  },
  notificationsMarkAllRead: {
    bn: "সব পঠিত হিসেবে চিহ্নিত করুন",
    en: "Mark all read",
  },
  notificationsNoFound: {
    bn: "এখনও কোনো বিজ্ঞপ্তি নেই",
    en: "No notifications yet",
  },
  notificationsGoToProfile: {
    bn: "প্রোফাইল ও বিজ্ঞাপনে যান",
    en: "Go to Profile & Advertisements",
  },
  notificationsRecentAlerts: {
    bn: "সাম্প্রতিক সতর্কতা",
    en: "Recent Alerts",
  },
  notificationsEditResubmit: {
    bn: "সম্পাদনা ও পুনরায় জমা দিন",
    en: "Edit & Resubmit",
  },
  notificationsOpenChat: {
    bn: "চ্যাট খুলুন",
    en: "Open Chat",
  },
  notificationsViewAd: {
    bn: "বিজ্ঞাপন দেখুন",
    en: "View Ad",
  },

  // Auth Modal
  authModalTitle: {
    bn: "খোঁজবাংলায় স্বাগতম",
    en: "Welcome to KhojoBangla",
  },
  authModalSubtitle: {
    bn: "বিজ্ঞাপন দেওয়া, পছন্দের তালিকা সংরক্ষণ এবং বিক্রেতার সাথে চ্যাট করতে প্রবেশ করুন",
    en: "Sign in to post advertisements, save favorites, and chat directly with sellers",
  },
  continueWithGoogle: {
    bn: "গুগল দিয়ে চালিয়ে যান",
    en: "Continue with Google",
  },
  continueWithEmail: {
    bn: "ইমেইল দিয়ে চালিয়ে যান",
    en: "Continue with Email",
  },
  continueWithPhone: {
    bn: "মোবাইল নম্বর দিয়ে চালিয়ে যান",
    en: "Continue with Phone Number",
  },

  // Post Free Advertisement
  postFreeAdHeader: {
    bn: "বিনামূল্যে বিজ্ঞাপন দিন",
    en: "Post Free Advertisement",
  },
  stepCategory: {
    bn: "ক্যাটাগরি",
    en: "Category",
  },
  stepDetails: {
    bn: "বিবরণ",
    en: "Details",
  },
  stepPhotos: {
    bn: "ছবি",
    en: "Photos",
  },
  stepLocation: {
    bn: "অবস্থান",
    en: "Location",
  },
  stepPreview: {
    bn: "প্রিভিউ",
    en: "Preview",
  },

  // Step 1: Category Selector
  chooseCategoryTitle: {
    bn: "ক্যাটাগরি নির্বাচন করুন",
    en: "Choose a Category",
  },
  chooseCategorySub: {
    bn: "আপনার পণ্যের সাথে মানানসই সেরা বিভাগটি বেছে নিন",
    en: "Select the department that best describes what you are listing",
  },
  adsCountSuffix: {
    bn: "বিজ্ঞাপন",
    en: "ads",
  },

  // Categories
  cat_cars: {
    bn: "গাড়ি",
    en: "Cars",
  },
  cat_bikes: {
    bn: "বাইক ও মোটরসাইকেল",
    en: "Bikes",
  },
  cat_properties: {
    bn: "জমি ও ফ্ল্যাট",
    en: "Properties",
  },
  cat_electronics: {
    bn: "ইলেকট্রনিক্স ও অ্যাপ্লায়েন্স",
    en: "Electronics & Appliances",
  },
  cat_mobiles: {
    bn: "মোবাইল ফোন",
    en: "Mobiles",
  },
  "cat_commercial-vehicles": {
    bn: "বাণিজ্যিক যানবাহন",
    en: "Commercial Vehicles & Spares",
  },
  cat_jobs: {
    bn: "চাকরি",
    en: "Jobs",
  },
  cat_furniture: {
    bn: "আসবাবপত্র",
    en: "Furniture",
  },
  cat_fashion: {
    bn: "ফ্যাশন ও পোশাক",
    en: "Fashion",
  },
  cat_pets: {
    bn: "পোষা প্রাণী",
    en: "Pets",
  },
  "cat_books-sports-hobbies": {
    bn: "বই, খেলাধুলা ও শখ",
    en: "Books, Sports & Hobbies",
  },
  cat_services: {
    bn: "সেবাসমূহ",
    en: "Services",
  },

  // Step 2: Form Details
  detailsTitle: {
    bn: "পণ্যের বিবরণ যুক্ত করুন",
    en: "Include Some Details",
  },
  detailsSub: {
    bn: "সঠিক এবং সম্পূর্ণ তথ্য প্রদান করুন",
    en: "Provide accurate and complete information",
  },
  adTitleLabel: {
    bn: "বিজ্ঞাপনের শিরোনাম *",
    en: "Ad Title *",
  },
  adTitlePlaceholder: {
    bn: "যেমন: হোন্ডা সিভিক ২০২২ / আইফোন ১৫ প্রো ম্যাক্স",
    en: "e.g. Royal Enfield Classic 350 / iPhone 15 Pro",
  },
  adTitleHelper: {
    bn: "মূল বৈশিষ্ট্য, ব্র্যান্ড, মডেল ও অবস্থা উল্লেখ করুন (কমপক্ষে ৮ অক্ষর)",
    en: "Mention key features, brand, model, and condition (Min 8 characters)",
  },
  adDescLabel: {
    bn: "বিস্তারিত বিবরণ *",
    en: "Description *",
  },
  adDescPlaceholder: {
    bn: "পণ্যটির অবস্থা, সাথে কী কী এক্সেসরিজ পাবেন, ব্যবহারের সময়কাল এবং বিক্রির কারণ বিস্তারিত লিখুন...",
    en: "Describe what you are selling, its condition, accessories included, reason for selling, etc.",
  },
  adPriceLabel: {
    bn: "বিক্রয় মূল্য নির্ধারণ করুন (৳) *",
    en: "Set a Price (Tk) *",
  },
  adPricePlaceholder: {
    bn: "যেমন: ২৫০০০",
    en: "e.g. 25000",
  },
  conditionLabel: {
    bn: "অবস্থা",
    en: "Condition",
  },
  conditionUsedText: {
    bn: "ব্যবহৃত",
    en: "Used",
  },
  conditionNewText: {
    bn: "নতুন",
    en: "New",
  },
  brandLabel: {
    bn: "ব্র্যান্ড / নির্মাতা",
    en: "Brand / Make",
  },
  brandPlaceholder: {
    bn: "যেমন: হোন্ডা / ইয়ামাহা / স্যামসাং",
    en: "e.g. Honda / Yamaha / Samsung",
  },
  yearLabel: {
    bn: "মডেল বা রেজিস্ট্রেশনের সাল",
    en: "Registration Year / Model",
  },
  yearPlaceholder: {
    bn: "যেমন: ২০২২",
    en: "e.g. 2022",
  },

  // Step 3: Photos
  photosTitle: {
    bn: "পণ্যের স্পষ্ট ছবি আপলোড করুন",
    en: "Upload Product Photos",
  },
  photosSub: {
    bn: "আসল এবং স্পষ্ট ছবি দিলে ৫ গুণ বেশি ক্রেতার সাড়া পাওয়া যায়",
    en: "Ads with clear real photos get up to 5x more buyer enquiries",
  },
  photosLimit: {
    bn: "টি ছবি",
    en: "Photos",
  },
  dropzoneClick: {
    bn: "ডিভাইস থেকে ছবি আপলোড করতে ক্লিক করুন",
    en: "Click to upload photos from your device",
  },
  dropzoneUploading: {
    bn: "ক্লাউডিনারি-তে ছবি আপলোড হচ্ছে...",
    en: "Uploading photos to Cloudinary...",
  },
  dropzoneHint: {
    bn: "JPG, PNG, WEBP ফরম্যাট সমর্থিত (সর্বোচ্চ ৮টি ছবি, প্রতিটি ১০MB পর্যন্ত)",
    en: "Supports JPG, PNG, WEBP (Max 8 photos, up to 10MB each)",
  },
  samplePhotosTitle: {
    bn: "অথবা এক ক্লিকে ডেমো ছবি যোগ করুন:",
    en: "Or add sample demo photos with 1-click:",
  },
  samplePhotoBtn: {
    bn: "নমুনা ছবি #",
    en: "Photo #",
  },
  coverPhotoTip: {
    bn: "প্রথম ছবিটিকে মূল কভার ছবি করতে '★ কভার' বাটনে ক্লিক করুন",
    en: "Click '★ Cover' to set the first image as the primary cover photo",
  },
  setCoverBtn: {
    bn: "কভার করুন",
    en: "Set Cover",
  },
  coverBadge: {
    bn: "কভার",
    en: "COVER",
  },
  emptySlot: {
    bn: "খালি স্লট",
    en: "Empty Slot",
  },

  // Step 4: Location & Seller
  locationTitle: {
    bn: "আপনার অবস্থান নিশ্চিত করুন",
    en: "Confirm Your Location",
  },
  locationSub: {
    bn: "সঠিক অবস্থান দিলে স্থানীয় ক্রেতারা সহজে আপনার বিজ্ঞাপন খুঁজে পাবে",
    en: "Helps local buyers find your advertisement quickly",
  },
  divisionLabel: {
    bn: "বিভাগ *",
    en: "Division *",
  },
  selectDivision: {
    bn: "বিভাগ নির্বাচন করুন",
    en: "Select Division",
  },
  districtLabel: {
    bn: "জেলা / শহর *",
    en: "City / District *",
  },
  selectDistrict: {
    bn: "জেলা / শহর নির্বাচন করুন",
    en: "Select City / District",
  },
  areaLabel: {
    bn: "এলাকা / মহল্লা *",
    en: "Neighbourhood / Area *",
  },
  areaPlaceholder: {
    bn: "যেমন: গুলশান / ধানমন্ডি / আগ্রাবাদ",
    en: "e.g. Gulshan / Dhanmondi / Agrabad",
  },
  postcodeLabel: {
    bn: "পোস্টাল কোড",
    en: "Postal Code",
  },
  postcodePlaceholder: {
    bn: "যেমন: ১২১২",
    en: "e.g. 1212",
  },
  mapCoordinatesTitle: {
    bn: "ম্যাপ অবস্থান ও কোঅর্ডিনেটস",
    en: "Map Location & Coordinates",
  },
  exactPinpointBadge: {
    bn: "সঠিক পিনপয়েন্ট",
    en: "Exact Pinpoint",
  },
  mapDragHint: {
    bn: "পণ্যটি সংগ্রহের সঠিক স্থান নির্দেশ করতে ম্যাপে ক্লিক করুন বা মার্কারটি টানুন",
    en: "Click map or drag the pin marker to specify the exact pickup / shop location",
  },
  detectFromAddressBtn: {
    bn: "ঠিকানা থেকে শনাক্ত করুন",
    en: "Detect from Address",
  },
  useMyGpsBtn: {
    bn: "আমার GPS ব্যবহার করুন",
    en: "Use My GPS",
  },
  interactivePinTip: {
    bn: "ইন্টারেক্টিভ পিন: যেকোনো জায়গায় ক্লিক করুন বা মার্কার টানুন",
    en: "Interactive Pin: Click anywhere or drag marker",
  },
  latitudeLabel: {
    bn: "অক্ষাংশ (Latitude Y)",
    en: "Latitude (Exact Y Coordinate)",
  },
  longitudeLabel: {
    bn: "দ্রাঘিমাংশ (Longitude X)",
    en: "Longitude (Exact X Coordinate)",
  },
  contactDetailsTitle: {
    bn: "আপনার যোগাযোগের তথ্য",
    en: "Your Contact Details",
  },
  contactDetailsSub: {
    bn: "যাচাইকৃত যোগাযোগ তথ্য ক্রেতাদের আস্থা বাড়ায়",
    en: "Verified contact info builds buyer trust and prevents spam",
  },
  yourNameLabel: {
    bn: "আপনার নাম *",
    en: "Your Name *",
  },
  yourNamePlaceholder: {
    bn: "যেমন: রফিকুল ইসলাম",
    en: "e.g. Rafiqul Islam",
  },
  phoneLabel: {
    bn: "মোবাইল নম্বর *",
    en: "Phone Number *",
  },
  phonePlaceholder: {
    bn: "০১৭০০-০০০০০০",
    en: "+880 1700-000000",
  },
  emailLabel: {
    bn: "ইমেইল ঠিকানা",
    en: "Email Address",
  },
  emailPlaceholder: {
    bn: "name@example.com",
    en: "name@example.com",
  },

  // Step 5: Preview & Action
  previewTitle: {
    bn: "বিজ্ঞাপনের প্রিভিউ দেখুন",
    en: "Preview Your Advertisement",
  },
  previewSub: {
    bn: "অ্যাডমিন অনুমোদনের পর ক্রেতারা আপনার বিজ্ঞাপনটি যেভাবে দেখবে",
    en: "This is how buyers will see your listing on KhojoBangla after Superadmin approval",
  },
  previewBadge: {
    bn: "প্রিভিউ",
    en: "PREVIEW",
  },
  statusAwaitingApproval: {
    bn: "স্ট্যাটাস: সুপারঅ্যাডমিন পর্যালোচনার অপেক্ষায়",
    en: "Status: Awaiting Superadmin Approval",
  },
  adSubmittedSuccess: {
    bn: "বিজ্ঞাপন সফলভাবে জমা দেওয়া হয়েছে!",
    en: "Ad Submitted Successfully!",
  },
  submissionDefaultNotice: {
    bn: "আপনার বিজ্ঞাপনটি সফলভাবে খোঁজোবাংলায় জমা দেওয়া হয়েছে এবং পর্যালোচনার অপেক্ষায় আছে।",
    en: "Your advertisement has been submitted to KhojoBangla and is awaiting review.",
  },
  whatHappensNext: {
    bn: "এরপর কী ঘটবে?",
    en: "What happens next?",
  },
  stepReview1: {
    bn: "আমাদের মডারেশন টিম কয়েক মিনিটের মধ্যে আপনার বিজ্ঞাপন পর্যালোচনা করবে।",
    en: "Our moderation team reviews your advertisement within a few minutes.",
  },
  stepReview2: {
    bn: "অনুমোদিত হলে এটি সাথে সাথে খোঁজোবাংলা হোমপেজ ও সার্চ রেজাল্টে দেখা যাবে।",
    en: "Once approved, it becomes publicly visible on the KhojoBangla homepage and search results.",
  },
  stepReview3: {
    bn: "পর্যালোচনা সম্পন্ন হলে আপনি অ্যাকাউন্টে নোটিফিকেশন পাবেন।",
    en: "You will receive an in-app notification when the review is completed.",
  },
  viewInProfileBtn: {
    bn: "আমার প্রোফাইলে দেখুন",
    en: "View in My Profile",
  },
  backToHomeBtn: {
    bn: "হোমে ফিরে যান",
    en: "Back to Home",
  },
  backToEditBtn: {
    bn: "সম্পাদনা করতে ফিরুন",
    en: "Back to Edit",
  },
  submitForApprovalBtn: {
    bn: "অনুমোদনের জন্য জমা দিন",
    en: "Submit for Approval",
  },
  submittingApprovalBtn: {
    bn: "জমা দেওয়া হচ্ছে...",
    en: "Submitting for Approval...",
  },
  previousBtn: {
    bn: "পূর্ববর্তী",
    en: "Previous",
  },
  nextStepBtn: {
    bn: "পরবর্তী ধাপ",
    en: "Next Step",
  },
  moderationPending: {
    bn: "মডারেশন: পর্যালোচনার অপেক্ষায়",
    en: "Moderation: Pending Review",
  },

  // Validation Errors
  valSelectCategory: {
    bn: "অনুগ্রহ করে একটি ক্যাটাগরি বেছে নিন",
    en: "Please select a category",
  },
  valAdTitleReq: {
    bn: "বিজ্ঞাপনের শিরোনাম প্রয়োজন",
    en: "Ad title is required",
  },
  valAdTitleMin: {
    bn: "শিরোনাম কমপক্ষে ৮ অক্ষরের হতে হবে",
    en: "Title should be at least 8 characters",
  },
  valAdDescReq: {
    bn: "বিজ্ঞাপনের বিবরণ প্রয়োজন",
    en: "Ad description is required",
  },
  valAdDescMin: {
    bn: "অনুগ্রহ করে আরও বিস্তারিত বিবরণ দিন (কমপক্ষে ১৫ অক্ষর)",
    en: "Please provide more details (at least 15 characters)",
  },
  valPriceReq: {
    bn: "অনুগ্রহ করে সঠিক বিক্রয় মূল্য দিন (টাকায়)",
    en: "Please enter a valid price in Taka (৳)",
  },
  valPhotoReq: {
    bn: "বিজ্ঞাপনের জন্য অনুগ্রহ করে অন্তত একটি ছবি যোগ করুন",
    en: "Please add at least one photo for your advertisement",
  },
  valDivisionReq: {
    bn: "বিভাগ নির্বাচন করা বাধ্যতামূলক",
    en: "Division is required",
  },
  valCityReq: {
    bn: "শহর / জেলা নির্বাচন করা বাধ্যতামূলক",
    en: "City is required",
  },
  valAreaReq: {
    bn: "এলাকা বা মহল্লার নাম উল্লেখ করুন",
    en: "Area / neighbourhood is required",
  },
  valSellerNameReq: {
    bn: "বিক্রেতার নাম প্রয়োজন",
    en: "Seller name is required",
  },
  valSellerPhoneReq: {
    bn: "মোবাইল নম্বর দেওয়া বাধ্যতামূলক",
    en: "Phone number is required",
  },
  valLoginToSubmit: {
    bn: "বিজ্ঞাপন জমা দেওয়ার জন্য অনুগ্রহ করে লগইন করুন।",
    en: "Please log in to submit your advertisement for Superadmin approval.",
  },

  // User Profile & Edit Profile
  myProfile: {
    bn: "আমার প্রোফাইল",
    en: "My Profile",
  },
  editProfileBtn: {
    bn: "প্রোফাইল সম্পাদনা",
    en: "Edit Profile",
  },
  postAdBtn: {
    bn: "+ বিজ্ঞাপন দিন",
    en: "+ POST AD",
  },
  logoutBtn: {
    bn: "লগআউট",
    en: "Logout",
  },
  myPostedAdsTab: {
    bn: "আমার পোস্ট করা বিজ্ঞাপন",
    en: "My Posted Advertisements",
  },
  savedAdsTab: {
    bn: "পছন্দের বিজ্ঞাপন",
    en: "Saved Advertisements",
  },
  filterAll: {
    bn: "সকল",
    en: "All",
  },
  filterPending: {
    bn: "অনুমোদনের অপেক্ষায়",
    en: "Pending Approval",
  },
  filterApproved: {
    bn: "অনুমোদিত ও সক্রিয়",
    en: "Live & Approved",
  },
  filterRejected: {
    bn: "প্রত্যাখ্যাত",
    en: "Rejected",
  },
  refreshBtn: {
    bn: "রিফ্রেশ",
    en: "Refresh",
  },
  loadingYourAds: {
    bn: "আপনার বিজ্ঞাপনগুলো লোড হচ্ছে...",
    en: "Loading your advertisements...",
  },
  noAdsInFilterTitle: {
    bn: "এই ফিল্টারে কোনো বিজ্ঞাপন পাওয়া যায়নি",
    en: "No advertisements found in this filter",
  },
  noAdsInFilterSub: {
    bn: "সমগ্র বাংলাদেশে আপনার ইলেকট্রনিক্স, যানবাহন বা পণ্য বিক্রি করতে একটি বিজ্ঞাপন দিন।",
    en: "Post an advertisement to sell your electronics, vehicles, or items across Bangladesh.",
  },
  postAnAdBtn: {
    bn: "একটি বিজ্ঞাপন দিন",
    en: "Post an Advertisement",
  },
  noSavedAdsTitle: {
    bn: "কোনো সংরক্ষিত বিজ্ঞাপন নেই",
    en: "No saved advertisements",
  },
  noSavedAdsSub: {
    bn: "মার্কেটপ্লেস ঘুরে পছন্দের বিজ্ঞাপনের হার্ট আইকনে ক্লিক করে সংরক্ষণ করুন।",
    en: "Browse the marketplace and bookmark ads by clicking the heart button.",
  },
  exploreMarketplaceBtn: {
    bn: "মার্কেটপ্লেস দেখুন",
    en: "Explore Marketplace",
  },
  submittedOn: {
    bn: "জমা দেওয়ার তারিখ",
    en: "Submitted",
  },
  approvedLiveBadge: {
    bn: "অনুমোদিত / সক্রিয়",
    en: "Approved / Live",
  },
  pendingReviewBadge: {
    bn: "পর্যালোচনার অপেক্ষায়",
    en: "Pending Review",
  },
  rejectedBadge: {
    bn: "প্রত্যাখ্যাত",
    en: "Rejected",
  },
  viewLiveBtn: {
    bn: "সরাসরি দেখুন",
    en: "View Live",
  },
  editBtn: {
    bn: "সম্পাদনা",
    en: "Edit",
  },
  editResubmitBtn: {
    bn: "সংশোধন ও পুনরায় জমা দিন",
    en: "Edit & Resubmit",
  },
  rejectionReasonLabel: {
    bn: "প্রত্যাখ্যানের কারণ:",
    en: "Rejection Reason:",
  },
  rejectionHint: {
    bn: "বিজ্ঞাপনটি সংশোধন করে পুনরায় মডারেশনের জন্য পাঠাতে 'সংশোধন ও পুনরায় জমা দিন' বাটনে ক্লিক করুন।",
    en: "Click \"Edit & Resubmit\" to update this ad and send it back to the moderation queue.",
  },
  editAdModalTitle: {
    bn: "বিজ্ঞাপন সম্পাদনা",
    en: "Edit Advertisement",
  },
  editResubmitModalTitle: {
    bn: "বিজ্ঞাপন সংশোধন ও পুনরায় জমা দিন",
    en: "Edit & Resubmit Advertisement",
  },
  resubmitModalDesc: {
    bn: "পুনরায় জমা দিলে বিজ্ঞাপনটি আবার সুপারঅ্যাডমিন পর্যালোচনা সারিতে চলে যাবে।",
    en: "Resubmitting will send your advertisement back to the Superadmin moderation queue.",
  },
  editModalDesc: {
    bn: "আপনার বিজ্ঞাপনের বিবরণ আপডেট করুন।",
    en: "Update your advertisement details.",
  },
  saveChangesBtn: {
    bn: "পরিবর্তন সংরক্ষণ করুন",
    en: "Save Changes",
  },
  savingBtn: {
    bn: "সংরক্ষণ হচ্ছে...",
    en: "Saving...",
  },
  cancelBtn: {
    bn: "বাতিল",
    en: "Cancel",
  },
  resubmitForApprovalBtn: {
    bn: "অনুমোদনের জন্য পুনরায় জমা দিন",
    en: "Resubmit for Approval",
  },
  profilePictureTab: {
    bn: "প্রোফাইল ছবি",
    en: "Profile picture",
  },
  viewProfileBtn: {
    bn: "প্রোফাইল দেখুন",
    en: "View profile",
  },
  basicInfoTitle: {
    bn: "প্রাথমিক তথ্য",
    en: "Basic information",
  },
  yourFullNamePlaceholder: {
    bn: "আপনার পুরো নাম",
    en: "Your full name",
  },
  aboutMePlaceholder: {
    bn: "আমার সম্পর্কে (ঐচ্ছিক)",
    en: "About me (optional)",
  },
  whyIsItImportant: {
    bn: "এটি কেন গুরুত্বপূর্ণ?",
    en: "Why is it important?",
  },
  whyImportantText: {
    bn: "খোঁজবাংলা বিশ্বাসের ওপর প্রতিষ্ঠিত। অন্যান্য ক্রেতা-বিক্রেতাদের সাথে পরিচিত হন। আপনার পছন্দের ব্র্যান্ড ও আগ্রহের কথা শেয়ার করুন।",
    en: "KhojoBangla is built on trust. Help other people get to know you. Tell them about the things you like. Share your favorite brands, interests, and preferences.",
  },
  contactInfoTitle: {
    bn: "যোগাযোগের তথ্য",
    en: "Contact information",
  },
  phoneVerifiedYay: {
    bn: "আপনার নম্বরটি সফলভাবে ভেরিফাইড!",
    en: "Yay! Your number is verified.",
  },
  emailLockedNotice: {
    bn: "আপনার ইমেইল কারও সাথে শেয়ার করা হয় না এবং কোনো স্প্যাম পাঠানো হয় না।",
    en: "Your email is never shared with external parties nor do we use it to spam you in any way.",
  },
  emailCannotChange: {
    bn: "ইমেইল ঠিকানা পরিবর্তনযোগ্য নয়",
    en: "Email address cannot be changed",
  },
  additionalInfoTitle: {
    bn: "অতিরিক্ত তথ্য",
    en: "Additional information",
  },
  googleLinked: {
    bn: "সংযুক্ত",
    en: "Linked",
  },
  googleLinkText: {
    bn: "সহজে যোগাযোগের জন্য আপনার গুগল অ্যাকাউন্ট লিঙ্ক করুন।",
    en: "Link your Google account to seamlessly use your contact list.",
  },
  linkGoogleBtn: {
    bn: "গুগল লিঙ্ক করুন",
    en: "Link Google",
  },
  unlinkGoogleBtn: {
    bn: "আনলিঙ্ক",
    en: "Unlink",
  },
  discardBtn: {
    bn: "বাতিল করুন",
    en: "Discard",
  },
  profileUpdatedSuccess: {
    bn: "প্রোফাইল সফলভাবে আপডেট করা হয়েছে!",
    en: "Profile updated successfully! Your changes are now live.",
  },
  viewLiveProfileLink: {
    bn: "লাইভ প্রোফাইল দেখুন →",
    en: "View live profile →",
  },
};

interface LanguageContextType {
  language: Language;
  currencySymbol: string;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const language = useAppSelector(selectLanguage);
  const currencySymbol = useAppSelector(selectCurrencySymbol);

  const setLanguage = (lang: Language) => {
    dispatch(setLanguageAction(lang));
  };

  const toggleLanguage = () => {
    dispatch(toggleLanguageAction());
  };

  const t = (key: string, fallback?: string): string => {
    const entry = TRANSLATIONS[key];
    if (!entry) {
      return fallback || key;
    }
    return entry[language] || fallback || entry.bn || key;
  };

  return (
    <LanguageContext.Provider value={{ language, currencySymbol, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
