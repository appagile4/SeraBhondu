"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Product } from "@/types/product";
import { ProductCard } from "@/components/products/ProductCard";
import { useLanguage } from "@/context/LanguageContext";
import { getFeaturedAds } from "@/lib/advertisementApi";
import { Flame, ArrowRight } from "lucide-react";

interface FeaturedListingsProps {
  products: Product[];
}

export function FeaturedListings({ products: initialProducts }: FeaturedListingsProps) {
  const { t } = useLanguage();
  const [liveFeatured, setLiveFeatured] = useState<Product[]>([]);

  useEffect(() => {
    let mounted = true;
    async function fetchFeatured() {
      try {
        const ads = await getFeaturedAds(8);
        if (mounted && ads.length > 0) {
          setLiveFeatured(ads);
        }
      } catch {
        // ignore
      }
    }
    fetchFeatured();
    return () => {
      mounted = false;
    };
  }, []);

  const displayProducts = liveFeatured.length > 0 ? liveFeatured : initialProducts;

  if (displayProducts.length === 0) return null;

  return (
    <section className="my-10 p-6 sm:p-8 bg-gradient-to-b from-red-500/10 via-red-500/5 to-transparent rounded-3xl border border-red-200/60 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#E30613] text-white shadow-sm">
            <Flame className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {t("featuredTitle")}
            </h2>
            <p className="text-xs text-slate-600">
              {t("featuredSubtitle")}
            </p>
          </div>
        </div>

        <Link
          href="/search?featured=true"
          className="text-xs font-bold text-[#014923] hover:text-[#E30613] flex items-center gap-1 group"
        >
          <span>{t("viewAll")}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {displayProducts.slice(0, 4).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
