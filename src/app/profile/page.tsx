"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMarketplace } from "@/context/MarketplaceContext";
import { useLanguage } from "@/context/LanguageContext";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Button } from "@/components/common/Button";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { EmptyState } from "@/components/common/EmptyState";
import { UserAvatar } from "@/components/common/UserAvatar";
import { MOCK_PRODUCTS } from "@/data/products";
import { formatPrice } from "@/lib/utils";
import {
  getMyAds,
  deleteAd,
  updateAd,
  BackendAdvertisement,
} from "@/lib/advertisementApi";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Plus,
  LogOut,
  PackageCheck,
  Heart,
  ShieldCheck,
  Edit3,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  ExternalLink,
  RefreshCw,
  Loader2,
  X,
} from "lucide-react";

export default function ProfilePage() {
  const { user, logout, userAds, wishlist } = useMarketplace();
  const { t, language, currencySymbol } = useLanguage();
  const [activeTab, setActiveTab] = useState<"my-ads" | "wishlist">("my-ads");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  // Real backend ads state
  const [backendAds, setBackendAds] = useState<BackendAdvertisement[]>([]);
  const [isLoadingAds, setIsLoadingAds] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Edit / Resubmit modal state
  const [editingAd, setEditingAd] = useState<BackendAdvertisement | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    price: "",
    description: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchUserAds = async () => {
    setIsLoadingAds(true);
    try {
      const ads = await getMyAds();
      setBackendAds(ads);
    } catch {
      // ignore
    } finally {
      setIsLoadingAds(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserAds();
    }
  }, [user]);

  const handleDeleteAd = async (id: string) => {
    const confirmMsg =
      language === "bn"
        ? "আপনি কি নিশ্চিতভাবে এই বিজ্ঞাপনটি স্থায়ীভাবে মুছে ফেলতে চান?"
        : "Are you sure you want to permanently delete this advertisement?";
    if (!confirm(confirmMsg)) return;
    setActionLoadingId(id);
    try {
      await deleteAd(id);
      setBackendAds((prev) => prev.filter((a) => a._id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || (language === "bn" ? "বিজ্ঞাপন মুছতে ব্যর্থ হয়েছে।" : "Failed to delete advertisement."));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenEdit = (ad: BackendAdvertisement) => {
    setEditingAd(ad);
    setEditForm({
      title: ad.title,
      price: ad.price.toString(),
      description: ad.description || "",
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAd) return;

    setIsUpdating(true);
    try {
      const res = await updateAd(editingAd._id, {
        title: editForm.title,
        price: Number(editForm.price),
        description: editForm.description,
      });

      alert(res.message || (language === "bn" ? "বিজ্ঞাপন সফলভাবে আপডেট করা হয়েছে!" : "Advertisement updated successfully!"));
      setEditingAd(null);
      await fetchUserAds();
    } catch (err: any) {
      alert(err.response?.data?.message || (language === "bn" ? "বিজ্ঞাপন আপডেট করতে ব্যর্থ হয়েছে।" : "Failed to update advertisement."));
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) {
    return (
      <div className="py-12">
        <EmptyState
          icon={<User className="w-8 h-8 text-slate-400" />}
          title={language === "bn" ? "প্রোফাইল দেখতে অনুগ্রহ করে লগইন করুন" : "Please log in to view your profile"}
          description={
            language === "bn"
              ? "আপনার সক্রিয় বিজ্ঞাপন পরিচালনা, ক্রেতাদের মেসেজ দেখতে এবং প্রোফাইল আপডেট করতে লগইন করুন।"
              : "Log in to manage your active advertisements, see buyer enquiries, and update profile settings."
          }
          actionText={language === "bn" ? "এখনই লগইন করুন" : "Log In Now"}
          actionHref="/login"
        />
      </div>
    );
  }

  // Saved items from wishlist
  const savedAds = [...userAds, ...MOCK_PRODUCTS].filter((p) => wishlist.includes(p.id));

  // Filter backend ads
  const filteredAds = backendAds.filter((ad) => {
    if (statusFilter === "all") return true;
    return ad.status === statusFilter;
  });

  const pendingCount = backendAds.filter((a) => a.status === "pending").length;
  const approvedCount = backendAds.filter((a) => a.status === "approved").length;
  const rejectedCount = backendAds.filter((a) => a.status === "rejected").length;

  const breadcrumbItems = [{ label: t("myProfile", "আমার প্রোফাইল") }];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />

      {/* User Header Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <UserAvatar
              src={user.avatar}
              name={user.name}
              size="xl"
              borderClassName="border-4 border-slate-100 shadow-sm"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">{user.name}</h1>
                <span className="p-1 rounded-md bg-emerald-50 text-emerald-600" title="Verified Account">
                  <ShieldCheck className="w-4 h-4" />
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user.email}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user.phone}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user.city}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <Link href="/profile/edit" className="flex-1 sm:flex-none">
              <Button
                variant="outline"
                size="md"
                leftIcon={<Edit3 className="w-4 h-4 text-[#014923]" />}
                className="w-full sm:w-auto font-bold border-2 border-slate-300 text-slate-800 hover:border-[#014923] hover:text-[#014923]"
              >
                {t("editProfileBtn", "প্রোফাইল সম্পাদনা")}
              </Button>
            </Link>
            <Link href="/post-ad" className="flex-1 sm:flex-none">
              <Button
                variant="sell"
                size="md"
                leftIcon={<Plus className="w-4 h-4 stroke-[3]" />}
                className="w-full sm:w-auto"
              >
                {t("postAdBtn", "+ বিজ্ঞাপন দিন")}
              </Button>
            </Link>
            <Button
              variant="outline"
              size="md"
              leftIcon={<LogOut className="w-4 h-4" />}
              onClick={logout}
            >
              {t("logoutBtn", "লগআউট")}
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("my-ads")}
          className={`flex items-center gap-2 pb-3 px-4 text-sm font-bold transition-colors relative cursor-pointer ${
            activeTab === "my-ads"
              ? "text-[#014923] border-b-2 border-[#014923]"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <PackageCheck className="w-4 h-4" />
          <span>{t("myPostedAdsTab", "আমার পোস্ট করা বিজ্ঞাপন")} ({backendAds.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("wishlist")}
          className={`flex items-center gap-2 pb-3 px-4 text-sm font-bold transition-colors relative cursor-pointer ${
            activeTab === "wishlist"
              ? "text-[#014923] border-b-2 border-[#014923]"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>{t("savedAdsTab", "পছন্দের বিজ্ঞাপন")} ({savedAds.length})</span>
        </button>
      </div>

      {/* Tab Contents: My Ads */}
      {activeTab === "my-ads" && (
        <div className="space-y-4">
          {/* Status Sub-Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setStatusFilter("all")}
                className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  statusFilter === "all"
                    ? "bg-[#014923] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {t("filterAll", "সকল")} ({backendAds.length})
              </button>
              <button
                onClick={() => setStatusFilter("pending")}
                className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  statusFilter === "pending"
                    ? "bg-amber-500 text-white"
                    : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{t("filterPending", "অনুমোদনের অপেক্ষায়")} ({pendingCount})</span>
              </button>
              <button
                onClick={() => setStatusFilter("approved")}
                className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  statusFilter === "approved"
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t("filterApproved", "অনুমোদিত ও সক্রিয়")} ({approvedCount})</span>
              </button>
              <button
                onClick={() => setStatusFilter("rejected")}
                className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  statusFilter === "rejected"
                    ? "bg-rose-600 text-white"
                    : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{t("filterRejected", "প্রত্যাখ্যাত")} ({rejectedCount})</span>
              </button>
            </div>

            <button
              onClick={fetchUserAds}
              disabled={isLoadingAds}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5 font-medium cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAds ? "animate-spin" : ""}`} />
              <span>{t("refreshBtn", "রিফ্রেশ")}</span>
            </button>
          </div>

          {/* Advertisements List */}
          {isLoadingAds ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#014923]" />
              <p className="text-sm">{t("loadingYourAds", "আপনার বিজ্ঞাপনগুলো লোড হচ্ছে...")}</p>
            </div>
          ) : filteredAds.length > 0 ? (
            <div className="space-y-4">
              {filteredAds.map((ad) => {
                const coverImg =
                  ad.images && ad.images.length > 0
                    ? typeof ad.images[0] === "string"
                      ? ad.images[0]
                      : ad.images[0].url
                    : "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80";

                return (
                  <div
                    key={ad._id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:border-slate-300"
                  >
                    <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                        <Image
                          src={coverImg}
                          alt={ad.title}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                              ad.status === "approved"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : ad.status === "pending"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {ad.status === "approved" && <CheckCircle2 className="w-3 h-3" />}
                            {ad.status === "pending" && <Clock className="w-3 h-3" />}
                            {ad.status === "rejected" && <AlertTriangle className="w-3 h-3" />}
                            <span>
                              {ad.status === "approved"
                                ? t("approvedLiveBadge", "অনুমোদিত / সক্রিয়")
                                : ad.status === "pending"
                                ? t("pendingReviewBadge", "পর্যালোচনার অপেক্ষায়")
                                : t("rejectedBadge", "প্রত্যাখ্যাত")}
                            </span>
                          </span>

                          <span className="text-xs text-slate-400 capitalize">
                            {t("stepCategory", "ক্যাটাগরি")}: {t(`cat_${ad.category}`, ad.category)}
                          </span>
                        </div>

                        <h3 className="font-bold text-slate-900 text-base truncate">
                          {ad.title}
                        </h3>

                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="font-extrabold text-[#014923] text-sm">
                            {formatPrice(ad.price, language)}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {ad.location?.city || "Dhaka"}
                          </span>
                          <span>•</span>
                          <span>
                            {t("submittedOn", "জমা দেওয়ার তারিখ")}{" "}
                            {new Date(ad.createdAt).toLocaleDateString(language === "bn" ? "bn-BD" : "en-US")}
                          </span>
                        </div>

                        {/* Rejection notice callout if rejected */}
                        {ad.status === "rejected" && (
                          <div className="mt-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-1">
                            <p className="font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                              {t("rejectionReasonLabel", "প্রত্যাখ্যানের কারণ:")}
                            </p>
                            <p className="italic">
                              &quot;{ad.rejectionReason || "Listing does not comply with community guidelines."}&quot;
                            </p>
                            <p className="text-[11px] text-rose-600 font-medium pt-0.5">
                              {t("rejectionHint", "বিজ্ঞাপনটি সংশোধন করে পুনরায় মডারেশনের জন্য পাঠাতে 'সংশোধন ও পুনরায় জমা দিন' বাটনে ক্লিক করুন।")}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                      {ad.status === "approved" && (
                        <Link href={`/product/${ad.slug}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                          >
                            {t("viewLiveBtn", "সরাসরি দেখুন")}
                          </Button>
                        </Link>
                      )}

                      <Button
                        variant={ad.status === "rejected" ? "primary" : "outline"}
                        size="sm"
                        onClick={() => handleOpenEdit(ad)}
                        leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                      >
                        {ad.status === "rejected"
                          ? t("editResubmitBtn", "সংশোধন ও পুনরায় জমা দিন")
                          : t("editBtn", "সম্পাদনা")}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAd(ad._id)}
                        disabled={actionLoadingId === ad._id}
                        className="text-rose-600 hover:bg-rose-50"
                      >
                        {actionLoadingId === ad._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={<PackageCheck className="w-8 h-8 text-slate-400" />}
              title={t("noAdsInFilterTitle", "এই ফিল্টারে কোনো বিজ্ঞাপন পাওয়া যায়নি")}
              description={t(
                "noAdsInFilterSub",
                "সমগ্র বাংলাদেশে আপনার ইলেকট্রনিক্স, যানবাহন বা পণ্য বিক্রি করতে একটি বিজ্ঞাপন দিন।"
              )}
              actionText={t("postAnAdBtn", "একটি বিজ্ঞাপন দিন")}
              actionHref="/post-ad"
            />
          )}
        </div>
      )}

      {/* Tab Contents: Wishlist */}
      {activeTab === "wishlist" && (
        <div className="space-y-4">
          {savedAds.length > 0 ? (
            <ProductGrid products={savedAds} />
          ) : (
            <EmptyState
              icon={<Heart className="w-8 h-8 text-rose-400" />}
              title={t("noSavedAdsTitle", "কোনো সংরক্ষিত বিজ্ঞাপন নেই")}
              description={t(
                "noSavedAdsSub",
                "মার্কেটপ্লেস ঘুরে পছন্দের বিজ্ঞাপনের হার্ট আইকনে ক্লিক করে সংরক্ষণ করুন।"
              )}
              actionText={t("exploreMarketplaceBtn", "মার্কেটপ্লেস দেখুন")}
              actionHref="/"
            />
          )}
        </div>
      )}

      {/* Danger Zone: Account Deletion */}
      <div className="mt-12 pt-6 border-t border-slate-200">
        <div className="bg-red-50/70 border border-red-200/90 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-red-900">
              {t("deleteAccountTitle", language === "bn" ? "অ্যাকাউন্ট মুছে ফেলুন" : "Delete Account")}
            </h4>
            <p className="text-xs text-red-700/90 mt-0.5">
              {t(
                "deleteAccountDesc",
                language === "bn"
                  ? "স্থায়ীভাবে আপনার সেরাবন্ধু অ্যাকাউন্ট ও সংশ্লিষ্ট সমস্ত বিজ্ঞাপন এবং ডেটা অপসারিত করুন।"
                  : "Permanently delete your Serabondhu account and all associated advertisements and data."
              )}
            </p>
          </div>
          <Link
            href="/delete-account"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors shrink-0 shadow-xs"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t("deleteAccountBtn", language === "bn" ? "অ্যাকাউন্ট মুছুন" : "Delete Account")}</span>
          </Link>
        </div>
      </div>

      {/* Edit / Resubmit Modal */}
      {editingAd && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {editingAd.status === "rejected"
                    ? t("editResubmitModalTitle", "বিজ্ঞাপন সংশোধন ও পুনরায় জমা দিন")
                    : t("editAdModalTitle", "বিজ্ঞাপন সম্পাদনা")}
                </h3>
                <p className="text-xs text-slate-500">
                  {editingAd.status === "rejected"
                    ? t(
                        "resubmitModalDesc",
                        "পুনরায় জমা দিলে বিজ্ঞাপনটি আবার সুপারঅ্যাডমিন পর্যালোচনা সারিতে চলে যাবে।"
                      )
                    : t("editModalDesc", "আপনার বিজ্ঞাপনের বিবরণ আপডেট করুন।")}
                </p>
              </div>
              <button
                onClick={() => setEditingAd(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {t("adTitleLabel", "বিজ্ঞাপনের শিরোনাম *")}
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                  required
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#014923]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {t("adPriceLabel", "বিক্রয় মূল্য")} ({currencySymbol})
                </label>
                <input
                  type="number"
                  value={editForm.price}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, price: e.target.value }))}
                  required
                  min="0"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#014923]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {t("adDescLabel", "বিস্তারিত বিবরণ *")}
                </label>
                <textarea
                  rows={4}
                  value={editForm.description}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                  required
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#014923]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingAd(null)}
                  disabled={isUpdating}
                >
                  {t("cancelBtn", "বাতিল")}
                </Button>
                <Button
                  type="submit"
                  variant="sell"
                  disabled={isUpdating}
                  leftIcon={isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
                >
                  {isUpdating
                    ? t("savingBtn", "সংরক্ষণ হচ্ছে...")
                    : editingAd.status === "rejected"
                    ? t("resubmitForApprovalBtn", "অনুমোদনের জন্য পুনরায় জমা দিন")
                    : t("saveChangesBtn", "পরিবর্তন সংরক্ষণ করুন")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

