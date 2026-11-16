"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/common/Button";
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Heart,
  Coffee,
  Laptop,
  GraduationCap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  X,
  Send,
} from "lucide-react";

interface JobOpening {
  id: string;
  title: string;
  department: "Engineering" | "Product & Design" | "Trust & Safety" | "Growth & Marketing";
  location: string;
  type: string;
  experience: string;
  description: string;
  requirements: string[];
}

const JOBS: JobOpening[] = [
  {
    id: "eng-1",
    title: "Senior Full Stack Engineer (Next.js & Node.js)",
    department: "Engineering",
    location: "Dhaka (Jhamsikhel) / Hybrid",
    type: "Full-time",
    experience: "3+ years",
    description:
      "Architect and scale Serabondhu's marketplace web application, real-time messaging, and high-throughput search infrastructure.",
    requirements: [
      "Deep expertise with React, Next.js (App Router), TypeScript, and Tailwind CSS",
      "Hands-on experience with PostgreSQL, Redis, and high-performance search caching",
      "Strong understanding of web security, CSRF/XSS prevention, and mobile web responsiveness",
    ],
  },
  {
    id: "eng-2",
    title: "React Native Mobile Engineer (iOS & Android)",
    department: "Engineering",
    location: "Dhaka / Hybrid",
    type: "Full-time",
    experience: "2+ years",
    description:
      "Lead development of Serabondhu's cross-platform native iOS & Android applications with offline support and instant push notifications.",
    requirements: [
      "Proficient in React Native, TypeScript, and state management (Zustand / Redux)",
      "Experience with native camera modules, push notifications, and geolocation services in Bangladesh",
      "Obsession with 60fps buttery-smooth mobile UI transitions and offline persistence",
    ],
  },
  {
    id: "ts-1",
    title: "Trust & Safety Operations Lead",
    department: "Trust & Safety",
    location: "Dhaka (Onsite)",
    type: "Full-time",
    experience: "2+ years",
    description:
      "Defend Serabondhu users from scams, advance-payment fraud, and counterfeit listings by spearheading proactive fraud monitoring.",
    requirements: [
      "Prior experience in marketplace trust & safety, banking compliance, or customer fraud investigation",
      "Familiarity with digital payment platforms in Bangladesh (eSewa, Khalti, Fonepay) and scam patterns",
      "Empathy, discretion, and decisive analytical judgment when resolving seller disputes",
    ],
  },
  {
    id: "prod-1",
    title: "Senior Product Designer (UI/UX)",
    department: "Product & Design",
    location: "Dhaka / Remote (Bangladesh)",
    type: "Full-time",
    experience: "3+ years",
    description:
      "Shape the end-to-end user experience for millions of Bangladeshi buyers and sellers, from 2-minute ad posting to live seller chat.",
    requirements: [
      "Stunning portfolio exhibiting clean design systems, typography hierarchy, and mobile usability",
      "Mastery of Figma, interactive prototyping, and user testing methodologies",
      "Strong understanding of Bangladeshi consumer behavior and multilingual design considerations",
    ],
  },
  {
    id: "gro-1",
    title: "Regional Growth & Merchant Lead (Chattogram & Gandaki)",
    department: "Growth & Marketing",
    location: "Chattogram, Gandaki",
    type: "Full-time",
    experience: "2+ years",
    description:
      "Drive merchant onboarding, auto showroom partnerships, and community marketing campaigns across the Gandaki province.",
    requirements: [
      "Proven track record in B2B business development, merchant acquisition, or regional field sales",
      "Extensive local network with vehicle reconditioned houses, electronics shops, and real estate brokers in Chattogram",
      "Energetic storyteller with outstanding communication and negotiation skills",
    ],
  },
];

const PERKS = [
  {
    icon: DollarSign,
    title: "Competitive Compensation & Bonuses",
    description: "Generous industry-leading salaries in NPR, Dashain & Tihar festive bonuses, and performance incentives.",
  },
  {
    icon: Heart,
    title: "Comprehensive Health Cover",
    description: "Medical and hospitalization insurance coverage for you and your immediate family members.",
  },
  {
    icon: Laptop,
    title: "Top-Tier Gear & Setup",
    description: "Latest Apple MacBook Pro or high-spec developer rig, 4K monitors, and an ergonomic home office allowance.",
  },
  {
    icon: GraduationCap,
    title: "Learning & Conference Budget",
    description: "Annual stipend of ৳ 60,000 for technical books, online courses, and regional developer conferences.",
  },
  {
    icon: Coffee,
    title: "Free Chef-Cooked Lunch & Snacks",
    description: "Freshly prepared wholesome meals, premium tea & coffee, and healthy snacks daily at our Gulshan, Dhaka hub.",
  },
  {
    icon: Sparkles,
    title: "Team Retreats & Celebrations",
    description: "Quarterly hackathons, outdoor retreats to Cox's Bazar and Sylhet tea gardens, and team milestone celebrations.",
  },
];

