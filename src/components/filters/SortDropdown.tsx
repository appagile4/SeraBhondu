"use client";

import React from "react";
import { ArrowUpDown } from "lucide-react";

export type SortOption = "relevance" | "newest" | "oldest" | "price_asc" | "price_desc";

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:inline flex items-center gap-1">
        <ArrowUpDown className="w-3.5 h-3.5" />
        <span>Sort By:</span>
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#0A2540] focus:ring-1 focus:ring-[#0A2540] cursor-pointer"
      >
        <option value="relevance">Relevance</option>
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
      </select>
    </div>
  );
}
