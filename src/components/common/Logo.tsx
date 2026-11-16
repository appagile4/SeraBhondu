"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useAppSelector } from "@/store";
import { selectLanguage } from "@/store/slices/languageSlice";

interface LogoProps {
  className?: string;
  variant?: "default" | "light";
  showTagline?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Logo({
  className = "",
  variant = "default",
  size = "md",
}: LogoProps) {
  const isLight = variant === "light";
  const language = useAppSelector(selectLanguage);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const heightClasses = {
    sm: "h-9 sm:h-10 w-auto",
    md: "h-12 sm:h-14 md:h-[58px] lg:h-[62px] w-auto",
    lg: "h-14 sm:h-16 lg:h-20 w-auto",
    xl: "h-18 sm:h-22 xl:h-26 w-auto",
  };

  // When language is English use e-logo.png; when Bangla / Bangladesh use b-logo.png
  const isEn = mounted ? language === "en" : false;
  const logoSrc = isEn ? "/e-logo.png" : "/b-logo.png";
  const logoAlt = isEn
    ? "Serabondhu - Buy, Sell, Connect"
    : "সেরাবন্ধু - কিনুন • বিক্রি করুন • খুঁজুন";

  return (
    <Link
      href="/"
      className={`inline-flex items-center select-none group transition-transform duration-200 hover:scale-[1.02] ${
        isLight ? "bg-white px-3.5 py-2 rounded-xl shadow-xs" : ""
      } ${className}`}
    >
      <div className="relative flex items-center">
        <Image
          key={logoSrc}
          src={logoSrc}
          alt={logoAlt}
          width={1600}
          height={800}
          priority
          className={`${heightClasses[size]} object-contain`}
        />
      </div>
    </Link>
  );
}
