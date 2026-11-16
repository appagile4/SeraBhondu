import React from "react";

interface ProductDescriptionProps {
  description: string;
}

export function ProductDescription({ description }: ProductDescriptionProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
      <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
        Description
      </h3>
      <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
        {description}
      </div>
    </div>
  );
}
