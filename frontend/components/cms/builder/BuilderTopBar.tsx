'use client';

import Link from 'next/link';
import { ArrowLeft, Eye, Globe, Maximize2, Save, Settings2 } from 'lucide-react';
import type { Page } from '@/services/cms.service';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface BuilderTopBarProps {
  pageData?: Page;
  currentLang: string;
  previewMode: boolean;
  setCurrentLang: (lang: string) => void;
  setPreviewMode: (value: boolean) => void;
  setShowPageSettings: (value: boolean) => void;
  onPublish: () => void;
  isSaving: boolean;
}

export default function BuilderTopBar({
  pageData,
  currentLang,
  previewMode,
  setCurrentLang,
  setPreviewMode,
  setShowPageSettings,
  onPublish,
  isSaving,
}: BuilderTopBarProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-white/90 backdrop-blur-xl border-b border-slate-200/60 px-4 md:px-10 py-3 md:py-4 flex flex-col md:flex-row justify-between items-center sticky top-0 z-[100] shadow-sm gap-4">
      <div className="flex items-center gap-3 md:gap-6 w-full md:w-auto overflow-hidden">
        <Link href="/dashboard/website-builder" className="w-9 h-9 md:w-11 md:h-11 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-xl transition-all border border-slate-200/40 flex-shrink-0">
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-slate-500" />
        </Link>
        <div className="flex flex-col overflow-hidden">
          <div className="flex items-center gap-2">
            <h1 className="font-black text-slate-900 tracking-tight text-sm md:text-xl leading-none truncate">{pageData?.title}</h1>
            <span className="hidden xs:inline-block bg-emerald-50 text-emerald-600 text-[8px] md:text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-emerald-100 whitespace-nowrap">{t('builder.liveEditor')}</span>
          </div>
          <p className="text-[8px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 md:mt-1.5 flex items-center gap-1.5 md:gap-2 truncate">
            <Globe className="w-3 h-3" /> <span className="truncate">/ {pageData?.slug}</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full flex-shrink-0"></span>
            {t('builder.draft')}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto justify-between md:justify-end">
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50 items-center overflow-hidden">
          <button onClick={() => setShowPageSettings(true)} className="p-2 md:p-2.5 hover:bg-white rounded-lg text-slate-500 hover:text-slate-900 transition-all flex-shrink-0">
            <Settings2 className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <div className="w-px h-5 bg-slate-200 mx-1"></div>
          <button onClick={() => setPreviewMode(!previewMode)} className={`flex items-center gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-lg text-[9px] md:text-[10px] font-black uppercase transition-all whitespace-nowrap ${previewMode ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white hover:text-slate-900'}`}>
            {previewMode ? <Maximize2 className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" />}
            <span>{previewMode ? t('builder.exit') : t('builder.preview')}</span>
          </button>
        </div>

        <button
          onClick={onPublish}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 md:px-10 py-2.5 md:py-3 bg-slate-900 text-white rounded-xl md:rounded-2xl hover:bg-black transition-all font-black shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50 text-[10px] md:text-sm uppercase tracking-widest whitespace-nowrap"
        >
          <Save className="w-3.5 h-3.5 md:w-4.5 md:h-4.5" />
          <span>{isSaving ? '...' : t('builder.publish')}</span>
        </button>
      </div>
    </div>
  );
}
