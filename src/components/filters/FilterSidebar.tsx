"use client";

import React from "react";
import { ProductFilterState } from "@/types/product";
import { POPULAR_CITIES, BANGLADESH_CITIES_BN, BANGLADESH_DIVISIONS_BN } from "@/data/locations";
import { POPULAR_CATEGORIES } from "@/data/categories";
import { useLanguage } from "@/context/LanguageContext";
import { Filter, RotateCcw } from "lucide-react";

interface FilterSidebarProps {
  filters: ProductFilterState;
  onFilterChange: (newFilters: ProductFilterState) => void;
  onReset: () => void;
  categorySlug?: string;
  className?: string;
}

export function FilterSidebar({
  filters,
  onFilterChange,
  onReset,
  categorySlug,
  className = "",
}: FilterSidebarProps) {
  const { t, language } = useLanguage();

  const handlePriceChange = (field: "minPrice" | "maxPrice", value: string) => {
    const num = value === "" ? undefined : parseInt(value, 10);
    onFilterChange({
      ...filters,
      [field]: isNaN(num as number) ? undefined : num,
    });
  };

  const currentCategory = categorySlug || filters.category;
  const isVehicle = currentCategory === "cars" || currentCategory === "bikes";
  const isMobile = currentCategory === "mobiles";
  const isProperty = currentCategory === "properties";

  const isBn = language === "bn";

  const quickBudgetPills = [
    { label: t("budgetUnder5k", "< ৳ 5k"), min: 0, max: 5000 },
    { label: t("budgetUnder25k", "< ৳ 25k"), min: 0, max: 25000 },
    { label: t("budgetUnder1L", "< ৳ 1L"), min: 0, max: 100000 },
    { label: t("budgetUnder5L", "< ৳ 5L"), min: 0, max: 500000 },
  ];

  return (
    <aside className={`bg-white rounded-2xl border border-slate-200 p-5 space-y-6 shadow-xs ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#014923]" />
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
            {t("filtersHeading", "Filters")}
          </h3>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-[#E30613] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>{t("resetFilters", "Reset")}</span>
        </button>
      </div>

      {/* Category Filter (if not locked to a specific page category) */}
      {!categorySlug && (
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            {t("categoryLabel", "Category")}
          </label>
          <select
            value={filters.category || "all"}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                category: e.target.value === "all" ? undefined : e.target.value,
              })
            }
            className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium text-slate-800 focus:border-[#014923] focus:ring-1 focus:ring-[#014923]"
          >
            <option value="all">{t("allCategoriesOption", "All Categories")}</option>
            {POPULAR_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {t(`cat_${cat.slug}`, cat.name)}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Location Filter */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
          {t("locationFilterLabel", "Location")}
        </label>
        <select
          value={filters.city || "All Bangladesh"}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              city:
                e.target.value === "All Bangladesh" || e.target.value === "All India"
                  ? undefined
                  : e.target.value,
            })
          }
          className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium text-slate-800 focus:border-[#014923] focus:ring-1 focus:ring-[#014923]"
        >
          {POPULAR_CITIES.map((c) => {
            const cityName = isBn ? BANGLADESH_CITIES_BN[c.name] || c.name : c.name;
            const stateName = isBn ? BANGLADESH_DIVISIONS_BN[c.state] || c.state : c.state;
            const isAll = c.name === "All Bangladesh" || c.name === "All India";
            return (
              <option key={c.id} value={c.name}>
                {isAll ? t("allBangladesh", "All Bangladesh") : `${cityName} (${stateName})`}
              </option>
            );
          })}
        </select>
      </div>

      {/* Price Range */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
          {t("priceRangeBDT", "Price Range (৳)")}
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-slate-400 block mb-1">
              {t("minLabel", "Min")}
            </span>
            <input
              type="number"
              placeholder={t("minPricePlaceholder", "Min ৳")}
              value={filters.minPrice ?? ""}
              onChange={(e) => handlePriceChange("minPrice", e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs focus:border-[#014923] focus:ring-1 focus:ring-[#014923]"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block mb-1">
              {t("maxLabel", "Max")}
            </span>
            <input
              type="number"
              placeholder={t("maxPricePlaceholder", "Max ৳")}
              value={filters.maxPrice ?? ""}
              onChange={(e) => handlePriceChange("maxPrice", e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs focus:border-[#014923] focus:ring-1 focus:ring-[#014923]"
            />
          </div>
        </div>

        {/* Quick Budget Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {quickBudgetPills.map((pill, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onFilterChange({ ...filters, minPrice: pill.min, maxPrice: pill.max })}
              className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-[#E30613]/10 hover:text-[#E30613] text-slate-600 font-semibold transition-colors cursor-pointer"
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Condition */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
          {t("conditionLabel", "Condition")}
        </label>
        <div className="flex rounded-xl border border-slate-200 overflow-hidden text-xs">
          {(["All", "Used", "New"] as const).map((cond) => {
            const isSelected = (filters.condition || "All") === cond;
            const condLabel =
              cond === "All"
                ? t("conditionAll", "All")
                : cond === "Used"
                ? t("conditionUsed", "Used")
                : t("conditionNew", "New");
            return (
              <button
                key={cond}
                type="button"
                onClick={() => onFilterChange({ ...filters, condition: cond })}
                className={`flex-1 py-2 font-semibold transition-colors cursor-pointer ${
                  isSelected ? "bg-[#014923] text-white" : "bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {condLabel}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Specific: Vehicles */}
      {isVehicle && (
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            {t("brandMakeLabel", "Brand / Make")}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {["Toyota", "Honda", "Yamaha", "Suzuki", "Bajaj", "Hyundai"].map((brand) => (
              <button
                key={brand}
                type="button"
                onClick={() =>
                  onFilterChange({
                    ...filters,
                    brand: filters.brand === brand ? undefined : brand,
                  })
                }
                className={`text-xs px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                  filters.brand === brand
                    ? "border-[#014923] bg-[#014923]/10 text-[#014923] font-bold"
                    : "border-slate-200 hover:border-slate-300 text-slate-700"
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category Specific: Mobiles */}
      {isMobile && (
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            {t("brandLabel", "Brand")}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {["Apple", "Samsung", "Xiaomi", "OnePlus", "Realme", "Vivo"].map((brand) => (
              <button
                key={brand}
                type="button"
                onClick={() =>
                  onFilterChange({
                    ...filters,
                    brand: filters.brand === brand ? undefined : brand,
                  })
                }
                className={`text-xs px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                  filters.brand === brand
                    ? "border-[#014923] bg-[#014923]/10 text-[#014923] font-bold"
                    : "border-slate-200 hover:border-slate-300 text-slate-700"
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category Specific: Properties */}
      {isProperty && (
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            {t("propertyTypeLabel", "Property Type")}
          </label>
          <select
            value={filters.propertyType || "all"}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                propertyType: e.target.value === "all" ? undefined : e.target.value,
              })
            }
            className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium text-slate-800 focus:border-[#014923] focus:ring-1 focus:ring-[#014923]"
          >
            <option value="all">{t("allTypesOption", "All Types")}</option>
            <option value="apartment">{t("apartmentFlatOption", "Apartment / Flat")}</option>
            <option value="hall">{t("commercialOfficeOption", "Commercial Hall / Office")}</option>
            <option value="plot">{t("plotLandOption", "Plot / Land")}</option>
          </select>
        </div>
      )}
    </aside>
  );
}
