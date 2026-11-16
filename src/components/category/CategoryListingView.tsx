"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Category } from "@/types/category";
import { Product, ProductFilterState } from "@/types/product";
import { ProductGrid } from "@/components/products/ProductGrid";
import { FilterSidebar } from "@/components/filters/FilterSidebar";
import { SortDropdown, SortOption } from "@/components/filters/SortDropdown";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { EmptyState } from "@/components/common/EmptyState";
import { filterAndSortProducts } from "@/lib/mock-api";
import { getApprovedAds } from "@/lib/advertisementApi";
import { useLanguage } from "@/context/LanguageContext";
import { SlidersHorizontal, Search, X } from "lucide-react";

interface CategoryListingViewProps {
  category: Category;
  initialProducts: Product[];
  initialSubCategory?: string;
}

export function CategoryListingView({
  category,
  initialProducts,
  initialSubCategory,
}: CategoryListingViewProps) {
  const { t, language } = useLanguage();
  const [filters, setFilters] = useState<ProductFilterState>({
    category: category.slug,
    subCategory: initialSubCategory,
    sortBy: "relevance",
  });
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [liveAds, setLiveAds] = useState<Product[]>([]);

  useEffect(() => {
    let mounted = true;
    async function loadCategoryApprovedAds() {
      try {
        const res = await getApprovedAds({ category: category.slug, limit: 30 });
        if (mounted && res.products.length > 0) {
          setLiveAds(res.products);
        }
      } catch {
        // ignore
      }
    }
    loadCategoryApprovedAds();
    return () => {
      mounted = false;
    };
  }, [category.slug]);

  // Combine live approved ads with initial products (deduped)
  const combinedProducts = useMemo(() => {
    const ids = new Set<string>();
    const list: Product[] = [];
    for (const p of liveAds) {
      if (!ids.has(p.id)) {
        ids.add(p.id);
        list.push(p);
      }
    }
    for (const p of initialProducts) {
      if (!ids.has(p.id)) {
        ids.add(p.id);
        list.push(p);
      }
    }
    return list;
  }, [liveAds, initialProducts]);

  // Filter products dynamically
  const filteredProducts = useMemo(() => {
    let result = filterAndSortProducts(combinedProducts, filters);
    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.location.city.toLowerCase().includes(q)
      );
    }
    return result;
  }, [combinedProducts, filters, searchKeyword]);

  const handleResetFilters = () => {
    setFilters({
      category: category.slug,
      sortBy: "relevance",
    });
    setSearchKeyword("");
  };

  const translatedCatName = t(`cat_${category.slug}`, category.name);
  const breadcrumbItems = [
    { label: t("allCategories", "সকল ক্যাটাগরি"), href: "/" },
    { label: translatedCatName, href: `/category/${category.slug}` },
    ...(initialSubCategory ? [{ label: initialSubCategory }] : []),
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />

      {/* Category Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {language === "bn" ? `বাংলাদেশে ${translatedCatName}` : `${category.name} in Bangladesh`}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              {category.description}
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-sm font-bold text-slate-900 block">
              {language === "bn"
                ? `${filteredProducts.length.toLocaleString("bn-BD")} টি বিজ্ঞাপন উপলব্ধ`
                : `${filteredProducts.length} Ads Available`}
            </span>
            <span className="text-xs text-slate-400">
              {language === "bn" ? "যাচাইকৃত বিজ্ঞাপন" : "Verified listings"}
            </span>
          </div>
        </div>

        {/* Subcategories quick filter tabs */}
        {category.subcategories && category.subcategories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pt-2 no-scrollbar">
            <button
              onClick={() => setFilters({ ...filters, subCategory: undefined })}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                !filters.subCategory
                  ? "bg-[#014923] text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              All {category.name}
            </button>
            {category.subcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setFilters({ ...filters, subCategory: sub.id })}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
                  filters.subCategory === sub.id
                    ? "bg-[#014923] text-white font-bold"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Layout (Sidebar + Results) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block lg:col-span-1">
          <FilterSidebar
            filters={filters}
            onFilterChange={setFilters}
            onReset={handleResetFilters}
            categorySlug={category.slug}
          />
        </div>

        {/* Results Column */}
        <div className="lg:col-span-3 space-y-4">
          {/* Controls Bar: In-category search + Mobile filter trigger + Sort dropdown */}
          <div className="bg-white rounded-2xl border border-slate-200 p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
            {/* Search within category */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={`Search within ${category.name}...`}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl border border-slate-300 focus:border-[#014923]"
              />
              {searchKeyword && (
                <button
                  onClick={() => setSearchKeyword("")}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3">
              {/* Mobile filter button */}
              <button
                onClick={() => setIsMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#E30613]" />
                <span>Filters</span>
              </button>

              {/* Sort Dropdown */}
              <SortDropdown
                value={filters.sortBy || "relevance"}
                onChange={(sortBy: SortOption) => setFilters({ ...filters, sortBy })}
              />
            </div>
          </div>

          {/* Product Grid or Empty State */}
          {filteredProducts.length > 0 ? (
            <ProductGrid products={filteredProducts} columns={3} />
          ) : (
            <EmptyState
              title={`No advertisements found in ${category.name}`}
              description="Try adjusting your price range, clearing some filters, or checking back soon for new listings."
              actionText="Reset All Filters"
              onAction={handleResetFilters}
            />
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer Modal */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="fixed inset-0 bg-slate-900/60"
            onClick={() => setIsMobileFiltersOpen(false)}
          />
          <div className="relative bg-white w-full sm:max-w-md max-h-[85vh] rounded-t-3xl sm:rounded-3xl p-5 overflow-y-auto z-10 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Filters</h3>
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
              onReset={handleResetFilters}
              categorySlug={category.slug}
            />
            <button
              onClick={() => setIsMobileFiltersOpen(false)}
              className="w-full py-3 rounded-xl bg-[#014923] text-white font-bold text-sm"
            >
              Apply Filters ({filteredProducts.length} Ads)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

