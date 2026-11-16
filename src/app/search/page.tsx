import { getAllProducts } from "@/lib/mock-api";
import { SearchResultsView } from "@/components/search/SearchResultsView";

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

  const allProducts = getAllProducts();

  return (
    <SearchResultsView
      initialProducts={allProducts}
      initialQuery={query}
      initialCity={city}
      initialFeatured={isFeatured}
    />
  );
}
