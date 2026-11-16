import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import {
  ShieldCheck,
  Lock,
  Eye,
  Database,
  Smartphone,
  Cookie,
  UserCheck,
  Clock,
  Mail,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — Serabondhu | Data Protection & Phone Privacy in Bangladesh",
  description:
    "Serabondhu Privacy Policy. Learn how we collect, protect, and respect your personal information, phone number privacy, and browsing data in Bangladesh.",
};

const SECTIONS = [
  { id: "collection", title: "1. Information We Collect" },
  { id: "usage", title: "2. How We Use Your Information" },
  { id: "phone-privacy", title: "3. Phone Number Privacy & In-App Chat" },
  { id: "cookies", title: "4. Cookies & Local Browser Storage" },
  { id: "sharing", title: "5. Information Sharing & Disclosures" },
  { id: "security", title: "6. Data Security & Storage" },
  { id: "rights", title: "7. Your Data Rights & Deletion Requests" },
  { id: "contact-dpo", title: "8. Contact Data Privacy Officer" },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="space-y-12 sm:space-y-16 pb-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-[#014923]">
          Home
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">Privacy Policy</span>
      </nav>

      {/* Hero */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#013819] via-[#014923] to-[#001844] text-white p-8 sm:p-12 shadow-xl">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-orange-300">
            <Lock className="w-3.5 h-3.5" />
            <span>Data Protection &amp; Confidentiality</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Privacy <span className="text-[#E30613]">Policy</span>
          </h1>

          <p className="text-sm sm:text-base text-blue-100 leading-relaxed">
            Your trust and privacy are fundamental to Serabondhu. This policy explains what information we collect, how it is secured, and the granular controls you have over your personal data.
          </p>

          <div className="flex items-center gap-2 text-xs text-blue-200 pt-1">
            <Clock className="w-4 h-4" />
            <span>Last Updated: November 2026 • Compliant with Individual Privacy Act of Bangladesh</span>
          </div>
        </div>
      </div>

      {/* Main Content & Table of Contents Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sticky Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Policy Sections
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

        {/* Legal Text */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-10 text-slate-700 leading-relaxed text-sm">
          {/* Section 1 */}
          <section id="collection" className="space-y-3 scroll-mt-28">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
              1. Information We Collect
            </h2>
            <p>
              When you interact with Serabondhu (serabondhu.net), we collect certain categories of personal and usage information:
            </p>
            <ul className="space-y-2 list-disc pl-5 text-xs sm:text-sm">
              <li>
                <strong>Account &amp; Profile Information:</strong> Your name, email address, and mobile phone number provided during registration or ad posting.
              </li>
              <li>
                <strong>Listing Information:</strong> Titles, descriptions, asking prices, photos, approximate location (city/district), and item specifications.
              </li>
              <li>
                <strong>Communications:</strong> Messages exchanged with other users through our in-app chat infrastructure (monitored automatically for scam patterns and abusive language).
              </li>
              <li>
                <strong>Technical &amp; Log Data:</strong> IP address, browser type, device identifiers, and timestamp data used to detect automated scraping and account takeover attempts.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section id="usage" className="space-y-3 scroll-mt-28">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
              2. How We Use Your Information
            </h2>
            <p>
              We process your data strictly to facilitate the marketplace experience, specifically:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="font-bold text-slate-900 block mb-1">Connecting Buyers &amp; Sellers</span>
                Displaying your ads, enabling direct calls or in-app chat conversations.
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="font-bold text-slate-900 block mb-1">Fraud Prevention &amp; Safety</span>
                Detecting advance-fee scams, counterfeit listings, and verifying seller authenticity.
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="font-bold text-slate-900 block mb-1">Service Communications</span>
                Sending important SMS OTPs, password reset links, and listing expiration notices.
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="font-bold text-slate-900 block mb-1">Continuous Platform Improvement</span>
                Optimizing search relevance, category navigation, and server responsiveness.
              </div>
            </div>
          </section>

          {/* Section 3: Phone Privacy */}
          <section id="phone-privacy" className="space-y-3 scroll-mt-28">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-[#014923]" />
              3. Phone Number Privacy &amp; In-App Chat
            </h2>
            <p>
              We respect your right to avoid unsolicited calls or spam. When creating or editing any advertisement, you have full control over how buyers contact you:
            </p>
            <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-xl text-xs text-emerald-900 space-y-1">
              <strong>Phone Number Privacy Feature:</strong> You can select the &quot;Hide Phone Number&quot; option when posting. When enabled, your phone number will never be exposed on the public webpage, and all prospective buyers will communicate with you exclusively through Serabondhu&apos;s encrypted in-app messaging system.
            </div>
          </section>

          {/* Section 4: Cookies */}
          <section id="cookies" className="space-y-3 scroll-mt-28">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Cookie className="w-5 h-5 text-[#E30613]" />
              4. Cookies &amp; Local Browser Storage
            </h2>
            <p>
              Serabondhu uses cookies and browser local storage (<code>localStorage</code>) to store essential session preferences, including:
            </p>
            <ul className="space-y-1.5 list-disc pl-5 text-xs sm:text-sm">
              <li>Your chosen browsing location (e.g. Dhaka, Chattogram).</li>
              <li>Your saved wishlist advertisements.</li>
              <li>Recent search terms for rapid autocompletion.</li>
              <li>Authentication session tokens to keep you logged in securely.</li>
            </ul>
            <p className="text-xs text-slate-500">
              We do not sell your personal browsing habits to third-party data brokers.
            </p>
          </section>

          {/* Section 5 */}
          <section id="sharing" className="space-y-3 scroll-mt-28">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
              5. Information Sharing &amp; Legal Disclosures
            </h2>
            <p>
              Serabondhu does not sell, rent, or trade your personal information. We may share data under the following limited conditions:
            </p>
            <ul className="space-y-2 list-disc pl-5 text-xs sm:text-sm">
              <li>
                <strong>Public Listings:</strong> Information you voluntarily include in your public advertisement (title, description, photos, price) is accessible to internet users.
              </li>
              <li>
                <strong>Law Enforcement Compliance:</strong> When required by lawful court order, warrant, or official subpoena issued by the <strong>Bangladesh Police Cyber Bureau</strong> or competent judicial bodies investigating criminal fraud, theft, or national security offenses.
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section id="security" className="space-y-3 scroll-mt-28">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
              6. Data Security &amp; Retention
            </h2>
            <p>
              All traffic between your browser and Serabondhu is encrypted using 256-bit TLS/SSL encryption. Passwords and credentials are stored using salted cryptographic hash functions.
            </p>
            <p>
              We retain account information for as long as your account remains active. If an ad expires or is marked as sold, it is archived from public search indexing.
            </p>
          </section>

          {/* Section 7 */}
          <section id="rights" className="space-y-3 scroll-mt-28">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
              7. Your Data Rights &amp; Deletion Requests
            </h2>
            <p>
              Under the privacy principles of Bangladesh, you have the right to access, update, correct, or request the complete deletion of your account and associated listing records at any time.
            </p>
            <p>
              To request account deletion or obtain a copy of your personal data, send an email from your registered email address to <code>privacy@serabondhu.net</code> with the subject &quot;Account Deletion Request&quot;.
            </p>
          </section>

          {/* Section 8 */}
          <section id="contact-dpo" className="space-y-3 scroll-mt-28">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
              8. Contact Data Privacy Officer
            </h2>
            <p>
              If you have any questions, concerns, or grievances regarding this Privacy Policy or our data handling practices, please contact our team:
            </p>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1">
              <p className="font-bold text-slate-900">Data Protection Officer — Serabondhu</p>
              <p>Jhamsikhel Road, Ward No. 3, Lalitpur, Bangladesh</p>
              <p>Email: <a href="mailto:privacy@serabondhu.net" className="text-[#014923] hover:underline">privacy@serabondhu.net</a></p>
              <p>Helpline: +977-1-4567890 (Ext. 4)</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

