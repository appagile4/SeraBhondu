import React from "react";
import { Product } from "@/types/product";

interface ProductDetailsProps {
  product: Product;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const attributes = product.attributes || {};
  const entries = Object.entries(attributes);

  if (entries.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
      <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
        Overview & Specifications
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {entries.map(([key, value]) => (
          <div key={key} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              {key}
            </span>
            <span className="block text-sm font-bold text-slate-800 mt-0.5 truncate">
              {String(value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
