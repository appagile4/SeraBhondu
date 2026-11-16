import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import {
  FileText,
  ShieldCheck,
  AlertOctagon,
  Scale,
  Ban,
  CheckCircle2,
  Clock,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Use — Serabondhu | Marketplace Legal Agreement",
  description:
    "Serabondhu Terms of Service and User Agreement. Review our marketplace policies, seller obligations, prohibited goods list, and legal governing laws in Bangladesh.",
};

const SECTIONS = [
  { id: "acceptance", title: "1. Acceptance of Terms & Eligibility" },
  { id: "platform-nature", title: "2. Nature of Serabondhu Platform" },
  { id: "accounts", title: "3. User Accounts & Security" },
  { id: "listing-rules", title: "4. Listing Policies & Guidelines" },
  { id: "prohibited-items", title: "5. Strictly Prohibited Goods & Services" },
  { id: "intellectual-property", title: "6. Intellectual Property & Content" },
  { id: "disclaimers", title: "7. Disclaimers & Limitation of Liability" },
  { id: "governing-law", title: "8. Governing Law & Jurisdiction" },
];

export default function TermsOfUsePage() {
  return (
    <div className="space-y-12 sm:space-y-16 pb-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-[#014923]">
          Home
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">Terms of Use</span>
      </nav>

      {/* Hero */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#013819] via-[#014923] to-[#001844] text-white p-8 sm:p-12 shadow-xl">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-orange-300">
            <Scale className="w-3.5 h-3.5" />
            <span>Legal Agreement &amp; User Terms</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Terms of <span className="text-[#E30613]">Use</span>
          </h1>

          <p className="text-sm sm:text-base text-blue-100 leading-relaxed">
            Please read these terms carefully before accessing or using Serabondhu (serabondhu.net). By registering, posting, or browsing, you agree to be bound by this agreement under the laws of Bangladesh.
          </p>

          <div className="flex items-center gap-2 text-xs text-blue-200 pt-1">
            <Clock className="w-4 h-4" />
            <span>Last Updated: November 2026 • Effective in all 8 divisions of Bangladesh</span>
          </div>
        </div>
      </div>

      {/* Main Content & Table of Contents Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sticky Table of Contents */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              On This Page
            </h3>
            <nav className="space-y-1 text-xs">
              {SECTIONS.map((sec) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  className="block py-1.5 px-2 rounded-lg text-slate-600 hover:text-[#014923] hover:bg-emerald-50/50 transition-colors"
                >
                  {sec.title}
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Legal Text (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-10 text-slate-700 leading-relaxed text-sm">
          {/* Section 1 */}
          <section id="acceptance" className="space-y-3 scroll-mt-28">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
              1. Acceptance of Terms &amp; Eligibility
            </h2>
            <p>
              By accessing, browsing, registering on, or utilizing <strong>Serabondhu</strong> (referred to herein as &quot;Serabondhu&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;the Platform&quot;, operating via <code>serabondhu.net</code> and related mobile applications), you acknowledge that you have read, understood, and agree to be bound by these Terms of Use and our Privacy Policy.
            </p>
            <p>
              To use Serabondhu, you must be at least 18 years of age or possess the legal capacity to form a binding contract under the laws of Bangladesh. If you are registering an account on behalf of a registered business, company, or auto showroom in Bangladesh, you warrant that you are authorized to bind that entity.
            </p>
          </section>

          {/* Section 2 */}
          <section id="platform-nature" className="space-y-3 scroll-mt-28">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
              2. Nature of Serabondhu Platform
            </h2>
            <p>
              Serabondhu serves as an online neutral classified marketplace connecting third-party buyers, sellers, and service providers. Serabondhu is not an auction house, retail merchant, or escrow service.
            </p>
            <div className="bg-emerald-50/60 border border-emerald-200 p-4 rounded-xl text-xs text-emerald-900 space-y-1">
              <strong>Notice Regarding Transactions:</strong> Serabondhu is not a party to the actual transaction between buyers and sellers. We do not hold physical inventory, guarantee the quality or legality of listed items, or manage physical shipping. Buyers and sellers transact directly and are solely responsible for inspecting goods and verifying payments.
            </div>
          </section>

          {/* Section 3 */}
          <section id="accounts" className="space-y-3 scroll-mt-28">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
              3. User Accounts &amp; Security
            </h2>
            <p>
              Users must provide accurate, current, and verifiable contact information, including a valid Bangladeshi mobile phone number. You are responsible for safeguarding your login credentials and one-time passwords (OTP).
            </p>
            <p>
              Serabondhu reserves the right to suspend, terminate, or restrict any account suspected of fraud, harassment, impersonation, or creating multiple duplicate accounts to bypass marketplace listing limits.
            </p>
          </section>

          {/* Section 4 */}
          <section id="listing-rules" className="space-y-3 scroll-mt-28">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
              4. Listing Policies &amp; Guidelines
            </h2>
            <p>
              When publishing an advertisement on Serabondhu, you agree to:
            </p>
            <ul className="space-y-2 list-disc pl-5 text-xs sm:text-sm">
              <li>Provide accurate product specifications, truthful condition grading, and transparent pricing in Bangladeshese Rupees (NPR).</li>
              <li>Upload only genuine photographs of the actual item for sale. Generic stock images from foreign websites are prohibited for used goods.</li>
              <li>List items in their correct geographic district and relevant category.</li>
              <li>Mark items as &quot;Sold&quot; promptly once an agreement is reached.</li>
            </ul>
          </section>

          {/* Section 5: Prohibited Items */}
          <section id="prohibited-items" className="space-y-4 scroll-mt-28">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Ban className="w-5 h-5 text-red-600" />
              5. Strictly Prohibited Goods &amp; Services
            </h2>
            <p>
              The listing or advertisement of any of the following items is strictly forbidden on Serabondhu and will result in immediate permanent account termination and referral to the Bangladesh Police Cyber Bureau:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-red-50 p-3 rounded-xl border border-red-200">
                <span className="font-bold text-red-700 block">Firearms &amp; Weapons</span>
                <span className="text-slate-600">Guns, ammunition, military gear, and dangerous explosives.</span>
              </div>
              <div className="bg-red-50 p-3 rounded-xl border border-red-200">
                <span className="font-bold text-red-700 block">Stolen Property &amp; Contraband</span>
                <span className="text-slate-600">Items without legal ownership proof or vehicles with forged Bluebooks.</span>
              </div>
              <div className="bg-red-50 p-3 rounded-xl border border-red-200">
                <span className="font-bold text-red-700 block">Wildlife &amp; Protected Species</span>
                <span className="text-slate-600">Endangered animals, animal skins, horns, and restricted botanical herbs.</span>
              </div>
              <div className="bg-red-50 p-3 rounded-xl border border-red-200">
                <span className="font-bold text-red-700 block">Prescription Drugs &amp; Narcotics</span>
                <span className="text-slate-600">Controlled medicinal substances, illicit drugs, and unapproved pharmaceuticals.</span>
              </div>
              <div className="bg-red-50 p-3 rounded-xl border border-red-200">
                <span className="font-bold text-red-700 block">Pyramid &amp; MLM Schemes</span>
                <span className="text-slate-600">Multi-level marketing, quick-money schemes, and fake overseas visa offers.</span>
              </div>
              <div className="bg-red-50 p-3 rounded-xl border border-red-200">
                <span className="font-bold text-red-700 block">Adult Content &amp; Services</span>
                <span className="text-slate-600">Pornographic materials and unregulated adult entertainment services.</span>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section id="intellectual-property" className="space-y-3 scroll-mt-28">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
              6. Intellectual Property &amp; Content License
            </h2>
            <p>
              By submitting images, titles, and descriptions, you grant Serabondhu a non-exclusive, worldwide, royalty-free license to display, index, format, and share such listings to promote your items on the platform and associated search channels.
            </p>
            <p>
              All Serabondhu brand assets, trademarks, logo treatments, page designs, algorithms, and custom software code are the proprietary intellectual property of Serabondhu.
            </p>
          </section>

          {/* Section 7 */}
          <section id="disclaimers" className="space-y-3 scroll-mt-28">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
              7. Disclaimers &amp; Limitation of Liability
            </h2>
            <p>
              Serabondhu provides the service on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind. Under no circumstances shall Serabondhu, its directors, or its affiliates be liable for any direct, indirect, incidental, or consequential damages resulting from transactions conducted between users, fraudulent conduct by third parties, or system interruptions.
            </p>
          </section>

          {/* Section 8 */}
          <section id="governing-law" className="space-y-3 scroll-mt-28">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
              8. Governing Law &amp; Jurisdiction
            </h2>
            <p>
              These Terms shall be governed by, and construed in accordance with, the laws of <strong>Bangladesh</strong>, including the Electronic Transactions Act 2063 (2008) and the Muluki Civil Code 2074. Any dispute arising in connection with these terms shall be subject to the exclusive jurisdiction of the competent courts of <strong>Dhaka, Bangladesh</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

