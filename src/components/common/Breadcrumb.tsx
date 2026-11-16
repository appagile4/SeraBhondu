"use client";

import Link from "next/link";
import React from "react";
import { ChevronRight, Home } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  const { t } = useLanguage();

  // Filter out redundant "Home" / "/" root item if caller passed it at index 0
  const displayItems = items.filter(
    (item, index) =>
      !(
        index === 0 &&
        (item.href === "/" ||
          item.label.toLowerCase() === "home" ||
          item.label === "হোম")
      )
  );

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center text-xs text-slate-500 py-3 ${className}`}>
      <ol className="flex items-center space-x-1.5 flex-wrap">
        <li>
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-[#014923] transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>{t("navHome", "হোম")}</span>
          </Link>
        </li>
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          return (
            <li key={index} className="flex items-center space-x-1.5">
              <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
              {isLast || !item.href ? (
                <span className="font-semibold text-slate-900 truncate max-w-[200px] sm:max-w-[300px]">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-[#014923] transition-colors truncate max-w-[150px]"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
