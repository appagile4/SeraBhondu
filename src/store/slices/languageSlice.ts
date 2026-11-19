import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import storage from "../../services/storage";

export type LanguageCode = "bn" | "en";

interface LanguageState {
  currentLanguage: LanguageCode;
  isLoading: boolean;
}

const initialState: LanguageState = {
  currentLanguage: "bn", // Default to Bangla
  isLoading: false,
};

// Async thunk to load persisted language on startup
export const loadLanguage = createAsyncThunk("language/load", async () => {
  try {
    const saved = await storage.getItem("serabondhu_language");
    if (saved === "bn" || saved === "en") {
      return saved as LanguageCode;
    }
  } catch (err) {
    console.warn("Failed to load language from storage:", err);
  }
  return "bn" as LanguageCode;
});

// Async thunk to change and persist language choice
export const setLanguageThunk = createAsyncThunk(
  "language/set",
  async (lang: LanguageCode) => {
    try {
      await storage.setItem("serabondhu_language", lang);
    } catch (err) {
      console.warn("Failed to persist language to storage:", err);
    }
    return lang;
  }
);

const languageSlice = createSlice({
  name: "language",
  initialState,
  reducers: {
    setLanguage(state, action: PayloadAction<LanguageCode>) {
      state.currentLanguage = action.payload;
    },
    toggleLanguage(state) {
      state.currentLanguage = state.currentLanguage === "bn" ? "en" : "bn";
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadLanguage.fulfilled, (state, action) => {
      state.currentLanguage = action.payload;
    });
    builder.addCase(setLanguageThunk.fulfilled, (state, action) => {
      state.currentLanguage = action.payload;
    });
  },
});

export const { setLanguage, toggleLanguage } = languageSlice.actions;
export default languageSlice.reducer;
