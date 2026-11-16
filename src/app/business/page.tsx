"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/common/Button";
import {
  Building2,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Store,
  Users,
  Sparkles,
  BarChart3,
  PhoneCall,
  Send,
  Zap,
} from "lucide-react";

const PACKAGES = [
  {
    name: "Dealer Starter",
    price: "৳ 4,999",
    period: "per month",
    description: "Ideal for independent bike reconditioned shops and boutique electronics stores.",
    features: [
      "Up to 30 Active Listings",
      "Verified Business Dealer Badge",
      "Dedicated Store Profile Page",
      "Direct WhatsApp Lead Button",
      "Standard Analytics & View Count",
      "Standard Email Support",
    ],
    popular: false,
    cta: "Select Starter",
  },
  {
    name: "Showroom Pro",
    price: "৳ 11,999",
    period: "per month",
    description: "The most popular plan for auto showrooms, real estate agencies, and retailers.",
    features: [
      "Up to 100 Active Listings",
      "10 Homepage Featured Spots monthly",
      "Verified Business Gold Badge",
      "Custom Store Banner & Social Links",
      "Priority WhatsApp & Call Enquiries",
      "Advanced Lead & Impression Insights",
      "Dedicated Relationship Manager",
    ],
    popular: true,
    cta: "Select Showroom Pro",
  },
  {
    name: "Enterprise Dealer",
    price: "৳ 24,999",
    period: "per month",
    description: "Tailored for major multi-branch auto franchises and large real estate developers.",
    features: [
      "Unlimited Active Listings",
      "30 Homepage & Category-Top Placements",
      "VIP Diamond Dealer Badge",
      "Automatic Bulk CSV / API Inventory Sync",
      "Dedicated Account Executive in Dhaka",
      "Custom Promotional Email Blasts",
      "24/7 Priority Hotline Support",
    ],
    popular: false,
    cta: "Contact Enterprise",
  },
];

