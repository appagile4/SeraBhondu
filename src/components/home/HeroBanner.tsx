"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import api from "@/lib/api";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

export interface BannerItem {
  _id?: string;
  id?: string;
  title?: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  order?: number;
  isActive?: boolean;
}

export function HeroBanner() {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // 1. Fetch active banners from backend API
  useEffect(() => {
    let isMounted = true;
    async function loadBanners() {
      setIsLoading(true);
      try {
        const res = await api.get("/banners");
        if (res.data?.success && Array.isArray(res.data.banners) && isMounted) {
          const activeBanners = res.data.banners.filter(
            (b: BannerItem) => b.isActive !== false && b.imageUrl
          );
          setBanners(activeBanners);
        } else if (isMounted) {
          setBanners([]);
        }
      } catch (err) {
        console.warn("Could not load backend banners:", err);
        if (isMounted) setBanners([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadBanners();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Auto-scroll loop every 2 seconds
  useEffect(() => {
    if (banners.length <= 1 || isHovered) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 2000);

    return () => clearInterval(timer);
  }, [banners.length, isHovered]);

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  // 3. Skeleton Loading / Activity Indicator (no fallback banner)
  if (isLoading) {
    return (
      <div className="my-4 sm:my-6 relative w-full aspect-[1024/384] overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 animate-pulse flex flex-col items-center justify-center gap-2">
        <div className="p-3 rounded-2xl bg-white/80 backdrop-blur-xs shadow-xs flex items-center gap-2.5">
          <Loader2 className="w-5 h-5 text-[#014923] animate-spin" />
          <span className="text-xs font-bold text-slate-700">ব্যানার লোড হচ্ছে...</span>
        </div>
      </div>
    );
  }

  // 4. If no banners returned from backend, do not display any fallback banner
  if (banners.length === 0) {
    return null;
  }

  return (
    <div
      className="my-4 sm:my-6 relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full aspect-[1024/384] overflow-hidden rounded-2xl sm:rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200/80 bg-slate-100">
        {/* Horizontal sliding track */}
        <div
          className="flex transition-transform duration-700 ease-out h-full w-full"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {banners.map((banner, index) => (
            <div
              key={banner._id || banner.id || index}
              className="relative w-full h-full shrink-0"
            >
              <Link
                href={banner.linkUrl || "/search"}
                className="block w-full h-full relative"
                aria-label={banner.title || `Serabondhu Banner ${index + 1}`}
              >
                <Image
                  src={banner.imageUrl}
                  alt={banner.title || `Serabondhu Promotional Banner ${index + 1}`}
                  fill
                  priority={index === 0}
                  loading={index === 0 ? "eager" : "lazy"}
                  unoptimized={
                    !banner.imageUrl.startsWith("/") &&
                    !banner.imageUrl.includes("res.cloudinary.com") &&
                    !banner.imageUrl.includes("unsplash.com")
                  }
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1280px"
                  className="object-cover object-center"
                />
              </Link>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        {banners.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/80 hover:bg-white text-slate-800 shadow-md flex items-center justify-center backdrop-blur-xs transition-all opacity-0 group-hover:opacity-100 cursor-pointer hover:scale-105 active:scale-95"
              aria-label="Previous Banner"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/80 hover:bg-white text-slate-800 shadow-md flex items-center justify-center backdrop-blur-xs transition-all opacity-0 group-hover:opacity-100 cursor-pointer hover:scale-105 active:scale-95"
              aria-label="Next Banner"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Bottom Pagination Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 bg-black/20 backdrop-blur-xs px-2.5 py-1 rounded-full">
              {banners.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentIndex(dotIdx);
                  }}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    currentIndex === dotIdx
                      ? "w-6 bg-white"
                      : "w-2 bg-white/60 hover:bg-white/90"
                  }`}
                  aria-label={`Go to slide ${dotIdx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default HeroBanner;
