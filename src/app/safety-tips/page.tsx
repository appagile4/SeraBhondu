import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { Button } from "@/components/common/Button";
import {
  ShieldCheck,
  AlertTriangle,
  Eye,
  CreditCard,
  MapPin,
  FileCheck,
  Users,
  CheckCircle2,
  XCircle,
  HelpCircle,
  PhoneCall,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Safety Tips for Buyers & Sellers — KhojoBangla | Safe Classifieds in Bangladesh",
  description:
    "Essential safety tips for buying and selling second-hand goods in Bangladesh. Learn how to inspect used cars, bikes, and mobiles safely and avoid common marketplace scams.",
};

const GOLDEN_RULES = [
  {
    icon: MapPin,
    title: "1. Meet in Busy, Well-Lit Public Places",
    description:
      "Always arrange physical meetings in bustling public places during daylight hours. Ideal locations in Dhaka & Chattogram include shopping complexes (e.g. Bhatbhateni, Labim Mall, Civil Mall), major bank lobbies, or cafes near main intersections. Never meet in secluded alleys or private residences alone.",
  },
  {
    icon: Eye,
    title: "2. Inspect the Item In-Person Before Handing Over Money",
    description:
      "Thoroughly inspect the product before finalizing any transaction. For smartphones and laptops, verify iCloud / Google account signouts, IMEI numbers against official boxes, and battery health. For bikes and cars, test ride in an open area and inspect undercarriage and engine noise.",
  },
  {
    icon: CreditCard,
    title: "3. Never Pay Advance 'Booking' or 'Delivery' Fees",
    description:
      "Legitimate sellers do not demand advance token deposits before you have personally examined the item. Never transfer money via eSewa, Khalti, IME Pay, or bank transfer in advance to 'hold' an item or cover imaginary courier charges.",
  },
  {
    icon: FileCheck,
    title: "4. Verify Official Bluebook Papers & Chassis Numbers",
    description:
      "When purchasing used motorbikes, scooters, or cars, inspect the official government Bluebook (Sawari Darta Kitab). Ensure the chassis and engine numbers stamped on the vehicle physically match the book, and check that annual vehicle taxes (Sawari Kar) are up to date at the Department of Transport Management (Yatayat Karyalaya).",
  },
  {
    icon: Users,
    title: "5. Bring a Friend or Subject-Matter Expert",
    description:
      "For significant purchases (such as automobiles, cameras, musical instruments, or rented properties), bring along a knowledgeable friend or trusted local mechanic. A second pair of eyes helps spot cosmetic touch-ups, engine leaks, and hidden defects.",
  },
];

const DOS_AND_DONTS = {
  dos: [
    "Test smartphones thoroughly: make a test phone call, test WiFi, camera, speaker, and touchscreen.",
    "Verify seller's identity on KhojoBangla: look for the 'Verified Seller' badge and member join date.",
    "Pay via digital transfer (Fonepay / eSewa) ONLY after you have physical possession of the product.",
    "Ask for original purchase receipts, warranty cards, and packaging when available.",
    "Report suspicious ads immediately using the 'Report Ad' flag on KhojoBangla.",
  ],
  donts: [
    "Never send advance deposits, earnest money, or transport courier fees before inspection.",
    "Don't accept fake payment confirmation screenshots — verify your own bank/eSewa balance directly.",
    "Never scan unfamiliar QR codes that claim to 'send you money' — QR codes authorize debits, not credits.",
    "Avoid deals that appear 'too good to be true' (e.g. iPhone 15 Pro for Rs. 35,000 is always a scam).",
    "Do not share OTP codes, banking passwords, or national citizenship card copies with strangers.",
  ],
};

export default function SafetyTipsPage() {
  return (
    <div className="space-y-12 sm:space-y-16 pb-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-[#014923]">
          Home
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">Safety Tips for Buyers</span>
      </nav>

      {/* Official Safety & Security Hero Banner */}
      <div className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/80 bg-[#014923]">
        <div className="relative w-full aspect-[1024/341]">
          <Image
            src="/KhojoBangla-safety-banner.jpg"
            alt="Safety Tips for Smart Buyers & Sellers in Bangladesh — KhojoBangla. Safe, Secure, Trusted Marketplace."
            fill
            priority
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1280px"
            className="object-cover object-center"
          />
        </div>
      </div>

      {/* 5 Golden Rules */}
      <div className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#014923]/10 text-[#014923] text-xs font-bold uppercase tracking-wider">
            Essential Guidelines
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            The 5 Golden Rules of Safe Classifieds
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Follow these rules on every classified deal to eliminate 99.9% of transaction risks.
          </p>
        </div>

        <div className="space-y-4">
          {GOLDEN_RULES.map((rule, idx) => {
            const Icon = rule.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs hover:border-[#014923]/40 transition-all flex flex-col sm:flex-row gap-5 items-start"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#014923] flex items-center justify-center shrink-0 shadow-xs">
                  <Icon className="w-6 h-6 text-[#E30613]" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-base sm:text-lg text-slate-900">
                    {rule.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {rule.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Do's and Don'ts Comparison Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Do&apos;s &amp; Don&apos;ts Quick Reference
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Keep this checklist in mind whenever meeting a buyer or seller.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Do's */}
          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2.5 text-emerald-800 font-bold text-base">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <span>Always DO These:</span>
            </div>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
              {DOS_AND_DONTS.dos.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-2" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Don'ts */}
          <div className="bg-rose-50/60 border border-rose-200/80 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2.5 text-rose-800 font-bold text-base">
              <XCircle className="w-6 h-6 text-rose-600" />
              <span>NEVER Do These:</span>
            </div>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
              {DOS_AND_DONTS.donts.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0 mt-2" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Special Inspection Advice for High-Ticket Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-900 text-sm text-[#014923]">
            Used Bikes &amp; Scooters
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Check engine sound upon cold start. Verify battery charging, tire tread life, and front suspension oil seals. Ensure no loan or police confiscation hold exists at Yatayat.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-900 text-sm text-[#014923]">
            Used Smartphones (iPhones &amp; Androids)
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Dial <code>*#06#</code> to cross-verify the IMEI with the original box. Check MDMS registration on the official Bangladesh Telecommunications Authority (NTA) portal to prevent sim blockages.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-900 text-sm text-[#014923]">
            Real Estate &amp; Apartments
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Inspect the Lalpurja (Land Ownership Certificate) and check cadastral maps at the local Malpot Karyalaya (Land Revenue Office) before providing any earnest agreement deposits.
          </p>
        </div>
      </div>

      {/* Cross link to Fraud Awareness */}
      <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs text-orange-400 font-bold uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Fraud Prevention Center</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold">
            Learn How Scammers Operate in Bangladesh
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg">
            Review real-life case studies of fake payment screenshots, overpayment tricks, and advance-fee courier scams in our comprehensive Fraud Awareness Guide.
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-3">
          <Link href="/fraud-awareness">
            <Button size="lg" className="bg-[#E30613] hover:bg-[#E55F00] text-white font-bold shadow-md">
              Read Fraud Guide
            </Button>
          </Link>
          <Link href="/contact">
            <Button size="lg" variant="outline" className="bg-transparent text-white border-2 border-white/50 hover:bg-white/15">
              Report an Issue
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

