import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en/common.json";
import hi from "./locales/hi/common.json";

export const LANGUAGES = [
  { code: "en", label: "English", locale: "en-IN" },
  { code: "hi", label: "हिन्दी", locale: "hi-IN" },
];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { en: { common: en }, hi: { common: hi } },
    supportedLngs: ["en", "hi"],
    fallbackLng: "en",
    load: "languageOnly",
    defaultNS: "common",
    ns: ["common"],
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "bk-lang",
      caches: ["localStorage"],
    },
    react: { useSuspense: false },
    debug: import.meta.env.DEV, // console mein i18next ke logs dikhayega. Chal jaye to false kar dein
  });

const syncHtmlLang = (lng) => {
  document.documentElement.lang = lng;
};
i18n.on("languageChanged", syncHtmlLang);
syncHtmlLang(i18n.resolvedLanguage || "en");

export const currentLocale = () =>
  LANGUAGES.find((l) => l.code === (i18n.resolvedLanguage || "en"))?.locale ||
  "en-IN";

export default i18n;
