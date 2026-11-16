"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/common/Button";
import { useLanguage } from "@/context/LanguageContext";
import { PlusCircle, ShieldCheck, Zap, Users } from "lucide-react";

export function SellCTA() {
  const { t } = useLanguage();

  return (
    <section className="my-12 relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#014923] via-[#013819] to-[#002611] text-white p-8 sm:p-12 border border-emerald-950 shadow-2xl">
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-[#E30613]/25 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-200 text-xs font-bold border border-red-500/30">
            <Zap className="w-3.5 h-3.5 fill-red-300" />
            <span>{t("sellCtaBadge")}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            {t("sellCtaTitle")}
          </h2>

          <p className="text-sm sm:text-base text-emerald-100 max-w-xl leading-relaxed">
            {t("sellCtaSub")}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs text-emerald-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white/10 text-emerald-300">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span>{t("sellFeature1")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white/10 text-amber-300">
                <Users className="w-4 h-4" />
              </div>
              <span>{t("sellFeature2")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white/10 text-orange-300">
                <PlusCircle className="w-4 h-4" />
              </div>
              <span>{t("sellFeature3")}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-center">
          <Link href="/post-ad" className="w-full sm:w-auto">
            <Button
              variant="sell"
              size="lg"
              leftIcon={<PlusCircle className="w-5 h-5 stroke-[2.5]" />}
              className="w-full sm:w-auto px-8 py-4 text-base font-black shadow-xl"
            >
              {t("sellCtaBtn")}
            </Button>
          </Link>
          <span className="text-[11px] text-emerald-200 mt-2 block">
            {t("tagline")}
          </span>
        </div>
      </div>
    </section>
  );
}
