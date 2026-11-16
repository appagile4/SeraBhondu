"use client";

import React, { useState } from "react";
import { Modal } from "@/components/common/Modal";
import { POPULAR_CITIES } from "@/data/locations";
import { useMarketplace } from "@/context/MarketplaceContext";
import { useLanguage } from "@/context/LanguageContext";
import { MapPin, Search, Check } from "lucide-react";

export function LocationModal() {
  const { isLocationModalOpen, closeLocationModal, selectedLocation, setSelectedLocation } =
    useMarketplace();
  const { language, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCities = POPULAR_CITIES.filter(
    (city) =>
      city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      city.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (cityName: string) => {
    setSelectedLocation(cityName);
    closeLocationModal();
  };

  const modalTitle = language === "bn" ? "আপনার অবস্থান নির্বাচন করুন" : "Select Your Location";
  const modalDescription =
    language === "bn"
      ? "কাছের সেরা ডিল ও বিজ্ঞাপনগুলো দেখতে আপনার জেলা বা বিভাগ বেছে নিন"
      : "Choose your city or division to discover deals and advertisements near you";

  return (
    <Modal
      isOpen={isLocationModalOpen}
      onClose={closeLocationModal}
      title={modalTitle}
      description={modalDescription}
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={language === "bn" ? "জেলা, শহর বা বিভাগ খুঁজুন..." : "Search city, district or division..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-sm focus:border-[#014923] focus:ring-1 focus:ring-[#014923]"
            autoFocus
          />
        </div>

        {/* Current / All Bangladesh */}
        <div className="pt-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            {language === "bn" ? "জনপ্রিয় শহর ও বিভাগসমূহ" : "Popular Cities & Divisions"}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {filteredCities.map((city) => {
              const isSelected = selectedLocation.toLowerCase() === city.name.toLowerCase();
              return (
                <button
                  key={city.id}
                  onClick={() => handleSelect(city.name)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-left text-sm transition-all ${
                    isSelected
                      ? "border-[#014923] bg-[#014923]/10 text-[#014923] font-semibold"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-[#E30613]" : "text-slate-400"}`} />
                    <div className="truncate">
                      <span className="block truncate">{city.name}</span>
                      {city.name !== "All Bangladesh" && (
                        <span className="text-[10px] text-slate-400 block truncate">{city.state}</span>
                      )}
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#014923] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {filteredCities.length === 0 && (
          <div className="text-center py-6 text-sm text-slate-500">
            No cities found matching &quot;{searchQuery}&quot;. Try searching for Dhaka, Chattogram, or Sylhet.
          </div>
        )}
      </div>
    </Modal>
  );
}
