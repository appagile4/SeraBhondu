"use client";

import React, { useState } from "react";
import Image from "next/image";
import { UploadCloud, X, Star, Plus, Loader2 } from "lucide-react";
import { uploadAdImages } from "@/lib/advertisementApi";
import { useLanguage } from "@/context/LanguageContext";

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  error?: string;
}

const PRESET_MOCK_PHOTOS = [
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
];

export function ImageUploader({ images, onChange, error }: ImageUploaderProps) {
  const { t, language } = useLanguage();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const handleSetCover = (index: number) => {
    if (index === 0) return;
    const item = images[index];
    const rest = images.filter((_, i) => i !== index);
    onChange([item, ...rest]);
  };

  const handleAddPreset = (url: string) => {
    if (images.length >= 8) return;
    if (images.includes(url)) return;
    onChange([...images, url]);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files).slice(0, 8 - images.length);
    if (fileList.length === 0) return;

    setIsUploading(true);
    setUploadNotice(t("dropzoneUploading", "ক্লাউডিনারি-তে ছবি আপলোড হচ্ছে..."));

    try {
      const uploaded = await uploadAdImages(fileList);
      if (uploaded && uploaded.length > 0) {
        const newUrls = uploaded.map((u) => u.url);
        onChange([...images, ...newUrls]);
        setUploadNotice(language === "bn" ? "ছবি সফলভাবে আপলোড হয়েছে!" : "Photos uploaded successfully!");
      } else {
        const fallbackUrls = fileList.map((f) => URL.createObjectURL(f));
        onChange([...images, ...fallbackUrls]);
      }
    } catch {
      // Graceful fallback to local object preview
      const fallbackUrls = fileList.map((f) => URL.createObjectURL(f));
      onChange([...images, ...fallbackUrls]);
      setUploadNotice(null);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadNotice(null), 3000);
    }
  };

  return (
    <div className="space-y-5 text-left">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            {t("photosTitle", "পণ্যের স্পষ্ট ছবি আপলোড করুন")}
          </h3>
          <p className="text-xs text-slate-500">
            {t("photosSub", "আসল এবং স্পষ্ট ছবি দিলে ৫ গুণ বেশি ক্রেতার সাড়া পাওয়া যায়")}
          </p>
        </div>
        <span className="text-xs font-bold text-slate-500">
          {images.length} / 8 {t("photosLimit", "Photos")}
        </span>
      </div>

      {/* Upload Dropzone */}
      <label className={`border-2 border-dashed ${
        isUploading
          ? "border-amber-400 bg-amber-50/40 cursor-wait"
          : "border-slate-300 hover:border-[#014923] bg-slate-50 hover:bg-[#014923]/5 cursor-pointer"
      } rounded-2xl p-6 flex flex-col items-center justify-center transition-colors block text-center`}>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileUpload}
          disabled={isUploading || images.length >= 8}
          className="hidden"
        />
        <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-[#014923] mb-2">
          {isUploading ? (
            <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
          ) : (
            <UploadCloud className="w-6 h-6" />
          )}
        </div>
        <span className="text-sm font-bold text-slate-800">
          {isUploading
            ? t("dropzoneUploading", "ক্লাউডিনারি-তে ছবি আপলোড হচ্ছে...")
            : t("dropzoneClick", "ডিভাইস থেকে ছবি আপলোড করতে ক্লিক করুন")}
        </span>
        <span className="text-xs text-slate-400 mt-1">
          {t("dropzoneHint", "Supports JPG, PNG, WEBP (Max 8 photos, up to 10MB each)")}
        </span>
      </label>

      {uploadNotice && (
        <p className="text-xs text-emerald-600 font-semibold">{uploadNotice}</p>
      )}

      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

      {/* Quick Preset Photos selector for easy demo testing */}
      <div className="space-y-2 pt-1">
        <span className="text-xs font-semibold text-slate-600 block">
          {t("samplePhotosTitle", "অথবা এক ক্লিকে ডেমো ছবি যোগ করুন:")}
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESET_MOCK_PHOTOS.map((url, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleAddPreset(url)}
              disabled={images.includes(url) || images.length >= 8 || isUploading}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                images.includes(url)
                  ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-white border-slate-200 text-slate-700 hover:border-[#014923] hover:text-[#014923] cursor-pointer"
              }`}
            >
              {t("samplePhotoBtn", "নমুনা ছবি #")}{i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Photo Previews Grid */}
      {images.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{t("coverPhotoTip", "প্রথম ছবিটিকে মূল কভার ছবি করতে '★ কভার' বাটনে ক্লিক করুন")}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((url, index) => {
              const isCover = index === 0;

              return (
                <div
                  key={index}
                  className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 group transition-all ${
                    isCover
                      ? "border-[#E30613] ring-2 ring-[#E30613]/20 shadow-sm"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <Image
                    src={url}
                    alt={`Upload ${index + 1}`}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover"
                  />

                  {/* Cover Badge */}
                  {isCover && (
                    <div className="absolute top-2 left-2 bg-[#E30613] text-white text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                      <Star className="w-2.5 h-2.5 fill-white" />
                      <span>{t("coverBadge", "কভার")}</span>
                    </div>
                  )}

                  {/* Actions overlay */}
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                    {!isCover && (
                      <button
                        type="button"
                        onClick={() => handleSetCover(index)}
                        className="bg-white/90 hover:bg-white text-slate-900 text-[10px] font-bold px-2 py-1 rounded shadow-xs cursor-pointer"
                      >
                        {t("setCoverBtn", "কভার করুন")}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemove(index)}
                      className="bg-rose-600 hover:bg-rose-700 text-white p-1.5 rounded-full shadow-xs cursor-pointer"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Empty placeholder slots */}
            {Array.from({ length: Math.max(0, 4 - images.length) }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="aspect-[4/3] rounded-xl border border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-slate-300"
              >
                <Plus className="w-5 h-5 stroke-[1.5]" />
                <span className="text-[10px] font-medium mt-1">{t("emptySlot", "খালি স্লট")}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
