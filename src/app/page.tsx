import React from "react";
import { HeroBanner } from "@/components/home/HeroBanner";
import { PopularCategories } from "@/components/home/PopularCategories";
import { FreshRecommendations } from "@/components/home/FreshRecommendations";
import { FeaturedListings } from "@/components/home/FeaturedListings";
import { LocationExplorer } from "@/components/home/LocationExplorer";
import { SellCTA } from "@/components/home/SellCTA";
import { getFeaturedAds, getApprovedAds, getBanners, BannerItem } from "@/lib/advertisementApi";
import { Product } from "@/types/product";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Fetch live banners directly from backend API
  let banners: BannerItem[] = [];
  try {
    banners = await getBanners();
  } catch (err) {
    console.warn("Failed to fetch banners on server:", err);
  }

  // Fetch live featured and approved ads directly from backend API
  let featured: Product[] = [];
  try {
    featured = await getFeaturedAds(8);
  } catch (err) {
    console.warn("Failed to fetch featured ads on server:", err);
  }

  let fresh: Product[] = [];
  try {
    const liveApproved = await getApprovedAds({ limit: 24 });
    fresh = liveApproved.products;
  } catch (err) {
    console.warn("Failed to fetch fresh ads on server:", err);
  }

  return (
    <div className="space-y-6">
      {/* Section 3: Hero Promotional Banner */}
      <HeroBanner initialBanners={banners} />

      {/* Section 4: Popular Categories Grid */}
      <PopularCategories />

      {/* Section 6: Featured Advertisements */}
      <FeaturedListings products={featured} />

      {/* Section 5: Fresh Recommendations */}
      <FreshRecommendations initialProducts={fresh} />

      {/* Section 7: Browse by Location */}
      <LocationExplorer />

      {/* Section 8: Promotional CTA for Sellers */}
      <SellCTA />
    </div>
  );
}
