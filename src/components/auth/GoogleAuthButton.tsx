"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAppDispatch } from "@/store";
import { googleAuthUser } from "@/store/slices/authSlice";
import { Loader2 } from "lucide-react";

interface GoogleAuthButtonProps {
  onSuccess?: () => void;
  onError?: (err: string) => void;
}

declare global {
  interface Window {
    google?: any;
    __google_gis_initialized?: boolean;
    __google_gis_active_callback?: (response: any) => void;
  }
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  onSuccess,
  onError,
}) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const hiddenBtnRef = useRef<HTMLDivElement>(null);

  const googleClientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    "579629075726-d0jh0p7ovcc6pc17bmlnk3i1ho805fli.apps.googleusercontent.com";

  // Handle Google Credential Response (ID Token JWT)
  const handleCredentialResponse = async (response: any) => {
    try {
      setLoading(true);
      if (!response.credential) {
        throw new Error("No credential returned from Google.");
      }

      const resultAction = await dispatch(
        googleAuthUser({ credential: response.credential })
      );

      if (googleAuthUser.fulfilled.match(resultAction)) {
        onSuccess?.();
      } else {
        const errorMsg =
          (resultAction.payload as string) || "Google authentication failed.";
        onError?.(errorMsg);
      }
    } catch (err: any) {
      onError?.(err.message || "Failed to verify Google credential.");
    } finally {
      setLoading(false);
    }
  };

  // Keep latest callback stored in window dispatcher
  useEffect(() => {
    window.__google_gis_active_callback = handleCredentialResponse;
  });

  // Load and initialize Google Identity Services SDK ONCE globally
  useEffect(() => {
    if (typeof window === "undefined") return;

    const initGoogleSingleton = () => {
      if (window.google?.accounts?.id && !window.__google_gis_initialized) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: (resp: any) => {
              if (window.__google_gis_active_callback) {
                window.__google_gis_active_callback(resp);
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true,
          });
          window.__google_gis_initialized = true;
        } catch (e) {
          console.warn("GIS initialization error:", e);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGoogleSingleton();
      return;
    }

    // Check if script tag is already in DOM
    const existingScript = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    );
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initGoogleSingleton();
      };
      script.onerror = () => {
        console.warn("Could not load Google Identity Services SDK.");
      };
      document.body.appendChild(script);
    } else {
      existingScript.addEventListener("load", initGoogleSingleton);
    }
  }, [googleClientId]);

  // Click handler: initiates Google OAuth popup
  const handleGoogleClick = () => {
    setLoading(true);

    // 1. Google OAuth 2.0 Token Client (Account chooser popup)
    if (window.google?.accounts?.oauth2) {
      try {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: "openid email profile",
          prompt: "select_account",
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              setLoading(false);
              if (tokenResponse.error === "popup_closed_by_user") {
                return;
              }
              const errDesc =
                tokenResponse.error_description || tokenResponse.error;
              onError?.(
                `Google OAuth Error: ${errDesc}. Please make sure '${window.location.origin}' is added under 'Authorized JavaScript origins' in Google Cloud Console.`
              );
              return;
            }

            if (tokenResponse.access_token) {
              try {
                const action = await dispatch(
                  googleAuthUser({ accessToken: tokenResponse.access_token })
                );
                if (googleAuthUser.fulfilled.match(action)) {
                  onSuccess?.();
                } else {
                  onError?.(
                    (action.payload as string) || "Failed to log in with Google."
                  );
                }
              } catch (err: any) {
                onError?.(err.message || "Failed to log in with Google.");
              } finally {
                setLoading(false);
              }
            }
          },
        });

        tokenClient.requestAccessToken({ prompt: "select_account" });
        return;
      } catch (oauthErr: any) {
        console.warn("OAuth Token client failed:", oauthErr);
      }
    }

    // 2. Fallback: Trigger Google One Tap
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            setLoading(false);
          }
        });
        return;
      } catch (gisErr) {
        console.warn("GIS prompt error:", gisErr);
      }
    }

    setLoading(false);
  };

  return (
    <>
      <div ref={hiddenBtnRef} className="hidden" aria-hidden="true" />

      <button
        type="button"
        onClick={handleGoogleClick}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl border border-slate-300 shadow-sm transition-all duration-150 hover:border-slate-400 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed group focus:outline-none focus:ring-2 focus:ring-[#0047BA]/20 cursor-pointer"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin text-[#0047BA]" />
        ) : (
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        )}
        <span className="text-sm sm:text-base">Continue with Google</span>
      </button>
    </>
  );
};

export default GoogleAuthButton;
