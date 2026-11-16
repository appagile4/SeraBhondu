"use client";

import React from "react";
import { Heart } from "lucide-react";
import { useMarketplace } from "@/context/MarketplaceContext";

interface WishlistButtonProps {
  productId: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function WishlistButton({ productId, className = "", size = "md" }: WishlistButtonProps) {
  const { isWishlisted, toggleWishlist } = useMarketplace();
  const wishlisted = isWishlisted(productId);

  const sizeClasses = {
    sm: "w-7 h-7 p-1.5",
    md: "w-9 h-9 p-2",
    lg: "w-11 h-11 p-2.5",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(productId);
  };

  return (
    <button
      onClick={handleClick}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      className={`rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm hover:scale-110 active:scale-95 ${
        wishlisted
          ? "bg-rose-50 text-rose-600 hover:bg-rose-100"
          : "bg-white/90 text-slate-600 hover:text-rose-500 hover:bg-white"
      } ${sizeClasses[size]} ${className}`}
    >
      <Heart
        className={`${iconSizes[size]} transition-colors ${
          wishlisted ? "fill-rose-500 text-rose-500" : ""
        }`}
      />
    </button>
  );
}
