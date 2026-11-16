"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function FeaturedBadge({ className = "" }: { className?: string }) {
  const { t } = useLanguage();

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#E30613] text-white text-[10px] font-black uppercase tracking-wider shadow-sm ${className}`}
    >
      <Sparkles className="w-3 h-3 fill-white" />
      <span>{t("featuredBadge")}</span>
    </span>
  );
}
