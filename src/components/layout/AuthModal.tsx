"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMarketplace } from "@/context/MarketplaceContext";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  clearAuthError,
  clearAuthSuccess,
} from "@/store/slices/authSlice";
import {
  AuthBottomSheet,
  AuthMethodSelector,
  EmailAuthForm,
  EmailOTPVerification,
  EmailPasswordForm,
  PhoneAuthForm,
  PhoneOTPVerification,
} from "@/components/auth";
import { CheckCircle2 } from "lucide-react";

export type AuthModalView =
  | "selector"
  | "email-input"
  | "email-otp"
  | "email-password"
  | "phone-input"
  | "phone-otp"
  | "success";

export function AuthModal() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthModalOpen, closeAuthModal } = useMarketplace();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, successMessage } = useAppSelector(
    (state) => state.auth
  );

  const [view, setView] = useState<AuthModalView>("selector");
  const [targetEmail, setTargetEmail] = useState("");
  const [targetPhone, setTargetPhone] = useState("");
  const [registrationToken, setRegistrationToken] = useState("");
  const [googleError, setGoogleError] = useState<string | null>(null);

  // Close handler: redirects to home if currently on /login or /register page
  const handleClose = () => {
    closeAuthModal();
    if (pathname === "/login" || pathname === "/register") {
      router.push("/");
    }
  };

  // Reset to initial selector view when modal closes or is reopened
  useEffect(() => {
    if (!isAuthModalOpen) {
      const timer = setTimeout(() => {
        setView("selector");
        setTargetEmail("");
        setTargetPhone("");
        setRegistrationToken("");
        setGoogleError(null);
        dispatch(clearAuthError());
        dispatch(clearAuthSuccess());
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isAuthModalOpen, dispatch]);

  const handleAuthSuccess = () => {
    setView("success");
    const timer = setTimeout(() => {
      closeAuthModal();
      router.push("/profile");
    }, 1000);
    return () => clearTimeout(timer);
  };

  return (
    <AuthBottomSheet isOpen={isAuthModalOpen} onClose={handleClose}>
      {/* View 1: Main Method Selector */}
      {view === "selector" && (
        <AuthMethodSelector
          onSelectEmail={() => setView("email-input")}
          onSelectPhone={() => setView("phone-input")}
          onGoogleSuccess={handleAuthSuccess}
          onGoogleError={(err) => setGoogleError(err)}
        />
      )}

      {/* View 2: Email Input */}
      {view === "email-input" && (
        <EmailAuthForm
          onBack={() => setView("selector")}
          onOtpSent={(email) => {
            setTargetEmail(email);
            setView("email-otp");
          }}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* View 3: Email OTP Verification */}
      {view === "email-otp" && (
        <EmailOTPVerification
          email={targetEmail}
          onBack={() => setView("email-input")}
          onSuccess={handleAuthSuccess}
          onNewUser={(data) => {
            setRegistrationToken(data.registrationToken);
            setView("email-password");
          }}
        />
      )}

      {/* View 4: Email Password Creation (New User) */}
      {view === "email-password" && (
        <EmailPasswordForm
          email={targetEmail}
          registrationToken={registrationToken}
          onBack={() => setView("email-otp")}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* View 5: Phone Number Input */}
      {view === "phone-input" && (
        <PhoneAuthForm
          onBack={() => setView("selector")}
          onOtpSent={(phone) => {
            setTargetPhone(phone);
            setView("phone-otp");
          }}
        />
      )}

      {/* View 6: Phone OTP Verification (Passwordless) */}
      {view === "phone-otp" && (
        <PhoneOTPVerification
          phone={targetPhone}
          onBack={() => setView("phone-input")}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* View 7: Success State */}
      {view === "success" && (
        <div className="flex flex-col items-center justify-center text-center py-8">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4 border border-emerald-200">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 animate-bounce" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            Welcome to DealDoko!
          </h3>
          <p className="text-sm text-slate-500 mt-1 max-w-xs">
            {successMessage || (user?.name ? `Logged in as ${user.name}` : "You are now logged in.")}
          </p>
        </div>
      )}
    </AuthBottomSheet>
  );
}

export default AuthModal;
