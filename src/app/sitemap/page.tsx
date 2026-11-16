import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { POPULAR_CATEGORIES } from "@/data/categories";
import { POPULAR_CITIES } from "@/data/locations";
import {
  Map,
  Compass,
  Building,
  ShieldCheck,
  User,
  ShoppingBag,
  HelpCircle,
  FileText,
  ExternalLink,
} from "lucide-react";

export const metadata: Metadata = {
  title: "HTML Sitemap — KhojoBangla | All Categories, Cities & Pages",
  description:
    "Explore the comprehensive KhojoBangla site directory. Navigate all marketplace categories, cities across Bangladesh, user portals, help centers, and legal pages.",
};

const COMPANY_LINKS = [
  { name: "About KhojoBangla", href: "/about", desc: "Our story, mission, and leadership team" },
  { name: "Careers & Culture", href: "/careers", desc: "Open job vacancies at our Lalitpur hub" },
  { name: "Contact Support", href: "/contact", desc: "Toll-free hotline, office address & ticket desk" },
  { name: "KhojoBangla for Businesses", href: "/business", desc: "Showroom dealer packages & inventory tools" },
  { name: "Sitemap Directory", href: "/sitemap", desc: "Full structural index of khojobangla.com" },
];

const SAFETY_LINKS = [
  { name: "Safety Tips for Buyers", href: "/safety-tips", desc: "In-person inspection & meeting guidelines" },
  { name: "Fraud Awareness Guide", href: "/fraud-awareness", desc: "Advance payment scam & QR fraud prevention" },
  { name: "Help Center & FAQ", href: "/help", desc: "Searchable knowledge base for posting & buying" },
  { name: "Terms of Use", href: "/terms", desc: "Marketplace rules & prohibited items list" },
  { name: "Privacy Policy", href: "/privacy", desc: "User privacy, phone number masking & cookies" },
];

const USER_LINKS = [
  { name: "Post an Advertisement", href: "/post-ad", desc: "List your car, mobile, or property for free" },
  { name: "Saved Wishlist", href: "/wishlist", desc: "Your bookmarked advertisements" },
  { name: "Buyer & Seller Chat", href: "/chat", desc: "Real-time in-app marketplace conversations" },
  { name: "User Profile Dashboard", href: "/profile", desc: "Manage your active listings and settings" },
  { name: "Login to Account", href: "/login", desc: "Sign in with your phone or email" },
  { name: "Create New Account", href: "/register", desc: "Register as a buyer or verified seller" },
];

export default function SitemapPage() {
  return (
    <div className="space-y-12 sm:space-y-16 pb-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-[#014923]">
          Home
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">Sitemap Directory</span>
      </nav>

      {/* Hero */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#013819] via-[#014923] to-[#001844] text-white p-8 sm:p-12 shadow-xl">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-orange-300">
            <Compass className="w-3.5 h-3.5" />
            <span>Complete Website Directory</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            KhojoBangla <span className="text-[#E30613]">HTML Sitemap</span>
          </h1>

          <p className="text-sm sm:text-base text-blue-100 leading-relaxed">
            Quickly navigate to any category, top provincial cities, account tools, or help and legal resources across KhojoBangla (khojobangla.com).
          </p>
        </div>
      </div>

      {/* 4 Core Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Section 1: Categories */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#014923] flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Marketplace Categories
              </h2>
              <p className="text-xs text-slate-500">
                12 main departments and subcategories
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {POPULAR_CATEGORIES.map((cat) => (
              <div key={cat.id} className="space-y-1">
                <Link
                  href={`/category/${cat.slug}`}
                  className="font-bold text-xs text-[#014923] hover:underline flex items-center gap-1.5"
                >
                  <span>{cat.name}</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    ({(cat.itemCount || 1000).toLocaleString()} ads)
                  </span>
                </Link>
                {cat.subcategories && cat.subcategories.length > 0 && (
                  <p className="text-[11px] text-slate-500 truncate">
                    {cat.subcategories.slice(0, 3).map((s) => s.name).join(", ")}...
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Cities across Bangladesh */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#E30613] flex items-center justify-center font-bold">
              <Map className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Browse by City &amp; Region
              </h2>
              <p className="text-xs text-slate-500">
                Discover local classifieds in your hometown
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {POPULAR_CITIES.map((city) => (
              <Link
                key={city.id}
                href={`/search?city=${encodeURIComponent(city.name)}`}
                className="p-2.5 rounded-xl border border-slate-100 hover:border-[#014923]/40 hover:bg-emerald-50/30 transition-colors group"
              >
                <div className="font-bold text-xs text-slate-800 group-hover:text-[#014923]">
                  {city.name}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {city.state}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Section 3: Company & Business */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                About KhojoBangla &amp; Business
              </h2>
              <p className="text-xs text-slate-500">
                Company profile, careers &amp; merchant services
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {COMPANY_LINKS.map((link, idx) => (
              <Link
                key={idx}
                href={link.href}
                className="block p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors group"
              >
                <div className="font-bold text-xs text-slate-900 group-hover:text-[#014923] flex items-center justify-between">
                  <span>{link.name}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#014923]" />
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {link.desc}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Section 4: Help, Trust & Legal */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Help, Safety &amp; Legal Policies
              </h2>
              <p className="text-xs text-slate-500">
                Consumer protection, terms &amp; fraud guidance
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {SAFETY_LINKS.map((link, idx) => (
              <Link
                key={idx}
                href={link.href}
                className="block p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors group"
              >
                <div className="font-bold text-xs text-slate-900 group-hover:text-[#014923] flex items-center justify-between">
                  <span>{link.name}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#014923]" />
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {link.desc}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* User Portals Bar */}
      <div className="bg-slate-100 rounded-3xl p-6 sm:p-8 border border-slate-200/80 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <User className="w-4 h-4 text-[#014923]" />
          Account &amp; Action Portals
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {USER_LINKS.map((uLink, idx) => (
            <Link
              key={idx}
              href={uLink.href}
              className="bg-white p-3.5 rounded-xl border border-slate-200 text-center hover:border-[#014923] hover:shadow-xs transition-all"
            >
              <span className="font-bold text-xs text-slate-800 block truncate">
                {uLink.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

