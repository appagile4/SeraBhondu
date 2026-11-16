import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { Button } from "@/components/common/Button";
import {
  ShieldAlert,
  AlertTriangle,
  Flame,
  QrCode,
  FileX,
  UserX,
  CreditCard,
  PhoneCall,
  CheckCircle2,
  ExternalLink,
  LifeBuoy,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Fraud Awareness Guide — Serabondhu | Recognizing & Preventing Scams in Bangladesh",
  description:
    "Comprehensive guide on common classified scams in Bangladesh. Learn how to identify advance payment fraud, fake bKash/Nagad screenshots, QR code phishing, and how to report scammers.",
};

const TOP_SCAMS = [
  {
    icon: Flame,
    title: "1. The 'Advance Booking Token' Scam",
    scenario: "A seller posts an iPhone 15 Pro for ৳ 45,000 (market price ৳ 140,000+) or a Yamaha R15 bike for ৳ 180,000.",
    mechanism:
      "When you contact them, they claim multiple buyers are offering cash and demand a 'token advance' of ৳ 2,000 to ৳ 10,000 via bKash / Nagad / Rocket to hold the item. Once money is sent, their phone is immediately switched off or your number is blocked.",
    prevention:
      "NEVER pay advance booking tokens. Legitimate sellers will gladly let you inspect the item in person before discussing payment.",
  },
  {
    icon: FileX,
    title: "2. The Fake Payment Screenshot Scam",
    scenario: "A buyer contacts you for an expensive laptop, camera, or phone that you have listed for sale.",
    mechanism:
      "They meet you or request delivery, then show you a realistic-looking bKash / Nagad / Bank Mobile App 'Payment Successful' screenshot on their phone. They claim 'the SMS is delayed due to network lag' and pressure you to release the item.",
    prevention:
      "Never rely on the buyer's phone screen. Check your own mobile banking or digital wallet balance directly on your own device and confirm the credited balance before letting the buyer leave.",
  },
  {
    icon: QrCode,
    title: "3. The 'Scan QR Code to Receive Money' Phishing Scam",
    scenario: "A scammer claims they are ready to purchase your item and wants to send payment digitally.",
    mechanism:
      "They send you a QR code on WhatsApp or Telegram and instruct: 'Please open your bKash / banking app and scan this QR code to receive the ৳ 25,000 into your account.' In reality, scanning a QR code and entering your PIN authorizes a payment OUT of your account, draining your balance.",
    prevention:
      "Scanning a QR code NEVER receives money into your account. To receive money, the buyer must scan YOUR personal QR code, or transfer funds to your phone number or account number directly without you entering any PIN.",
  },
  {
    icon: UserX,
    title: "4. Army / Police Official Impersonation",
    scenario: "The seller posts photos of a vehicle with a profile photo in military or police uniform.",
    mechanism:
      "They claim they have been urgently transferred to a remote border cantonment and need to liquidate their bike or car immediately. They send fake ID cards to build false trust and ask for transport courier fees in advance.",
    prevention:
      "Authentic security personnel conduct transactions in person just like any other citizen. Do not let military uniforms or badge pictures lull you into transferring money in advance.",
  },
  {
    icon: CreditCard,
    title: "5. The Overpayment / Accidental Transfer Scam",
    scenario: "A buyer 'accidentally' sends an edited receipt showing they transferred ৳ 50,000 instead of ৳ 5,000.",
    mechanism:
      "They panic and demand that you immediately refund the 'excess' ৳ 45,000 to their alternate bKash number. If you comply, you end up sending your own genuine funds while their initial payment was fictitious.",
    prevention:
      "Always check your actual statement with your bank or wallet provider. If an unverified credit appears, report it to customer support rather than refunding to a third-party account.",
  },
];

const RED_FLAGS = [
  "Price is radically lower than market benchmark (more than 50% discount on mint electronics).",
  "Seller refuses to meet in a public location in person or allow physical inspection.",
  "Insistence on instant digital token transfer (bKash / Nagad / Rocket) before meeting.",
  "Pressure tactics: claiming 'another buyer is offering more cash right now if you don't send token'.",
  "Seller claims to be in a remote district and offers to send the product via courier upon advance payment.",
  "Account was created today and has zero verification badges or past transaction tenure.",
];

