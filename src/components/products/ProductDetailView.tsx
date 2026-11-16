"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Product } from "@/types/product";
import { ProductGallery } from "./ProductGallery";
import { ProductDetails } from "./ProductDetails";
import { ProductDescription } from "./ProductDescription";
import { RelatedProducts } from "./RelatedProducts";
import { SellerCard } from "@/components/seller/SellerCard";
import { PriceDisplay } from "./PriceDisplay";
import { WishlistButton } from "./WishlistButton";
import { FeaturedBadge } from "./FeaturedBadge";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { formatListingDate } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { MapPin, Calendar, Share2, Check, ShieldCheck, Eye } from "lucide-react";

interface ProductDetailViewProps {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetailView({ product, relatedProducts }: ProductDetailViewProps) {
  const [copied, setCopied] = useState(false);
  const { t, language } = useLanguage();

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `Check out this deal on Serabondhu: ${product.title}`,
          url: window.location.href,
        });
        return;
      } catch {
        // user cancelled or share failed, fallback to clipboard
      }
    }
    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Link copied to clipboard!");
    }
  };

  const breadcrumbItems = [
    { label: t(`cat_${product.category}`, product.category), href: `/category/${product.category}` },
    { label: product.title },
  ];

  const fullLocation = product.location.area
    ? `${product.location.area}, ${product.location.city}, ${product.location.state}`
    : `${product.location.city}, ${product.location.state}`;

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />

      {/* 2-Column Desktop Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Gallery, Specs, Description, Map */}
        <div className="lg:col-span-8 space-y-6">
          {/* Gallery */}
          <ProductGallery images={product.images} title={product.title} />

          {/* Specifications / Attributes */}
          <ProductDetails product={product} />

          {/* Description */}
          <ProductDescription description={product.description} />

          {/* Location / Map Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Ad Location</h3>
              <span className="text-xs text-slate-500 font-medium">{product.location.city}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-700">
              <MapPin className="w-4 h-4 text-[#E30613] shrink-0" />
              <span className="font-semibold">{fullLocation}</span>
              {product.location.pincode && (
                <span className="text-xs text-slate-400">({product.location.pincode})</span>
              )}
            </div>

            {/* Realistic stylized map placeholder card */}
            <div className="relative h-48 w-full rounded-xl overflow-hidden bg-gradient-to-tr from-slate-200 via-blue-50 to-orange-50 border border-slate-200 flex items-center justify-center text-center p-4">
              <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                backgroundImage: "radial-gradient(#014923 1px, transparent 1px)",
                backgroundSize: "16px 16px"
              }} />
              <div className="relative z-10 space-y-2">
                <div className="w-10 h-10 rounded-full bg-[#014923] text-amber-300 flex items-center justify-center mx-auto shadow-md">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{fullLocation}</h4>
                  <p className="text-[11px] text-slate-500">Map location verified via seller area</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Price, Title, Action Buttons, Seller Card */}
        <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
          {/* Price & Title Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div>
                <PriceDisplay price={product.price} size="xl" />
                {product.featured && (
                  <div className="mt-1.5">
                    <FeaturedBadge />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleShare}
                  className="p-2.5 rounded-full border border-slate-200 text-slate-600 hover:text-[#0A2540] hover:bg-slate-50 transition-colors"
                  title="Share this Ad"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                </button>
                <WishlistButton productId={product.id} size="md" />
              </div>
            </div>

            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                {product.title}
              </h1>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1 truncate max-w-[65%]">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{product.location.area || product.location.city}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{formatListingDate(product.postedAt, language)}</span>
              </div>
            </div>

            {product.viewsCount && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
                <Eye className="w-3.5 h-3.5" />
                <span>
                  {language === "bn"
                    ? `${product.viewsCount} জন এই বিজ্ঞাপনটি দেখেছেন`
                    : `${product.viewsCount} people viewed this advertisement`}
                </span>
              </div>
            )}
          </div>

          {/* Seller Card */}
          <SellerCard seller={product.seller} product={product} />

          {/* Safety Tips Card */}
          <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-4 space-y-2 text-xs text-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-[#00225E]">
                <ShieldCheck className="w-4 h-4 text-[#014923]" />
                <span>
                  {language === "bn" ? "সেরাবন্ধু নিরাপত্তা নির্দেশিকা" : "Serabondhu Safety & Security"}
                </span>
              </div>
              <Link href="/safety-tips" className="text-[11px] font-bold text-[#014923] hover:underline">
                {language === "bn" ? "বিস্তারিত নির্দেশিকা →" : "Full Guide →"}
              </Link>
            </div>
            <ul className="space-y-1 text-slate-600 text-[11px] list-disc list-inside">
              <li>
                {language === "bn"
                  ? "দিনের আলোতে জনবহুল ও নিরাপদ স্থানে বিক্রেতার সাথে দেখা করুন।"
                  : "Meet seller at a safe, crowded public location in daylight."}
              </li>
              <li>
                {language === "bn"
                  ? "টাকা পরিশোধের পূর্বে পণ্যটি পুঙ্খানুপুঙ্খভাবে যাচাই করুন।"
                  : "Inspect the product thoroughly before making payment."}
              </li>
              <li>
                {language === "bn"
                  ? "বিকাশ বা নগদে কখনো অগ্রিম টাকা পাঠাবেন না।"
                  : "Never send advance token deposits via bKash / Nagad."}
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Related Advertisements */}
      <RelatedProducts products={relatedProducts} />
    </div>
  );
}

