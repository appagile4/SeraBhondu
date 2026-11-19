import { TRANSLATIONS, TranslationKey } from "../constants/translations";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  LanguageCode,
  setLanguageThunk,
  toggleLanguage as toggleAction,
} from "../store/slices/languageSlice";

export const BANGLA_LOGO = require("../../assets/images/b-logo.png");
export const ENGLISH_LOGO = require("../../assets/images/e-logo.png");

export function useLanguage() {
  const dispatch = useAppDispatch();
  const currentLanguage = useAppSelector(
    (state) => state.language.currentLanguage,
  );

  const t = (key: TranslationKey, fallback?: string): string => {
    const entry = TRANSLATIONS[key];
    if (!entry) return fallback || (key as string);
    return entry[currentLanguage] || fallback || entry.bn || (key as string);
  };

  const switchLanguage = (lang: LanguageCode) => {
    dispatch(setLanguageThunk(lang));
  };

  const toggle = () => {
    dispatch(toggleAction());
    const nextLang = currentLanguage === "bn" ? "en" : "bn";
    dispatch(setLanguageThunk(nextLang));
  };

  const logoSource = currentLanguage === "en" ? ENGLISH_LOGO : BANGLA_LOGO;
  const currencySymbol = currentLanguage === "en" ? "₹" : "৳";

  return {
    language: currentLanguage,
    isBn: currentLanguage === "bn",
    isEn: currentLanguage === "en",
    currencySymbol,
    logoSource,
    t,
    setLanguage: switchLanguage,
    toggleLanguage: toggle,
  };
}
