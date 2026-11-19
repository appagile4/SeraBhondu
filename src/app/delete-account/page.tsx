"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMarketplace } from "@/context/MarketplaceContext";
import { useLanguage } from "@/context/LanguageContext";
import api from "@/lib/api";
import { Button } from "@/components/common/Button";
import {
  AlertTriangle,
  Trash2,
  ShieldAlert,
  CheckCircle2,
  Mail,
  KeyRound,
  ArrowLeft,
  Loader2,
  Clock,
  PackageX,
  MessageSquare,
  HeartOff,
} from "lucide-react";

const REASONS = [
  { en: "I have found what I was looking for", bn: "যা খুঁজছিলাম তা পেয়ে গেছি" },
  { en: "I have privacy or data security concerns", bn: "প্রাইভেসি বা ডেটা নিরাপত্তা সংক্রান্ত উদ্বেগ" },
  { en: "I receive too many messages or notifications", bn: "অতিরিক্ত বার্তা বা নোটিফিকেশন পাচ্ছি" },
  { en: "I am switching to another account", bn: "অন্য অ্যাকাউন্টে স্থানান্তরিত হচ্ছি" },
  { en: "I encountered technical issues or bugs", bn: "কারিগরি সমস্যা বা ত্রুটির সম্মুখীন হয়েছি" },
  { en: "Other reason", bn: "অন্যান্য কারণ" },
];

