import { notFound } from "next/navigation";
import { getCategoryBySlug, getAllProducts, getAllCategories } from "@/lib/mock-api";
import { CategoryListingView } from "@/components/category/CategoryListingView";

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

  // Get all products matching this category
  const allProducts = getAllProducts().filter(
    (p) => p.category.toLowerCase() === slug.toLowerCase()
  );

  return (
    <CategoryListingView
      category={category}
      initialProducts={allProducts}
      initialSubCategory={sub}
    />
  );
}
