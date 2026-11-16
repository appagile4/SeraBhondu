"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Seller } from "@/types/seller";
import { Product } from "@/types/product";
import { Button } from "@/components/common/Button";
import { useMarketplace } from "@/context/MarketplaceContext";
import { BadgeCheck, MessageSquare, Phone, ChevronRight, Shield, Star, CheckCircle } from "lucide-react";

interface SellerCardProps {
  seller: Seller;
  product?: Product;
}

export function SellerCard({ seller, product }: SellerCardProps) {
  const { openChat, user, openAuthModal } = useMarketplace();
  const [showPhone, setShowPhone] = useState(false);

  // Robust check to determine if the logged-in user is the owner of this product
  const currentUserId = user ? String(user.id || (user as any)._id || "") : "";
  const currentUserEmail = user?.email ? user.email.toLowerCase().trim() : "";
  const currentUserPhone = user?.phone ? user.phone.replace(/\D/g, "") : "";

  const sellerId = String(
    seller?.id ||
    (seller as any)?._id ||
    (product as any)?.seller?._id ||
    (product as any)?.seller?.id ||
    (typeof product?.seller === "string" ? product.seller : "") ||
    ""
  );

  const sellerEmail = (
    seller?.email ||
    (product as any)?.sellerContact?.email ||
    (product as any)?.seller?.email ||
    ""
  ).toLowerCase().trim();

  const sellerPhone = (
    seller?.phone ||
    (product as any)?.sellerContact?.phone ||
    (product as any)?.seller?.phone ||
    ""
  ).replace(/\D/g, "");

  const isOwner = Boolean(
    user && (
      (currentUserId && sellerId && currentUserId === sellerId) ||
      (currentUserEmail && sellerEmail && currentUserEmail === sellerEmail) ||
      (currentUserPhone && sellerPhone && currentUserPhone === sellerPhone)
    )
  );

  const handleChatClick = () => {
    if (!user) {
      openAuthModal();
      return;
    }
    if (isOwner) return;
    openChat(product);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-5 shadow-xs">
      {/* Seller Header */}
      <div className="flex items-center gap-3.5">
        <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-slate-200 shrink-0">
          <Image
            src={seller.avatar}
            alt={seller.name}
            width={56}
            height={56}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="text-base font-bold text-slate-900 truncate">{seller.name}</h4>
            {seller.verified && (
              <span title="Verified Seller">
                <BadgeCheck className="w-4 h-4 text-[#014923] shrink-0" />
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">Member since {seller.memberSince}</p>
          {seller.rating && (
            <div className="flex items-center gap-1 mt-0.5 text-xs text-amber-500 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{seller.rating}</span>
              <span className="text-slate-400 font-normal">({seller.reviewCount} reviews)</span>
            </div>
          )}
        </div>
      </div>

      {/* Trust & Stats */}
      <div className="grid grid-cols-2 gap-2 text-center py-2.5 px-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
        <div>
          <span className="block text-slate-400 text-[10px] uppercase font-bold">Total Ads</span>
          <span className="font-extrabold text-slate-800 text-sm">{seller.totalAds} Ads</span>
        </div>
        <div>
          <span className="block text-slate-400 text-[10px] uppercase font-bold">Verified</span>
          <span className="font-extrabold text-[#014923] text-sm">Phone &amp; ID</span>
        </div>
      </div>

      {/* Actions: If user sees their own product, DO NOT show chat and phone options */}
      {!isOwner ? (
        <div className="space-y-2.5">
          <Button
            variant="primary"
            className="w-full py-3"
            leftIcon={<MessageSquare className="w-4 h-4" />}
            onClick={handleChatClick}
          >
            Chat with Seller
          </Button>

          <Button
            variant="outline"
            className="w-full py-2.5 text-xs"
            leftIcon={<Phone className="w-4 h-4 text-[#E30613]" />}
            onClick={() => setShowPhone(!showPhone)}
          >
            {showPhone ? (seller.phone || "+977 98412 34567") : "Show Phone Number"}
          </Button>
        </div>
      ) : (
        <div className="bg-blue-50/70 border border-emerald-200/80 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#014923]">
            <CheckCircle className="w-4 h-4 text-[#014923] shrink-0" />
            <span>This is your advertisement</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            You posted this listing. Buyer messages and calls will be directed to you.
          </p>
          <div className="pt-1 flex items-center gap-2">
            <Link
              href="/profile"
              className="flex-1 text-center py-2 px-3 text-xs font-bold text-[#014923] hover:text-[#003819] bg-white border border-emerald-200 hover:border-emerald-300 rounded-lg transition-colors shadow-2xs"
            >
              Manage in My Ads
            </Link>
            <Link
              href="/chat"
              className="flex-1 text-center py-2 px-3 text-xs font-bold text-white bg-[#014923] hover:bg-[#003819] rounded-lg transition-colors shadow-2xs"
            >
              View Inquiries
            </Link>
          </div>
        </div>
      )}

      {/* Safety Note & Link */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1 text-[11px] text-slate-500">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          <span>Safety verified seller</span>
        </div>
        <Link
          href={`/seller/${seller.id}`}
          className="text-xs font-semibold text-[#014923] hover:text-[#E30613] flex items-center gap-0.5"
        >
          <span>View Profile</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

