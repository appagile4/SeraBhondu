"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/common/Button";
import {
  HelpCircle,
  Search,
  ChevronDown,
  Sparkles,
  PhoneCall,
  Mail,
  ShieldCheck,
  CheckCircle2,
  FileQuestion,
  Headphones,
} from "lucide-react";

interface FAQItem {
  id: string;
  category: "Posting Ads" | "Buying & Safety" | "Account & Verification" | "Business & Dealers";
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  // Posting Ads
  {
    id: "post-1",
    category: "Posting Ads",
    question: "Is posting an advertisement really 100% free on KhojoBangla?",
    answer:
      "Yes! Individual buyers and sellers can post advertisements for cars, motorbikes, smartphones, real estate, furniture, and jobs completely free of charge with zero commissions or hidden listing fees.",
  },
  {
    id: "post-2",
    category: "Posting Ads",
    question: "How long does it take for my ad to go live after posting?",
    answer:
      "Most listings go live instantly! Our automated safety scanner approves 95% of listings within 60 seconds. If an ad contains restricted keywords or requires manual review by our Dhaka moderation team, it is typically approved within 15 to 30 minutes.",
  },
  {
    id: "post-3",
    category: "Posting Ads",
    question: "How many photos can I upload per advertisement?",
    answer:
      "You can upload up to 8 high-resolution photos per listing. We strongly recommend including clear daylight pictures showing the front, back, sides, original packaging, and any cosmetic flaws to attract serious buyers faster.",
  },
  {
    id: "post-4",
    category: "Posting Ads",
    question: "How long does my advertisement remain active on KhojoBangla?",
    answer:
      "Standard listings remain active for 60 days. You can easily bump, refresh, mark as sold, or renew your advertisement anytime from your User Profile Dashboard.",
  },

  // Buying & Safety
  {
    id: "buy-1",
    category: "Buying & Safety",
    question: "How do I contact a seller on KhojoBangla?",
    answer:
      "You can contact sellers directly through two methods: (1) Instant in-app messaging by clicking 'Chat with Seller', or (2) Calling the verified phone number displayed on the ad page (if the seller has chosen to share their number publicly).",
  },
  {
    id: "buy-2",
    category: "Buying & Safety",
    question: "Should I ever pay advance booking or courier charges?",
    answer:
      "NO. Never pay advance token deposits or courier fees via eSewa, Khalti, or bank transfer before you have physically met the seller and inspected the product in person. Advance token requests are almost always scams.",
  },
  {
    id: "buy-3",
    category: "Buying & Safety",
    question: "Where is the best place to meet a seller in Dhaka or Chattogram?",
    answer:
      "Always meet in daylight hours in crowded public places with CCTV surveillance, such as shopping malls (Bhatbhateni, Labim Mall, Civil Mall), major bank branches, or popular cafes near main chowks. Never meet in secluded locations alone.",
  },
  {
    id: "buy-4",
    category: "Buying & Safety",
    question: "How do I verify the Bluebook when buying a second-hand motorbike or scooter?",
    answer:
      "Ask the seller to show the physical Sawari Darta Kitab (Bluebook). Check that the engine number and chassis number stamped on the vehicle frame physically match the Bluebook. Also check that annual vehicle taxes (Sawari Kar) have been stamped and cleared up to the current fiscal year.",
  },

  // Account & Verification
  {
    id: "acc-1",
    category: "Account & Verification",
    question: "How do I get the 'Verified Seller' badge on my profile?",
    answer:
      "To obtain a Verified Seller badge, complete phone number SMS OTP verification, add a clear profile picture, and maintain a track record of genuine listings with positive buyer feedback. Business showrooms can also submit PAN/VAT registrations for the Dealer badge.",
  },
  {
    id: "acc-2",
    category: "Account & Verification",
    question: "Can I hide my phone number and only communicate via in-app chat?",
    answer:
      "Yes! When posting an advertisement or in your profile privacy settings, you can toggle 'Hide Phone Number'. Prospective buyers will only be able to reach you via KhojoBangla's secure in-app chat.",
  },
  {
    id: "acc-3",
    category: "Account & Verification",
    question: "I forgot my password. How do I reset it?",
    answer:
      "Click 'Login' in the top header, select 'Forgot Password?', enter your registered phone number or email address, and you will receive a secure 6-digit OTP code to create a new password.",
  },

