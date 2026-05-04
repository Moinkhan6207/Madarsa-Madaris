'use client';

import { LANGUAGE_META, LanguageCode, SUPPORTED_LANGUAGES } from '@/lib/i18n/config';
import { useTranslation } from '@/lib/i18n/useTranslation';

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useTranslation();

  return (
    <div className="relative">
      <label className="sr-only" htmlFor="language-switcher">{t('common.language')}</label>
      <div className="flex items-center gap-2 rounded-xl bg-slate-100 border border-slate-200 px-3 py-2">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest hidden sm:inline">{t('common.language')}</span>
        <select
          id="language-switcher"
          className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer min-w-[120px]"
          value={language}
          onChange={(e) => setLanguage(e.target.value as LanguageCode)}
          aria-label={t('common.language')}
        >
          {SUPPORTED_LANGUAGES.map((lang) => {
            const meta = LANGUAGE_META[lang];
            return (
              <option key={lang} value={lang}>
                {meta.flag} - {meta.nativeLabel}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
}
