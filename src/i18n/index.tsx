import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Lang } from '../db/schema';
import { getSetting, setSetting } from '../db/repos';

import en from './en.json';
import hi from './hi.json';
import hinglish from './hinglish.json';

const dictionaries: Record<Lang, Record<string, string>> = {
  en,
  hi,
  hinglish,
};

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => Promise<void>;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>('hi'); // Default Hindi per project spec

  useEffect(() => {
    // Load persisted language preference
    getSetting<Lang>('lang', 'hi').then((savedLang) => {
      if (savedLang && (savedLang === 'hi' || savedLang === 'en' || savedLang === 'hinglish')) {
        setLangState(savedLang);
      }
    });
  }, []);

  const setLang = async (newLang: Lang) => {
    setLangState(newLang);
    await setSetting('lang', newLang);
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const dict = dictionaries[lang] || dictionaries.hi;
    let text = dict[key] || dictionaries.en[key] || key;

    if (params) {
      Object.entries(params).forEach(([paramKey, val]) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(val));
      });
    }

    return text;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return ctx;
}