  // Business & Dealers
  {
    id: "biz-1",
    category: "Business & Dealers",
    question: "What is KhojoBangla Business for auto showrooms and real estate agents?",
    answer:
      "KhojoBangla Business provides dedicated dealer storefront URLs, priority homepage featured placements, bulk CSV inventory upload, and direct WhatsApp lead generation for motor showrooms, real estate developers, and high-volume electronics retailers.",
  },
  {
    id: "biz-2",
    category: "Business & Dealers",
    question: "How do I sign up for a verified dealer subscription?",
    answer:
      "Visit our KhojoBangla for Businesses page (khojobangla.com/business) or contact our enterprise team directly at +977-1-4567890 to activate your showroom package.",
  },
];

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [openAccordion, setOpenAccordion] = useState<string | null>("post-1");

  const categories = [
    "All",
    "Posting Ads",
    "Buying & Safety",
    "Account & Verification",
    "Business & Dealers",
  ];

  const filteredFaqs = FAQS.filter((faq) => {
    const matchesCategory =
      selectedCategory === "All" || faq.category === selectedCategory;
    const matchesQuery =
      searchQuery.trim() === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  return (
    <div className="space-y-12 sm:space-y-16 pb-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-[#014923]">
          Home
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">Help Center &amp; FAQ</span>
      </nav>

      {/* Hero with Search Bar */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#013819] via-[#014923] to-[#001844] text-white p-8 sm:p-12 lg:p-16 shadow-xl text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-orange-300">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>KhojoBangla Knowledge Base &amp; FAQ</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            How Can We <span className="text-[#E30613]">Assist You</span>?
          </h1>

          <p className="text-sm sm:text-base text-blue-100 max-w-lg mx-auto leading-relaxed">
            Search our frequently asked questions or select a topic below to get quick answers to common questions about buying, selling, and safety.
          </p>

          {/* Search Box */}
          <div className="relative max-w-xl mx-auto pt-2">
            <input
              type="text"
              placeholder="Search help topics (e.g. 'how to post ad', 'bluebook', 'scams')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 py-3.5 pl-12 rounded-2xl bg-white text-slate-900 text-sm shadow-xl focus:outline-hidden focus:ring-2 focus:ring-[#E30613]"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 mt-1" />
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? "bg-[#014923] text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Accordion FAQ List */}
      <div className="max-w-3xl mx-auto space-y-4">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq) => {
            const isOpen = openAccordion === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleAccordion(faq.id)}
                  className="w-full text-left px-6 py-4.5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#E30613] bg-orange-50 px-2 py-0.5 rounded-md shrink-0">
                      {faq.category}
                    </span>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900">
                      {faq.question}
                    </h3>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-[#014923]" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/40">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 space-y-3">
            <FileQuestion className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="font-bold text-slate-800 text-sm">
              No matching help articles found
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try different keywords or contact our customer support team directly.
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              variant="outline"
              className="text-xs"
            >
              Clear Search Filters
            </Button>
          </div>
        )}
      </div>

      {/* Still Need Assistance Banner */}
      <div className="max-w-3xl mx-auto rounded-3xl bg-gradient-to-r from-[#014923] to-[#013819] text-white p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs text-orange-300 font-bold uppercase tracking-wider">
            <Headphones className="w-4 h-4" />
            <span>Still Need Assistance?</span>
          </div>
          <h3 className="text-xl font-bold">
            Our Dhaka Support Team is Here
          </h3>
          <p className="text-xs text-blue-100 max-w-sm">
            Call our toll-free line or open a support ticket. We respond Sunday to Friday, 9AM to 6PM.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/contact">
            <Button className="bg-[#E30613] hover:bg-[#E55F00] text-white font-bold shadow-md">
              Contact Support
            </Button>
          </Link>
          <a href="tel:+97714567890">
            <Button
              className="bg-white hover:bg-slate-100 text-[#014923] font-extrabold shadow-md flex items-center gap-2 border-0"
            >
              <PhoneCall className="w-4 h-4 text-[#E30613]" />
              <span>Call Hotline</span>
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}

