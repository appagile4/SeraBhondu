"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import api from "@/lib/api";
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  RotateCw,
  UploadCloud,
  Check,
  X,
  AlertCircle,
  Sliders,
  Sparkles,
  Link as LinkIcon,
  Layers,
  ArrowUpRight,
} from "lucide-react";

export interface AdminBanner {
  _id: string;
  title?: string;
  subtitle?: string;
  imageUrl: string;
  imagePublicId?: string;
  linkUrl?: string;
  order: number;
  isActive: boolean;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export function BannerManagement() {
  const [banners, setBanners] = useState<AdminBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<AdminBanner | null>(null);
  const [deletingBannerId, setDeletingBannerId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("/search");
  const [order, setOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch all banners (Superadmin view)
  const fetchBanners = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/banners/admin/all");
      if (res.data?.success) {
        setBanners(res.data.banners || []);
      }
    } catch (err) {
      console.error("Failed to load banners:", err);
      showToast("Failed to fetch banners from server.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setTitle("");
    setSubtitle("");
    setLinkUrl("/search");
    setOrder((banners.length || 0) + 1);
    setIsActive(true);
    setSelectedFile(null);
    setPreviewUrl(null);
    setImageUrlInput("");
    setEditingBanner(null);
    setIsUploadModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (b: AdminBanner) => {
    setTitle(b.title || "");
    setSubtitle(b.subtitle || "");
    setLinkUrl(b.linkUrl || "/search");
    setOrder(b.order ?? 1);
    setIsActive(b.isActive);
    setSelectedFile(null);
    setPreviewUrl(b.imageUrl);
    setImageUrlInput(b.imageUrl);
    setEditingBanner(b);
    setIsUploadModalOpen(true);
  };

  // File change handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  // Quick toggle Active / Inactive
  const handleToggleStatus = async (banner: AdminBanner) => {
    try {
      const updatedStatus = !banner.isActive;
      const res = await api.put(`/banners/${banner._id}`, {
        isActive: updatedStatus,
      });

      if (res.data?.success) {
        setBanners((prev) =>
          prev.map((item) =>
            item._id === banner._id ? { ...item, isActive: updatedStatus } : item
          )
        );
        showToast(
          updatedStatus
            ? "Banner activated! It is now looping in the homepage carousel."
            : "Banner deactivated."
        );
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update banner status.");
    }
  };

  // Save Banner (Create or Update)
  const handleSubmitBanner = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingBanner && !selectedFile && !imageUrlInput.trim()) {
      alert("Please select an image file or provide an image URL.");
      return;
    }

    setIsActionLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("subtitle", subtitle);
      formData.append("linkUrl", linkUrl);
      formData.append("order", String(order));
      formData.append("isActive", String(isActive));

      if (selectedFile) {
        formData.append("image", selectedFile);
      } else if (imageUrlInput.trim()) {
        formData.append("imageUrl", imageUrlInput.trim());
      }

      if (editingBanner) {
        // Update existing banner
        const res = await api.put(`/banners/${editingBanner._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (res.data?.success) {
          showToast("Banner updated successfully!");
          setIsUploadModalOpen(false);
          fetchBanners();
        }
      } else {
        // Create new banner
        const res = await api.post("/banners", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (res.data?.success) {
          showToast("New banner uploaded and added to the 2-second carousel!");
          setIsUploadModalOpen(false);
          fetchBanners();
        }
      }
    } catch (err: any) {
      console.error("Save banner error:", err);
      alert(err.response?.data?.message || "Failed to save banner.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Delete Banner
  const handleConfirmDelete = async () => {
    if (!deletingBannerId) return;
    setIsActionLoading(true);
    try {
      const res = await api.delete(`/banners/${deletingBannerId}`);
      if (res.data?.success) {
        setBanners((prev) => prev.filter((b) => b._id !== deletingBannerId));
        showToast("Banner permanently deleted.");
        setDeletingBannerId(null);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete banner.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const activeCount = banners.filter((b) => b.isActive).length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#014923] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-400 text-xs font-bold animate-in fade-in slide-in-from-top-4">
          <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Stat & Action Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-[#014923]">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span>Homepage Hero Banners</span>
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#014923]">
                  {banners.length} Total
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload unlimited promotional banners. Active banners automatically loop in a smooth horizontal side-scroll every <strong>2 seconds</strong> on the public homepage.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={fetchBanners}
            title="Refresh Banners"
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#00A896]" : ""}`} />
          </button>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200"
          >
            <span>Preview Homepage</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={handleOpenCreateModal}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#014923] hover:bg-[#003819] text-white text-xs font-black shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Banner</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
            Total Banners
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">{banners.length}</p>
          <span className="text-[10px] text-slate-500">Cloudinary &amp; DB Hosted</span>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-emerald-700 uppercase tracking-wider">
              Active in 2s Loop
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-2xl font-black text-emerald-800 mt-1">{activeCount}</p>
          <span className="text-[10px] text-emerald-700">Currently sliding live</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
            Inactive / Draft
          </span>
          <p className="text-2xl font-black text-slate-600 mt-1">{banners.length - activeCount}</p>
          <span className="text-[10px] text-slate-500">Hidden from carousel</span>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-extrabold text-[#014923] uppercase tracking-wider block">
            Slide Interval
          </span>
          <p className="text-2xl font-black text-[#014923] mt-1">2.0 sec</p>
          <span className="text-[10px] text-blue-700">Smooth infinite side-scroll</span>
        </div>
      </div>

      {/* Banner Cards Grid */}
      <div className="space-y-4">
        {isLoading && banners.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400">
            <RotateCw className="w-6 h-6 animate-spin text-[#014923] mx-auto mb-2" />
            <p className="text-xs font-bold">Loading promotional banners...</p>
          </div>
        ) : banners.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-[#014923] flex items-center justify-center mx-auto mb-3">
              <UploadCloud className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-black text-slate-900">No banners uploaded yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Click below to upload your first banner image. You can upload as many banners as you like.
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 rounded-xl bg-[#014923] text-white text-xs font-black shadow-md cursor-pointer hover:bg-[#003819] transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Banner Now</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {banners.map((banner, index) => (
              <div
                key={banner._id}
                className={`bg-white border rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group ${
                  banner.isActive ? "border-slate-200" : "border-slate-200/60 opacity-80"
                }`}
              >
                {/* Banner Thumbnail with 1024/384 aspect */}
                <div>
                  <div className="relative w-full aspect-[1024/384] bg-slate-100 overflow-hidden border-b border-slate-100">
                    <Image
                      src={banner.imageUrl}
                      alt={banner.title || `Banner ${index + 1}`}
                      fill
                      unoptimized
                      sizes="(max-width: 768px) 100vw, 400px"
                      className="object-cover group-hover:scale-102 transition-transform duration-500"
                    />

                    {/* Order & Status Badges */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
                      <span className="px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-black uppercase tracking-wider">
                        #{banner.order}
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider backdrop-blur-xs ${
                          banner.isActive
                            ? "bg-emerald-500/90 text-white shadow-xs"
                            : "bg-slate-600/90 text-white"
                        }`}
                      >
                        {banner.isActive ? "Active (In Loop)" : "Inactive"}
                      </span>
                    </div>

                    {/* Quick action buttons overlay */}
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1 z-10">
                      <button
                        onClick={() => handleToggleStatus(banner)}
                        title={banner.isActive ? "Deactivate banner" : "Activate banner"}
                        className={`p-1.5 rounded-lg backdrop-blur-xs transition-colors cursor-pointer ${
                          banner.isActive
                            ? "bg-white/90 text-emerald-700 hover:bg-white"
                            : "bg-white/90 text-slate-500 hover:bg-white"
                        }`}
                      >
                        {banner.isActive ? (
                          <Eye className="w-3.5 h-3.5" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Banner Content Details */}
                  <div className="p-4 space-y-2">
                    <h4 className="text-sm font-black text-slate-900 line-clamp-1">
                      {banner.title || "Untitled Banner"}
                    </h4>

                    {banner.subtitle && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {banner.subtitle}
                      </p>
                    )}

                    <div className="flex items-center gap-1 text-[11px] text-[#014923] font-bold pt-1 truncate">
                      <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{banner.linkUrl || "/search"}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="text-[10px] text-slate-400 font-mono">
                    {new Date(banner.createdAt).toLocaleDateString()}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(banner)}
                      className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => setDeletingBannerId(banner._id)}
                      className="p-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer"
                      title="Delete banner"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload & Edit Banner Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-[#014923]">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {editingBanner ? "Edit Hero Banner" : "Upload Promotional Banner"}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Will display in the 2-second side-scroll loop on the public marketplace.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmitBanner} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              {/* Image Upload Drop Area */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Banner Image <span className="text-rose-500">*</span>
                  <span className="text-[10px] text-slate-400 font-normal ml-1">
                    (Recommended aspect 1024×384 or 16:6 landscape)
                  </span>
                </label>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-full aspect-[1024/384] rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#014923] bg-slate-50 hover:bg-emerald-50/20 transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden p-2 group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  {previewUrl ? (
                    <>
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-2">
                        <UploadCloud className="w-4 h-4" />
                        <span>Click to change image</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-4">
                      <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-1 group-hover:text-[#014923] transition-colors" />
                      <p className="text-xs font-bold text-slate-700">
                        Click or drag banner file here
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        PNG, JPG, WebP up to 10MB (Cloudinary uploaded)
                      </p>
                    </div>
                  )}
                </div>

                {/* Alternative Direct URL Input */}
                <div className="pt-1">
                  <input
                    type="url"
                    placeholder="Or paste direct image URL (e.g. /serabondhu-hero-banner.jpg or https://...)"
                    value={imageUrlInput}
                    onChange={(e) => {
                      setImageUrlInput(e.target.value);
                      if (e.target.value.trim() && !selectedFile) {
                        setPreviewUrl(e.target.value.trim());
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#014923] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Banner Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bangladesh's Trusted Online Marketplace"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#014923] focus:bg-white transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Destination Link URL
                  </label>
                  <input
                    type="text"
                    placeholder="/search or /category/cars"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#014923] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* Subtitle */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Subtitle / Promo Caption
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Discover great deals, buy & sell anything in Dhaka & Chattogram"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#014923] focus:bg-white transition-colors resize-none"
                />
              </div>

              {/* Order & Active Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Display Order (#)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#014923] focus:bg-white transition-colors"
                  />
                  <span className="text-[10px] text-slate-400">
                    Lower number appears first in the loop (e.g. 1, 2, 3...)
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Publish Status
                  </label>
                  <label className="flex items-center gap-2.5 p-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 text-[#014923] rounded cursor-pointer accent-[#014923]"
                    />
                    <span className="text-xs font-bold text-slate-800">
                      Active (Include in 2s Auto-Scroll Loop)
                    </span>
                  </label>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isActionLoading}
                  className="px-5 py-2.5 rounded-xl bg-[#014923] hover:bg-[#003819] text-white text-xs font-black shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isActionLoading ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      <span>Uploading to Cloudinary...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>{editingBanner ? "Save Changes" : "Publish Banner"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingBannerId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-xl bg-rose-50">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Delete Banner</h3>
                <p className="text-xs text-slate-500">
                  This action removes the banner from the database and Cloudinary.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete this banner? It will immediately stop appearing in the homepage carousel loop.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingBannerId(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isActionLoading}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
              >
                {isActionLoading ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