export default function BusinessPage() {
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    contactName: "",
    phone: "",
    email: "",
    city: "Dhaka",
    industry: "Auto Showroom / Vehicles",
    expectedAds: "10-30 ads/month",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySubmitted(true);
  };

  return (
    <div className="space-y-12 sm:space-y-16 pb-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-[#014923]">
          Home
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">KhojoBangla for Businesses</span>
      </nav>

      {/* Hero */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#013819] via-[#014923] to-[#001844] text-white p-8 sm:p-12 lg:p-16 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#E30613]/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-orange-300">
            <Building2 className="w-3.5 h-3.5" />
            <span>Bangladesh&apos;s High-Impact B2B &amp; Dealer Marketplace</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Put Your Inventory in Front of <br />
            <span className="text-[#E30613]">150,000+ Active Buyers</span> Each Month.
          </h1>

          <p className="text-base sm:text-lg text-blue-100 leading-relaxed">
            Whether you run a motor showroom in Teku, a real estate consultancy in Chattogram, or a digital appliance warehouse in Sylhet, KhojoBangla Business gives you the verified brand credibility, analytics, and direct buyer leads you need to close deals faster.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <a href="#inquiry-form">
              <Button size="lg" className="bg-[#E30613] hover:bg-[#E55F00] text-white font-bold shadow-lg">
                Request Dealer Partnership
              </Button>
            </a>
            <a href="#plans">
              <Button size="lg" variant="outline" className="bg-transparent text-white border-2 border-white/50 hover:bg-white/15">
                View Pricing Packages
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Why Partner Grid */}
      <div className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#014923]/10 text-[#014923] text-xs font-bold uppercase tracking-wider">
            Dealer Advantages
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Why Top Bangladeshi Showrooms Choose KhojoBangla
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Built specifically to solve high listing costs and low conversion rates on legacy classifieds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#014923] flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6 text-[#014923]" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Verified Dealer Authority</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Showcase official business verification badges and showroom trade licenses. Buyers buy with 3x higher trust when purchasing from verified businesses.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#E30613] flex items-center justify-center font-bold">
              <Store className="w-6 h-6 text-[#E30613]" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Dedicated Brand Storefront</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Get your own custom URL (e.g., <code className="text-[#014923]">khojobangla.com/store/your-showroom</code>) featuring all your active vehicles or properties, contact buttons, and location maps.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Zap className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Instant WhatsApp &amp; Call Leads</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Direct hot buyer leads straight to your sales executive&apos;s WhatsApp or showroom phone number with pre-filled vehicle details so deals never go cold.
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Packages */}
      <div id="plans" className="space-y-8 scroll-mt-24">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Transparent Dealer Packages
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            No long-term lock-ins. Upgrade, downgrade, or cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PACKAGES.map((pkg, idx) => (
            <div
              key={idx}
              className={`relative rounded-3xl p-8 border flex flex-col justify-between transition-all ${
                pkg.popular
                  ? "bg-white border-[#014923] shadow-xl ring-2 ring-[#014923]"
                  : "bg-white border-slate-200 shadow-xs hover:border-slate-300"
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#E30613] text-white text-[11px] font-bold uppercase tracking-wider shadow-sm">
                  Most Popular
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {pkg.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 min-h-[32px]">
                    {pkg.description}
                  </p>
                </div>

                <div className="border-b border-slate-100 pb-6">
                  <span className="text-3xl font-extrabold text-slate-900">
                    {pkg.price}
                  </span>
                  <span className="text-xs text-slate-500 ml-1">
                    /{pkg.period}
                  </span>
                </div>

                <ul className="space-y-3 text-xs text-slate-600">
                  {pkg.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                <a href="#inquiry-form">
                  <Button
                    className={`w-full font-bold text-xs py-2.5 rounded-xl ${
                      pkg.popular
                        ? "bg-[#014923] hover:bg-[#003893] text-white"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                    }`}
                  >
                    {pkg.cta}
                  </Button>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inquiry Form */}
      <div id="inquiry-form" className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs scroll-mt-24">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Apply for Business Account
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Tell us about your business and our B2B team in Dhaka will activate your verified storefront within 24 hours.
            </p>
          </div>

          {!inquirySubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Business / Showroom Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dhaka Auto Hub"
                    value={formData.businessName}
                    onChange={(e) =>
                      setFormData({ ...formData, businessName: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-[#014923] focus:ring-1 focus:ring-[#014923]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Person Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Suresh Maharjan"
                    value={formData.contactName}
                    onChange={(e) =>
                      setFormData({ ...formData, contactName: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-[#014923] focus:ring-1 focus:ring-[#014923]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="98XXXXXXXX"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-[#014923] focus:ring-1 focus:ring-[#014923]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="info@Dhakaauto.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-[#014923] focus:ring-1 focus:ring-[#014923]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City / Primary Market *
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white focus:border-[#014923] focus:ring-1 focus:ring-[#014923]"
                  >
                    <option value="Dhaka">Dhaka</option>
                    <option value="Chattogram">Chattogram</option>
                    <option value="Lalitpur">Lalitpur</option>
                    <option value="Bhaktapur">Bhaktapur</option>
                    <option value="Sylhet">Bharatpur / Sylhet</option>
                    <option value="Biratnagar">Biratnagar</option>
                    <option value="Butwal">Butwal</option>
                    <option value="Other">Other City in Bangladesh</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Industry / Category *
                  </label>
                  <select
                    value={formData.industry}
                    onChange={(e) =>
                      setFormData({ ...formData, industry: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white focus:border-[#014923] focus:ring-1 focus:ring-[#014923]"
                  >
                    <option value="Auto Showroom / Vehicles">Auto Showroom / Reconditioned</option>
                    <option value="Real Estate / Housing">Real Estate Agency / Developer</option>
                    <option value="Electronics & Mobile Retail">Electronics &amp; Mobiles Store</option>
                    <option value="Furniture & Home Decor">Furniture Showroom</option>
                    <option value="Commercial Equipment">Commercial &amp; Heavy Vehicles</option>
                    <option value="Services & Agency">Professional Services</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Additional Notes or Questions
                </label>
                <textarea
                  rows={3}
                  placeholder="Share details about your showroom inventory or custom requirements..."
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-[#014923] focus:ring-1 focus:ring-[#014923]"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-[#E30613] hover:bg-[#E55F00] text-white font-bold shadow-md flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Business Application</span>
                </Button>
              </div>
            </form>
          ) : (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Application Received!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
                Thank you, <strong>{formData.contactName}</strong> from <strong>{formData.businessName}</strong>. Our enterprise representative will call you on <strong>{formData.phone}</strong> within 1 business day.
              </p>
              <Button
                onClick={() => setInquirySubmitted(false)}
                className="bg-[#014923] text-white"
              >
                Submit Another Request
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

