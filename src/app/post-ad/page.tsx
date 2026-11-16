"use client";

import React, { useState } from "react";
import { CategorySelector } from "@/components/post-ad/CategorySelector";
import { AdvertisementForm } from "@/components/post-ad/AdvertisementForm";
import { ImageUploader } from "@/components/post-ad/ImageUploader";
import { LocationSelector } from "@/components/post-ad/LocationSelector";
import { AdvertisementPreview } from "@/components/post-ad/AdvertisementPreview";
import { Button } from "@/components/common/Button";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { Category } from "@/types/category";
import { Product } from "@/types/product";
import { useMarketplace } from "@/context/MarketplaceContext";
import { useLanguage } from "@/context/LanguageContext";
import { createAd } from "@/lib/advertisementApi";
import { Check, ArrowRight, ArrowLeft, AlertCircle } from "lucide-react";

const STEPS = [
  { id: 1, key: "stepCategory", defaultTitle: "ক্যাটাগরি" },
  { id: 2, key: "stepDetails", defaultTitle: "বিবরণ" },
  { id: 3, key: "stepPhotos", defaultTitle: "ছবি" },
  { id: 4, key: "stepLocation", defaultTitle: "অবস্থান" },
  { id: 5, key: "stepPreview", defaultTitle: "প্রিভিউ" },
];