export default function CareersPage() {
  const [selectedDept, setSelectedDept] = useState<string>("All");
  const [applyingJob, setApplyingJob] = useState<JobOpening | null>(null);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [applicantForm, setApplicantForm] = useState({
    name: "",
    email: "",
    phone: "",
    experience: "",
    portfolioUrl: "",
    note: "",
  });

  const departments = ["All", "Engineering", "Product & Design", "Trust & Safety", "Growth & Marketing"];

  const filteredJobs =
    selectedDept === "All"
      ? JOBS
      : JOBS.filter((job) => job.department === selectedDept);

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setApplicationSubmitted(true);
    setTimeout(() => {
      // simulate receipt
    }, 1000);
  };

  return (
    <div className="space-y-12 sm:space-y-16 pb-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-[#014923]">
          Home
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">Careers &amp; Culture</span>
      </nav>

      {/* Hero */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#013819] via-[#014923] to-[#001844] text-white p-8 sm:p-12 lg:p-16 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#E30613]/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-orange-300">
            <Briefcase className="w-3.5 h-3.5" />
            <span>We Are Hiring — Join Our Mission</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Build the Future of <br />
            <span className="text-[#E30613]">Marketplace Commerce</span> in Bangladesh.
          </h1>

          <p className="text-base sm:text-lg text-blue-100 leading-relaxed">
            At Serabondhu, we are building software that changes how millions of people discover value, start micro-businesses, and connect across Bangladesh. We value high ownership, intellectual honesty, speed of execution, and deep care for our users.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <a href="#open-roles">
              <Button size="lg" className="bg-[#E30613] hover:bg-[#E55F00] text-white font-bold shadow-lg">
                View Open Positions ({JOBS.length})
              </Button>
            </a>
            <a href="#perks">
              <Button size="lg" variant="outline" className="bg-transparent text-white border-2 border-white/50 hover:bg-white/15">
                Explore Perks &amp; Culture
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Perks & Benefits */}
      <div id="perks" className="space-y-8 scroll-mt-24">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#014923]/10 text-[#014923] text-xs font-bold uppercase tracking-wider">
            Benefits &amp; Culture
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Why You Will Love Working Here
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            We take great care of the people building Bangladesh&apos;s most ambitious online platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PERKS.map((perk, idx) => {
            const Icon = perk.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:border-[#014923]/40 transition-all flex flex-col space-y-3"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#014923] flex items-center justify-center font-bold">
                  <Icon className="w-6 h-6 text-[#E30613]" />
                </div>
                <h3 className="font-bold text-base text-slate-900">
                  {perk.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {perk.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Open Roles Section */}
      <div id="open-roles" className="space-y-8 scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-6">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Open Positions
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Find your next career chapter at Serabondhu headquarters or remotely across Bangladesh.
            </p>
          </div>

          {/* Department Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedDept === dept
                    ? "bg-[#014923] text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* Roles List */}
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md hover:border-[#014923]/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-3 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-[#014923] text-[11px] font-bold">
                    {job.department}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {job.location}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-medium">
                    {job.type}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  {job.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {job.description}
                </p>

                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Key Highlights:
                  </span>
                  <ul className="text-xs text-slate-600 space-y-1">
                    {job.requirements.slice(0, 2).map((req, rIdx) => (
                      <li key={rIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#014923] shrink-0 mt-0.5" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="shrink-0 flex items-center md:flex-col md:justify-center gap-3 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                <Button
                  onClick={() => {
                    setApplyingJob(job);
                    setApplicationSubmitted(false);
                  }}
                  className="bg-[#014923] hover:bg-[#003893] text-white text-xs font-bold w-full md:w-auto"
                >
                  Apply for Role
                </Button>
                <span className="text-[11px] text-slate-400 whitespace-nowrap">
                  Exp: {job.experience}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Application Modal */}
      {applyingJob && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setApplyingJob(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            {!applicationSubmitted ? (
              <form onSubmit={handleApplySubmit} className="space-y-4">
                <div className="space-y-1 border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold text-[#E30613] uppercase tracking-wider">
                    Job Application
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    {applyingJob.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {applyingJob.department} • {applyingJob.location}
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Shrestha"
                      value={applicantForm.name}
                      onChange={(e) =>
                        setApplicantForm({ ...applicantForm, name: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-[#014923] focus:ring-1 focus:ring-[#014923]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="ramesh@gmail.com"
                        value={applicantForm.email}
                        onChange={(e) =>
                          setApplicantForm({ ...applicantForm, email: e.target.value })
                        }
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-[#014923] focus:ring-1 focus:ring-[#014923]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="98XXXXXXXX"
                        value={applicantForm.phone}
                        onChange={(e) =>
                          setApplicantForm({ ...applicantForm, phone: e.target.value })
                        }
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-[#014923] focus:ring-1 focus:ring-[#014923]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      LinkedIn / GitHub / Portfolio URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/username"
                      value={applicantForm.portfolioUrl}
                      onChange={(e) =>
                        setApplicantForm({ ...applicantForm, portfolioUrl: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-[#014923] focus:ring-1 focus:ring-[#014923]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Brief Note / Why Serabondhu?
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Tell us about yourself and what drives you..."
                      value={applicantForm.note}
                      onChange={(e) =>
                        setApplicantForm({ ...applicantForm, note: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-[#014923] focus:ring-1 focus:ring-[#014923]"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full bg-[#E30613] hover:bg-[#E55F00] text-white font-bold py-2.5 rounded-xl shadow-md flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Application</span>
                  </Button>
                </div>
              </form>
            ) : (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Application Received!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
                  Thank you, <strong>{applicantForm.name || "candidate"}</strong>. Our People Operations team in Lalitpur will review your application and reach out within 3 business days.
                </p>
                <Button
                  onClick={() => setApplyingJob(null)}
                  className="bg-[#014923] text-white"
                >
                  Done
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

