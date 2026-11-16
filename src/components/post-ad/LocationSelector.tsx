"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Input } from "@/components/common/Input";
import {
  INDIAN_STATES,
  POPULAR_CITIES,
  BANGLADESH_DIVISIONS_BN,
  BANGLADESH_CITIES_BN,
} from "@/data/locations";
import { useLanguage } from "@/context/LanguageContext";

// Dynamic client-side import for Leaflet map to guarantee zero SSR issues during Next.js builds
const LocationMapPicker = dynamic(
  () => import("./LocationMapPicker").then((mod) => mod.LocationMapPicker),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-64 sm:h-72 rounded-2xl bg-slate-100 border border-slate-200 animate-pulse flex flex-col items-center justify-center gap-2 text-xs text-slate-400 font-semibold">
        <div className="w-6 h-6 rounded-full border-2 border-slate-300 border-t-[#014923] animate-spin" />
        <span>Loading Interactive Location Map...</span>
      </div>
    ),
  }
);

interface LocationSelectorProps {
  locationData: {
    state: string;
    city: string;
    area: string;
    pincode: string;
    latitude?: number | null;
    longitude?: number | null;
  };
  sellerData: {
    name: string;
    phone: string;
    email: string;
  };
  errors: Record<string, string>;
  onChangeLocation: (field: string, value: any) => void;
  onChangeSeller: (field: string, value: string) => void;
}

export function LocationSelector({
  locationData,
  sellerData,
  errors,
  onChangeLocation,
  onChangeSeller,
}: LocationSelectorProps) {
  const { t, language } = useLanguage();

  return (
    <div className="space-y-6 text-left">
      {/* Location Details */}
      <div className="space-y-4">
        <div className="text-left">
          <h3 className="text-base font-bold text-slate-900">
            {t("locationTitle", "আপনার অবস্থান নিশ্চিত করুন")}
          </h3>
          <p className="text-xs text-slate-500">
            {t("locationSub", "সঠিক অবস্থান দিলে স্থানীয় ক্রেতারা সহজে আপনার বিজ্ঞাপন খুঁজে পাবে")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              {t("divisionLabel", "বিভাগ *")}
            </label>
            <select
              value={locationData.state}
              onChange={(e) => onChangeLocation("state", e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:border-[#014923] bg-white text-slate-900"
            >
              <option value="">{t("selectDivision", "বিভাগ নির্বাচন করুন")}</option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>
                  {language === "bn" ? BANGLADESH_DIVISIONS_BN[s] || s : s}
                </option>
              ))}
            </select>
            {errors.state && <p className="text-xs text-rose-600">{errors.state}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              {t("districtLabel", "জেলা / শহর *")}
            </label>
            <select
              value={locationData.city}
              onChange={(e) => onChangeLocation("city", e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-sm focus:border-[#014923] bg-white text-slate-900"
            >
              <option value="">{t("selectDistrict", "জেলা / শহর নির্বাচন করুন")}</option>
              {POPULAR_CITIES.filter((c) => c.name !== "All Bangladesh" && c.name !== "All India").map((c) => (
                <option key={c.id} value={c.name}>
                  {language === "bn" ? BANGLADESH_CITIES_BN[c.name] || c.name : c.name}
                </option>
              ))}
            </select>
            {errors.city && <p className="text-xs text-rose-600">{errors.city}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label={t("areaLabel", "এলাকা / মহল্লা *")}
            placeholder={t("areaPlaceholder", "যেমন: গুলশান / ধানমন্ডি / আগ্রাবাদ")}
            value={locationData.area}
            onChange={(e) => onChangeLocation("area", e.target.value)}
            error={errors.area}
          />
          <Input
            label={t("postcodeLabel", "পোস্টাল কোড")}
            placeholder={t("postcodePlaceholder", "যেমন: ১২১২")}
            value={locationData.pincode}
            onChange={(e) => onChangeLocation("pincode", e.target.value)}
          />
        </div>

        {/* Interactive Map & Exact Coordinates Picker */}
        <LocationMapPicker
          latitude={locationData.latitude ?? null}
          longitude={locationData.longitude ?? null}
          state={locationData.state}
          city={locationData.city}
          area={locationData.area}
          pincode={locationData.pincode}
          onCoordinatesChange={(lat, lng) => {
            onChangeLocation("latitude", lat);
            onChangeLocation("longitude", lng);
          }}
          onAddressDetected={(detected) => {
            if (detected.area && !locationData.area) {
              onChangeLocation("area", detected.area);
            }
            if (detected.city && !locationData.city) {
              onChangeLocation("city", detected.city);
            }
            if (detected.state && !locationData.state) {
              onChangeLocation("state", detected.state);
            }
          }}
        />
      </div>

      {/* Seller Information */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="text-left">
          <h3 className="text-base font-bold text-slate-900">
            {t("contactDetailsTitle", "আপনার যোগাযোগের তথ্য")}
          </h3>
          <p className="text-xs text-slate-500">
            {t("contactDetailsSub", "যাচাইকৃত যোগাযোগ তথ্য ক্রেতাদের আস্থা বাড়ায়")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label={t("yourNameLabel", "আপনার নাম *")}
            placeholder={t("yourNamePlaceholder", "যেমন: রফিকুল ইসলাম")}
            value={sellerData.name}
            onChange={(e) => onChangeSeller("name", e.target.value)}
            error={errors.name}
          />
          <Input
            label={t("phoneLabel", "মোবাইল নম্বর *")}
            placeholder={t("phonePlaceholder", "০১৭০০-০০০০০০")}
            value={sellerData.phone}
            onChange={(e) => onChangeSeller("phone", e.target.value)}
            error={errors.phone}
          />
          <Input
            label={t("emailLabel", "ইমেইল ঠিকানা")}
            placeholder={t("emailPlaceholder", "name@example.com")}
            value={sellerData.email}
            onChange={(e) => onChangeSeller("email", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
