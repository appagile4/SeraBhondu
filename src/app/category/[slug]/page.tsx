import { notFound } from "next/navigation";
import { getCategoryBySlug, getAllProducts, getAllCategories } from "@/lib/mock-api";
import { getApprovedAds } from "@/lib/advertisementApi";
import { CategoryListingView } from "@/components/category/CategoryListingView";
import { Product } from "@/types/product";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  const categories = getAllCategories();
  return categories.map((cat) => ({
    slug: cat.slug,
  }));
}

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sub?: string }>;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const { sub } = await searchParams;

  const category = getCategoryBySlug(slug);
  if (!category) {
    notFound();
  }

  // Fetch real approved ads from the live backend
  let liveProducts: Product[] = [];
  try {
    const liveRes = await getApprovedAds({ category: slug, limit: 50 });
    liveProducts = liveRes.products;
  } catch (err) {
    console.warn(`Failed to fetch ads for category ${slug}:`, err);
  }

  // Fallback to mock products only if backend returns 0 products
  const fallbackProducts = getAllProducts().filter(
    (p) => p.category.toLowerCase() === slug.toLowerCase()
  );

  const initialProducts = liveProducts.length > 0 ? liveProducts : fallbackProducts;

  return (
    <CategoryListingView
      category={category}
      initialProducts={initialProducts}
      initialSubCategory={sub}
    />
  );
}
