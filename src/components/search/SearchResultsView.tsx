"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Product, ProductFilterState } from "@/types/product";
import { ProductGrid } from "@/components/products/ProductGrid";
import { FilterSidebar } from "@/components/filters/FilterSidebar";
import { SortDropdown, SortOption } from "@/components/filters/SortDropdown";
import { EmptyState } from "@/components/common/EmptyState";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { filterAndSortProducts } from "@/lib/mock-api";
import { searchAds } from "@/lib/advertisementApi";
import { useLanguage } from "@/context/LanguageContext";
import { Search, SlidersHorizontal, X } from "lucide-react";

interface SearchResultsViewProps {
  initialProducts: Product[];
  initialQuery: string;
  initialCity?: string;
  initialFeatured?: boolean;
}

export function SearchResultsView({
  initialProducts,
  initialQuery,
  initialCity,
  initialFeatured,
}: SearchResultsViewProps) {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<ProductFilterState>({
    city: initialCity,
    sortBy: "relevance",
  });
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [liveSearchResults, setLiveSearchResults] = useState<Product[]>([]);

  useEffect(() => {
    let mounted = true;
    async function performLiveSearch() {
      try {
        const res = await searchAds(query, filters.city, filters.category);
        if (mounted && res.products.length > 0) {
          setLiveSearchResults(res.products);
        }
      } catch {
        // ignore
      }
    }
    performLiveSearch();
    return () => {
      mounted = false;
    };
  }, [query, filters.city, filters.category]);

  // Dynamically filter products by search query and filters
  const searchResults = useMemo(() => {
    // Prefer live backend search results, fallback to initial products
    const list = liveSearchResults.length > 0 ? liveSearchResults : initialProducts;

    // Query text match
    const q = query.trim().toLowerCase();
    let filteredList = list;
    if (q) {
      filteredList = filteredList.filter((p) => {
        const titleMatch = p.title.toLowerCase().includes(q);
        const descMatch = p.description.toLowerCase().includes(q);
        const catMatch = p.category.toLowerCase().includes(q);
        const cityMatch = p.location.city.toLowerCase().includes(q);
        const tagMatch = p.tags?.some((t) => t.toLowerCase().includes(q));
        return titleMatch || descMatch || catMatch || cityMatch || tagMatch;
      });
    }

    if (initialFeatured) {
      filteredList = filteredList.filter((p) => p.featured);
    }

    return filterAndSortProducts(filteredList, filters);
  }, [liveSearchResults, initialProducts, query, filters, initialFeatured]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleReset = () => {
    setFilters({ sortBy: "relevance" });
    setQuery("");
  };

  const breadcrumbItems = [
    { label: t("searchBtn", "অনুসন্ধান"), href: "/search" },
    { label: query ? `"${query}"` : t("allAds", "সকল বিজ্ঞাপন") },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />

      {/* Header Search Box and Title */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {query
                ? (language === "bn" ? `"${query}" এর জন্য ফলাফল` : `Results for "${query}"`)
                : (language === "bn" ? "মার্কেটপ্লেসে অনুসন্ধান" : "Search Marketplace")}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {language === "bn"
                ? `${searchResults.length.toLocaleString("bn-BD")} টি বিজ্ঞাপন পাওয়া গেছে`
                : `Found ${searchResults.length} advertisements`}{" "}
              {filters.city && filters.city !== "All Bangladesh" && filters.city !== "All India"
                ? (language === "bn" ? `(${filters.city})` : `in ${filters.city}`)
                : (language === "bn" ? "সমগ্র বাংলাদেশে" : "across Bangladesh")}
            </p>
          </div>
        </div>

        {/* Search input field */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-xl">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder={t("searchKeywordsPlaceholder", "Search by keywords, model, city...")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-20 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-[#014923] focus:ring-1 focus:ring-[#014923]"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-12 top-2.5 p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-[#014923] text-white rounded-lg text-xs font-bold hover:bg-[#003819] cursor-pointer"
          >
            {language === "bn" ? "অনুসন্ধান" : "Search"}
          </button>
        </form>
      </div>

      {/* 2-column layout: Filters + Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block lg:col-span-1">
          <FilterSidebar
            filters={filters}
            onFilterChange={setFilters}
            onReset={handleReset}
          />
        </div>

        {/* Results Column */}
        <div className="lg:col-span-3 space-y-4">
          {/* Controls Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-3.5 flex items-center justify-between gap-3 shadow-xs">
            <span className="text-xs font-bold text-slate-700">
              {searchResults.length} {t("advertisementsCount", "Advertisements")}
            </span>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#E30613]" />
                <span>{t("filtersHeading", "Filters")}</span>
              </button>

              <SortDropdown
                value={filters.sortBy || "relevance"}
                onChange={(sortBy: SortOption) => setFilters({ ...filters, sortBy })}
              />
            </div>
          </div>

          {/* Grid or Empty */}
          {searchResults.length > 0 ? (
            <ProductGrid products={searchResults} columns={3} />
          ) : (
            <EmptyState
              title={
                language === "bn"
                  ? "কোনো মিলযুক্ত বিজ্ঞাপন পাওয়া যায়নি"
                  : "No matching advertisements found"
              }
              description={
                language === "bn"
                  ? `"${query}" এর জন্য কোনো বিজ্ঞাপন পাওয়া যায়নি। অন্যান্য কীওয়ার্ড দিয়ে অনুসন্ধান করুন অথবা ফিল্টার পরিবর্তন করুন।`
                  : `We couldn't find any results for "${query}". Try searching with different keywords, widening your price range, or browsing popular categories.`
              }
              actionText={
                language === "bn" ? "অনুসন্ধান ও ফিল্টার রিসেট করুন" : "Clear Search & Filters"
              }
              onAction={handleReset}
            />
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="fixed inset-0 bg-slate-900/60"
            onClick={() => setIsMobileFiltersOpen(false)}
          />
          <div className="relative bg-white w-full sm:max-w-md max-h-[85vh] rounded-t-3xl sm:rounded-3xl p-5 overflow-y-auto z-10 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">{t("filtersHeading", "Filters")}</h3>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <FilterSidebar
              filters={filters}
              onFilterChange={setFilters}
              onReset={handleReset}
            />
            <button
              onClick={() => setIsMobileFiltersOpen(false)}
              className="w-full py-3 rounded-xl bg-[#014923] text-white font-bold text-sm cursor-pointer hover:bg-[#003819]"
            >
              {language === "bn"
                ? `ফিল্টার প্রয়োগ করুন (${searchResults.length}টি বিজ্ঞাপন)`
                : `Apply Filters (${searchResults.length} Ads)`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

