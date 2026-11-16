"use client";

import React, { useState } from "react";
import { Phone, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { useAppDispatch } from "@/store";
import { sendPhoneOtpUnified } from "@/store/slices/authSlice";

interface PhoneAuthFormProps {
  onBack: () => void;
  onOtpSent: (phone: string, exists: boolean) => void;
}

export const PhoneAuthForm: React.FC<PhoneAuthFormProps> = ({
  onBack,
  onOtpSent,
}) => {
  const dispatch = useAppDispatch();
  const [countryCode, setCountryCode] = useState("+880");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let cleanDigits = phoneNumber.replace(/\D/g, "");
    if (!cleanDigits) {
      setError("Please enter your phone number.");
      return;
    }

    // Handle leading 0 for Bangladesh mobile numbers (e.g., 017xxxxxxxx -> 17xxxxxxxx)
    if (countryCode === "+880" && cleanDigits.startsWith("0")) {
      cleanDigits = cleanDigits.substring(1);
    }

    if (cleanDigits.length < 9 || cleanDigits.length > 11) {
      setError("Please enter a valid mobile number (e.g. 017XXXXXXXX).");
      return;
    }

    const fullPhone = `${countryCode}${cleanDigits}`;

    try {
      setLoading(true);
      const action = await dispatch(sendPhoneOtpUnified({ phone: fullPhone }));

      if (sendPhoneOtpUnified.fulfilled.match(action)) {
        onOtpSent(fullPhone, Boolean(action.payload.exists));
      } else {
        setError(
          (action.payload as string) ||
            "Failed to send verification code. Please check your number."
        );
      }
    } catch (err: any) {
      setError(err.message || "Failed to send SMS verification code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col text-slate-800">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-5 w-fit focus:outline-none"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to login options</span>
      </button>

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Enter your phone number
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          We&apos;ll send a 6-digit SMS verification code to your mobile phone.
        </p>
      </div>

      {/* Error alert */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <span className="leading-snug">{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="auth-phone-input"
            className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5"
          >
            Mobile Phone Number
          </label>
          <div className="flex rounded-xl shadow-sm border border-slate-300 focus-within:border-transparent focus-within:ring-2 focus-within:ring-[#014923] overflow-hidden bg-white">
            {/* Country code selector */}
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="px-3 py-3 bg-slate-50 border-r border-slate-200 text-slate-800 text-sm font-semibold focus:outline-none cursor-pointer"
            >
              <option value="+880">🇧🇩 +880 (Bangladesh)</option>
              <option value="+91">🇮🇳 +91 (India)</option>
              <option value="+1">🇺🇸 +1 (USA)</option>
            </select>

            {/* Phone digits */}
            <div className="relative flex-1">
              <input
                id="auth-phone-input"
                type="tel"
                autoFocus
                inputMode="numeric"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="017XXXXXXXX"
                className="w-full px-4 py-3 bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-[#014923] hover:bg-[#003819] text-white font-semibold rounded-xl shadow-md transition-all duration-150 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed text-sm sm:text-base mt-2 focus:outline-none focus:ring-2 focus:ring-[#014923]/50"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Sending SMS...</span>
            </>
          ) : (
            <span>Continue with SMS</span>
          )}
        </button>
      </form>

      <div className="mt-6 p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-start gap-2.5 text-xs text-emerald-900">
        <Phone className="w-4 h-4 text-[#014923] flex-shrink-0 mt-0.5" />
        <span className="leading-relaxed">
          Fast &amp; password-free: You will log in directly via SMS OTP without needing to create or remember any password.
        </span>
      </div>
    </div>
  );
};

export default PhoneAuthForm;
