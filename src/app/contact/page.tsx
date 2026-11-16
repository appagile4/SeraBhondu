"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/common/Button";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  ShieldAlert,
  Send,
  CheckCircle2,
  HelpCircle,
  Headphones,
} from "lucide-react";

export default function ContactPage() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "General Inquiry",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const randomTicket = "DOKO-" + Math.floor(100000 + Math.random() * 900000);
    setTicketNumber(randomTicket);
    setFormSubmitted(true);
  };

  return (
    <div className="space-y-12 sm:space-y-16 pb-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-[#014923]">
          Home
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">Contact Support</span>
      </nav>

      {/* Hero */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#013819] via-[#014923] to-[#001844] text-white p-8 sm:p-12 shadow-xl">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-orange-300">
            <Headphones className="w-3.5 h-3.5" />
            <span>Dedicated Customer Care &amp; Fraud Desk</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            How Can We <span className="text-[#E30613]">Help You</span> Today?
          </h1>

          <p className="text-sm sm:text-base text-blue-100 leading-relaxed">
            Have a question about posting an ad, need help reporting a suspicious listing, or interested in business partnership? Our Dhaka support team is here Sunday through Friday.
          </p>
        </div>
      </div>

      {/* Quick Contact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Phone */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col space-y-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-[#014923] flex items-center justify-center">
            <Phone className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Call Us Directly</h3>
          <p className="text-xs text-slate-500">
            Toll-Free Helpline for all 8 divisions
          </p>
          <div className="pt-1">
            <a
              href="tel:+97714567890"
              className="font-bold text-sm text-[#014923] hover:underline"
            >
              +977-1-4567890
            </a>
            <p className="text-[11px] text-slate-400 mt-0.5">
              WhatsApp: +977-9801234567
            </p>
          </div>
        </div>

        {/* Email */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col space-y-3">
          <div className="w-11 h-11 rounded-xl bg-orange-50 text-[#E30613] flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Email Support</h3>
          <p className="text-xs text-slate-500">
            Guaranteed response within 4 hours
          </p>
          <div className="pt-1">
            <a
              href="mailto:support@serabondhu.net"
              className="font-bold text-sm text-[#014923] hover:underline"
            >
              support@serabondhu.net
            </a>
            <p className="text-[11px] text-slate-400 mt-0.5">
              safety@serabondhu.net
            </p>
          </div>
        </div>

        {/* Office */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col space-y-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Dhaka Office</h3>
          <p className="text-xs text-slate-500">
            Jhamsikhel Road, Ward No. 3
          </p>
          <p className="text-xs text-slate-700 font-medium">
            Lalitpur, Dhaka Division, Bangladesh
          </p>
        </div>

        {/* Hours */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col space-y-3">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Operating Hours</h3>
          <p className="text-xs text-slate-500">
            Bangladesh Standard Time (NPT)
          </p>
          <p className="text-xs text-slate-700 font-medium">
            Sun – Fri: 9:00 AM – 6:00 PM <br />
            <span className="text-slate-400">Emergency fraud desk open 24/7</span>
          </p>
        </div>
      </div>

      {/* Main Form & Safety Hotline Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Form (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs">
          {!formSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1 border-b border-slate-100 pb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Send Us a Message
                </h2>
                <p className="text-xs text-slate-500">
                  Fill in your details below and our resolution team will get back to you shortly.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anjali Thapa"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-[#014923] focus:ring-1 focus:ring-[#014923]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="anjali@gmail.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-[#014923] focus:ring-1 focus:ring-[#014923]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Mobile Number (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="98XXXXXXXX"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-[#014923] focus:ring-1 focus:ring-[#014923]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Topic / Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-300 bg-white focus:border-[#014923] focus:ring-1 focus:ring-[#014923]"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Ad Approval / Moderation">Ad Approval / Moderation</option>
                    <option value="Report Fraud / Scam">Report Fraud / Scam Listing</option>
                    <option value="Account Login / Verification">Account Login / Verification</option>
                    <option value="Dealer & Business Inquiry">Dealer &amp; Business Inquiry</option>
                    <option value="Feedback & Suggestions">Feedback &amp; Suggestions</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Summary of your request or issue..."
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-[#014923] focus:ring-1 focus:ring-[#014923]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Detailed Message *
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Provide all relevant details, including Ad ID or seller phone number if applicable..."
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-[#014923] focus:ring-1 focus:ring-[#014923]"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full sm:w-auto bg-[#E30613] hover:bg-[#E55F00] text-white font-bold px-8 shadow-md flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Ticket</span>
              </Button>
            </form>
          ) : (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">
                Ticket Submitted Successfully!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                Your support reference is <span className="font-mono font-bold text-[#014923]">{ticketNumber}</span>. A confirmation has been sent to <strong>{formData.email}</strong>. Our support team typically responds in under 4 hours.
              </p>
              <div className="pt-4 flex justify-center gap-3">
                <Button
                  onClick={() => {
                    setFormSubmitted(false);
                    setFormData({
                      name: "",
                      email: "",
                      phone: "",
                      category: "General Inquiry",
                      subject: "",
                      message: "",
                    });
                  }}
                  variant="outline"
                >
                  Submit Another Inquiry
                </Button>
                <Link href="/help">
                  <Button className="bg-[#014923] text-white">
                    Visit Help Center
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Urgent Fraud & Help Center links */}
        <div className="space-y-6">
          {/* Urgent Fraud Alert */}
          <div className="bg-red-50 border border-red-200 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-700 font-bold text-sm">
              <ShieldAlert className="w-6 h-6 text-red-600 shrink-0" />
              <span>Suspect a Scam or Fraud?</span>
            </div>
            <p className="text-xs text-red-800 leading-relaxed">
              If an individual asked you for advance payment via eSewa / Khalti / Fonepay or sent a counterfeit QR code, report it immediately to freeze their account.
            </p>
            <div className="pt-1 space-y-2">
              <div className="bg-white p-3 rounded-xl border border-red-200 text-xs">
                <span className="text-[10px] uppercase font-bold text-red-500 block">
                  Bangladesh Police Cyber Bureau
                </span>
                <span className="font-bold text-slate-900 text-sm">Toll-Free Hotline: 1177</span>
              </div>
              <Link href="/fraud-awareness" className="block text-xs font-bold text-red-700 hover:underline">
                Read Fraud Awareness Guide →
              </Link>
            </div>
          </div>

          {/* Quick FAQ Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#014923]" />
              Need Answers Faster?
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Check our Help Center for instant step-by-step guides on ad approval, photo guidelines, and resetting passwords.
            </p>
            <Link href="/help">
              <Button variant="outline" className="w-full text-xs font-bold border-slate-300 text-slate-700">
                Browse All FAQs
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

