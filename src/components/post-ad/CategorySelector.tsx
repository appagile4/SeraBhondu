"use client";

import React from "react";
import { POPULAR_CATEGORIES } from "@/data/categories";
import { Category } from "@/types/category";
import { useLanguage } from "@/context/LanguageContext";
import { Check } from "lucide-react";

interface CategorySelectorProps {
  selectedCategory: string;
  onSelect: (category: Category) => void;
}

export function CategorySelector({ selectedCategory, onSelect }: CategorySelectorProps) {
  const { t, language } = useLanguage();

  return (
    <div className="space-y-4">
      <div className="text-left">
        <h3 className="text-base font-bold text-slate-900">
          {t("chooseCategoryTitle", "ক্যাটাগরি নির্বাচন করুন")}
        </h3>
        <p className="text-xs text-slate-500">
          {t("chooseCategorySub", "আপনার পণ্যের সাথে মানানসই সেরা বিভাগটি বেছে নিন")}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {POPULAR_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.slug;
          const translatedName = t(`cat_${cat.slug}`, cat.name);
          const formattedCount =
            language === "bn"
              ? `${cat.itemCount.toLocaleString("bn-BD")} ${t("adsCountSuffix", "বিজ্ঞাপন")}`
              : `${cat.itemCount.toLocaleString()} ${t("adsCountSuffix", "ads")}`;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelect(cat)}
              className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                isSelected
                  ? "border-[#014923] bg-[#014923]/10 text-[#014923] font-bold shadow-sm ring-1 ring-[#014923]/20"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700"
              }`}
            >
              <div className="truncate pr-2">
                <span className="block text-sm truncate">{translatedName}</span>
                <span className="text-[10px] text-slate-400 block">{formattedCount}</span>
              </div>
              {isSelected && <Check className="w-4 h-4 text-[#014923] shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