export default function FraudAwarenessPage() {
  return (
    <div className="space-y-12 sm:space-y-16 pb-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-[#014923]">
          Home
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">Fraud Awareness Guide</span>
      </nav>

      {/* Official Fraud Prevention & Awareness Hero Banner Graphic */}
      <div className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/80 bg-[#014923]">
        <div className="relative w-full aspect-[1024/350]">
          <Image
            src="/Serabondhu-fraud-banner.jpg"
            alt="Spot Scams, Protect Your Money in Bangladesh — Serabondhu Fraud Prevention & Awareness Portal"
            fill
            priority
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1280px"
            className="object-cover object-center"
          />
        </div>
      </div>

      {/* Red Flags Alert Banner */}
      <div className="bg-amber-50 border border-amber-300/80 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex items-center gap-3 text-amber-900 font-bold text-lg">
          <AlertTriangle className="w-6 h-6 text-[#E30613] shrink-0" />
          <span>Warning Signs: The Top 6 Red Flags of a Classified Scam</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-700">
          {RED_FLAGS.map((flag, idx) => (
            <div key={idx} className="flex items-start gap-2.5 bg-white/80 p-3 rounded-xl border border-amber-200/60">
              <span className="w-2 h-2 rounded-full bg-[#E30613] shrink-0 mt-1.5" />
              <span>{flag}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Scams Breakdown */}
      <div className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-red-50 text-red-600 text-xs font-bold uppercase tracking-wider">
            Case Studies
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            How Scammers Operate in Bangladesh
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Real scenarios reported across Dhaka, Chattogram, and major trading hubs.
          </p>
        </div>

        <div className="space-y-6">
          {TOP_SCAMS.map((scam, idx) => {
            const Icon = scam.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4 hover:border-red-300 transition-all"
              >
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base sm:text-lg text-slate-900">
                    {scam.title}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      The Bait / Scenario
                    </span>
                    <p className="text-slate-700 leading-relaxed">
                      {scam.scenario}
                    </p>
                  </div>

                  <div className="bg-red-50/50 p-4 rounded-xl border border-red-200/60 space-y-1">
                    <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider block">
                      The Trap &amp; Mechanism
                    </span>
                    <p className="text-slate-700 leading-relaxed">
                      {scam.mechanism}
                    </p>
                  </div>

                  <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200/60 space-y-1">
                    <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                      How to Protect Yourself
                    </span>
                    <p className="text-slate-700 leading-relaxed font-medium">
                      {scam.prevention}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* What to do if you were scammed */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
          <LifeBuoy className="w-6 h-6 text-[#014923]" />
          What to Do If You Were Targeted or Scammed
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
            <span className="w-7 h-7 rounded-full bg-[#014923] text-white text-xs font-bold flex items-center justify-center">
              1
            </span>
            <h4 className="font-bold text-slate-900 text-sm">
              Call Your Wallet / Bank Immediately
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Contact eSewa (1660-01-02121), Khalti (1660-01-58888), or your issuing bank to freeze the recipient&apos;s transaction immediately before they cash out.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-orange-50/60 border border-orange-200 space-y-2">
            <span className="w-7 h-7 rounded-full bg-[#E30613] text-white text-xs font-bold flex items-center justify-center">
              2
            </span>
            <h4 className="font-bold text-slate-900 text-sm">
              File a Police Cyber Bureau Report
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Bangladesh Police Cyber Bureau (Bhotebahal, Dhaka) handles digital fraud. Call their 24/7 hotline at <strong>1177</strong> or email <code>cyberbureau@Bangladeshpolice.gov.np</code>.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
            <span className="w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
              3
            </span>
            <h4 className="font-bold text-slate-900 text-sm">
              Notify Serabondhu Fraud Desk
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Submit a ticket or call Serabondhu at <strong>+977-1-4567890</strong> with the ad URL and scammer phone number so we can blacklist their IP, phone, and active listings.
            </p>
          </div>
        </div>

        <div className="pt-4 flex flex-wrap gap-4 items-center justify-center sm:justify-start">
          <Link href="/contact">
            <Button className="bg-[#014923] hover:bg-[#003893] text-white font-bold">
              Report Fraud to Serabondhu Team
            </Button>
          </Link>
          <Link href="/safety-tips">
            <Button variant="outline" className="border-slate-300 text-slate-700">
              Review General Safety Tips
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

