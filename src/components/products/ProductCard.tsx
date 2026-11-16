import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types/product";
import { PriceDisplay } from "./PriceDisplay";
import { WishlistButton } from "./WishlistButton";
import { FeaturedBadge } from "./FeaturedBadge";
import { formatListingDate } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { MapPin } from "lucide-react";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const { t, language } = useLanguage();

  const displayLocation = product.location.area
    ? `${product.location.area}, ${product.location.city}`
    : `${product.location.city}, ${product.location.state}`;

  const conditionLabel = product.condition
    ? (product.condition.toLowerCase() === "used"
        ? t("conditionUsed")
        : product.condition.toLowerCase() === "new"
        ? t("conditionNew")
        : product.condition)
    : null;

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-[#E30613]/60 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      {/* Image Container */}
      <Link href={`/product/${product.slug}`} className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 block">
        <Image
          src={product.images[0] || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80"}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          priority={priority}
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Featured Badge */}
        {product.featured && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <FeaturedBadge />
          </div>
        )}

        {/* Wishlist Button */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <WishlistButton productId={product.id} size="sm" />
        </div>
      </Link>

      {/* Product Content */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between">
        <Link href={`/product/${product.slug}`} className="block space-y-1">
          {/* Price */}
          <div className="flex items-center justify-between">
            <PriceDisplay price={product.price} size="md" />
            {conditionLabel && (
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-[#014923]">
                {conditionLabel}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-sm font-semibold text-slate-800 line-clamp-1 group-hover:text-[#014923] transition-colors">
            {product.title}
          </h3>

          {/* Snippet / Subtitle */}
          <p className="text-xs text-slate-500 line-clamp-1">
            {product.description}
          </p>
        </Link>

        {/* Footer: Location & Date */}
        <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1 truncate max-w-[65%]">
            <MapPin className="w-3 h-3 shrink-0 text-[#FF6A00]" />
            <span className="truncate">{displayLocation}</span>
          </div>
          <span className="shrink-0">{formatListingDate(product.postedAt, language)}</span>
        </div>
      </div>
    </div>
  );
}
