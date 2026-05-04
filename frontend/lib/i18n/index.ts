import en from './translations/en.json';
import hi from './translations/hi.json';
import ur from './translations/ur.json';
import ar from './translations/ar.json';
import bn from './translations/bn.json';
export {
  SUPPORTED_LANGUAGES,
  LANGUAGE_META,
  RTL_LANGUAGES,
  I18N_STORAGE_KEY,
  isLanguageCode,
  getLanguageDirection,
  type LanguageCode,
} from './config';

export const translations = { en, hi, ur, ar, bn } as const;

export type TranslationTree = typeof en;

export const getNestedValue = (obj: Record<string, any>, path: string) =>
  path.split('.').reduce<any>((acc, part) => (acc && part in acc ? acc[part] : undefined), obj);
