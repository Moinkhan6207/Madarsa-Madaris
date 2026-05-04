export const SUPPORTED_LANGUAGES = ['en', 'hi', 'ur', 'ar', 'bn'] as const;
export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_META: Record<LanguageCode, { label: string; nativeLabel: string; flag: string; dir: 'ltr' | 'rtl' }> = {
  en: { label: 'English', nativeLabel: 'English', flag: 'EN', dir: 'ltr' },
  hi: { label: 'Hindi', nativeLabel: 'हिन्दी', flag: 'HI', dir: 'ltr' },
  ur: { label: 'Urdu', nativeLabel: 'اردو', flag: 'UR', dir: 'rtl' },
  ar: { label: 'Arabic', nativeLabel: 'العربية', flag: 'AR', dir: 'rtl' },
  bn: { label: 'Bengali', nativeLabel: 'বাংলা', flag: 'BN', dir: 'ltr' },
};

export const RTL_LANGUAGES: LanguageCode[] = ['ur', 'ar'];
export const I18N_STORAGE_KEY = 'app_language';

export const isLanguageCode = (value: string): value is LanguageCode => SUPPORTED_LANGUAGES.includes(value as LanguageCode);
export const getLanguageDirection = (lang: LanguageCode): 'ltr' | 'rtl' => LANGUAGE_META[lang].dir;
