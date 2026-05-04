'use client';

import { useMemo } from 'react';
import { getNestedValue, translations } from './index';
import { useLanguage } from './LanguageProvider';

export function useTranslation() {
  const { language, direction, setLanguage } = useLanguage();

  const dictionary = useMemo(() => translations[language], [language]);

  const t = useMemo(
    () => (key: string) => {
      const value = getNestedValue(dictionary as unknown as Record<string, any>, key);
      if (typeof value === 'string') return value;
      const fallback = getNestedValue(translations.en as unknown as Record<string, any>, key);
      return typeof fallback === 'string' ? fallback : key;
    },
    [dictionary]
  );

  return { t, language, direction, setLanguage };
}
