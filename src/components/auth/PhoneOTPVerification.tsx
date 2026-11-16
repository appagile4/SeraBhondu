"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Loader2, RotateCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAppDispatch } from "@/store";
import {
  verifyPhoneOtpUnified,
  sendPhoneOtpUnified,
} from "@/store/slices/authSlice";

interface PhoneOTPVerificationProps {
  phone: string;
  onBack: () => void;
  onSuccess: () => void;
}

export const PhoneOTPVerification: React.FC<PhoneOTPVerificationProps> = ({
  phone,
  onBack,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState<number>(60);
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);

  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  // 60-second countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    setError(null);

    const sanitized = value.replace(/\D/g, "");
    if (!sanitized) {
      const nextDigits = [...digits];
      nextDigits[index] = "";
      setDigits(nextDigits);
      return;
    }

    const digit = sanitized[sanitized.length - 1];
    const nextDigits = [...digits];
    nextDigits[index] = digit;
    setDigits(nextDigits);

    // Auto-advance
    if (index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    setError(null);
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasteData) return;

    const nextDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      nextDigits[i] = pasteData[i] || "";
    }
    setDigits(nextDigits);

    const focusIndex = Math.min(pasteData.length, 5);
    inputsRef.current[focusIndex]?.focus();
  };

  const fullOtp = digits.join("");
  const isOtpComplete = fullOtp.length === 6;

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isOtpComplete || isVerifying) return;

    setError(null);
    setResendSuccess(null);

    try {
      setIsVerifying(true);
      const action = await dispatch(
        verifyPhoneOtpUnified({ phone, otp: fullOtp })
      );

      if (verifyPhoneOtpUnified.fulfilled.match(action)) {
        onSuccess();
      } else {
        setError(
          (action.payload as string) ||
            "Invalid verification code. Please check your SMS and try again."
        );
      }
    } catch (err: any) {
      setError(err.message || "Failed to verify phone code.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isResending) return;
    setError(null);
    setResendSuccess(null);

    try {
      setIsResending(true);
      const action = await dispatch(sendPhoneOtpUnified({ phone }));
      if (sendPhoneOtpUnified.fulfilled.match(action)) {
        setCountdown(60);
        setDigits(["", "", "", "", "", ""]);
        inputsRef.current[0]?.focus();
        setResendSuccess("A new 6-digit code has been sent to your phone via SMS!");
      } else {
        setError((action.payload as string) || "Failed to resend SMS.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to resend SMS.");
    } finally {
      setIsResending(false);
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
        <span>Change phone number</span>
      </button>

      {/* Heading */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Verify your phone
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Enter the 6-digit code sent via SMS to{" "}
          <strong className="text-slate-800 font-medium">{phone}</strong>.
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <span className="leading-snug">{error}</span>
        </div>
      )}

      {resendSuccess && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-700 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
          <span className="leading-snug">{resendSuccess}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleVerify} className="space-y-6">
        <div className="flex justify-between items-center gap-2 sm:gap-2.5">
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputsRef.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-xl border transition-all duration-150 focus:outline-none shadow-sm ${
                digit
                  ? "border-[#014923] bg-emerald-50/40 text-[#014923]"
                  : "border-slate-300 bg-white text-slate-900 focus:border-[#014923] focus:ring-2 focus:ring-[#014923]/20"
              }`}
            />
          ))}
        </div>

        {/* Resend Countdown */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>Didn&apos;t receive SMS?</span>
          {countdown > 0 ? (
            <span className="font-semibold text-slate-600">
              Resend in <span className="text-[#014923] font-bold">{countdown}s</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="font-bold text-[#014923] hover:text-[#003819] transition-colors flex items-center gap-1 focus:outline-none"
            >
              {isResending ? (
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
              ) : null}
              <span>Resend OTP</span>
            </button>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!isOtpComplete || isVerifying}
          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-[#014923] hover:bg-[#003819] text-white font-semibold rounded-xl shadow-md transition-all duration-150 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#014923]/50"
        >
          {isVerifying ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Verifying Code...</span>
            </>
          ) : (
            <span>Verify &amp; Continue</span>
          )}
        </button>
      </form>
    </div>
  );
};

export default PhoneOTPVerification;

