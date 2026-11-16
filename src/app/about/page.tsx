import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/common/Button";
import {
  ShieldCheck,
  Users,
  MapPin,
  TrendingUp,
  Sparkles,
  Award,
  ArrowRight,
  CheckCircle2,
  Heart,
  Store,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us — KhojoBangla | Buy • Sell • Find in Bangladesh",
  description:
    "Learn about KhojoBangla, Bangladesh's modern online classified marketplace. Discover our mission, community values, and how we are empowering millions across Dhaka, Chattogram, and all 8 divisions.",
};

const STATS = [
  { label: "Active Listings", value: "50,000+", icon: Sparkles },
  { label: "Registered Traders", value: "150,000+", icon: Users },
  { label: "Districts Covered", value: "64 Districts", icon: MapPin },
  { label: "Listing Fee", value: "100% Free", icon: Award },
];

const CORE_VALUES = [
  {
    icon: ShieldCheck,
    title: "Uncompromising Trust",
    description:
      "We verify phone numbers, monitor spam, and actively fight fraud to ensure every transaction is genuine and secure.",
  },
  {
    icon: Heart,
    title: "Community First",
    description:
      "Built for Bangladeshis, by Bangladeshis. We connect local neighbors across Dhaka, Chattogram, Sylhet, and remote towns alike.",
  },
  {
    icon: TrendingUp,
    title: "Circular Economy",
    description:
      "Giving pre-owned electronics, vehicles, and furniture a second life reduces waste and keeps quality goods affordable.",
  },
  {
    icon: Store,
    title: "Empowering Local Businesses",
    description:
      "We provide small merchants, bike showrooms, and independent entrepreneurs with free digital storefronts to grow.",
  },
];

const MILESTONES = [
  {
    year: "2024",
    title: "The Genesis",
    description:
      "Founded with the conviction that Bangladesh deserved a fast, modern, mobile-first classified platform with zero listing fees.",
  },
  {
    year: "2025",
    title: "Province-Wide Expansion",
    description:
      "Expanded beyond Dhaka Valley to Dhaka, Gandaki, Koshi, Lumbini, and all 8 divisions with localized search filters.",
  },
  {
    year: "2026",
    title: "Next-Gen Classifieds",
    description:
      "Launched instant in-app messaging, verified seller badges, smart fraud detection, and dedicated business storefronts.",
  },
];

export default function AboutPage() {
  return (
    <div className="space-y-12 sm:space-y-16 pb-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-[#014923]">
          Home
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">About KhojoBangla</span>
      </nav>

      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#013819] via-[#014923] to-[#001844] text-white p-8 sm:p-12 lg:p-16 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#E30613]/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-orange-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Bangladesh&apos;s Fastest Growing Classified Marketplace</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Connecting Communities, <br />
            <span className="text-[#E30613]">Empowering Great Deals</span> Across Bangladesh.
          </h1>

          <p className="text-base sm:text-lg text-blue-100 leading-relaxed">
            KhojoBangla (<strong>khojobangla.com</strong>) was born out of a simple observation: buying and selling pre-owned goods in Bangladesh should be safe, effortless, and 100% free. Whether you are upgrading your smartphone in Chattogram, selling a family car in Dhaka, or searching for an apartment in Lalitpur, KhojoBangla brings trustworthy local buyers and sellers together.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link href="/post-ad">
              <Button size="lg" className="bg-[#E30613] hover:bg-[#E55F00] text-white shadow-lg">
                Post Your First Ad for Free
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="bg-transparent text-white border-2 border-white/50 hover:bg-white/15">
                Contact Our Team
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Counter */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {STATS.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col items-center text-center hover:border-[#014923]/40 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-[#014923]/10 text-[#014923] flex items-center justify-center mb-3">
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {stat.value}
              </span>
              <span className="text-xs text-slate-500 font-medium mt-1">
                {stat.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#E30613]/10 text-[#E30613] text-xs font-bold uppercase tracking-wider">
            Our Mission
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Making Commerce Honest, Frictionless, and Accessible to All
          </h2>
          <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
            In every Bangladeshi home, there are bicycles, electronics, textbooks, and furnishings waiting for a new purpose. At the same time, students, young professionals, and families are searching for quality goods at prices they can afford.
          </p>
          <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
            KhojoBangla bridges this gap with high-speed local search, direct buyer-to-seller messaging, fraud-prevention tools, and verified profiles. We believe that sustainable trade starts right in your neighborhood.
          </p>
          <ul className="space-y-3 pt-2 text-sm text-slate-700">
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Zero commissions and zero hidden charges for individual sellers</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Real-time local search across 64 Districts and 12+ categories</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Dedicated Trust &amp; Safety team monitoring listings 24/7</span>
            </li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-orange-50 rounded-3xl p-8 border border-slate-200/80 flex flex-col justify-center space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-3">
            <h3 className="text-lg font-bold text-[#014923] flex items-center gap-2">
              <Award className="w-5 h-5 text-[#E30613]" />
              Our Vision
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              To be the most trusted, loved, and widely utilized digital trading hub in the Himalayan region — where any individual or business can turn unused items into instant cash within minutes.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-3">
            <h3 className="text-lg font-bold text-[#014923] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#E30613]" />
              Safety Pledge
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              We uphold strict standards against fraud, stolen goods, and counterfeit electronics. Every listing is screened with automated filters and human moderation.
            </p>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            What Drives KhojoBangla
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Our values guide every design decision, code commit, and community interaction.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CORE_VALUES.map((val, idx) => {
            const Icon = val.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md hover:border-[#014923]/30 transition-all flex flex-col"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#014923] to-blue-600 text-white flex items-center justify-center mb-4 shadow-sm">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-slate-900 mb-2">
                  {val.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {val.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Journey & Milestones */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xs space-y-8">
        <div className="max-w-xl space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Our Journey So Far
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            How KhojoBangla grew into Bangladesh&apos;s preferred online trading community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {MILESTONES.map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 relative hover:bg-emerald-50/40 transition-colors"
            >
              <div className="text-2xl font-black text-[#E30613]">
                {item.year}
              </div>
              <h4 className="font-bold text-base text-slate-900">
                {item.title}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="rounded-3xl bg-gradient-to-r from-[#014923] to-[#013819] text-white p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="text-xl sm:text-2xl font-bold">
            Ready to Find Your Next Great Deal?
          </h3>
          <p className="text-xs sm:text-sm text-blue-100 max-w-lg">
            Join thousands of smart buyers and sellers across Bangladesh today. It takes less than 2 minutes to post your first advertisement.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/post-ad">
            <Button size="lg" className="bg-[#E30613] hover:bg-[#E55F00] text-white font-bold shadow-md">
              Post an Ad Now
            </Button>
          </Link>
          <Link href="/category/cars">
            <Button size="lg" variant="outline" className="bg-transparent text-white border-2 border-white/50 hover:bg-white/15">
              Browse Listings
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

