"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useMarketplace } from "@/context/MarketplaceContext";
import { useLanguage } from "@/context/LanguageContext";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { Button } from "@/components/common/Button";
import { UserAvatar } from "@/components/common/UserAvatar";
import {
  Lightbulb,
  ChevronRight,
  CheckCircle2,
  Camera,
  Trash2,
  Upload,
  Check,
  User,
  ShieldCheck,
  Lock,
  Loader2,
} from "lucide-react";

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
];

export default function EditProfilePage() {
  const { user, updateUser, uploadAvatar, isUploadingAvatar } = useMarketplace();
  const { t, language } = useLanguage();

  // Active navigation tab on the left sidebar
  const [activeTab, setActiveTab] = useState<"edit-profile" | "profile-picture">("edit-profile");

  // Form states initialized with user data
  const [name, setName] = useState(user?.name || "");
  const [about, setAbout] = useState(user?.about || "");
  const [phoneCode, setPhoneCode] = useState("+880");
  const [phoneNumber, setPhoneNumber] = useState(
    user?.phone?.replace(/^\+\d+\s*/, "") || ""
  );
  const [avatar, setAvatar] = useState(
    user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"
  );
  const [isGoogleLinked, setIsGoogleLinked] = useState(
    user?.isGoogleLinked !== undefined ? user.isGoogleLinked : false
  );

  // Status feedback
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Handle image upload to Cloudinary and store URL on MongoDB
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError(
        language === "bn"
          ? "অনুগ্রহ করে একটি সঠিক ছবির ফাইল নির্বাচন করুন (JPEG, PNG, WebP)।"
          : "Please select a valid image file (JPEG, PNG, WebP)."
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError(
        language === "bn"
          ? "ছবির ফাইল সাইজ সর্বোচ্চ ১০MB হতে পারবে।"
          : "Image file size should not exceed 10MB."
      );
      return;
    }

    setUploadError(null);
    try {
      // Direct stream to Cloudinary and save to MongoDB
      const uploadedUrl = await uploadAvatar(file);
      if (uploadedUrl) {
        setAvatar(uploadedUrl);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3500);
      } else {
        setUploadError(
          language === "bn"
            ? "ক্লাউডিনারিতে ছবি আপলোড করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।"
            : "Failed to upload image to Cloudinary. Please try again."
        );
      }
    } catch {
      setUploadError(
        language === "bn"
          ? "আপলোডের সময় সমস্যা হয়েছে। অনুগ্রহ করে সংযোগ পরীক্ষা করুন।"
          : "An error occurred during upload. Please check your connection."
      );
    }
  };

  // Keep in sync with user if context updates
  useEffect(() => {
    if (user) {
      setName(user.name);
      setAbout(user.about || "");
      setAvatar(user.avatar);
      if (user.phone) {
        if (user.phone.startsWith("+880")) {
          setPhoneCode("+880");
          setPhoneNumber(user.phone.replace("+880", "").trim());
        } else if (user.phone.startsWith("+977")) {
          setPhoneCode("+977");
          setPhoneNumber(user.phone.replace("+977", "").trim());
        } else if (user.phone.startsWith("+91")) {
          setPhoneCode("+91");
          setPhoneNumber(user.phone.replace("+91", "").trim());
        } else {
          setPhoneNumber(user.phone.trim());
        }
      }
      if (user.isGoogleLinked !== undefined) {
        setIsGoogleLinked(user.isGoogleLinked);
      }
    }
  }, [user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const fullPhone = `${phoneCode} ${phoneNumber.trim()}`;

    setTimeout(() => {
      updateUser({
        name: name.trim(),
        about: about.trim(),
        phone: fullPhone,
        avatar,
        isGoogleLinked,
      });

      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    }, 400);
  };

  const handleDiscard = () => {
    if (user) {
      setName(user.name);
      setAbout(user.about || "");
      setAvatar(user.avatar);
      setPhoneNumber(user.phone?.replace(/^\+\d+\s*/, "") || "");
      setIsGoogleLinked(user.isGoogleLinked ?? false);
    }
  };

  const toggleGoogleLink = () => {
    setIsGoogleLinked((prev) => !prev);
  };

  if (!user) {
    return (
      <div className="py-16 max-w-md mx-auto px-4 text-center">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-500">
            <User className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">
            {language === "bn" ? "প্রোফাইল সম্পাদনা করতে লগইন করুন" : "Sign in to edit your profile"}
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            {language === "bn"
              ? "প্রোফাইল তথ্য ও সেটিংস আপডেট করতে আপনার সেরাবন্ধু অ্যাকাউন্টে লগইন থাকা প্রয়োজন।"
              : "You must be logged into your Serabondhu account to update your profile details and settings."}
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl font-bold bg-[#014923] text-white hover:bg-[#003893] transition-all shadow-sm"
          >
            {language === "bn" ? "এখনই লগইন করুন" : "Log In Now"}
          </Link>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: t("myProfile", "আমার প্রোফাইল"), href: "/profile" },
    { label: t("editProfileBtn", "প্রোফাইল সম্পাদনা") },
  ];

  return (
    <div className="space-y-6 pb-16">
      <Breadcrumb items={breadcrumbItems} />

      {/* Success Banner */}
      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{t("profileUpdatedSuccess", "প্রোফাইল সফলভাবে আপডেট করা হয়েছে!")}</span>
          </div>
          <Link
            href="/profile"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline"
          >
            {t("viewLiveProfileLink", "লাইভ প্রোফাইল দেখুন →")}
          </Link>
        </div>
      )}

      {/* Main 2-Column Container */}
      <div className="flex flex-col md:flex-row items-start gap-8">
        {/* Left Sidebar Navigation */}
        <aside className="w-full md:w-56 lg:w-64 shrink-0 space-y-6">
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setActiveTab("edit-profile")}
              className={`w-full text-left px-3 py-2 text-sm font-bold rounded-lg transition-colors cursor-pointer ${
                activeTab === "edit-profile"
                  ? "text-slate-900 bg-slate-100"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {t("editProfileBtn", "প্রোফাইল সম্পাদনা")}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("profile-picture")}
              className={`w-full text-left px-3 py-2 text-sm font-bold rounded-lg transition-colors cursor-pointer ${
                activeTab === "profile-picture"
                  ? "text-slate-900 bg-slate-100"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {t("profilePictureTab", "প্রোফাইল ছবি")}
            </button>
          </div>

          {/* View Profile Action Button */}
          <Link href="/profile" className="block">
            <Button
              variant="outline"
              className="w-full border-2 border-[#014923] text-[#014923] hover:bg-emerald-50 font-bold rounded-lg py-2.5 text-sm transition-colors text-center"
            >
              {t("viewProfileBtn", "প্রোফাইল দেখুন")}
            </Button>
          </Link>
        </aside>

        {/* Right Main Form Card */}
        <main className="flex-1 w-full bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
          {activeTab === "edit-profile" ? (
            <form onSubmit={handleSave}>
              {/* Card Title */}
              <div className="px-6 sm:px-8 py-4 border-b border-slate-200">
                <h1 className="text-base sm:text-lg font-bold text-slate-900">
                  {t("editProfileBtn", "প্রোফাইল সম্পাদনা")}
                </h1>
              </div>

              {/* Section 1: Basic Information */}
              <div className="px-6 sm:px-8 py-6 border-b border-slate-200 space-y-4">
                <h2 className="text-sm font-bold text-slate-900">
                  {t("basicInfoTitle", "প্রাথমিক তথ্য")}
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Form Inputs */}
                  <div className="lg:col-span-8 space-y-4">
                    {/* Name Input */}
                    <div>
                      <div className="relative">
                        <input
                          type="text"
                          value={name}
                          maxLength={30}
                          onChange={(e) => setName(e.target.value)}
                          placeholder={t("yourFullNamePlaceholder", "আপনার পুরো নাম")}
                          className="w-full px-3.5 py-2.5 text-sm text-slate-900 rounded-lg border border-slate-300 focus:border-[#014923] focus:ring-1 focus:ring-[#014923] outline-none transition-all placeholder:text-slate-400"
                          required
                        />
                      </div>
                      <div className="text-[11px] text-slate-400 text-right mt-1 font-mono">
                        {name.length} / 30
                      </div>
                    </div>

                    {/* About me Textarea */}
                    <div>
                      <div className="relative">
                        <textarea
                          rows={3}
                          value={about}
                          maxLength={200}
                          onChange={(e) => setAbout(e.target.value)}
                          placeholder={t("aboutMePlaceholder", "আমার সম্পর্কে (ঐচ্ছিক)")}
                          className="w-full px-3.5 py-2.5 text-sm text-slate-900 rounded-lg border border-slate-300 focus:border-[#014923] focus:ring-1 focus:ring-[#014923] outline-none transition-all placeholder:text-slate-400 resize-none"
                        />
                      </div>
                      <div className="text-[11px] text-slate-400 text-right mt-1 font-mono">
                        {about.length} / 200
                      </div>
                    </div>
                  </div>

                  {/* Right Help Box: "Why is it important?" */}
                  <div className="lg:col-span-4 border border-slate-200 bg-slate-50/70 rounded-xl p-4 text-xs space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>{t("whyIsItImportant", "এটি কেন গুরুত্বপূর্ণ?")}</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      {t("whyImportantText", "সেরাবন্ধু বিশ্বাসের ওপর প্রতিষ্ঠিত। অন্যান্য ক্রেতা-বিক্রেতাদের সাথে পরিচিত হন। আপনার পছন্দের ব্র্যান্ড ও আগ্রহের কথা শেয়ার করুন।")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 2: Contact Information */}
              <div className="px-6 sm:px-8 py-6 border-b border-slate-200 space-y-4">
                <h2 className="text-sm font-bold text-slate-900">
                  {t("contactInfoTitle", "যোগাযোগের তথ্য")}
                </h2>

                {/* Phone Number Field */}
                <div className="space-y-1.5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 max-w-md flex items-center rounded-lg border border-slate-300 bg-white hover:border-slate-400 focus-within:border-[#014923] focus-within:ring-1 focus-within:ring-[#014923] transition-all overflow-hidden">
                      {/* Country Code Select */}
                      <select
                        value={phoneCode}
                        onChange={(e) => setPhoneCode(e.target.value)}
                        className="bg-slate-50 px-2.5 py-2.5 text-xs font-semibold text-slate-700 border-r border-slate-200 outline-none cursor-pointer"
                      >
                        <option value="+880">+880 (BD)</option>
                      </select>

                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder={language === "bn" ? "মোবাইল নম্বর" : "Phone Number"}
                        className="flex-1 px-3 py-2.5 text-sm text-slate-900 outline-none"
                        required
                      />

                      <div className="pr-3 text-slate-400">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Verification Status */}
                    <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{t("phoneVerifiedYay", "আপনার নম্বরটি সফলভাবে ভেরিফাইড!")}</span>
                    </div>
                  </div>
                </div>

                {/* Email Field - Read Only / Locked */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div
                      className="flex-1 max-w-md flex items-center rounded-lg border border-slate-200 bg-slate-50/90 text-slate-700 transition-all overflow-hidden cursor-not-allowed select-none"
                      title="Email address cannot be changed"
                    >
                      <input
                        type="email"
                        value={user?.email || ""}
                        readOnly
                        disabled
                        aria-readonly="true"
                        placeholder="your.email@example.com"
                        className="flex-1 px-3.5 py-2.5 text-sm text-slate-700 bg-transparent outline-none cursor-not-allowed font-medium"
                      />
                      <div className="pr-3 flex items-center gap-1.5 text-slate-400">
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        <ChevronRight className="w-4 h-4 opacity-40" />
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                        {t("emailLockedNotice", "আপনার ইমেইল কারও সাথে শেয়ার করা হয় না এবং কোনো স্প্যাম পাঠানো হয় না।")}
                      </p>
                      <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                        <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{t("emailCannotChange", "ইমেইল ঠিকানা পরিবর্তনযোগ্য নয়")}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Additional Information */}
              <div className="px-6 sm:px-8 py-6 space-y-4">
                <h2 className="text-sm font-bold text-slate-900">
                  {t("additionalInfoTitle", "অতিরিক্ত তথ্য")}
                </h2>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">Google</h3>
                      {isGoogleLinked && (
                        <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Check className="w-3 h-3" /> {t("googleLinked", "সংযুক্ত")}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      {t("googleLinkText", "সহজে যোগাযোগের জন্য আপনার গুগল অ্যাকাউন্ট লিঙ্ক করুন।")}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={toggleGoogleLink}
                    className="w-full sm:w-auto px-8 py-2 text-sm font-bold rounded-lg border-2 border-[#014923] text-[#014923] hover:bg-emerald-50 transition-colors cursor-pointer"
                  >
                    {isGoogleLinked ? t("unlinkGoogleBtn", "আনলিঙ্ক") : t("linkGoogleBtn", "গুগল লিঙ্ক করুন")}
                  </button>
                </div>
              </div>

              {/* Bottom Actions Bar */}
              <div className="px-6 sm:px-8 py-4 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleDiscard}
                  className="text-sm font-bold text-[#014923] hover:underline cursor-pointer"
                >
                  {t("discardBtn", "বাতিল করুন")}
                </button>

                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-[#014923] hover:bg-[#00381b] text-white font-bold px-7 py-2.5 rounded-lg shadow-xs cursor-pointer"
                >
                  {isSaving ? t("savingBtn", "সংরক্ষণ হচ্ছে...") : t("saveChangesBtn", "পরিবর্তন সংরক্ষণ করুন")}
                </Button>
              </div>
            </form>
          ) : (
            /* Profile Picture Tab */
            <div className="space-y-6">
              {/* Card Title */}
              <div className="px-6 sm:px-8 py-4 border-b border-slate-200">
                <h1 className="text-base sm:text-lg font-bold text-slate-900">
                  {t("profilePictureTab", "প্রোফাইল ছবি")}
                </h1>
              </div>

              <div className="px-6 sm:px-8 py-6 space-y-6">
                {/* Current Avatar Display */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  <UserAvatar
                    src={avatar}
                    name={name}
                    size={112}
                    borderClassName="border-4 border-slate-100 shadow-md"
                  />

                  <div className="space-y-3 text-center sm:text-left flex-1">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {language === "bn" ? "একটি নতুন ছবি আপলোড করুন" : "Upload a new photo"}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {language === "bn"
                          ? "JPG, PNG বা WebP ফরম্যাট সমর্থিত (সর্বোচ্চ ১০MB)।"
                          : "Supports JPG, PNG, or WebP. Max size: 10MB."}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                      <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#014923] text-white text-xs font-bold rounded-lg cursor-pointer hover:bg-[#00381b] transition-all shadow-xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{language === "bn" ? "ডিভাইস থেকে আপলোড" : "Upload from device"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          disabled={isUploadingAvatar}
                          className="hidden"
                        />
                      </label>

                      {avatar && (
                        <button
                          type="button"
                          onClick={() => setAvatar("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80")}
                          className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{language === "bn" ? "রিমুভ" : "Remove"}</span>
                        </button>
                      )}
                    </div>

                    {isUploadingAvatar && (
                      <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold animate-pulse">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{language === "bn" ? "ক্লাউডিনারিতে আপলোড হচ্ছে..." : "Uploading to Cloudinary..."}</span>
                      </div>
                    )}

                    {uploadError && (
                      <p className="text-xs text-rose-600 font-semibold">{uploadError}</p>
                    )}
                  </div>
                </div>

                {/* Preset Avatars Selection */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700">
                    {language === "bn" ? "অথবা যেকোনো নমুনা অবতার বেছে নিন:" : "Or pick from avatar presets:"}
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {PRESET_AVATARS.map((presetUrl, idx) => {
                      const isSelected = avatar === presetUrl;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAvatar(presetUrl)}
                          className={`relative w-12 h-12 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                            isSelected
                              ? "border-[#014923] ring-2 ring-[#014923]/30 scale-105"
                              : "border-slate-200 hover:border-slate-400"
                          }`}
                        >
                          <Image
                            src={presetUrl}
                            alt={`Avatar Preset ${idx + 1}`}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                          {isSelected && (
                            <div className="absolute inset-0 bg-[#014923]/30 flex items-center justify-center">
                              <Check className="w-4 h-4 text-white stroke-[3]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom Actions Bar */}
              <div className="px-6 sm:px-8 py-4 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleDiscard}
                  className="text-sm font-bold text-[#014923] hover:underline cursor-pointer"
                >
                  {t("discardBtn", "বাতিল করুন")}
                </button>

                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-[#014923] hover:bg-[#00381b] text-white font-bold px-7 py-2.5 rounded-lg shadow-xs cursor-pointer"
                >
                  {isSaving ? t("savingBtn", "সংরক্ষণ হচ্ছে...") : t("saveChangesBtn", "পরিবর্তন সংরক্ষণ করুন")}
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

