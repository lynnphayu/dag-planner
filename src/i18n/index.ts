"use client";

import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import enUS from "./locales/en-US";

// Define translation type based on the English locale
type TranslationType = typeof enUS.translation;
declare module "i18next" {
  interface CustomTypeOptions {
    resources: {
      translation: TranslationType;
    };
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      "en-US": enUS,
    },
    fallbackLng: "en-US",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
