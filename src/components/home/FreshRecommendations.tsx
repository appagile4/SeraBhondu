"use client";

import React, { useState, useEffect } from "react";
import { Product } from "@/types/product";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Button } from "@/components/common/Button";
import { useMarketplace } from "@/context/MarketplaceContext";
import { getApprovedAds } from "@/lib/advertisementApi";
import { useLanguage } from "@/context/LanguageContext";
import { Sparkles, ChevronDown, RefreshCw } from "lucide-react";

interface FreshRecommendationsProps {
  initialProducts: Product[];
}

export function FreshRecommendations({ initialProducts }: FreshRecommendationsProps) {
  const { selectedLocation } = useMarketplace();
  const { t } = useLanguage();
  const [displayCount, setDisplayCount] = useState(12);
  const [liveApprovedAds, setLiveApprovedAds] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadLiveApprovedAds() {
      setIsLoading(true);
      try {
        const cityParam =
          selectedLocation && selectedLocation !== "All Bangladesh" && selectedLocation !== "All Nepal" && selectedLocation !== "All India"
            ? selectedLocation
            : undefined;

        const res = await getApprovedAds({ city: cityParam, limit: 24 });
        if (isMounted && res.products.length > 0) {
          setLiveApprovedAds(res.products);
        }
      } catch {
        // Fallback gracefully
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadLiveApprovedAds();

    return () => {
      isMounted = false;
    };
  }, [selectedLocation]);

  // Combine live approved ads from MongoDB with initial products (avoiding ID duplicates)
  const combinedIds = new Set<string>();
  const combined: Product[] = [];

  for (const ad of liveApprovedAds) {
    if (!combinedIds.has(ad.id)) {
      combinedIds.add(ad.id);
      combined.push(ad);
    }
  }

  for (const ad of initialProducts) {
    if (!combinedIds.has(ad.id)) {
      combinedIds.add(ad.id);
      combined.push(ad);
    }
  }

  // Filter by location if selected
  const filtered =
    selectedLocation && selectedLocation !== "All Nepal" && selectedLocation !== "All India"
      ? combined.filter((p) => p.location.city.toLowerCase() === selectedLocation.toLowerCase())
      : combined;

  const visibleProducts = filtered.slice(0, displayCount);
  const hasMore = displayCount < filtered.length;

  return (
    <section className="my-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-100 text-[#014923]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {t("freshRecommendationsTitle")}
              </h2>
              {liveApprovedAds.length > 0 && (
                <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase">
                  {liveApprovedAds.length} {t("newBadge")}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              {selectedLocation !== "All Bangladesh" && selectedLocation !== "All Nepal" && selectedLocation !== "All India"
                ? `${selectedLocation} ${t("freshInCity")}`
                : t("freshRecommendationsSub")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isLoading && (
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin text-[#00A896]" />
              Updating...
            </span>
          )}
          <span className="text-xs font-semibold text-slate-500">
            {t("showingAds")} {visibleProducts.length} {t("ofAds")} {filtered.length}
          </span>
        </div>
      </div>

      <ProductGrid products={visibleProducts} />

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            size="lg"
            rightIcon={<ChevronDown className="w-4 h-4" />}
            onClick={() => setDisplayCount((prev) => prev + 8)}
            className="px-8 font-bold border-2"
          >
            {t("loadMore")}
          </Button>
        </div>
      )}
    </section>
  );
}
