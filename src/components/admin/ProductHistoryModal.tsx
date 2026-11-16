"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import api from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { ChatTranscriptModal } from "./ChatTranscriptModal";
import {
  X,
  History,
  CheckCircle2,
  Calendar,
  MapPin,
  User,
  ShoppingBag,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  Phone,
  Mail,
  Clock,
  BadgeDollarSign,
  AlertCircle,
  Loader2,
  Plus,
} from "lucide-react";

interface ProductHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  advertisementId: string | null;
  onRecordSaleSuccess?: () => void;
}

export function ProductHistoryModal({
  isOpen,
  onClose,
  advertisementId,
  onRecordSaleSuccess,
}: ProductHistoryModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<{
    advertisement: any;
    seller: any;
    soldRecord: any;
    inquiries: any[];
    auditLogs: any[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Mark Sold Form State
  const [showMarkSoldForm, setShowMarkSoldForm] = useState(false);
  const [selectedBuyerId, setSelectedBuyerId] = useState<string>("");
  const [soldPriceInput, setSoldPriceInput] = useState<string>("");
  const [soldLocationInput, setSoldLocationInput] = useState<string>("");
  const [isSubmittingSale, setIsSubmittingSale] = useState(false);
  const [saleSuccessMsg, setSaleSuccessMsg] = useState<string | null>(null);

  // Chat Transcript Modal
  const [inspectConvId, setInspectConvId] = useState<string | null>(null);

  const fetchHistory = async () => {
    if (!advertisementId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get(
        `/admin/advertisements/${advertisementId}/history`
      );
      if (res.data?.success) {
        setData(res.data);
        if (res.data.advertisement?.price) {
          setSoldPriceInput(res.data.advertisement.price.toString());
        }
        if (res.data.advertisement?.location?.city) {
          setSoldLocationInput(res.data.advertisement.location.city);
        }
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to load product history."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && advertisementId) {
      fetchHistory();
      setShowMarkSoldForm(false);
      setSaleSuccessMsg(null);
    } else {
      setData(null);
      setError(null);
    }
  }, [isOpen, advertisementId]);

  const handleMarkAsSold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!advertisementId) return;

    setIsSubmittingSale(true);
    try {
      const res = await api.put(
        `/admin/advertisements/${advertisementId}/mark-sold`,
        {
          buyerId: selectedBuyerId || undefined,
          soldPrice: soldPriceInput ? Number(soldPriceInput) : undefined,
          soldLocation: soldLocationInput || undefined,
          soldAt: new Date().toISOString(),
        }
      );

      if (res.data?.success) {
        setSaleSuccessMsg(
          "Product sale successfully recorded in the marketplace ledger!"
        );
        setShowMarkSoldForm(false);
        fetchHistory();
        if (onRecordSaleSuccess) onRecordSaleSuccess();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to record sale.");
    } finally {
      setIsSubmittingSale(false);
    }
  };

  if (!isOpen) return null;

  const ad = data?.advertisement;
  const seller = data?.seller || ad?.seller;
  const soldRecord = data?.soldRecord;
  const inquiries = data?.inquiries || [];
  const auditLogs = data?.auditLogs || [];

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
        <div
          className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[90vh] max-h-[820px] animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-[#F8FAFC] px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#014923]/10 text-[#014923] flex items-center justify-center shrink-0">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <span>Product Lifecycle &amp; Buyer-Seller History</span>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-[#014923] px-2 py-0.5 rounded-full">
                    AUDIT LEDGER
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Detailed provenance: seller registration, buyer acquisition, location, and prospective inquiries.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200/70 rounded-full transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 space-y-6 bg-slate-50/50 whatsapp-scrollbar">
            {isLoading && (
              <div className="flex items-center justify-center py-20">
                <div className="inline-flex items-center gap-2 bg-white px-4 py-2.5 rounded-full shadow-sm text-xs font-bold text-slate-600 border border-slate-200">
                  <Loader2 className="w-4 h-4 animate-spin text-[#00A884]" />
                  <span>Loading product history ledger...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-center text-xs text-red-700">
                {error}
              </div>
            )}

            {saleSuccessMsg && (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold px-4 py-3 rounded-2xl flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{saleSuccessMsg}</span>
                </div>
                <button
                  onClick={() => setSaleSuccessMsg(null)}
                  className="text-emerald-700 hover:text-emerald-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {!isLoading && ad && (
              <>
                {/* 1. PRODUCT SUMMARY BANNER */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                      <Image
                        src={
                          ad.images?.[0]?.url ||
                          (typeof ad.images?.[0] === "string"
                            ? ad.images[0]
                            : "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80")
                        }
                        alt={ad.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-50 text-[#014923]">
                          {ad.category}
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            ad.status === "sold" || ad.isSold
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : ad.status === "approved"
                              ? "bg-emerald-100 text-[#014923] border border-emerald-200"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {ad.isSold ? "SOLD & DELIVERED" : ad.status}
                        </span>
                      </div>
                      <h4 className="text-sm sm:text-base font-black text-slate-900 truncate">
                        {ad.title}
                      </h4>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-base font-black text-[#014923]">
                          {formatPrice(ad.price)}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#E30613]" />
                          {ad.location?.city || "Dhaka"}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500">
                          Listed {new Date(ad.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {ad.slug && (
                    <a
                      href={`/product/${ad.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
                    >
                      <span>View Live Ad</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                {/* 2. BUYER & SALE RECORD (THE CORE AUDIT LEDGER) */}
                <div
                  className={`rounded-2xl p-5 border shadow-xs space-y-3 ${
                    soldRecord?.isSold
                      ? "bg-gradient-to-br from-emerald-50/80 to-teal-50/50 border-emerald-200"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          soldRecord?.isSold
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <BadgeDollarSign className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-xs font-black uppercase tracking-wider text-slate-900">
                          {soldRecord?.isSold
                            ? "Sale & Acquisition Record"
                            : "Marketplace Sale Status"}
                        </h5>
                        <p className="text-[11px] text-slate-500">
                          {soldRecord?.isSold
                            ? "Official verified transaction record between seller and buyer"
                            : "This item is currently listed as available or under active negotiation"}
                        </p>
                      </div>
                    </div>

                    {!soldRecord?.isSold && (
                      <button
                        type="button"
                        onClick={() => setShowMarkSoldForm(!showMarkSoldForm)}
                        className="px-3.5 py-1.5 bg-[#00A884] hover:bg-[#008f6f] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{showMarkSoldForm ? "Cancel" : "Record Sale / Mark as Sold"}</span>
                      </button>
                    )}
                  </div>

                  {/* Mark as Sold Form Drawer */}
                  {showMarkSoldForm && (
                    <form
                      onSubmit={handleMarkAsSold}
                      className="bg-white p-4 rounded-xl border border-slate-300 space-y-3 animate-in slide-in-from-top-2"
                    >
                      <h6 className="text-xs font-extrabold text-slate-900">
                        Record Deal &amp; Specify Buyer
                      </h6>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        {/* Select Buyer */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                            Select Buyer
                          </label>
                          <select
                            value={selectedBuyerId}
                            onChange={(e) => setSelectedBuyerId(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 outline-none focus:border-[#00A884]"
                          >
                            <option value="">-- Choose from Inquirers --</option>
                            {inquiries.map((inq) => (
                              <option key={inq.id} value={inq.buyer?.id}>
                                {inq.buyer?.name} ({inq.buyer?.phone || inq.buyer?.email})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Sold Price */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                            Agreed Sale Price (Rs.)
                          </label>
                          <input
                            type="number"
                            value={soldPriceInput}
                            onChange={(e) => setSoldPriceInput(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 outline-none focus:border-[#00A884]"
                            placeholder="Final amount"
                            required
                          />
                        </div>

                        {/* Sold Location */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                            Sale Location / City
                          </label>
                          <input
                            type="text"
                            value={soldLocationInput}
                            onChange={(e) => setSoldLocationInput(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 outline-none focus:border-[#00A884]"
                            placeholder="Dhaka, Chattogram..."
                            required
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowMarkSoldForm(false)}
                          className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmittingSale}
                          className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
                        >
                          {isSubmittingSale ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          <span>Confirm Sale Record</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* If Sold: Full Verified Buyer Dossier */}
                  {soldRecord?.isSold && (
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
                      <div className="bg-white/90 p-3 rounded-xl border border-emerald-200">
                        <span className="text-[10px] font-extrabold uppercase text-slate-400 block">
                          Purchased By (Buyer)
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                            <Image
                              src={
                                soldRecord.buyer?.avatar ||
                                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
                              }
                              alt={soldRecord.buyer?.name || "Buyer"}
                              width={28}
                              height={28}
                              className="object-cover"
                            />
                          </div>
                          <span className="font-bold text-slate-900 text-xs truncate">
                            {soldRecord.buyer?.name || "Direct Marketplace Buyer"}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 block truncate mt-0.5 font-mono">
                          {soldRecord.buyer?.phone || soldRecord.buyer?.email}
                        </span>
                      </div>

                      <div className="bg-white/90 p-3 rounded-xl border border-emerald-200">
                        <span className="text-[10px] font-extrabold uppercase text-slate-400 block">
                          Final Agreed Price
                        </span>
                        <span className="text-sm font-black text-emerald-700 block mt-1">
                          {formatPrice(soldRecord.soldPrice || ad.price)}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Listed at {formatPrice(ad.price)}
                        </span>
                      </div>

                      <div className="bg-white/90 p-3 rounded-xl border border-emerald-200">
                        <span className="text-[10px] font-extrabold uppercase text-slate-400 block">
                          When Sold (Date &amp; Time)
                        </span>
                        <span className="text-xs font-bold text-slate-900 block mt-1">
                          {new Date(soldRecord.soldAt).toLocaleDateString()}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(soldRecord.soldAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <div className="bg-white/90 p-3 rounded-xl border border-emerald-200">
                        <span className="text-[10px] font-extrabold uppercase text-slate-400 block">
                          Where Sold (Location)
                        </span>
                        <span className="text-xs font-bold text-slate-900 block mt-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{soldRecord.soldLocation || "Dhaka"}</span>
                        </span>
                        <span className="text-[10px] text-slate-500">Deal closed in Bangladesh</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. TWO COLUMN: SELLER DETAILS & PROSPECTIVE BUYERS */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Left Column: Seller Dossier (4 cols) */}
                  <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <h5 className="text-xs font-black uppercase tracking-wider text-slate-400">
                      Seller Dossier
                    </h5>

                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 border border-slate-300 shrink-0">
                        <Image
                          src={
                            seller?.avatar ||
                            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
                          }
                          alt={seller?.name || "Seller"}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-slate-900 text-sm truncate">
                            {seller?.name || "Seller"}
                          </span>
                          {seller?.isVerified && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#014923] shrink-0" />
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 block">
                          Seller on Serabondhu
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5" /> Phone:
                        </span>
                        <span className="font-mono font-bold text-slate-900">
                          {seller?.phone || "Not provided"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5" /> Email:
                        </span>
                        <span className="font-mono text-slate-900 truncate max-w-[160px]">
                          {seller?.email || "Not provided"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" /> City:
                        </span>
                        <span className="font-bold text-slate-900">
                          {seller?.city || "Dhaka"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" /> Member Since:
                        </span>
                        <span className="text-slate-700">
                          {seller?.createdAt
                            ? new Date(seller.createdAt).toLocaleDateString()
                            : "2026"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Inquiries & Prospective Buyers History (8 cols) */}
                  <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-xs font-black uppercase tracking-wider text-slate-900">
                          Prospective Inquiries ({inquiries.length})
                        </h5>
                        <p className="text-[11px] text-slate-500">
                          Complete registry of everyone who inquired, chatted, or negotiated for this product
                        </p>
                      </div>
                      <span className="text-[10px] font-extrabold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
                        {inquiries.length} {inquiries.length === 1 ? "Inquirer" : "Inquirers"}
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto whatsapp-scrollbar pr-1">
                      {inquiries.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 space-y-2">
                          <MessageSquare className="w-8 h-8 mx-auto opacity-50" />
                          <p className="text-xs font-bold text-slate-700">
                            No buyers have inquired about this product yet
                          </p>
                          <p className="text-[11px] text-slate-400">
                            As soon as a buyer clicks &apos;Chat with Seller&apos;, their inquiry is logged here.
                          </p>
                        </div>
                      ) : (
                        inquiries.map((inq) => {
                          const isBuyerOfProduct = inq.isSoldToThisBuyer;

                          return (
                            <div
                              key={inq.id}
                              className={`py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors ${
                                isBuyerOfProduct ? "bg-emerald-50/50 p-3 rounded-xl" : ""
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                                  <Image
                                    src={
                                      inq.buyer?.avatar ||
                                      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
                                    }
                                    alt={inq.buyer?.name}
                                    width={36}
                                    height={36}
                                    className="object-cover"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-900 text-xs">
                                      {inq.buyer?.name}
                                    </span>
                                    {isBuyerOfProduct && (
                                      <span className="text-[9px] font-black bg-emerald-600 text-white px-1.5 py-0.2 rounded-full uppercase">
                                        PURCHASER
                                      </span>
                                    )}
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      {inq.buyer?.phone || inq.buyer?.email}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-600 truncate mt-0.5 italic">
                                    &ldquo;{inq.lastMessageText}&rdquo;
                                  </p>
                                  <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-0.5">
                                    <span>
                                      First Inquired: {new Date(inq.inquiryDate).toLocaleDateString()}
                                    </span>
                                    <span>•</span>
                                    <span>{inq.messageCount} messages</span>
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => setInspectConvId(inq.conversationId)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#014923] font-bold text-xs flex items-center gap-1 transition-colors shrink-0 cursor-pointer border border-emerald-200"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>Inspect Chat</span>
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* 4. ADMIN AUDIT TIMELINE */}
                {auditLogs.length > 0 && (
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                    <h5 className="text-xs font-black uppercase tracking-wider text-slate-400">
                      Administrative Audit Trail
                    </h5>
                    <div className="space-y-2">
                      {auditLogs.map((log: any) => (
                        <div
                          key={log._id}
                          className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 last:border-0"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              {log.action}
                            </span>
                            <span className="text-slate-700 font-medium">
                              By {log.admin?.name || "Superadmin"}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="bg-[#F8FAFC] px-6 py-3 border-t border-slate-200 flex items-center justify-between shrink-0 text-xs">
            <span className="text-slate-400 text-[11px] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Full compliance &amp; marketplace transaction audit log</span>
            </span>

            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Close Ledger
            </button>
          </div>
        </div>
      </div>

      {/* Embedded Transcript Inspector */}
      <ChatTranscriptModal
        isOpen={Boolean(inspectConvId)}
        onClose={() => setInspectConvId(null)}
        conversationId={inspectConvId}
      />
    </>
  );
}

