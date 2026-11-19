import { getAllProducts } from "@/lib/mock-api";
import { searchAds } from "@/lib/advertisementApi";
import { SearchResultsView } from "@/components/search/SearchResultsView";
import { Product } from "@/types/product";

export const dynamic = "force-dynamic";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    city?: string;
    featured?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || "";
  const city = params.city;
  const isFeatured = params.featured === "true";

  let initialProducts: Product[] = [];
  try {
    const liveSearch = await searchAds(query, city, undefined, 1, 50);
    initialProducts = liveSearch.products;
  } catch (err) {
    console.warn("Backend live search failed:", err);
  }

  // Fallback to mock products only if backend returns nothing and no query was typed
  if (initialProducts.length === 0 && !query) {
    initialProducts = getAllProducts();
  }

  return (
    <SearchResultsView
      initialProducts={initialProducts}
      initialQuery={query}
      initialCity={city}
      initialFeatured={isFeatured}
    />
  );
}
