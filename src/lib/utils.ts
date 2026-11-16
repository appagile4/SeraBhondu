import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as marketplace currency
 * Returns 'Tk 1,000' in English and '৳ 1,000' in Bangla
 */
export function formatPrice(price: number, language?: "bn" | "en"): string {
  let lang = language;
  if (!lang && typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("khojobangla_lang");
      if (saved === "en" || saved === "bn") {
        lang = saved as "bn" | "en";
      }
    } catch {}
  }
  if (!lang) lang = "bn";

  const formattedNumber = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(price);

  const symbol = lang === "en" ? "Tk" : "৳";
  return `${symbol} ${formattedNumber}`;
}

/**
 * Format date in friendly marketplace format ("Today", "Yesterday", "4 days ago" / "আজ", "গতকাল", "৪ দিন আগে")
 */
export function formatListingDate(dateString: string, language?: "bn" | "en"): string {
  let lang = language;
  if (!lang && typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("khojobangla_lang");
      if (saved === "en" || saved === "bn") {
        lang = saved as "bn" | "en";
      }
    } catch {}
  }
  if (!lang) lang = "bn";

  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (lang === "bn") {
    if (diffDays === 0) return "আজ";
    if (diffDays === 1) return "গতকাল";
    if (diffDays < 7) return `${diffDays} দিন আগে`;
    return date.toLocaleDateString("bn-BD", {
      day: "numeric",
      month: "short",
    });
  }

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });
}
