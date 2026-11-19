export type TranslationKey = keyof typeof TRANSLATIONS;

export const TRANSLATIONS = {
  // Navigation / Tabs
  tabHome: {
    bn: "হোম",
    en: "Home",
  },
  tabCategories: {
    bn: "ক্যাটাগরি",
    en: "Categories",
  },
  tabSell: {
    bn: "বিজ্ঞাপন",
    en: "SELL",
  },
  tabChat: {
    bn: "চ্যাট",
    en: "Chat",
  },
  tabAccount: {
    bn: "অ্যাকাউন্ট",
    en: "Account",
  },

  // Account Screen - Header & Profile
  accountTitle: {
    bn: "আমার অ্যাকাউন্ট",
    en: "My Account",
  },
  editProfile: {
    bn: "প্রোফাইল পরিবর্তন",
    en: "Edit Profile",
  },
  verifiedMember: {
    bn: "ভেরিফাইড মেম্বার",
    en: "Verified Member",
  },
  superadmin: {
    bn: "সুপারএডমিন",
    en: "Superadmin",
  },

  // Account Screen - Guest / Not Logged In
  welcomeGuestTitle: {
    bn: "স্বাগতম সেরাবন্ধুতে",
    en: "Welcome to Serabondhu",
  },
  welcomeGuestSub: {
    bn: "আপনার বিজ্ঞাপন পরিচালনা, চ্যাট বার্তা দেখা, ফেভারিট আইটেম সংরক্ষণ ও প্রোফাইল সেটিংসে প্রবেশ করতে লগইন করুন।",
    en: "Login to manage your advertisements, chat with buyers & sellers, save favourite items, and access profile settings.",
  },
  loginOrSignUp: {
    bn: "লগইন বা সাইন আপ করুন",
    en: "Log In or Sign Up",
  },

  // Language Switcher
  languageLabel: {
    bn: "অ্যাপের ভাষা",
    en: "App Language",
  },
  languageSub: {
    bn: "বাংলা অথবা English নির্বাচন করুন",
    en: "Select Bangla or English",
  },
  bangla: {
    bn: "বাংলা",
    en: "Bangla",
  },
  english: {
    bn: "English",
    en: "English",
  },
  changeLanguage: {
    bn: "ভাষা পরিবর্তন করুন",
    en: "Change Language",
  },

  // Account Stats
  statMyAds: {
    bn: "আমার বিজ্ঞাপন",
    en: "My Ads",
  },
  statFavourites: {
    bn: "পছন্দের তালিকা",
    en: "Wishlist",
  },

  // Account Menu Items
  menuMyAds: {
    bn: "আমার বিজ্ঞাপন সমূহ",
    en: "My Advertisements",
  },
  menuFavourites: {
    bn: "পছন্দের বিজ্ঞাপন",
    en: "Saved / Favourites",
  },
  menuNotifications: {
    bn: "নোটিফিকেশন ও অ্যালার্ট",
    en: "Notifications & Alerts",
  },
  menuSafety: {
    bn: "নিরাপত্তা নির্দেশিকা",
    en: "Safety Guidelines",
  },
  menuTerms: {
    bn: "ব্যবহারের শর্তাবলী",
    en: "Terms of Use",
  },
  menuPrivacy: {
    bn: "গোপনীয়তা নীতি",
    en: "Privacy Policy",
  },

  // Logout
  logOut: {
    bn: "লগ আউট",
    en: "Log Out",
  },
  logOutConfirmTitle: {
    bn: "লগ আউট নিশ্চিতকরণ",
    en: "Confirm Logout",
  },
  logOutConfirmDesc: {
    bn: "আপনি কি নিশ্চিত সেরাবন্ধু থেকে লগ আউট করতে চান?",
    en: "Are you sure you want to log out of Serabondhu?",
  },
  cancel: {
    bn: "বাতিল",
    en: "Cancel",
  },

  // Home Screen
  freshRecommendations: {
    bn: "নতুন বিজ্ঞাপন",
    en: "Fresh Recommendations",
  },
  featuredAds: {
    bn: "ফিচার্ড বিজ্ঞাপন",
    en: "Featured Ads",
  },
  searchPlaceholder: {
    bn: "পণ্য, গাড়ি, মোবাইল খুঁজুন...",
    en: "Search products, cars, mobiles...",
  },
  allBangladesh: {
    bn: "সমগ্র বাংলাদেশ",
    en: "All Bangladesh",
  },
  viewAll: {
    bn: "সবগুলো দেখুন",
    en: "View All",
  },
  loadMore: {
    bn: "আরও লোড করুন",
    en: "Load More",
  },
  noAdsFound: {
    bn: "কোনো বিজ্ঞাপন পাওয়া যায়নি",
    en: "No advertisements found",
  },
  price: {
    bn: "মূল্য",
    en: "Price",
  },
  currency: {
    bn: "৳",
    en: "₹",
  },

  // Chat Screen
  chatsTitle: {
    bn: "বার্তা ও চ্যাট",
    en: "Chats & Messages",
  },
  chatsSub: {
    bn: "সেরা বন্ধু ইন-অ্যাপ নিরাপদ মেসেঞ্জার",
    en: "Serabondhu secure in-app messenger",
  },
  chatsAuthPromptTitle: {
    bn: "আপনার বার্তা ও চ্যাট",
    en: "Your Messages & Chats",
  },
  chatsAuthPromptDesc: {
    bn: "ক্রেতা এবং বিক্রেতার সাথে নিরাপদ রিয়েল-টাইম চ্যাটিং এবং দামাদামি করতে লগইন করুন।",
    en: "Log in to chat in real-time and safely negotiate with buyers and sellers.",
  },
  noChatsTitle: {
    bn: "কোনো চ্যাট পাওয়া যায়নি",
    en: "No chats found",
  },
  noChatsSub: {
    bn: "সেরাবন্ধুতে বিজ্ঞাপন দেখুন এবং বিক্রেতার সাথে দরদাম শুরু করতে চ্যাট করুন।",
    en: "Browse classifieds on Serabondhu and chat with sellers to start negotiating.",
  },
  typeMessage: {
    bn: "একটি বার্তা লিখুন...",
    en: "Type a message...",
  },
  send: {
    bn: "পাঠান",
    en: "Send",
  },

  // Post Ad Screen
  postAdTitle: {
    bn: "বিজ্ঞাপন দিন",
    en: "Post New Ad",
  },
  postAdSubtitle: {
    bn: "সঠিক তথ্য দিয়ে দ্রুত ক্রেতা বা বিক্রেতার সাথে যুক্ত হন",
    en: "Provide accurate details to connect with buyers & sellers",
  },
  postAdAuthSubtitle: {
    bn: "সেরাবন্ধুতে সম্পূর্ণ ফ্রিতে পুরনো বা নতুন যে কোনো পণ্য কেনাবেচার জন্য বিজ্ঞাপন পোস্ট করতে লগইন করুন।",
    en: "Log in to post advertisements for buying and selling new or used items on Serabondhu.",
  },
  adTitleLabel: {
    bn: "বিজ্ঞাপনের শিরোনাম",
    en: "Advertisement Title",
  },
  adCategoryLabel: {
    bn: "ক্যাটাগরি",
    en: "Category",
  },
  adPriceLabel: {
    bn: "মূল্য (টাকা)",
    en: "Price (BDT)",
  },
  adDescriptionLabel: {
    bn: "বিস্তারিত বিবরণ",
    en: "Description",
  },
  submitAdBtn: {
    bn: "বিজ্ঞাপন প্রকাশ করুন",
    en: "Submit Advertisement",
  },

  // Category & Feed Labels
  allCategoriesTitle: {
    bn: "সকল ক্যাটাগরি",
    en: "All Categories",
  },
  allCategoriesSubtitle: {
    bn: "বাংলাদেশজুড়ে কেনাবেচার জন্য ক্যাটাগরি নির্বাচন করুন",
    en: "Select a category to buy and sell across Bangladesh",
  },
  searchCategoriesPlaceholder: {
    bn: "ক্যাটাগরি বা সাবক্যাটাগরি খুঁজুন...",
    en: "Search categories or subcategories...",
  },
  popularCategories: {
    bn: "জনপ্রিয় ক্যাটাগরি",
    en: "Popular Categories",
  },
  clearFilter: {
    bn: "ফিল্টার সরান",
    en: "Clear",
  },
  subcategories: {
    bn: "সাব-ক্যাটাগরি",
    en: "Subcategories",
  },
  viewAllAdsIn: {
    bn: "সকল বিজ্ঞাপন দেখুন",
    en: "View All Advertisements",
  },
  usedCondition: {
    bn: "ব্যবহৃত",
    en: "Used",
  },
  newCondition: {
    bn: "নতুন",
    en: "New",
  },
  featuredBadge: {
    bn: "ফিচার্ড",
    en: "Featured",
  },

  // Auth Modal - Complete Translations
  authWelcomeTitle: {
    bn: "স্বাগতম সেরাবন্ধুতে",
    en: "Welcome to Serabondhu",
  },
  authPhoneTitle: {
    bn: "মোবাইল ওটিপি লগইন",
    en: "Mobile OTP Login",
  },
  authPhoneOtpTitle: {
    bn: "ওটিপি যাচাই করুন",
    en: "Verify OTP Code",
  },
  authEmailTitle: {
    bn: "ইমেইল দিয়ে প্রবেশ করুন",
    en: "Continue with Email",
  },
  authEmailOtpTitle: {
    bn: "ইমেইল ওটিপি যাচাই",
    en: "Verify Email OTP",
  },
  authSetPasswordTitle: {
    bn: "অ্যাকাউন্ট তৈরি করুন",
    en: "Create Account",
  },
  authSlogan: {
    bn: "কিনুন • বিক্রি করুন • খুঁজুন",
    en: "Buy • Sell • Connect",
  },
  authGoogleBtn: {
    bn: "গুগল দিয়ে প্রবেশ করুন",
    en: "Continue with Google",
  },
  authPhoneBtn: {
    bn: "মোবাইল নম্বর দিয়ে প্রবেশ করুন",
    en: "Continue with Phone Number",
  },
  authEmailBtn: {
    bn: "ইমেইল দিয়ে প্রবেশ করুন",
    en: "Continue with Email",
  },
  authMobileNumberLabel: {
    bn: "আপনার মোবাইল নম্বর",
    en: "Mobile Number",
  },
  authPhoneHelper: {
    bn: "আমরা এই নম্বরে একটি ৪ বা ৬ সংখ্যার ওটিপি কোড পাঠাবো।",
    en: "We will send an OTP verification code to this mobile number.",
  },
  authSendOtpBtn: {
    bn: "ওটিপি কোড পাঠান",
    en: "Send OTP Code",
  },
  authEnterPhoneOtpLabel: {
    bn: "নম্বরে পাঠানো ওটিপি কোড দিন",
    en: "Enter the OTP code sent to",
  },
  authVerifyAndLoginBtn: {
    bn: "যাচাই করে প্রবেশ করুন",
    en: "Verify & Proceed",
  },
  authResendIn: {
    bn: "পুনরায় কোড পাঠান",
    en: "Resend code in",
  },
  authSeconds: {
    bn: "সেকেন্ড",
    en: "seconds",
  },
  authResendCodeBtn: {
    bn: "আবার কোড পাঠান",
    en: "Resend Code",
  },
  authEmailTabOtp: {
    bn: "ইমেইল ওটিপি",
    en: "Email OTP",
  },
  authEmailTabPassword: {
    bn: "পাসওয়ার্ড লগইন",
    en: "Password Login",
  },
  authEmailLabel: {
    bn: "ইমেইল এড্রেস",
    en: "Email Address",
  },
  authPasswordLabel: {
    bn: "পাসওয়ার্ড",
    en: "Password",
  },
  authPasswordPlaceholder: {
    bn: "আপনার পাসওয়ার্ড",
    en: "Enter your password",
  },
  authLoginBtn: {
    bn: "লগইন করুন",
    en: "Log In",
  },
  authEnterEmailOtpLabel: {
    bn: "এড্রেসে পাঠানো ওটিপি কোড দিন",
    en: "Enter the OTP code sent to",
  },
  authVerifyCodeBtn: {
    bn: "যাচাই করুন",
    en: "Verify Code",
  },
  authFullNameLabel: {
    bn: "আপনার পূর্ণ নাম",
    en: "Full Name",
  },
  authFullNamePlaceholder: {
    bn: "উদাঃ মোঃ রফিকুল ইসলাম",
    en: "e.g. John Doe",
  },
  authCreatePasswordLabel: {
    bn: "একটি পাসওয়ার্ড তৈরি করুন",
    en: "Create a Password",
  },
  authCreatePasswordPlaceholder: {
    bn: "কমপক্ষে ৬ অক্ষর",
    en: "At least 6 characters",
  },
  authConfirmPasswordLabel: {
    bn: "পাসওয়ার্ড নিশ্চিত করুন",
    en: "Confirm Password",
  },
  authConfirmPasswordPlaceholder: {
    bn: "পাসওয়ার্ড পুনরায় লিখুন",
    en: "Re-enter password",
  },
  authCompleteSignUpBtn: {
    bn: "নিবন্ধন সম্পন্ন করুন",
    en: "Complete Registration",
  },
  authLegalTextPrefix: {
    bn: "সাইন ইন করার মাধ্যমে আপনি সেরা বন্ধুর",
    en: "By signing in, you agree to Serabondhu's",
  },
  authLegalAnd: {
    bn: "ও",
    en: "and",
  },
  authLegalTextSuffix: {
    bn: "মেনে নিচ্ছেন।",
    en: ".",
  },
  authTerms: {
    bn: "ব্যবহারের শর্তাবলী",
    en: "Terms of Use",
  },
  authPrivacy: {
    bn: "গোপনীয়তা নীতি",
    en: "Privacy Policy",
  },
  authErrorInvalidPhone: {
    bn: "দয়া করে সঠিক মোবাইল নম্বর দিন।",
    en: "Please enter a valid mobile number.",
  },
  authErrorInvalidOtp: {
    bn: "দয়া করে সম্পূর্ণ ওটিপি কোড দিন।",
    en: "Please enter the complete OTP code.",
  },
  authErrorInvalidEmail: {
    bn: "সঠিক ইমেইল এড্রেস লিখুন।",
    en: "Please enter a valid email address.",
  },
  authErrorPasswordRequired: {
    bn: "পাসওয়ার্ড দিন।",
    en: "Password is required.",
  },
  authErrorNameRequired: {
    bn: "আপনার পূর্ণ নাম লিখুন।",
    en: "Full name is required.",
  },
  authErrorPasswordLength: {
    bn: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।",
    en: "Password must be at least 6 characters.",
  },
  authErrorPasswordMismatch: {
    bn: "পাসওয়ার্ড দুটি মেলেনি।",
    en: "Passwords do not match.",
  },
  authErrorGoogleConfig: {
    bn: "এই ডিভাইসে গুগল সাইন-ইন কনফিগার করা নেই। অনুগ্রহ করে ফোন বা ইমেইল দিয়ে প্রবেশ করুন।",
    en: "Google sign-in is not configured on this device. Please continue with Phone or Email.",
  },
  splashBrand: {
    bn: "বাংলাদেশের সেরা মার্কেটপ্লেস",
    en: "Bangladesh's Premier Marketplace",
  },
  splashVersion: {
    bn: "সংস্করণ ১.০.০",
    en: "Version 1.0.0",
  },
  allAdsTitle: {
    bn: "সকল বিজ্ঞাপন",
    en: "All Advertisements",
  },
  filtersTitle: {
    bn: "ফিল্টার",
    en: "Filters",
  },
  applyFilters: {
    bn: "ফিল্টার প্রয়োগ করুন",
    en: "Apply Filters",
  },
  resetFilters: {
    bn: "রিসেট করুন",
    en: "Reset All",
  },
  priceRange: {
    bn: "মূল্যের পরিসীমা",
    en: "Price Range",
  },
  sortBy: {
    bn: "সাজান",
    en: "Sort By",
  },
  sortNewest: {
    bn: "নতুনতম আগে",
    en: "Newest First",
  },
  sortPriceLow: {
    bn: "মূল্য: কম থেকে বেশি",
    en: "Price: Low to High",
  },
  sortPriceHigh: {
    bn: "মূল্য: বেশি থেকে কম",
    en: "Price: High to Low",
  },
  sortOldest: {
    bn: "পুরাতনতম আগে",
    en: "Oldest First",
  },
  conditionAll: {
    bn: "সকল কন্ডিশন",
    en: "All Conditions",
  },
  conditionNew: {
    bn: "একদম নতুন",
    en: "Brand New",
  },
  conditionLikeNew: {
    bn: "নতুনের মত",
    en: "Like New",
  },
  conditionUsed: {
    bn: "ব্যবহৃত",
    en: "Used",
  },
  minPricePlaceholder: {
    bn: "সর্বনিম্ন (৳)",
    en: "Min (₹)",
  },
  maxPricePlaceholder: {
    bn: "সর্বোচ্চ (৳)",
    en: "Max (₹)",
  },
  verifiedOnly: {
    bn: "শুধুমাত্র ভেরিফাইড বিক্রেতা",
    en: "Verified Sellers Only",
  },
  foundAdsCount: {
    bn: "টি বিজ্ঞাপন পাওয়া গেছে",
    en: "ads found",
  },
  viewAllCategoriesBanner: {
    bn: "সকল পণ্যের তালিকা দেখুন ও ফিল্টার করুন",
    en: "Explore All Ads with Deep Filters",
  },
  searchSubcategories: {
    bn: "সাবক্যাটাগরি খুঁজুন...",
    en: "Search subcategories...",
  },
  gridView: {
    bn: "গ্রিড",
    en: "Grid",
  },
  listView: {
    bn: "তালিকা",
    en: "List",
  },
  allGroup: {
    bn: "সবগুলো",
    en: "All",
  },
  vehiclesGroup: {
    bn: "যানবাহন",
    en: "Vehicles",
  },
  propertyGroup: {
    bn: "প্রপার্টি",
    en: "Property",
  },
  electronicsGroup: {
    bn: "ইলেকট্রনিক্স",
    en: "Electronics",
  },
  servicesJobsGroup: {
    bn: "চাকরি ও সেবা",
    en: "Jobs & Services",
  },
  lifestyleGroup: {
    bn: "লাইফস্টাইল",
    en: "Lifestyle",
  },
  categories: {
    bn: "ক্যাটাগরি",
    en: "Categories",
  },
  location: {
    bn: "অবস্থান",
    en: "Location",
  },
  condition: {
    bn: "কন্ডিশন",
    en: "Condition",
  },
  deleteAccount: {
    bn: "অ্যাকাউন্ট মুছুন",
    en: "Delete Account",
  },
  deleteAccountTitle: {
    bn: "অ্যাকাউন্ট স্থায়ীভাবে মুছে ফেলুন",
    en: "Permanently Delete Account",
  },
  deleteAccountWarning: {
    bn: "আপনার অ্যাকাউন্ট মুছে ফেললে সকল বিজ্ঞাপন, বার্তা ও ব্যক্তিগত তথ্য চিরতরে অপসারিত হবে। এই প্রক্রিয়াটি অপরিবর্তনীয়।",
    en: "Deleting your account will permanently erase all your listings, chat messages, and profile data. This action cannot be undone.",
  },
  deleteAccountConfirmPrompt: {
    bn: "আপনি কি নিশ্চিতভাবে আপনার অ্যাকাউন্ট মুছে ফেলতে চান?",
    en: "Are you sure you want to delete your account?",
  },
  reasonLeaving: {
    bn: "মুছে ফেলার কারণ",
    en: "Reason for Leaving",
  },
  deleteAccountSuccess: {
    bn: "আপনার অ্যাকাউন্ট সফলভাবে মুছে ফেলা হয়েছে।",
    en: "Your account has been successfully deleted.",
  },

  // Edit Profile Screen
  changePhoto: {
    bn: "প্রোফাইল ছবি পরিবর্তন করুন",
    en: "Change Profile Photo",
  },
  fullNameLabel: {
    bn: "আপনার পূর্ণ নাম *",
    en: "Full Name *",
  },
  fullNamePlaceholder: {
    bn: "আপনার নাম লিখুন",
    en: "Enter your full name",
  },
  phoneLabel: {
    bn: "মোবাইল নম্বর",
    en: "Phone Number",
  },
  phonePlaceholder: {
    bn: "+৮৮০ ১XXXXXXXXX",
    en: "+880 1XXXXXXXXX",
  },
  cityDistrictLabel: {
    bn: "শহর / জেলা",
    en: "City / District",
  },
  aboutBioLabel: {
    bn: "আপনার সম্পর্কে (বায়ো)",
    en: "About / Bio",
  },
  aboutBioPlaceholder: {
    bn: "আপনার কাজের ধরন বা নিজের সম্পর্কে কিছু লিখুন...",
    en: "Write a few words about yourself or your business...",
  },
  saveChanges: {
    bn: "পরিবর্তন সংরক্ষণ করুন",
    en: "Save Changes",
  },
  permissionRequired: {
    bn: "অনুমতি প্রয়োজন",
    en: "Permission Required",
  },
  permissionPhotoLibrary: {
    bn: "প্রোফাইল ছবি পরিবর্তন করতে ফটো লাইব্রেরির অনুমতি দিন।",
    en: "Please grant photo library access to change your profile picture.",
  },
  photoUpdatedSuccess: {
    bn: "আপনার প্রোফাইল ছবি আপডেট করা হয়েছে।",
    en: "Your profile photo has been updated.",
  },
  photoUpdateFailed: {
    bn: "প্রোফাইল ছবি পরিবর্তন করা যায়নি।",
    en: "Could not change profile photo.",
  },
  nameRequired: {
    bn: "নাম আবশ্যক",
    en: "Name Required",
  },
  nameRequiredDesc: {
    bn: "অনুগ্রহ করে আপনার নাম লিখুন।",
    en: "Please enter your name.",
  },
  profileUpdateSuccess: {
    bn: "আপনার প্রোফাইল সফলভাবে আপডেট করা হয়েছে।",
    en: "Your profile has been updated successfully.",
  },
  profileUpdateFailed: {
    bn: "প্রোফাইল আপডেট করা যায়নি।",
    en: "Could not update profile.",
  },
  okText: {
    bn: "ঠিক আছে",
    en: "OK",
  },
  successTitle: {
    bn: "সফল হয়েছে",
    en: "Success",
  },
  failedTitle: {
    bn: "ব্যর্থ হয়েছে",
    en: "Failed",
  },
} as const;
