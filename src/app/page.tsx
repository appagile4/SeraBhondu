import React from "react";
import { HeroBanner } from "@/components/home/HeroBanner";
import { PopularCategories } from "@/components/home/PopularCategories";
import { FreshRecommendations } from "@/components/home/FreshRecommendations";
import { FeaturedListings } from "@/components/home/FeaturedListings";
import { LocationExplorer } from "@/components/home/LocationExplorer";
import { SellCTA } from "@/components/home/SellCTA";
import { getFeaturedProducts, getFreshRecommendations } from "@/lib/mock-api";

export default function HomePage() {
  const featured = getFeaturedProducts(4);
  const fresh = getFreshRecommendations(16);

  return (
    <div className="space-y-6">
      {/* Section 3: Hero Promotional Banner */}
      <HeroBanner />

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
