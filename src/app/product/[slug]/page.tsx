import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/mock-api";
import { getAdBySlug, getRelatedAds } from "@/lib/advertisementApi";
import { ProductDetailView } from "@/components/products/ProductDetailView";
import { Product } from "@/types/product";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  let product: Product | null = null;

  try {
    const { product: backendProduct } = await getAdBySlug(slug);
    if (backendProduct) {
      product = backendProduct;
    }
  } catch {
    // ignore
  }

  if (!product) {
    product = getProductBySlug(slug) || null;
  }

  if (!product) {
    notFound();
  }

  let related: Product[] = [];
  try {
    related = await getRelatedAds(product.id);
  } catch {}

  if (!related || related.length === 0) {
    related = getRelatedProducts(product.id, product.category, 4);
  }

  return <ProductDetailView product={product} relatedProducts={related} />;
}
