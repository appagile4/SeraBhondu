"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import api from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import {
  ShoppingBag,
  Search,
  RotateCw,
  Eye,
  MessageSquare,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  History,
  Phone,
  User,
  ArrowRight,
  Filter,
  Loader2,
} from "lucide-react";

interface DealsTableProps {
  onViewProductHistory: (advertisementId: string) => void;
  onInspectTranscript: (conversationId: string) => void;
}

export function DealsTable({
  onViewProductHistory,
  onInspectTranscript,
}: DealsTableProps) {
  const [deals, setDeals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [totalCount, setTotalCount] = useState(0);

  const fetchDeals = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/admin/deals", {
        params: {
          status: statusFilter !== "all" ? statusFilter : undefined,
          search: searchTerm || undefined,
        },
      });

      if (res.data?.success) {
        setDeals(res.data.deals || []);
        setTotalCount(res.data.total || 0);
      }
    } catch (err) {
      console.error("Failed to load deals:", err);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  return (
    <div className="space-y-4">
      {/* Control Header: Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: "all", label: "All Transactions & Inquiries" },
            { id: "sold", label: "Sold Deals" },
            { id: "negotiating", label: "Active Negotiations" },
            { id: "inquired", label: "New Inquiries" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`text-xs px-3.5 py-1.5 rounded-full font-bold transition-all shrink-0 cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-[#014923] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar & Refresh */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search buyer, seller, product, city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#014923] focus:bg-white transition-all"
            />
          </div>

          <button
            onClick={fetchDeals}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors cursor-pointer shadow-xs"
            title="Refresh transactions"
          >
            <RotateCw
              className={`w-4 h-4 ${isLoading ? "animate-spin text-[#00A884]" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Transactions & Inquiries Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Item &amp; Price</th>
                <th className="py-3 px-4">Seller</th>
                <th className="py-3 px-4">Buyer</th>
                <th className="py-3 px-4">Transaction / Status</th>
                <th className="py-3 px-4">Where &amp; When</th>
                <th className="py-3 px-4">Inquiry Activity</th>
                <th className="py-3 px-4 text-right">Audit Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {isLoading && (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="inline-flex items-center gap-2 text-xs font-bold text-slate-500">
                      <Loader2 className="w-4 h-4 animate-spin text-[#00A884]" />
                      <span>Loading marketplace transaction ledger...</span>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && deals.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <ShoppingBag className="w-8 h-8 mx-auto opacity-50 mb-2" />
                    <p className="font-bold text-slate-700">No transactions or inquiries found</p>
                    <p className="text-[11px]">
                      Buyer inquiries and purchases will appear here in real-time.
                    </p>
                  </td>
                </tr>
              )}

              {!isLoading &&
                deals.map((deal) => {
                  const product = deal.product;
                  const seller = deal.seller;
                  const buyer = deal.buyer;
                  const isSold = deal.isSold || deal.dealStatus === "sold";

                  return (
                    <tr
                      key={deal.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Product & Price */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                            {product.image ? (
                              <Image
                                src={product.image}
                                alt={product.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xs">
                                Ad
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-[#014923] uppercase block">
                              {product.category}
                            </span>
                            <p className="font-bold text-slate-900 truncate">
                              {product.title}
                            </p>
                            <span className="font-black text-[#014923]">
                              {formatPrice(product.price)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Seller */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                            <Image
                              src={
                                seller.avatar ||
                                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
                              }
                              alt={seller.name}
                              width={28}
                              height={28}
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">
                              {seller.name}
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono">
                              {seller.phone || seller.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Buyer */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                            <Image
                              src={
                                buyer.avatar ||
                                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
                              }
                              alt={buyer.name}
                              width={28}
                              height={28}
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <p className="font-bold text-slate-900 truncate">
                                {buyer.name}
                              </p>
                              {isSold && (
                                <span className="text-[9px] font-black bg-emerald-600 text-white px-1.5 py-0.2 rounded uppercase">
                                  BUYER
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500 font-mono">
                              {buyer.phone || buyer.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Transaction Status */}
                      <td className="py-3.5 px-4">
                        {isSold ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>SOLD &amp; DELIVERED</span>
                            </span>
                            {product.soldPrice && (
                              <p className="text-[11px] font-bold text-emerald-700 pl-1">
                                Sold: {formatPrice(product.soldPrice)}
                              </p>
                            )}
                          </div>
                        ) : deal.dealStatus === "negotiating" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-[#014923] border border-emerald-200">
                            <Clock className="w-3 h-3 text-[#014923]" />
                            <span>NEGOTIATING</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                            <span>INQUIRY</span>
                          </span>
                        )}
                      </td>

                      {/* Where & When */}
                      <td className="py-3.5 px-4 text-xs">
                        <div className="flex items-center gap-1 text-slate-800 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-[#E30613] shrink-0" />
                          <span>{product.city || seller.city || "Bangladesh"}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Inquired: {new Date(deal.inquiryDate).toLocaleDateString()}
                        </div>
                      </td>

                      {/* Messages / Activity */}
                      <td className="py-3.5 px-4 max-w-[180px]">
                        <p className="font-bold text-slate-900 text-xs flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5 text-[#00A884]" />
                          <span>{deal.messageCount} messages</span>
                        </p>
                        <p className="text-[11px] text-slate-500 truncate italic mt-0.5">
                          &ldquo;{deal.lastMessageText}&rdquo;
                        </p>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Inspect Chat */}
                          <button
                            type="button"
                            onClick={() => onInspectTranscript(deal.conversationId)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#014923] font-bold text-xs flex items-center gap-1 transition-colors border border-emerald-200 cursor-pointer"
                            title="Inspect Chat Transcript"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span className="hidden xl:inline">Chat Log</span>
                          </button>

                          {/* View Lifecycle */}
                          {product.id && (
                            <button
                              type="button"
                              onClick={() => onViewProductHistory(product.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center gap-1 transition-colors shadow-xs cursor-pointer"
                              title="Full Product Provenance & History"
                            >
                              <History className="w-3.5 h-3.5" />
                              <span className="hidden xl:inline">Product History</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