export default function DeleteAccountPage() {
  const router = useRouter();
  const { user, logout } = useMarketplace();
  const { t, language } = useLanguage();
  const isBn = language === "bn";

  // Form State
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [reasonDetails, setReasonDetails] = useState("");
  const [otp, setOtp] = useState("");
  const [isAgreed, setIsAgreed] = useState(false);

  // Flow State
  const [otpSent, setOtpSent] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{
    message: string;
    details?: { adsDeleted: number; messagesDeleted: number; conversationsDeleted: number };
  } | null>(null);

  // Auto-populate email if user is logged in
  useEffect(() => {
    if (user?.email && !email) {
      setEmail(user.email);
    }
  }, [user, email]);

  // Handle OTP Cooldown timer
  useEffect(() => {
    if (otpCooldown <= 0) return;
    const timer = setInterval(() => {
      setOtpCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCooldown]);

  // Request 6-digit OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMessage(isBn ? "অনুগ্রহ করে আপনার নিবন্ধিত ইমেইল লিখুন।" : "Please enter your registered email address.");
      return;
    }

    if (!reason) {
      setErrorMessage(isBn ? "অ্যাকাউন্ট মুছে ফেলার কারণ নির্বাচন করুন।" : "Please choose a reason for deleting your account.");
      return;
    }

    setIsSendingOtp(true);
    try {
      const response = await api.post("/auth/delete-account/send-otp", {
        email: cleanEmail,
      });

      if (response.data?.success) {
        setOtpSent(true);
        setOtpCooldown(60);
      } else {
        setErrorMessage(response.data?.message || (isBn ? "যাচাইকরণ কোড পাঠাতে ব্যর্থ হয়েছে।" : "Failed to send verification code."));
      }
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message ||
        err.message ||
        (isBn ? "যাচাইকরণ কোড পাঠাতে সমস্যা হয়েছে।" : "Unable to request verification code.")
      );
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Confirm Permanent Deletion
  const handleConfirmDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isAgreed) {
      setErrorMessage(isBn ? "অনুগ্রহ করে শর্তটি মেনে নিন।" : "Please acknowledge that you understand account deletion is permanent.");
      return;
    }

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setErrorMessage(isBn ? "৬-সংখ্যার যাচাইকরণ কোড লিখুন।" : "Please enter the 6-digit verification code sent to your email.");
      return;
    }

    setIsDeleting(true);
    try {
      const response = await api.post("/auth/delete-account/confirm", {
        email: email.trim().toLowerCase(),
        otp: cleanOtp,
        reason,
        reasonDetails,
      });

      if (response.data?.success) {
        setSuccessResult({
          message: response.data.message || (isBn ? "আপনার অ্যাকাউন্ট সম্পূর্ণভাবে মুছে ফেলা হয়েছে।" : "Your account has been permanently deleted."),
          details: response.data.details,
        });

        // Trigger local logout & storage purge
        logout();
      } else {
        setErrorMessage(response.data?.message || (isBn ? "অ্যাকাউন্ট মুছে ফেলা ব্যর্থ হয়েছে।" : "Failed to delete account."));
      }
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message ||
        err.message ||
        (isBn ? "অ্যাকাউন্ট মুছে ফেলার প্রক্রিয়া সম্পন্ন করা যায়নি।" : "Failed to process account deletion confirmation.")
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isBn ? "প্রোফাইলে ফিরে যান" : "Back to Profile"}</span>
          </Link>
        </div>

        {/* Success View */}
        {successResult ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-black text-slate-900">
                {isBn ? "অ্যাকাউন্ট স্থায়ীভাবে মুছে ফেলা হয়েছে" : "Account Permanently Deleted"}
              </h1>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                {successResult.message}
              </p>
            </div>

            {successResult.details && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-sm mx-auto text-left space-y-2">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {isBn ? "মুছে ফেলা তথ্যের বিবরণ:" : "Purged Data Summary:"}
                </p>
                <div className="text-xs text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span>{isBn ? "বিজ্ঞাপনসমূহ:" : "Advertisements:"}</span>
                    <span className="font-semibold text-slate-900">
                      {successResult.details.adsDeleted}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{isBn ? "মেসেজ ও চ্যাট:" : "Messages & Conversations:"}</span>
                    <span className="font-semibold text-slate-900">
                      {successResult.details.messagesDeleted + successResult.details.conversationsDeleted}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4">
              <Button
                variant="primary"
                onClick={() => router.push("/")}
                className="w-full sm:w-auto px-8"
              >
                {isBn ? "হোম পেজে ফিরে যান" : "Return to Homepage"}
              </Button>
            </div>
          </div>
        ) : (
          /* Main Account Deletion Form */
          <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-red-700 to-rose-600 px-6 py-6 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">
                    {isBn ? "সেরাবন্ধু অ্যাকাউন্ট মুছে ফেলুন" : "Delete Your Serabondhu Account"}
                  </h1>
                  <p className="text-xs text-red-100 mt-0.5">
                    {isBn
                      ? "আপনার অ্যাকাউন্ট এবং সংশ্লিষ্ট সমস্ত ডেটা স্থায়ীভাবে মুছে যাবে"
                      : "Permanent data erasure and profile cancellation"}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Critical Notice Box */}
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-red-900 space-y-3">
                <div className="flex items-center gap-2 font-bold text-red-700">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{isBn ? "গুরুত্বপূর্ণ সতর্কতা (Action Cannot Be Undone)" : "Warning: This Action is Permanent"}</span>
                </div>
                <p className="leading-relaxed">
                  {isBn
                    ? "আপনার অ্যাকাউন্ট মুছে ফেলার অনুরোধটি নিশ্চিত করা হলে নিচের ডেটাসমূহ স্থায়ীভাবে অপসারিত হবে:"
                    : "Once confirmed, the following data will be permanently purged and cannot be recovered:"}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div className="bg-white/80 p-2.5 rounded-lg border border-red-200/80 flex items-center gap-2">
                    <PackageX className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{isBn ? "সকল বিজ্ঞাপন" : "All Listings"}</span>
                  </div>
                  <div className="bg-white/80 p-2.5 rounded-lg border border-red-200/80 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{isBn ? "সকল চ্যাট ও মেসেজ" : "All Messages"}</span>
                  </div>
                  <div className="bg-white/80 p-2.5 rounded-lg border border-red-200/80 flex items-center gap-2">
                    <HeartOff className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{isBn ? "প্রোফাইল ও পছন্দের তালিকা" : "Profile & Wishlist"}</span>
                  </div>
                </div>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-xl flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="flex-1 font-medium">{errorMessage}</span>
                </div>
              )}

              {/* Stage 1: Email & Reason Form */}
              {!otpSent ? (
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  {/* Email Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {isBn ? "নিবন্ধিত ইমেইল ঠিকানা" : "Registered Email Address"} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="youremail@example.com"
                        required
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Reason Dropdown */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {isBn ? "অ্যাকাউন্ট মুছে ফেলার কারণ" : "Reason for Leaving"} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 bg-white"
                    >
                      <option value="">{isBn ? "কারণ নির্বাচন করুন..." : "Select a reason..."}</option>
                      {REASONS.map((r, i) => (
                        <option key={i} value={r.en}>
                          {isBn ? r.bn : r.en}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Reason Details */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {isBn ? "বিস্তারিত মতামত (ঐচ্ছিক)" : "Additional Feedback (Optional)"}
                    </label>
                    <textarea
                      rows={3}
                      value={reasonDetails}
                      onChange={(e) => setReasonDetails(e.target.value)}
                      placeholder={isBn ? "আপনার মূল্যবান মতামত লিখুন যা আমাদের সেবার মান উন্নত করতে সাহায্য করবে..." : "Help us understand how we can improve..."}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900"
                    />
                  </div>

                  {/* Submit OTP Request */}
                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isSendingOtp}
                      leftIcon={isSendingOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
                      className="w-full py-3 bg-red-600 hover:bg-red-700 border-red-600 shadow-md font-bold text-sm"
                    >
                      {isSendingOtp
                        ? (isBn ? "যাচাইকরণ কোড পাঠানো হচ্ছে..." : "Sending Verification Code...")
                        : (isBn ? "নিরাপত্তা কোড পাঠান" : "Send Deletion Verification Code")}
                    </Button>
                  </div>
                </form>
              ) : (
                /* Stage 2: OTP Verification & Final Confirmation */
                <form onSubmit={handleConfirmDelete} className="space-y-4">
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        {isBn ? "কোড পাঠানো হয়েছে:" : "Code sent to:"} <strong>{email}</strong>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-xs text-emerald-700 underline hover:text-emerald-900 font-semibold"
                    >
                      {isBn ? "পরিবর্তন" : "Change"}
                    </button>
                  </div>

                  {/* 6-Digit OTP */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {isBn ? "৬-সংখ্যার যাচাইকরণ কোড" : "6-Digit Verification Code"} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        placeholder="123456"
                        required
                        className="w-full pl-10 pr-4 py-2.5 text-base tracking-widest font-mono rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 text-center"
                      />
                    </div>
                  </div>

                  {/* Resend Cooldown */}
                  <div className="text-right">
                    {otpCooldown > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{isBn ? `পুনরায় পাঠানো যাবে ${otpCooldown} সেকেন্ডে` : `Resend in ${otpCooldown}s`}</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleRequestOtp}
                        disabled={isSendingOtp}
                        className="text-xs font-semibold text-red-600 hover:text-red-700 underline"
                      >
                        {isBn ? "কোড পুনরায় পাঠান" : "Resend Verification Code"}
                      </button>
                    )}
                  </div>

                  {/* Confirmation Checkbox */}
                  <div className="pt-2">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAgreed}
                        onChange={(e) => setIsAgreed(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded text-red-600 focus:ring-red-500 border-slate-300"
                      />
                      <span className="text-xs text-slate-700 leading-relaxed select-none">
                        {isBn
                          ? "আমি নিশ্চিত করছি যে আমি আমার অ্যাকাউন্ট স্থায়ীভাবে মুছে ফেলতে চাই। আমি অবগত যে আমার কোনো বিজ্ঞাপন বা চ্যাট পুনরুদ্ধার করা যাবে না।"
                          : "I confirm that I want to permanently delete my account. I understand that all my listings, messages, and profile data will be erased and cannot be recovered."}
                      </span>
                    </label>
                  </div>

                  {/* Final Submit Button */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setOtpSent(false)}
                      className="w-full sm:w-1/2 py-2.5"
                    >
                      {isBn ? "বাতিল করুন" : "Cancel"}
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isDeleting || !isAgreed || otp.length !== 6}
                      leftIcon={isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      className="w-full sm:w-1/2 py-2.5 bg-red-600 hover:bg-red-700 border-red-600 font-bold"
                    >
                      {isDeleting
                        ? (isBn ? "অ্যাকাউন্ট মুছে ফেলা হচ্ছে..." : "Deleting Account...")
                        : (isBn ? "স্থায়ীভাবে মুছে ফেলুন" : "Permanently Delete Account")}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
