"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import en from "@/locales/en.json";
import ta from "@/locales/ta.json";
import kn from "@/locales/kn.json";
import hi from "@/locales/hi.json";
import te from "@/locales/te.json";

type Language = "en" | "ta" | "kn" | "hi" | "te";

const translations: Record<Language, any> = { en, ta, kn, hi, te };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("jansetu_language") as Language;
    if (saved && ["en", "ta", "kn", "hi", "te"].includes(saved)) {
      setLanguageState(saved);
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("jansetu_language", lang);
  };

  const t = (key: string): string => {
    const keys = key.split(".");
    
    // First try the current language
    let value = translations[language];
    let found = true;
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        found = false;
        break;
      }
    }
    
    if (found && typeof value === "string") {
      return value;
    }

    // Fallback to English
    let enValue = translations["en"];
    let enFound = true;
    for (const k of keys) {
      if (enValue && typeof enValue === "object" && k in enValue) {
        enValue = enValue[k];
      } else {
        enFound = false;
        break;
      }
    }

    if (enFound && typeof enValue === "string") {
      return enValue;
    }

    // Ultimate fallback: transform the key into readable text
    // E.g. 'hero.check_eligibility' -> 'Check eligibility'
    const lastPart = keys[keys.length - 1];
    if (lastPart) {
      const readable = lastPart.replace(/_/g, ' ');
      return readable.charAt(0).toUpperCase() + readable.slice(1);
    }
    
    return key;
  };

  // Prevent hydration mismatch by not rendering until mounted if needed, 
  // but since we want SEO and fast paint, we'll render English first on server.
  // The UI will instantly swap to the saved language on the client without reload.
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <div key={mounted ? "mounted" : "unmounted"} className="contents">
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}
