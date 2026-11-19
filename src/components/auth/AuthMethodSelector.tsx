"use client";

import React from "react";
import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { GoogleAuthButton } from "./GoogleAuthButton";
import { useLanguage } from "@/context/LanguageContext";
import { Logo } from "@/components/common/Logo";

interface AuthMethodSelectorProps {
  onSelectEmail: () => void;
  onSelectPhone: () => void;
  onGoogleSuccess: () => void;
  onGoogleError: (err: string) => void;
}

export const AuthMethodSelector: React.FC<AuthMethodSelectorProps> = ({
  onSelectEmail,
  onSelectPhone,
  onGoogleSuccess,
  onGoogleError,
}) => {
  const { language, t } = useLanguage();

  return (
    <div className="flex flex-col text-slate-800">
      {/* Brand & Heading */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center mb-3">
          <Logo size="md" />
        </div>
        <h2 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight">
          {t("welcomeMessage")}
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          {t("authModalSubtitle")}
        </p>
      </div>

      {/* Auth Actions */}
      <div className="space-y-3">
        {/* 1. Continue with Google */}
        <GoogleAuthButton onSuccess={onGoogleSuccess} onError={onGoogleError} />

        {/* 2. Continue with Email */}
        <button
          type="button"
          onClick={onSelectEmail}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#014923] hover:bg-[#003819] text-white font-semibold rounded-xl shadow-sm transition-all duration-150 active:scale-[0.99] group focus:outline-none focus:ring-2 focus:ring-[#014923]/50"
        >
          <Mail className="w-5 h-5 text-emerald-100 group-hover:scale-110 transition-transform" />
          <span className="text-sm sm:text-base">{t("continueWithEmail")}</span>
        </button>

        {/* Divider: ----- or ----- */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-3 text-xs font-semibold text-slate-400 lowercase tracking-wider">
            {language === "bn" ? "অথবা" : "or"}
          </span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* 3. Continue with Phone Number - without color, without border, reduced text size, underline */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onSelectPhone}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-[#014923] underline underline-offset-4 decoration-slate-300 hover:decoration-[#014923] transition-colors py-1 px-1 bg-transparent border-0 shadow-none focus:outline-none cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{t("continueWithPhone")}</span>
          </button>
        </div>
      </div>

      {/* Footer Legal Terms */}
      <div className="mt-8 text-center text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-5">
        By continuing, you agree to Serabondhu&apos;s{" "}
        <Link
          href="/terms"
          target="_blank"
          className="text-[#014923] hover:underline font-medium"
        >
          Terms &amp; Conditions
        </Link>{" "}
        and{" "}
        <Link
          href="/privacy"
          target="_blank"
          className="text-[#014923] hover:underline font-medium"
        >
          Privacy Policy
        </Link>
        .
      </div>
    </div>
  );
};

export default AuthMethodSelector;
