"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutGrid,
  TrendingUp,
  Info,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { useLanguage } from "@/context/LanguageContext";

function FacebookIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function YoutubeIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 12 5 12 5s6.255 0 7.812.418zM9.75 15.02l5.75-3.02-5.75-3.02v6.04z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function InstagramIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.566.683.748 1.15.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function TiktokIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.891 2.89 2.896 2.896 0 0 1-2.892-2.89 2.896 2.896 0 0 1 2.892-2.891c.316 0 .618.053.898.15V9.435a6.304 6.304 0 0 0-.898-.065 6.335 6.335 0 0 0-6.337 6.337 6.336 6.336 0 0 0 6.337 6.337 6.336 6.336 0 0 0 6.336-6.337V8.583a8.196 8.196 0 0 0 4.887 1.602V6.74c-.426-.007-.847-.024-1.117-.054z" />
    </svg>
  );
}

export function MainFooter() {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  return (
    <footer className="relative bg-[#013819] border-t border-emerald-950 overflow-hidden text-white">
      {/* Background Scenic Footer Image */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <Image
          src="/footer.png"
          alt="Serabondhu Scenic Footer Banner"
          fill
          priority={false}
          sizes="100vw"
          className="object-cover object-bottom"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14">
        {/* 5 Navigation Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-6 pb-12 lg:pb-16 text-xs">
          {/* Brand Column */}
          <div className="col-span-2 sm:col-span-1 lg:col-span-1 space-y-3.5">
            <div className="bg-white p-2 rounded-xl inline-block shadow-sm">
              <Logo size="md" />
            </div>
            <p className="text-emerald-100/90 leading-relaxed text-xs max-w-xs font-normal">
              {t("footerAboutText")}
            </p>

            {/* Social Media Circular Buttons */}
            <div className="flex items-center gap-2.5 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Serabondhu on Facebook"
                className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-[#014923] hover:bg-[#014923] hover:text-white hover:border-[#014923] hover:scale-105 transition-all duration-150"
              >
                <FacebookIcon className="w-3.5 h-3.5" />
              </a>

              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Serabondhu on YouTube"
                className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-[#014923] hover:bg-[#FF0000] hover:text-white hover:border-[#FF0000] hover:scale-105 transition-all duration-150"
              >
                <YoutubeIcon className="w-3.5 h-3.5" />
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Serabondhu on Instagram"
                className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-[#014923] hover:bg-[#E1306C] hover:text-white hover:border-[#E1306C] hover:scale-105 transition-all duration-150"
              >
                <InstagramIcon className="w-3.5 h-3.5" />
              </a>

              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Serabondhu on TikTok"
                className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-[#014923] hover:bg-slate-900 hover:text-white hover:border-slate-900 hover:scale-105 transition-all duration-150"
              >
                <TiktokIcon className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Column 2: Popular Categories */}
          <div>
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-emerald-400 shrink-0" />
              <h5 className="font-extrabold uppercase tracking-wider text-emerald-300 text-xs">
                {t("footerPopularCategories")}
              </h5>
            </div>
            <div className="w-6 h-0.5 bg-[#E30613] rounded-full mt-1.5 mb-3.5" />
            <ul className="space-y-2.5 text-xs">
              {[
                { name: t("footerUsedCars"), href: "/category/cars" },
                { name: t("footerBikesScooters"), href: "/category/bikes" },
                { name: t("footerMobiles"), href: "/category/mobiles" },
                { name: t("footerPropertiesSale"), href: "/category/properties" },
                {
                  name: t("footerElectronics"),
                  href: "/category/electronics",
                },
                {
                  name: t("footerFurniture"),
                  href: "/category/furniture",
                },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group flex items-center gap-1.5 text-slate-200 hover:text-white font-medium transition-colors"
                  >
                    <ChevronRight className="w-3 h-3 text-[#E30613] shrink-0 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Trending Locations */}
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
              <h5 className="font-extrabold uppercase tracking-wider text-emerald-300 text-xs">
                {t("footerTrendingLocations")}
              </h5>
            </div>
            <div className="w-6 h-0.5 bg-[#E30613] rounded-full mt-1.5 mb-3.5" />
            <ul className="space-y-2.5 text-xs">
              {[
                { name: t("cityDhaka"), href: "/search?city=Dhaka" },
                { name: t("cityChattogram"), href: "/search?city=Chattogram" },
                { name: t("citySylhet"), href: "/search?city=Sylhet" },
                { name: t("cityRajshahi"), href: "/search?city=Rajshahi" },
                { name: t("cityKhulna"), href: "/search?city=Khulna" },
                { name: t("cityBarishal"), href: "/search?city=Barishal" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group flex items-center gap-1.5 text-slate-200 hover:text-white font-medium transition-colors"
                  >
                    <ChevronRight className="w-3 h-3 text-[#E30613] shrink-0 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: About Serabondhu */}
          <div>
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-400 shrink-0" />
              <h5 className="font-extrabold uppercase tracking-wider text-emerald-300 text-xs">
                {t("footerAboutUs")}
              </h5>
            </div>
            <div className="w-6 h-0.5 bg-[#E30613] rounded-full mt-1.5 mb-3.5" />
            <ul className="space-y-2.5 text-xs">
              {[
                { name: t("footerAboutCompany"), href: "/about" },
                { name: t("footerCareersCulture"), href: "/careers" },
                { name: t("footerContactSupport"), href: "/contact" },
                { name: t("footerBusiness"), href: "/business" },
                { name: t("footerSitemapLink"), href: "/sitemap" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group flex items-center gap-1.5 text-slate-200 hover:text-white font-medium transition-colors"
                  >
                    <ChevronRight className="w-3 h-3 text-[#E30613] shrink-0 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Help & Safety */}
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <h5 className="font-extrabold uppercase tracking-wider text-emerald-300 text-xs">
                {t("footerHelpSupport")}
              </h5>
            </div>
            <div className="w-6 h-0.5 bg-[#E30613] rounded-full mt-1.5 mb-3.5" />
            <ul className="space-y-2.5 text-xs">
              {[
                { name: t("footerBuyerSafety"), href: "/safety-tips" },
                { name: t("footerFraudAwareness"), href: "/fraud-awareness" },
                { name: t("footerHelpCenter"), href: "/help" },
                { name: t("footerTermsOfUse"), href: "/terms" },
                { name: t("footerPrivacyPolicy"), href: "/privacy" },
                { name: t("footerDeleteAccount", "অ্যাকাউন্ট মুছুন"), href: "/delete-account" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group flex items-center gap-1.5 text-slate-200 hover:text-white font-medium transition-colors"
                  >
                    <ChevronRight className="w-3 h-3 text-[#E30613] shrink-0 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Sits right on the deep royal blue wave at bottom */}
        <div className="pt-4 pb-20 md:pb-5 text-xs text-white flex flex-col md:flex-row items-center justify-between gap-3 font-medium">
          {/* Copyright and Tagline */}
          <p className="text-white drop-shadow-xs text-center md:text-left">
            © {currentYear} Serabondhu (
            <span className="text-[#E30613] font-bold">serabondhu.net</span>).{" "}
            {t("footerCopyright")} {t("tagline")}.
          </p>

          {/* Legal / Policy Links */}
          <div className="flex items-center flex-wrap justify-center gap-3 sm:gap-4 text-white drop-shadow-xs">
            <span className="text-white/40 hidden md:inline select-none">
              |
            </span>
            <Link
              href="/safety-tips"
              className="flex items-center gap-1.5 hover:text-amber-200 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-white" />
              <span>{t("footerSecurity")}</span>
            </Link>
            <span className="text-white/40 select-none">|</span>
            <Link
              href="/terms"
              className="hover:text-amber-200 transition-colors"
            >
              {t("footerTermsShort")}
            </Link>
            <span className="text-white/40 select-none">|</span>
            <Link
              href="/privacy"
              className="hover:text-amber-200 transition-colors"
            >
              {t("footerPrivacyShort")}
            </Link>
            <span className="text-white/40 select-none">|</span>
            <Link
              href="/privacy#cookies"
              className="hover:text-amber-200 transition-colors"
            >
              {t("footerCookiesShort")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
