'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { I18N_STORAGE_KEY, LanguageCode, getLanguageDirection, isLanguageCode } from './config';

interface LanguageContextValue {
  language: LanguageCode;
  direction: 'ltr' | 'rtl';
  setLanguage: (lang: LanguageCode) => void;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>('en');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem(I18N_STORAGE_KEY);
    if (saved && isLanguageCode(saved)) {
      setLanguageState(saved);
    }
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const dir = getLanguageDirection(language);
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
    document.body.dir = dir;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(I18N_STORAGE_KEY, language);
      document.cookie = `${I18N_STORAGE_KEY}=${language}; path=/; max-age=31536000; samesite=lax`;
    }
  }, [language]);

  const setLanguage = useCallback((lang: LanguageCode) => {
    setLanguageState(lang);
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({ language, direction: getLanguageDirection(language), setLanguage }),
    [language, setLanguage]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
