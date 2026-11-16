"use client";

import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { store, useAppDispatch } from "@/store";
import { fetchCurrentUser } from "@/store/slices/authSlice";
import { initializeLanguage } from "@/store/slices/languageSlice";

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Initialize language from localStorage or default to 'bn'
    dispatch(initializeLanguage());

    // If a saved token exists, validate and refresh user data from backend
    const token =
      localStorage.getItem("serabondhu_token") || localStorage.getItem("dealdoko_token");
    if (token) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]);

  return <>{children}</>;
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  );
}
