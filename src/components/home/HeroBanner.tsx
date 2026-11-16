"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import api from "@/lib/api";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

const DEFAULT_BANNER: BannerItem = {
  _id: "default-1",
  title: "KhojoBangla.com — কিনুন • বিক্রি করুন • খুঁজে নিন বাংলায়",
  imageUrl: "/khojobangla-hero-banner.jpg",
  linkUrl: "/search",
};

export function HeroBanner() {
  const [banners, setBanners] = useState<BannerItem[]>([DEFAULT_BANNER]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // 1. Fetch active banners from backend
  useEffect(() => {
    let isMounted = true;
    async function loadBanners() {
      try {
        const res = await api.get("/banners");
        if (res.data?.success && res.data.banners?.length > 0 && isMounted) {
          setBanners(res.data.banners);
        }
      } catch (err) {
        // Fallback to default banner on error
        console.warn("Could not load backend banners, using default.", err);
      }
    }
    loadBanners();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Auto-scroll loop every 2 seconds (Side scroll loop as requested)
  useEffect(() => {
    if (banners.length <= 1 || isHovered) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 2000); // 2 seconds auto-scroll interval

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
                aria-label={banner.title || `KhojoBangla Banner ${index + 1}`}
              >
                <Image
                  src={banner.imageUrl}
                  alt={banner.title || `KhojoBangla Promotional Banner ${index + 1}`}
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

        {/* Navigation Arrows (visible on hover or always accessible) */}
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
