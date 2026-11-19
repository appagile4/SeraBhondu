import { Product, ProductFilterState } from "@/types/product";
import { Category } from "@/types/category";
import { Seller } from "@/types/seller";
import { MOCK_PRODUCTS } from "@/data/products";
import { POPULAR_CATEGORIES } from "@/data/categories";
import { SELLERS } from "@/data/sellers";

export function getAllProducts(): Product[] {
  return [...MOCK_PRODUCTS];
}

export function getFeaturedProducts(limit = 8): Product[] {
  return MOCK_PRODUCTS.filter((p) => p.featured).slice(0, limit);
}

export function getFreshRecommendations(limit = 12): Product[] {
  return [...MOCK_PRODUCTS]
    .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime())
    .slice(0, limit);
}

export function getProductBySlug(slug: string): Product | undefined {
  return MOCK_PRODUCTS.find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return MOCK_PRODUCTS.find((p) => p.id === id);
}

export function getRelatedProducts(productId: string, category: string, limit = 4): Product[] {
  return MOCK_PRODUCTS.filter((p) => p.id !== productId && p.category === category).slice(0, limit);
}

export function getAllCategories(): Category[] {
  return POPULAR_CATEGORIES;
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return POPULAR_CATEGORIES.find((c) => c.slug === slug);
}

export function getSellerById(id: string): Seller | undefined {
  return SELLERS[id];
}

export function getSellerProducts(sellerId: string): Product[] {
  return MOCK_PRODUCTS.filter((p) => p.seller.id === sellerId);
}

export function filterAndSortProducts(
  products: Product[],
  filters?: ProductFilterState
): Product[] {
  if (!filters) return products;

  let result = [...products];

  // Category filter
  if (filters.category && filters.category !== "all") {
    result = result.filter(
      (p) => p.category.toLowerCase() === filters.category?.toLowerCase()
    );
  }

  // SubCategory filter
  if (filters.subCategory && filters.subCategory !== "all") {
    result = result.filter(
      (p) => p.subCategory?.toLowerCase() === filters.subCategory?.toLowerCase()
    );
  }

  // City filter
  const isAllCity =
    !filters.city ||
    filters.city.toLowerCase() === "all bangladesh" ||
    filters.city === "all-bangladesh" ||
    filters.city === "All Nepal" ||
    filters.city === "All India" ||
    filters.city.toLowerCase() === "all";

  if (!isAllCity) {
    result = result.filter(
      (p) => p.location.city.toLowerCase() === filters.city?.toLowerCase()
    );
  }

  // Price range
  if (typeof filters.minPrice === "number" && filters.minPrice > 0) {
    result = result.filter((p) => p.price >= (filters.minPrice ?? 0));
  }
  if (typeof filters.maxPrice === "number" && filters.maxPrice > 0) {
    result = result.filter((p) => p.price <= (filters.maxPrice ?? Infinity));
  }

  // Condition
  if (filters.condition && filters.condition !== "All") {
    result = result.filter((p) => p.condition?.toLowerCase() === filters.condition?.toLowerCase());
  }

  // Brand
  if (filters.brand) {
    const brandLower = filters.brand.toLowerCase();
    result = result.filter((p) => {
      const b = p.attributes?.Brand?.toString().toLowerCase();
      return (b ? b.includes(brandLower) : false) || p.title.toLowerCase().includes(brandLower);
    });
  }

  // Sorting
  switch (filters.sortBy) {
    case "newest":
      result.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
      break;
    case "oldest":
      result.sort((a, b) => new Date(a.postedAt).getTime() - new Date(b.postedAt).getTime());
      break;
    case "price_asc":
      result.sort((a, b) => a.price - b.price);
      break;
    case "price_desc":
      result.sort((a, b) => b.price - a.price);
      break;
    case "relevance":
    default:
      // Keep natural order (or featured first)
      result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
      break;
  }

  return result;
}

export function searchProducts(query: string, city?: string, filters?: ProductFilterState): Product[] {
  let list = getAllProducts();
  const q = query.trim().toLowerCase();

  if (q) {
    list = list.filter((p) => {
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchCat = p.category.toLowerCase().includes(q);
      const matchCity = p.location.city.toLowerCase().includes(q);
      const matchState = p.location.state.toLowerCase().includes(q);
      const matchTags = p.tags?.some((t) => t.toLowerCase().includes(q));
      const matchAttrs = Object.values(p.attributes || {}).some((v) =>
        v.toString().toLowerCase().includes(q)
      );

      return matchTitle || matchDesc || matchCat || matchCity || matchState || matchTags || matchAttrs;
    });
  }

  if (city && city !== "All Bangladesh" && city !== "all-bangladesh" && city !== "All India" && city !== "all-india") {
    list = list.filter((p) => p.location.city.toLowerCase() === city.toLowerCase());
  }

  return filterAndSortProducts(list, filters);
}

