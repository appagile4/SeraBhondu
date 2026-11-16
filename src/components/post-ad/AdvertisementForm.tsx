"use client";

import React from "react";
import { Input } from "@/components/common/Input";
import { useLanguage } from "@/context/LanguageContext";

interface AdvertisementFormProps {
  formData: {
    title: string;
    description: string;
    price: number | string;
    condition: "New" | "Used";
    brand?: string;
    year?: string;
  };
  errors: Record<string, string>;
  onChange: (field: string, value: string | number) => void;
  category: string;
}

export function AdvertisementForm({
  formData,
  errors,
  onChange,
  category,
}: AdvertisementFormProps) {
  const { t, currencySymbol } = useLanguage();
  const isVehicle = category === "cars" || category === "bikes";

  return (
    <div className="space-y-5 text-left">
      <div className="text-left">
        <h3 className="text-base font-bold text-slate-900">
          {t("detailsTitle", "পণ্যের বিবরণ যুক্ত করুন")}
        </h3>
        <p className="text-xs text-slate-500">
          {t("detailsSub", "সঠিক এবং সম্পূর্ণ তথ্য প্রদান করুন")}
        </p>
      </div>

      {/* Ad Title */}
      <Input
        label={t("adTitleLabel", "বিজ্ঞাপনের শিরোনাম *")}
        placeholder={t("adTitlePlaceholder", "যেমন: হোন্ডা সিভিক ২০২২ / আইফোন ১৫ প্রো ম্যাক্স")}
        value={formData.title}
        onChange={(e) => onChange("title", e.target.value)}
        error={errors.title}
        helperText={t("adTitleHelper", "মূল বৈশিষ্ট্য, ব্র্যান্ড, মডেল ও অবস্থা উল্লেখ করুন (কমপক্ষে ৮ অক্ষর)")}
      />

      {/* Description */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-700">
          {t("adDescLabel", "বিস্তারিত বিবরণ *")}
        </label>
        <textarea
          rows={4}
          placeholder={t(
            "adDescPlaceholder",
            "পণ্যটির অবস্থা, সাথে কী কী এক্সেসরিজ পাবেন, ব্যবহারের সময়কাল এবং বিক্রির কারণ বিস্তারিত লিখুন..."
          )}
          value={formData.description}
          onChange={(e) => onChange("description", e.target.value)}
          className={`w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-[#014923] focus:ring-1 focus:ring-[#014923] ${
            errors.description ? "border-rose-500" : ""
          }`}
        />
        {errors.description && (
          <p className="text-xs text-rose-600 font-medium">{errors.description}</p>
        )}
      </div>

      {/* Price */}
      <Input
        label={`${currencySymbol} - ${t("adPriceLabel", "বিক্রয় মূল্য নির্ধারণ করুন *")}`}
        type="number"
        placeholder={t("adPricePlaceholder", "যেমন: ২৫০০০")}
        value={formData.price}
        onChange={(e) => onChange("price", Number(e.target.value))}
        error={errors.price}
      />

      {/* Condition */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-700">
          {t("conditionLabel", "অবস্থা")}
        </label>
        <div className="flex gap-3">
          {(["Used", "New"] as const).map((cond) => {
            const isSelected = formData.condition === cond;
            const label = cond === "Used" ? t("conditionUsedText", "ব্যবহৃত") : t("conditionNewText", "নতুন");
            return (
              <button
                key={cond}
                type="button"
                onClick={() => onChange("condition", cond)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  isSelected
                    ? "border-[#014923] bg-[#014923]/10 text-[#014923] ring-1 ring-[#014923]/30"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Optional Vehicle fields */}
      {isVehicle && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Input
            label={t("brandLabel", "ব্র্যান্ড / নির্মাতা")}
            placeholder={t("brandPlaceholder", "যেমন: হোন্ডা / ইয়ামাহা / টয়োটা")}
            value={formData.brand || ""}
            onChange={(e) => onChange("brand", e.target.value)}
          />
          <Input
            label={t("yearLabel", "মডেল বা রেজিস্ট্রেশনের সাল")}
            placeholder={t("yearPlaceholder", "যেমন: ২০২২")}
            value={formData.year || ""}
            onChange={(e) => onChange("year", e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
