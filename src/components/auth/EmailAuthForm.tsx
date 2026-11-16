"use client";

import React, { useState } from "react";
import { Mail, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { useAppDispatch } from "@/store";
import { sendEmailOtpUnified } from "@/store/slices/authSlice";

interface EmailAuthFormProps {
  onBack: () => void;
  onOtpSent: (email: string, exists: boolean) => void;
}

export const EmailAuthForm: React.FC<EmailAuthFormProps> = ({
  onBack,
  onOtpSent,
}) => {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }
    if (!emailRegex.test(cleanEmail)) {
      setError("Please enter a valid email address (e.g. name@example.com).");
      return;
    }

    try {
      setLoading(true);
      const action = await dispatch(sendEmailOtpUnified({ email: cleanEmail }));
      if (sendEmailOtpUnified.fulfilled.match(action)) {
        onOtpSent(cleanEmail, Boolean(action.payload.exists));
      } else {
        setError(
          (action.payload as string) ||
            "Failed to send verification code. Please check your email."
        );
      }
    } catch (err: any) {
      setError(err.message || "Failed to send verification code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col text-slate-800">
      {/* Top Navigation */}
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
          Enter your email
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          We&apos;ll send a 6-digit verification code to confirm your email address.
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
            htmlFor="auth-email-input"
            className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5"
          >
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-5 h-5" />
            </div>
            <input
              id="auth-email-input"
              type="email"
              autoFocus
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#014923] focus:border-transparent transition-all shadow-sm"
            />
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
              <span>Sending Code...</span>
            </>
          ) : (
            <span>Continue</span>
          )}
        </button>
      </form>

      <p className="text-xs text-slate-400 text-center mt-6">
        Existing accounts will log in directly. New accounts can set a password in the next step.
      </p>
    </div>
  );
};

export default EmailAuthForm;

