import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import local translations
import translationEN from "./locales/en/translation.json";
import translationTE from "./locales/te/translation.json";
import translationHI from "./locales/hi/translation.json";
import translationTA from "./locales/ta/translation.json";
import translationKN from "./locales/kn/translation.json";
import translationML from "./locales/ml/translation.json";
import translationBN from "./locales/bn/translation.json";

const resources = {
  en: { translation: translationEN },
  te: { translation: translationTE },
  hi: { translation: translationHI },
  ta: { translation: translationTA },
  kn: { translation: translationKN },
  ml: { translation: translationML },
  bn: { translation: translationBN },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    debug: false,
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "agriAI_language",
      caches: ["localStorage"],
    },
  });

export default i18n;
