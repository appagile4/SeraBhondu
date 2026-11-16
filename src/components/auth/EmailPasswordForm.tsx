"use client";

import React, { useState, useMemo } from "react";
import { Lock, Eye, EyeOff, User, ArrowLeft, Loader2, AlertCircle, Check } from "lucide-react";
import { useAppDispatch } from "@/store";
import { setEmailPasswordUnified } from "@/store/slices/authSlice";

interface EmailPasswordFormProps {
  email: string;
  registrationToken: string;
  onBack: () => void;
  onSuccess: () => void;
}

export const EmailPasswordForm: React.FC<EmailPasswordFormProps> = ({
  email,
  registrationToken,
  onBack,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password strength calculation
  const strength = useMemo(() => {
    let score = 0;
    if (!password) return { score: 0, label: "", color: "bg-slate-200" };
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, label: "Weak", color: "bg-red-500", width: "w-1/4" };
      case 2:
        return { score: 2, label: "Fair", color: "bg-amber-500", width: "w-2/4" };
      case 3:
        return { score: 3, label: "Good", color: "bg-emerald-500", width: "w-3/4" };
      case 4:
      default:
        return { score: 4, label: "Strong", color: "bg-emerald-500", width: "w-full" };
    }
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!password) {
      setError("Please choose a password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    try {
      setLoading(true);
      const action = await dispatch(
        setEmailPasswordUnified({
          registrationToken,
          email,
          password,
          name: name.trim(),
        })
      );

      if (setEmailPasswordUnified.fulfilled.match(action)) {
        onSuccess();
      } else {
        setError(
          (action.payload as string) ||
            "Failed to complete account registration. Please try again."
        );
      }
    } catch (err: any) {
      setError(err.message || "Failed to set password.");
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
        <span>Back</span>
      </button>

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Create your password
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Welcome to Serabondhu! Choose a secure password to complete your account for{" "}
          <strong className="text-slate-800 font-medium">{email}</strong>.
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
        {/* Full Name */}
        <div>
          <label
            htmlFor="auth-fullname-input"
            className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5"
          >
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="w-5 h-5" />
            </div>
            <input
              id="auth-fullname-input"
              type="text"
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. Ramesh Shrestha"
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#014923] focus:border-transparent transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="auth-new-password"
            className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5"
          >
            Create Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-5 h-5" />
            </div>
            <input
              id="auth-new-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              placeholder="At least 6 characters"
              className="w-full pl-11 pr-11 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#014923] focus:border-transparent transition-all shadow-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Password Strength Meter */}
          {password && (
            <div className="mt-2 space-y-1">
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${strength.color} ${strength.width}`}
                />
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-500">
                <span>Strength:</span>
                <span className="font-semibold">{strength.label}</span>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="auth-confirm-password"
            className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5"
          >
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-5 h-5" />
            </div>
            <input
              id="auth-confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Repeat your password"
              className="w-full pl-11 pr-11 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#014923] focus:border-transparent transition-all shadow-sm"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-[#014923] hover:bg-[#003819] text-white font-semibold rounded-xl shadow-md transition-all duration-150 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed text-sm sm:text-base mt-4 focus:outline-none focus:ring-2 focus:ring-[#014923]/50"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Creating Account...</span>
            </>
          ) : (
            <span>Create Account &amp; Login</span>
          )}
        </button>
      </form>
    </div>
  );
};

export default EmailPasswordForm;

