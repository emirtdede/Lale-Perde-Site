'use client';

import React, { createContext, useContext, useState } from 'react';
import { tr } from '../locales/tr';
import { en } from '../locales/en';

type Language = 'tr' | 'en';

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('lale_perde_lang') as Language;
      if (savedLang === 'tr' || savedLang === 'en') return savedLang;
    }
    return 'tr';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('lale_perde_lang', lang);
  };

  const t = (keyPath: string): string => {
    const dict = language === 'tr' ? tr : en;
    const keys = keyPath.split('.');
    let current: Record<string, unknown> | unknown = dict;

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = (current as Record<string, unknown>)[key];
      } else {
        return keyPath; // fallback to key path if not found
      }
    }

    return typeof current === 'string' ? current : keyPath;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
