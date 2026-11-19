"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Seller } from "@/types/seller";
import { Product } from "@/types/product";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Button } from "@/components/common/Button";
import { UserAvatar } from "@/components/common/UserAvatar";
import { useMarketplace } from "@/context/MarketplaceContext";
import { BadgeCheck, MapPin, Calendar, Star, Phone, ShieldCheck, UserCheck } from "lucide-react";

interface SellerProfileProps {
  seller: Seller;
  products: Product[];
}

export function SellerProfile({ seller, products }: SellerProfileProps) {
  const { user } = useMarketplace();
  const [showPhone, setShowPhone] = useState(false);

  const currentUserId = user ? String(user.id || (user as any)._id || "") : "";
  const currentUserEmail = user?.email ? user.email.toLowerCase().trim() : "";
  const sellerId = String(seller?.id || (seller as any)?._id || "");
  const sellerEmail = (seller?.email || "").toLowerCase().trim();

  const isOwner = Boolean(
    user && (
      (currentUserId && sellerId && currentUserId === sellerId) ||
      (currentUserEmail && sellerEmail && currentUserEmail === sellerEmail)
    )
  );

  return (
    <div className="space-y-8">
      {/* Profile Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <UserAvatar
              src={seller.avatar}
              name={seller.name}
              size="xl"
              borderClassName="border-4 border-slate-100 shadow-md"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">{seller.name}</h1>
                {seller.verified && (
                  <span title="Verified Seller">
                    <BadgeCheck className="w-5 h-5 text-[#00A896]" />
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{seller.location.area}, {seller.location.city}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Member since {seller.memberSince}</span>
                </div>
              </div>
              {seller.rating && (
                <div className="flex items-center gap-1 text-xs text-amber-500 font-bold pt-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{seller.rating} / 5.0</span>
                  <span className="text-slate-400 font-normal">({seller.reviewCount} verified reviews)</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
            {!isOwner ? (
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                leftIcon={<Phone className="w-4 h-4 text-[#00A896]" />}
                onClick={() => setShowPhone(!showPhone)}
              >
                {showPhone ? (seller.phone || "+977 98412 34567") : "Show Phone Number"}
              </Button>
            ) : (
              <Link href="/profile">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto text-[#014923] border-[#014923]/30 hover:bg-emerald-50"
                  leftIcon={<UserCheck className="w-4 h-4 text-[#014923]" />}
                >
                  Edit Your Profile
                </Button>
              </Link>
            )}
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Identity &amp; Phone Verified</span>
            </div>
          </div>
        </div>

        {seller.about && (
          <div className="mt-6 pt-6 border-t border-slate-100 text-sm text-slate-600 leading-relaxed">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">About Seller</h4>
            <p>{seller.about}</p>
          </div>
        )}
      </div>

      {/* Seller's Active Ads */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Active Advertisements ({products.length})
          </h2>
        </div>

        <ProductGrid
          products={products}
          emptyMessage="This seller currently has no active advertisements."
        />
      </div>
    </div>
  );
}

