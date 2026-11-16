"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import api from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import {
  X,
  MessageSquare,
  ShieldCheck,
  Calendar,
  User,
  ShoppingBag,
  ExternalLink,
  CheckCircle2,
  Clock,
  Loader2,
} from "lucide-react";

interface ChatTranscriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string | null;
}

export function ChatTranscriptModal({
  isOpen,
  onClose,
  conversationId,
}: ChatTranscriptModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<{
    conversation: any;
    totalMessages: number;
    messages: any[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !conversationId) {
      setData(null);
      setError(null);
      return;
    }

    let isMounted = true;
    async function fetchTranscript() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.get(
          `/admin/conversations/${conversationId}/audit-transcript`
        );
        if (res.data?.success && isMounted) {
          setData(res.data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(
            err.response?.data?.message || "Failed to load audit transcript."
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchTranscript();

    return () => {
      isMounted = false;
    };
  }, [isOpen, conversationId]);

  if (!isOpen) return null;

  const conv = data?.conversation;
  const ad = conv?.advertisement;
  const seller = conv?.seller || conv?.participants?.[0];
  const buyer = conv?.buyer || conv?.participants?.[1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[85vh] max-h-[720px] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="bg-[#F0F2F5] px-5 py-3.5 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#014923]/10 text-[#014923] flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-slate-900 truncate">
                  Buyer-Seller Chat Audit Transcript
                </h3>
                <span className="bg-emerald-100 text-[#014923] text-[10px] font-black px-2 py-0.5 rounded-full shrink-0">
                  SUPERADMIN AUDIT
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                Official compliance record of negotiations and buyer inquiry
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

        {/* Product & Parties Context Ribbon */}
        {ad && (
          <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
            {/* Ad summary */}
            <div className="flex items-center gap-2.5 min-w-0">
              {ad.images?.[0]?.url || ad.images?.[0] ? (
                <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0">
                  <Image
                    src={ad.images?.[0]?.url || ad.images?.[0]}
                    alt={ad.title}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : null}
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Negotiating Item
                </span>
                <span className="font-bold text-slate-900 truncate block max-w-xs sm:max-w-md">
                  {ad.title}
                </span>
                <span className="font-extrabold text-[#014923]">
                  {formatPrice(ad.price)}
                </span>
              </div>
            </div>

            {/* Participants Summary */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">
                  Seller
                </span>
                <span className="font-bold text-slate-900">
                  {seller?.name || "Seller"}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {seller?.phone || seller?.email}
                </span>
              </div>
              <span className="text-slate-300 font-bold">⇄</span>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase">
                  Buyer
                </span>
                <span className="font-bold text-slate-900">
                  {buyer?.name || "Buyer"}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {buyer?.phone || buyer?.email}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Messages Stream Container */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-3 bg-[#EFEAE2] relative whatsapp-scrollbar">
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm text-xs font-bold text-slate-600">
                <Loader2 className="w-4 h-4 animate-spin text-[#00A884]" />
                <span>Loading transcript from database...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center text-xs text-red-700">
              {error}
            </div>
          )}

          {!isLoading && data && data.messages.length === 0 && (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto text-slate-400 opacity-60" />
              <p className="text-xs font-bold text-slate-700">
                No chat messages recorded yet
              </p>
              <p className="text-[11px] text-slate-400">
                This inquiry was initiated, but no messages were exchanged.
              </p>
            </div>
          )}

          {!isLoading &&
            data &&
            data.messages.map((msg: any) => {
              const isSeller =
                (msg.sender?._id || msg.sender).toString() ===
                (seller?._id || seller?.id || "").toString();

              return (
                <div
                  key={msg._id}
                  className={`flex flex-col ${
                    isSeller ? "items-start" : "items-end"
                  }`}
                >
                  {/* Sender Tag */}
                  <div className="flex items-center gap-1.5 px-1 mb-1 text-[11px]">
                    <span className="font-bold text-slate-700">
                      {msg.sender?.name || (isSeller ? "Seller" : "Buyer")}
                    </span>
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                        isSeller
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-[#014923]"
                      }`}
                    >
                      {isSeller ? "SELLER" : "BUYER"}
                    </span>
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-md rounded-2xl px-4 py-2.5 shadow-sm text-xs space-y-1.5 ${
                      isSeller
                        ? "bg-white text-slate-900 rounded-tl-xs border border-slate-200"
                        : "bg-[#D9FDD3] text-slate-900 rounded-tr-xs border border-emerald-200"
                    }`}
                  >
                    {/* Attachment if present */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="space-y-1">
                        {msg.attachments.map((att: any, i: number) => (
                          <div
                            key={i}
                            className="relative w-48 h-32 rounded-lg overflow-hidden border border-slate-200 bg-slate-100"
                          >
                            <Image
                              src={att.url}
                              alt="Attachment"
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Text Message */}
                    <p className="whitespace-pre-wrap leading-relaxed font-sans text-[12.5px]">
                      {msg.text || msg.message}
                    </p>

                    {/* Timestamp & Status */}
                    <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 pt-0.5">
                      <span>
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="capitalize">• {msg.status || "sent"}</span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Modal Bottom Footer */}
        <div className="bg-[#F0F2F5] px-5 py-3 border-t border-slate-200 flex items-center justify-between shrink-0 text-xs">
          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              Total {data?.totalMessages || 0} messages logged for this
              buyer-seller deal.
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Close Transcript
          </button>
        </div>
      </div>
    </div>
  );
}

