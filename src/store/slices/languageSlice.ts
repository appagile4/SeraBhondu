import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../index";

export type Language = "bn" | "en";

interface LanguageState {
  language: Language;
}

// Client-safe initial language detection
const getInitialLanguage = (): Language => {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("khojobangla_lang") as Language;
      if (saved === "en" || saved === "bn") {
        return saved;
      }
    } catch {}
  }
  return "bn"; // Bangladesh / Bangla is default
};

const initialState: LanguageState = {
  language: "bn",
};

export const languageSlice = createSlice({
  name: "language",
  initialState,
  reducers: {
    initializeLanguage: (state) => {
      state.language = getInitialLanguage();
      if (typeof window !== "undefined") {
        document.documentElement.lang = state.language;
      }
    },
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.language = action.payload;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("khojobangla_lang", action.payload);
          document.documentElement.lang = action.payload;
        } catch {}
      }
    },
    toggleLanguage: (state) => {
      const next: Language = state.language === "bn" ? "en" : "bn";
      state.language = next;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("khojobangla_lang", next);
          document.documentElement.lang = next;
        } catch {}
      }
    },
  },
});

export const { initializeLanguage, setLanguage, toggleLanguage } = languageSlice.actions;

// Selectors
export const selectLanguage = (state: RootState): Language => state.language.language;
export const selectCurrencySymbol = (state: RootState): string =>
  state.language.language === "en" ? "Tk" : "৳";
export const selectIsBangla = (state: RootState): boolean => state.language.language === "bn";
export const selectIsEnglish = (state: RootState): boolean => state.language.language === "en";

export default languageSlice.reducer;
