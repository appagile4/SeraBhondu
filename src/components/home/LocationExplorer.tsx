"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useMarketplace } from "@/context/MarketplaceContext";
import { useLanguage } from "@/context/LanguageContext";
import { MapPin, Navigation } from "lucide-react";

const CITIES = [
  { name: "Dhaka", state: "Dhaka Division", count: "48,000+ ads" },
  { name: "Chattogram", state: "Chattogram Division", count: "29,400+ ads" },
  { name: "Sylhet", state: "Sylhet Division", count: "16,800+ ads" },
  { name: "Rajshahi", state: "Rajshahi Division", count: "14,200+ ads" },
  { name: "Khulna", state: "Khulna Division", count: "15,300+ ads" },
  { name: "Barishal", state: "Barishal Division", count: "8,900+ ads" },
  { name: "Rangpur", state: "Rangpur Division", count: "10,200+ ads" },
  { name: "Mymensingh", state: "Mymensingh Division", count: "9,100+ ads" },
  { name: "Gazipur", state: "Dhaka Division", count: "13,800+ ads" },
  { name: "Narayanganj", state: "Dhaka Division", count: "11,200+ ads" },
];

export function LocationExplorer() {
  const router = useRouter();
  const { selectedLocation, setSelectedLocation } = useMarketplace();
  const { t } = useLanguage();

  const handleCityClick = (cityName: string) => {
    setSelectedLocation(cityName);
    router.push(`/search?city=${encodeURIComponent(cityName)}`);
  };

  return (
    <section className="my-10 space-y-5">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-xl bg-emerald-100 text-[#014923]">
          <Navigation className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {t("locationExplorerTitle")}
          </h2>
          <p className="text-xs text-slate-500">
            {t("locationExplorerSub")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {CITIES.map((city) => {
          const isSelected = selectedLocation.toLowerCase() === city.name.toLowerCase();

          return (
            <button
              key={city.name}
              onClick={() => handleCityClick(city.name)}
              className={`p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "bg-[#014923] text-white border-[#014923] shadow-md scale-[1.02]"
                  : "bg-white border-slate-200 hover:border-[#E30613] hover:shadow-md text-slate-800"
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <MapPin
                  className={`w-4 h-4 shrink-0 ${isSelected ? "text-amber-300" : "text-[#E30613]"}`}
                />
                <span className="font-bold text-sm truncate">{city.name}</span>
              </div>
              <div className="text-[11px] opacity-70 truncate">{city.state}</div>
              <div
                className={`text-[10px] mt-1 font-semibold ${
                  isSelected ? "text-amber-300" : "text-slate-400"
                }`}
              >
                {city.count}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
