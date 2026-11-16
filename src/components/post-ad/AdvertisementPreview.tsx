"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/common/Button";
import { useLanguage } from "@/context/LanguageContext";
import { Clock, MapPin, User, Eye, ArrowLeft, Send, Loader2 } from "lucide-react";

interface AdvertisementPreviewProps {
  data: {
    title: string;
    description: string;
    price: number | string;
    condition: "New" | "Used";
    category: string;
    images: string[];
    state: string;
    city: string;
    area: string;
    pincode: string;
    sellerName: string;
    sellerPhone: string;
    sellerEmail: string;
  };
  onPublish: () => void;
  onBack: () => void;
  isPublished: boolean;
  publishedSlug?: string;
  isSubmitting?: boolean;
  submissionNotice?: string;
}

export function AdvertisementPreview({
  data,
  onPublish,
  onBack,
  isPublished,
  isSubmitting,
  submissionNotice,
}: AdvertisementPreviewProps) {
  const { t, language } = useLanguage();

  if (isPublished) {
    return (
      <div className="py-12 text-center space-y-6 max-w-lg mx-auto">
        <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-md ring-8 ring-amber-50">
          <Clock className="w-10 h-10" />
        </div>
        <div className="space-y-3">
          <div className="inline-block bg-amber-100 border border-amber-300 text-amber-800 text-xs font-black px-4 py-1 rounded-full uppercase tracking-wider">
            {t("statusAwaitingApproval", "স্ট্যাটাস: সুপারঅ্যাডমিন পর্যালোচনার অপেক্ষায়")}
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            {t("adSubmittedSuccess", "বিজ্ঞাপন সফলভাবে জমা দেওয়া হয়েছে!")}
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            {submissionNotice ||
              t(
                "submissionDefaultNotice",
                "আপনার বিজ্ঞাপনটি সফলভাবে খোঁজোবাংলায় জমা দেওয়া হয়েছে এবং পর্যালোচনার অপেক্ষায় আছে।"
              )}
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 max-w-sm mx-auto text-left space-y-2 shadow-xs">
            <p className="font-bold text-slate-800">{t("whatHappensNext", "এরপর কী ঘটবে?")}</p>
            <p className="flex items-start gap-2">
              <span className="font-bold text-[#E30613]">1.</span>
              <span>
                {t(
                  "stepReview1",
                  "আমাদের মডারেশন টিম কয়েক মিনিটের মধ্যে আপনার বিজ্ঞাপন পর্যালোচনা করবে।"
                )}
              </span>
            </p>
            <p className="flex items-start gap-2">
              <span className="font-bold text-[#E30613]">2.</span>
              <span>
                {t(
                  "stepReview2",
                  "অনুমোদিত হলে এটি সাথে সাথে খোঁজোবাংলা হোমপেজ ও সার্চ রেজাল্টে দেখা যাবে।"
                )}
              </span>
            </p>
            <p className="flex items-start gap-2">
              <span className="font-bold text-[#E30613]">3.</span>
              <span>
                {t(
                  "stepReview3",
                  "পর্যালোচনা সম্পন্ন হলে আপনি অ্যাকাউন্টে নোটিফিকেশন পাবেন।"
                )}
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
          <Link href="/profile" className="w-full sm:w-auto">
            <Button variant="secondary" className="w-full" leftIcon={<Eye className="w-4 h-4" />}>
              {t("viewInProfileBtn", "আমার প্রোফাইলে দেখুন")}
            </Button>
          </Link>
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full">
              {t("backToHomeBtn", "হোমে ফিরে যান")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const coverImage =
    data.images[0] ||
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80";

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            {t("previewTitle", "বিজ্ঞাপনের প্রিভিউ দেখুন")}
          </h3>
          <p className="text-xs text-slate-500">
            {t("previewSub", "অ্যাডমিন অনুমোদনের পর ক্রেতারা আপনার বিজ্ঞাপনটি যেভাবে দেখবে")}
          </p>
        </div>
      </div>

      {/* Card Preview */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-md max-w-lg mx-auto">
        <div className="relative aspect-[16/10] w-full bg-slate-900">
          <Image
            src={coverImage}
            alt={data.title}
            fill
            sizes="(max-width: 640px) 100vw, 512px"
            className="object-cover"
          />
          <div className="absolute top-3 left-3 bg-[#E30613] text-white text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase">
            {t("previewBadge", "প্রিভিউ")}
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <span className="text-2xl font-black text-slate-900 block">
              {formatPrice(Number(data.price) || 0, language)}
            </span>
            <h4 className="text-lg font-bold text-slate-800 mt-1">{data.title}</h4>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <MapPin className="w-3.5 h-3.5 text-[#E30613]" />
              <span>
                {data.area}, {data.city}, {data.state}
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 whitespace-pre-line">
            {data.description}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                <User className="w-4 h-4" />
              </div>
              <span className="font-bold">{data.sellerName}</span>
            </div>
            <span className="text-slate-400">
              {t("moderationPending", "মডারেশন: পর্যালোচনার অপেক্ষায়")}
            </span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <Button variant="outline" onClick={onBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          {t("backToEditBtn", "সম্পাদনা করতে ফিরুন")}
        </Button>
        <Button
          variant="sell"
          size="lg"
          onClick={onPublish}
          disabled={isSubmitting}
          rightIcon={
            isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4 stroke-[3]" />
            )
          }
          className="shadow-xl px-8"
        >
          {isSubmitting
            ? t("submittingApprovalBtn", "জমা দেওয়া হচ্ছে...")
            : t("submitForApprovalBtn", "অনুমোদনের জন্য জমা দিন")}
        </Button>
      </div>
    </div>
  );
}

