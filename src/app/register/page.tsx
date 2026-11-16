"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMarketplace } from "@/context/MarketplaceContext";
import { useAppSelector } from "@/store";
import { AuthMethodSelector } from "@/components/auth";

export default function RegisterPage() {
  const router = useRouter();
  const { openAuthModal } = useMarketplace();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/profile");
      return;
    }
    // Automatically trigger the animated bottom sheet modal on page load
    openAuthModal();
  }, [isAuthenticated, openAuthModal, router]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center py-10 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200">
        <AuthMethodSelector
          onSelectEmail={openAuthModal}
          onSelectPhone={openAuthModal}
          onGoogleSuccess={() => router.push("/profile")}
          onGoogleError={(err) => console.error(err)}
        />
      </div>
    </div>
  );
}
