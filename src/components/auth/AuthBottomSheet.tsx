"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface AuthBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const AuthBottomSheet: React.FC<AuthBottomSheetProps> = ({
  isOpen,
  onClose,
  children,
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);

  // 1. Prevent background scrolling while modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // 2. Escape key support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end items-center sm:p-4">
          {/* Dark transparent backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            onClick={onClose}
            aria-hidden="true"
            className="fixed inset-0 bg-slate-950/65 backdrop-blur-md transition-opacity"
          />

          {/* Bottom sheet container */}
          <motion.div
            ref={sheetRef}
            initial={{ y: "100%", opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 300,
              mass: 0.8,
            }}
            role="dialog"
            aria-modal="true"
            className="relative w-full sm:max-w-md bg-white rounded-t-[32px] sm:rounded-3xl shadow-2xl border-t border-slate-100 sm:border border-slate-200/80 z-10 max-h-[92vh] flex flex-col overflow-hidden sm:mb-6"
          >
            {/* Grab handle for touch/mobile affordance */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
            </div>

            {/* Header close button */}
            <div className="absolute top-4 right-4 z-20">
              <button
                type="button"
                onClick={onClose}
                aria-label="Close authentication modal"
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0047BA]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content area with internal scrolling if viewport is constrained */}
            <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 sm:py-7">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthBottomSheet;