export default function PostAdPage() {
  const { addCustomAd, user, openAuthModal } = useMarketplace();
  const { t, language } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [isPublished, setIsPublished] = useState(false);
  const [publishedSlug, setPublishedSlug] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submissionNotice, setSubmissionNotice] = useState<string>("");

  // Form State
  const [category, setCategory] = useState<string>("cars");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    condition: "Used" as "New" | "Used",
    brand: "",
    year: "",
  });
  const [images, setImages] = useState<string[]>([]);
  const [locationData, setLocationData] = useState({
    state: "Dhaka Division",
    city: "Dhaka",
    area: "",
    pincode: "",
    latitude: 23.8103 as number | null,
    longitude: 90.4125 as number | null,
  });
  const [sellerData, setSellerData] = useState({
    name: user?.name || "Verified Seller",
    phone: user?.phone || "+880 1700-000000",
    email: user?.email || "seller@example.com",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (step: number) => {
    const err: Record<string, string> = {};

    if (step === 1) {
      if (!category) err.category = t("valSelectCategory", "অনুগ্রহ করে একটি ক্যাটাগরি বেছে নিন");
    }

    if (step === 2) {
      if (!formData.title.trim()) {
        err.title = t("valAdTitleReq", "বিজ্ঞাপনের শিরোনাম প্রয়োজন");
      } else if (formData.title.length < 8) {
        err.title = t("valAdTitleMin", "শিরোনাম কমপক্ষে ৮ অক্ষরের হতে হবে");
      }

      if (!formData.description.trim()) {
        err.description = t("valAdDescReq", "বিজ্ঞাপনের বিবরণ প্রয়োজন");
      } else if (formData.description.length < 15) {
        err.description = t("valAdDescMin", "অনুগ্রহ করে আরও বিস্তারিত বিবরণ দিন (কমপক্ষে ১৫ অক্ষর)");
      }

      if (!formData.price || Number(formData.price) <= 0) {
        err.price = t("valPriceReq", "অনুগ্রহ করে সঠিক বিক্রয় মূল্য দিন (টাকায়)");
      }
    }

    if (step === 3) {
      if (images.length === 0) {
        err.images = t("valPhotoReq", "বিজ্ঞাপনের জন্য অনুগ্রহ করে অন্তত একটি ছবি যোগ করুন");
      }
    }

    if (step === 4) {
      if (!locationData.state) {
        err.state = t("valDivisionReq", "বিভাগ নির্বাচন করা বাধ্যতামূলক");
      }
      if (!locationData.city) {
        err.city = t("valCityReq", "শহর / জেলা নির্বাচন করা বাধ্যতামূলক");
      }
      if (!locationData.area.trim()) {
        err.area = t("valAreaReq", "এলাকা বা মহল্লার নাম উল্লেখ করুন");
      }
      if (!sellerData.name.trim()) {
        err.name = t("valSellerNameReq", "বিক্রেতার নাম প্রয়োজন");
      }
      if (!sellerData.phone.trim()) {
        err.phone = t("valSellerPhoneReq", "মোবাইল নম্বর দেওয়া বাধ্যতামূলক");
      }
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleCategorySelect = (cat: Category) => {
    setCategory(cat.slug);
    setCurrentStep(2);
  };

  const handlePublish = async () => {
    // If not logged in, prompt user to log in
    if (!user) {
      setSubmitError(t("valLoginToSubmit", "বিজ্ঞাপন জমা দেওয়ার জন্য অনুগ্রহ করে লগইন করুন।"));
      openAuthModal();
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const slug = `${formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString().slice(-4)}`;

    const fallbackImages =
      images.length > 0
        ? images
        : ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80"];

    try {
      // Send real creation request to backend
      const res = await createAd({
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        category: category,
        condition: formData.condition,
        images: fallbackImages,
        location: locationData,
        sellerContact: {
          name: sellerData.name,
          phone: sellerData.phone,
          email: sellerData.email,
        },
        attributes: {
          ...(formData.brand ? { Brand: formData.brand } : {}),
          ...(formData.year ? { Year: formData.year } : {}),
          Condition: formData.condition,
        },
      });

      const savedSlug = res.advertisement?.slug || slug;
      setPublishedSlug(savedSlug);
      setSubmissionNotice(
        res.message ||
          (language === "bn"
            ? "আপনার বিজ্ঞাপনটি সফলভাবে জমা দেওয়া হয়েছে এবং অ্যাডমিন পর্যালোচনার অপেক্ষায় আছে।"
            : "Your advertisement has been submitted successfully and is awaiting admin approval.")
      );

      // Also persist to local custom ad state for immediate reactivity
      const localAd: Product = {
        id: res.advertisement?._id || `ad-${Date.now()}`,
        title: formData.title,
        slug: savedSlug,
        description: formData.description,
        price: Number(formData.price),
        category: category,
        condition: formData.condition,
        images: fallbackImages,
        location: {
          city: locationData.city,
          state: locationData.state,
          area: locationData.area,
          pincode: locationData.pincode,
          latitude: locationData.latitude ?? null,
          longitude: locationData.longitude ?? null,
        },
        seller: {
          id: user?.id || "user-101",
          name: sellerData.name,
          avatar:
            user?.avatar ||
            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
          memberSince: "Nov 2026",
          verified: true,
          phone: sellerData.phone,
          location: {
            city: locationData.city,
            state: locationData.state,
            area: locationData.area,
          },
          totalAds: 1,
        },
        postedAt: new Date().toISOString(),
        featured: false,
        attributes: {
          ...(formData.brand ? { Brand: formData.brand } : {}),
          ...(formData.year ? { Year: formData.year } : {}),
          Condition: formData.condition,
        },
      };

      addCustomAd(localAd);
      setIsPublished(true);
    } catch (err: any) {
      console.error("Ad creation error:", err);
      setSubmitError(
        err.response?.data?.message ||
          (language === "bn"
            ? "সার্ভারে বিজ্ঞাপন জমা দিতে ব্যর্থ হয়েছে। অনুগ্রহ করে সংযোগ পরীক্ষা করে পুনরায় চেষ্টা করুন।"
            : "Failed to submit advertisement to the server. Please check your connection and try again.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const breadcrumbItems = [
    { label: t("postFreeAdHeader", "বিনামূল্যে বিজ্ঞাপন দিন") },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Breadcrumb items={breadcrumbItems} />

      {submitError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Progress Steps Header */}
      {!isPublished && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            {STEPS.map((s) => {
              const isPassed = currentStep > s.id;
              const isCurrent = currentStep === s.id;
              const title = t(s.key, s.defaultTitle);

              return (
                <div key={s.id} className="flex items-center flex-1 last:flex-none">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        isPassed
                          ? "bg-[#014923] text-white"
                          : isCurrent
                          ? "bg-[#014923] text-white ring-4 ring-[#014923]/15 shadow-sm"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {isPassed ? <Check className="w-4 h-4" /> : s.id}
                    </div>
                    <span
                      className={`text-xs font-bold hidden sm:inline ${
                        isCurrent ? "text-slate-900" : "text-slate-400"
                      }`}
                    >
                      {title}
                    </span>
                  </div>
                  {s.id !== STEPS.length && (
                    <div
                      className={`flex-1 h-0.5 mx-2 sm:mx-4 ${
                        isPassed ? "bg-[#014923]" : "bg-slate-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step Container Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        {/* Step 1: Category Selector */}
        {currentStep === 1 && (
          <CategorySelector
            selectedCategory={category}
            onSelect={handleCategorySelect}
          />
        )}

        {/* Step 2: Details */}
        {currentStep === 2 && (
          <AdvertisementForm
            formData={formData}
            errors={errors}
            onChange={(field, val) => setFormData((prev) => ({ ...prev, [field]: val }))}
            category={category}
          />
        )}

        {/* Step 3: Photos */}
        {currentStep === 3 && (
          <ImageUploader
            images={images}
            onChange={setImages}
            error={errors.images}
          />
        )}

        {/* Step 4: Location & Seller */}
        {currentStep === 4 && (
          <LocationSelector
            locationData={locationData}
            sellerData={sellerData}
            errors={errors}
            onChangeLocation={(field, val) =>
              setLocationData((prev) => ({ ...prev, [field]: val }))
            }
            onChangeSeller={(field, val) =>
              setSellerData((prev) => ({ ...prev, [field]: val }))
            }
          />
        )}

        {/* Step 5: Preview & Publish */}
        {currentStep === 5 && (
          <AdvertisementPreview
            data={{
              ...formData,
              category,
              images,
              ...locationData,
              sellerName: sellerData.name,
              sellerPhone: sellerData.phone,
              sellerEmail: sellerData.email,
            }}
            onPublish={handlePublish}
            onBack={handleBack}
            isPublished={isPublished}
            publishedSlug={publishedSlug}
            isSubmitting={isSubmitting}
            submissionNotice={submissionNotice}
          />
        )}

        {/* Navigation Step Buttons (for Steps 2, 3, 4) */}
        {!isPublished && currentStep > 1 && currentStep < 5 && (
          <div className="flex items-center justify-between pt-8 border-t border-slate-100 mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              {t("previousBtn", "পূর্ববর্তী")}
            </Button>
            <Button
              variant="primary"
              onClick={handleNext}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {t("nextStepBtn", "পরবর্তী ধাপ")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
