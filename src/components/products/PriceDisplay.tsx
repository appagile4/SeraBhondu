"use client";

import React from "react";
import { formatPrice } from "@/lib/utils";
import { useAppSelector } from "@/store";
import { selectLanguage } from "@/store/slices/languageSlice";

interface PriceDisplayProps {
  price: number;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function PriceDisplay({ price, className = "", size = "md" }: PriceDisplayProps) {
  const language = useAppSelector(selectLanguage);

  const sizeClasses = {
    sm: "text-sm font-bold",
    md: "text-lg font-extrabold",
    lg: "text-2xl font-black",
    xl: "text-3xl font-black",
  };

  return (
    <span className={`tracking-tight text-slate-900 ${sizeClasses[size]} ${className}`}>
      {formatPrice(price, language)}
    </span>
  );
}
