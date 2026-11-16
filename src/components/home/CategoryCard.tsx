"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Category } from "@/types/category";
import { useLanguage } from "@/context/LanguageContext";

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const { t } = useLanguage();
  const displayName = t(`cat_${category.slug}`, category.name);

  return (
    <Link
      href={`/category/${category.slug}`}
      className="group flex flex-col items-center text-center transition-transform duration-200"
    >
      {/* 3D Category Tile */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden bg-[#F8F9FA] border border-slate-100 flex items-center justify-center p-2 group-hover:scale-105 group-hover:shadow-md transition-all duration-200">
        <Image
          src={category.image}
          alt={displayName}
          width={112}
          height={112}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Category Name Label */}
      <span className="text-xs sm:text-[13px] font-semibold text-slate-800 group-hover:text-[#014923] transition-colors mt-2 sm:mt-2.5 max-w-[110px] leading-snug">
        {displayName}
      </span>
    </Link>
  );
}
