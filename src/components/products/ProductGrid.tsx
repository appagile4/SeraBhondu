import React from "react";
import { Product } from "@/types/product";
import { ProductCard } from "./ProductCard";
import { Loader2 } from "lucide-react";

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs animate-pulse flex flex-col h-full">
      <div className="w-full aspect-[4/3] bg-slate-200" />
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="h-5 bg-slate-200 rounded w-1/2" />
          <div className="h-4 bg-slate-200 rounded w-3/4" />
          <div className="h-3 bg-slate-100 rounded w-1/3" />
        </div>
        <div className="pt-2 flex justify-between border-t border-slate-100">
          <div className="h-3 bg-slate-100 rounded w-1/4" />
          <div className="h-3 bg-slate-100 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({
  count = 8,
  columns = 4,
}: {
  count?: number;
  columns?: 3 | 4;
}) {
  const gridColsClass =
    columns === 3
      ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
      : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-2 py-2 text-slate-500">
        <Loader2 className="w-4 h-4 animate-spin text-[#014923]" />
        <span className="text-xs font-semibold">বিজ্ঞাপন লোড হচ্ছে...</span>
      </div>
      <div className={`grid ${gridColsClass} gap-4 sm:gap-6`}>
        {Array.from({ length: count }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

interface ProductGridProps {
  products: Product[];
  emptyMessage?: string;
  columns?: 3 | 4;
  loading?: boolean;
}

export function ProductGrid({
  products,
  emptyMessage = "No advertisements found matching your criteria.",
  columns = 4,
  loading = false,
}: ProductGridProps) {
  if (loading) {
    return <ProductGridSkeleton count={8} columns={columns} />;
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-white rounded-2xl border border-slate-200">
        <p className="text-sm font-medium text-slate-500">{emptyMessage}</p>
      </div>
    );
  }

  const gridColsClass =
    columns === 3
      ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
      : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";

  return (
    <div className={`grid ${gridColsClass} gap-4 sm:gap-6`}>
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} priority={index < 4} />
      ))}
    </div>
  );
}
