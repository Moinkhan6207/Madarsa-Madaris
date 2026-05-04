'use client';

import { X } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface BuilderSettingsModalProps {
  open: boolean;
  localPageData: any;
  setLocalPageData: (value: any) => void;
  setShowPageSettings: (value: boolean) => void;
  onSave: () => void;
  isSaving: boolean;
}

export default function BuilderSettingsModal({
  open,
  localPageData,
  setLocalPageData,
  setShowPageSettings,
  onSave,
  isSaving,
}: BuilderSettingsModalProps) {
  const { t } = useTranslation();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 md:p-6">
      <div onClick={() => setShowPageSettings(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl" />
      <div className="bg-white w-full max-w-2xl rounded-[3rem] md:rounded-[4rem] shadow-2xl p-8 md:p-12 relative overflow-hidden z-[410] border border-white">
        <button onClick={() => setShowPageSettings(false)} className="absolute top-6 md:top-8 right-6 md:right-8 p-2 md:p-3 hover:bg-slate-50 rounded-xl md:rounded-2xl transition-all"><X className="w-5 h-5 md:w-6 md:h-6 text-slate-300" /></button>
        <div className="mb-8 md:mb-10 text-center">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase">{t('builder.seoSettings')}</h2>
        </div>
        <div className="space-y-6 md:space-y-8">
          <div>
            <label className="block text-[10px] md:text-[11px] font-black text-slate-400 uppercase mb-2 md:mb-2.5 ml-2">{t('builder.metaTitle')}</label>
            <input value={localPageData.metaTitle || ''} onChange={(e) => setLocalPageData({ ...localPageData, metaTitle: e.target.value })} className="w-full px-5 md:px-6 py-4 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl focus:border-emerald-500 transition-all font-black text-slate-900" />
          </div>
          <div>
            <label className="block text-[10px] md:text-[11px] font-black text-slate-400 uppercase mb-2 md:mb-2.5 ml-2">{t('builder.metaDescription')}</label>
            <textarea rows={4} value={localPageData.metaDescription || ''} onChange={(e) => setLocalPageData({ ...localPageData, metaDescription: e.target.value })} className="w-full px-5 md:px-6 py-4 md:py-5 bg-slate-50 border border-slate-100 rounded-2xl md:rounded-3xl resize-none font-bold text-slate-900" />
          </div>
          <div className="flex gap-3 md:gap-4 pt-4 md:pt-6">
            <button onClick={() => setShowPageSettings(false)} className="flex-1 py-4 md:py-5 bg-slate-100 text-slate-500 rounded-2xl md:rounded-3xl font-black text-[11px] md:text-xs uppercase">{t('builder.discard')}</button>
            <button onClick={onSave} className="flex-[2] py-4 md:py-5 bg-slate-900 text-white rounded-2xl md:rounded-3xl font-black text-[11px] md:text-xs uppercase shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-2 md:gap-3">
              {isSaving ? t('builder.saving') : t('builder.saveChanges')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
