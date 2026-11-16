"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { setLanguage, selectLanguage, Language } from "@/store/slices/languageSlice";
import { Globe, Check, ChevronDown } from "lucide-react";

interface LanguageSwitcherProps {
  variant?: "pill" | "dropdown" | "mobile";
  className?: string;
}

export function LanguageSwitcher({
  variant = "pill",
  className = "",
}: LanguageSwitcherProps) {
  const dispatch = useAppDispatch();
  const language = useAppSelector(selectLanguage);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSetLanguage = (lang: Language) => {
    dispatch(setLanguage(lang));
    setIsOpen(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mobile dedicated tab row variant
  if (variant === "mobile") {
    return (
      <div className={`flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 ${className}`}>
        <button
          type="button"
          onClick={() => handleSetLanguage("bn")}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            language === "bn"
              ? "bg-[#014923] text-white shadow-xs"
              : "text-slate-700 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <span className="text-sm">🇧🇩</span>
          <span>বাংলা (ডিফল্ট)</span>
        </button>

        <button
          type="button"
          onClick={() => handleSetLanguage("en")}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            language === "en"
              ? "bg-[#014923] text-white shadow-xs"
              : "text-slate-700 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <span className="text-sm">🇬🇧</span>
          <span>English</span>
        </button>
      </div>
    );
  }

  // Desktop Pill Switcher variant (Direct interactive toggle)
  return (
    <div
      ref={dropdownRef}
      className={`relative inline-flex items-center text-xs ${className}`}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl border-2 border-slate-300 hover:border-[#014923] bg-white text-slate-800 font-bold transition-all hover:shadow-xs active:scale-95 cursor-pointer select-none"
        title="Change Language / ভাষা পরিবর্তন করুন"
        aria-label="Language Selector"
      >
        <span className="text-sm">
          {language === "bn" ? "🇧🇩" : "🇬🇧"}
        </span>
        <span className="text-xs font-black tracking-wide">
          {language === "bn" ? "বাংলা" : "English"}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-slate-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {language === "bn" ? "ভাষা নির্বাচন করুন" : "Select Language"}
          </div>

          <button
            type="button"
            onClick={() => handleSetLanguage("bn")}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              language === "bn"
                ? "bg-[#014923]/10 text-[#014923]"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">🇧🇩</span>
              <div className="text-left">
                <p className="font-bold">বাংলা</p>
                <p className="text-[10px] text-slate-400 font-normal">বাংলাদেশ (ডিফল্ট)</p>
              </div>
            </div>
            {language === "bn" && (
              <Check className="w-4 h-4 text-[#014923] shrink-0" />
            )}
          </button>

          <button
            type="button"
            onClick={() => handleSetLanguage("en")}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              language === "en"
                ? "bg-[#014923]/10 text-[#014923]"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">🇬🇧</span>
              <div className="text-left">
                <p className="font-bold">English</p>
                <p className="text-[10px] text-slate-400 font-normal">International</p>
              </div>
            </div>
            {language === "en" && (
              <Check className="w-4 h-4 text-[#014923] shrink-0" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
