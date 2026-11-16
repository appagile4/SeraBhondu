"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { MEGA_MENU_GROUPS } from "@/data/categories";
import {
  Car,
  Home,
  Tv,
  Smartphone,
  Truck,
  Briefcase,
  Armchair,
  Shirt,
  HeartHandshake,
  BookOpen,
  Wrench,
  ChevronRight,
  X,
} from "lucide-react";

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  vehicles: <Car className="w-4 h-4 text-[#014923]" />,
  properties: <Home className="w-4 h-4 text-[#014923]" />,
  electronics: <Tv className="w-4 h-4 text-[#014923]" />,
  mobiles: <Smartphone className="w-4 h-4 text-[#014923]" />,
  "commercial-vehicles": <Truck className="w-4 h-4 text-[#014923]" />,
  jobs: <Briefcase className="w-4 h-4 text-[#014923]" />,
  furniture: <Armchair className="w-4 h-4 text-[#014923]" />,
  fashion: <Shirt className="w-4 h-4 text-[#014923]" />,
  pets: <HeartHandshake className="w-4 h-4 text-[#014923]" />,
  "books-sports-hobbies": <BookOpen className="w-4 h-4 text-[#014923]" />,
  services: <Wrench className="w-4 h-4 text-[#014923]" />,
};

export function MegaMenu({ isOpen, onClose }: MegaMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 w-full z-40 bg-white border-b border-slate-200 shadow-2xl animate-in slide-in-from-top-2 duration-200 max-h-[80vh] overflow-y-auto">
      <div ref={menuRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-black text-[#014923] tracking-tight">
              All Classified Categories
            </h2>
            <p className="text-xs text-slate-500">
              Browse thousands of advertisements across all 11 primary marketplace departments
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 11 Categories organized in a responsive multi-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-6">
          {MEGA_MENU_GROUPS.map((group) => {
            return (
              <div key={group.id} className="space-y-2">
                <Link
                  href={`/category/${group.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-2 group/title"
                >
                  <div className="p-1 rounded-md bg-emerald-50 group-hover/title:bg-[#E30613]/10 transition-colors">
                    {ICON_MAP[group.id] || <ChevronRight className="w-4 h-4 text-[#014923]" />}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover/title:text-[#E30613] transition-colors">
                    {group.title}
                  </h3>
                </Link>

                <ul className="pl-7 space-y-1">
                  {group.subcategories.map((sub) => (
                    <li key={sub.id}>
                      <Link
                        href={`/category/${sub.slug}?sub=${sub.id}`}
                        onClick={onClose}
                        className="text-xs text-slate-600 hover:text-[#014923] hover:font-semibold hover:translate-x-0.5 inline-block transition-all py-0.5"
                      >
                        {sub.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

