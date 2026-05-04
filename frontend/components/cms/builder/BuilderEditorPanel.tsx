'use client';

import Image from 'next/image';
import { CheckCircle2, Image as ImageIcon, Plus, Trash2, Type, X, ChevronUp, ChevronDown } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface BuilderEditorPanelProps {
  visible: boolean;
  editingBlockIndex: number | null;
  currentEditingBlock: any;
  currentEditingContent: any;
  setEditingBlockIndex: (value: number | null) => void;
  setMediaTarget: (value: { index: number; key: string } | null) => void;
  setMediaLibraryOpen: (value: boolean) => void;
  handleMoveBlock: (index: number, direction: 'up' | 'down') => void;
  handleDeleteBlock: (index: number) => void;
  handleUpdateBlock: (index: number, content: any) => void;
}

export default function BuilderEditorPanel({
  visible,
  editingBlockIndex,
  currentEditingBlock,
  currentEditingContent,
  setEditingBlockIndex,
  setMediaTarget,
  setMediaLibraryOpen,
  handleMoveBlock,
  handleDeleteBlock,
  handleUpdateBlock,
}: BuilderEditorPanelProps) {
  const { t } = useTranslation();
  if (!visible || editingBlockIndex === null) return null;

  return (
    <>
      <div onClick={() => setEditingBlockIndex(null)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[190] md:hidden" />
      <aside className="fixed right-0 md:right-6 top-0 md:top-6 bottom-0 md:bottom-6 w-full md:w-[420px] bg-white md:rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.15)] z-[200] flex flex-col overflow-hidden border border-slate-100 ring-1 ring-slate-100">
        <div className="px-6 md:px-10 py-6 md:py-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
          <div>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-none">{t('builder.editorPanel')}</h3>
            <p className="text-[9px] md:text-[10px] text-emerald-600 font-black uppercase mt-1 md:mt-2 tracking-widest">{currentEditingBlock?.type} {t('builder.configuration')}</p>
          </div>
          <button onClick={() => setEditingBlockIndex(null)} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white shadow-xl border border-slate-100 rounded-xl md:rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all flex-shrink-0"><X className="w-5 h-5 md:w-6 md:h-6 text-slate-400" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8 md:py-12 space-y-8 md:space-y-12 custom-scrollbar pb-32 bg-white">
          {Object.keys(currentEditingContent).map((key) => {
            const value = currentEditingContent[key];
            const isImage = key.toLowerCase().includes('image') || key.toLowerCase().includes('url');
            return (
              <div key={key} className="space-y-3 md:space-y-4">
                <div className="flex items-center gap-2 ml-1">
                  {isImage ? <ImageIcon className="w-3 md:w-3.5 h-3 md:h-3.5 text-slate-400" /> : <Type className="w-3 md:w-3.5 h-3 md:h-3.5 text-slate-400" />}
                  <label className="block text-[10px] md:text-[11px] font-black text-slate-800 uppercase tracking-widest">{key.replace(/([A-Z])/g, ' $1')}</label>
                </div>

                {isImage ? (
                  <div className="space-y-3 md:space-y-4">
                    {value && (
                      <div className="group relative aspect-video rounded-[1.2rem] md:rounded-[1.5rem] overflow-hidden bg-slate-100 border border-slate-100 shadow-inner">
                        <Image src={value} alt="Preview" fill className="object-cover transition-transform group-hover:scale-105 duration-500" sizes="100vw" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button onClick={() => { setMediaTarget({ index: editingBlockIndex, key }); setMediaLibraryOpen(true); }} className="bg-white/90 backdrop-blur p-3 md:p-4 rounded-full shadow-2xl text-slate-900 transform scale-90 group-hover:scale-100 transition-transform"><Plus className="w-5 h-5 md:w-6 md:h-6" /></button>
                        </div>
                      </div>
                    )}
                    <button onClick={() => { setMediaTarget({ index: editingBlockIndex, key }); setMediaLibraryOpen(true); }} className={`w-full py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all border-2 flex items-center justify-center gap-2 md:gap-3 ${value ? 'bg-white border-slate-100 text-slate-900 hover:bg-slate-50' : 'bg-slate-900 border-slate-900 text-white hover:bg-black shadow-xl shadow-slate-200'}`}>
                      {value ? t('builder.replaceMedia') : t('builder.selectMedia')}
                    </button>
                  </div>
                ) : typeof value === 'string' && value.length > 50 ? (
                  <textarea rows={5} value={value} onChange={(e) => handleUpdateBlock(editingBlockIndex, { ...currentEditingContent, [key]: e.target.value })} className="w-full px-5 md:px-6 py-5 md:py-6 bg-slate-50/50 border border-slate-200 rounded-2xl md:rounded-3xl text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/20 focus:bg-white transition-all resize-none shadow-sm" placeholder={`${t('builder.enter')} ${key}...`} />
                ) : typeof value === 'object' && Array.isArray(value) ? (
                  <div className="space-y-4 md:space-y-6">
                    <div className="bg-slate-900 rounded-[1.2rem] md:rounded-[1.5rem] p-4 md:p-5 flex justify-between items-center shadow-xl shadow-slate-200">
                      <span className="text-[9px] md:text-[10px] font-black text-white uppercase tracking-widest ml-1 md:ml-2">{key.replace(/([A-Z])/g, ' $1')} ({value.length})</span>
                      <button onClick={() => {
                        let newItem = {};
                        if (key === 'images') newItem = { url: '', caption: '' };
                        else if (key === 'testimonials') newItem = { name: '', role: '', text: '', imageUrl: '' };
                        else if (key === 'courses') newItem = { title: '', duration: '', description: '' };
                        handleUpdateBlock(editingBlockIndex, { ...currentEditingContent, [key]: [...value, newItem] });
                      }} className="w-8 h-8 md:w-10 md:h-10 bg-emerald-500 text-white rounded-lg md:rounded-xl flex items-center justify-center hover:rotate-90 transition-transform shadow-lg"><Plus className="w-4 h-4 md:w-5 md:h-5" /></button>
                    </div>
                    <div className="space-y-4 md:space-y-6">
                      {value.map((item, i) => (
                        <div key={i} className="p-6 md:p-8 bg-white rounded-[1.8rem] md:rounded-[2.5rem] border border-slate-100 relative shadow-xl shadow-slate-200/40 group/item">
                          <button onClick={() => { const newValue = [...value]; newValue.splice(i, 1); handleUpdateBlock(editingBlockIndex, { ...currentEditingContent, [key]: newValue }); }} className="absolute -right-2 md:-right-3 -top-2 md:-top-3 w-8 h-8 md:w-10 md:h-10 bg-white shadow-2xl border border-slate-50 rounded-full text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"><Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" /></button>
                          <div className="space-y-4 md:space-y-6">
                            {Object.keys(item).map((subKey) => (
                              <div key={subKey}>
                                <label className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 md:mb-2 block">{subKey}</label>
                                {subKey.toLowerCase().includes('url') || subKey.toLowerCase().includes('image') ? (
                                  <div className="flex gap-3 md:gap-4 items-center">
                                    {item[subKey] && <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-slate-100 overflow-hidden border border-slate-100 flex-shrink-0 relative"><Image src={item[subKey]} alt="Preview" fill className="object-cover" sizes="56px" /></div>}
                                    <button onClick={() => { setMediaTarget({ index: editingBlockIndex, key: `${key}.${i}.${subKey}` }); setMediaLibraryOpen(true); }} className="flex-1 py-2.5 md:py-3.5 bg-slate-50 text-slate-900 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-slate-200 hover:bg-emerald-50">{t('builder.select')}</button>
                                  </div>
                                ) : (
                                  <input value={item[subKey]} onChange={(e) => { const newValue = [...value]; newValue[i] = { ...item, [subKey]: e.target.value }; handleUpdateBlock(editingBlockIndex, { ...currentEditingContent, [key]: newValue }); }} className="w-full px-4 md:px-5 py-3 md:py-4 bg-slate-50/50 border border-slate-200 rounded-xl md:rounded-2xl text-[12px] md:text-[13px] font-black text-slate-900 focus:bg-white focus:border-emerald-500/30 transition-all focus:outline-none" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <input value={value} onChange={(e) => handleUpdateBlock(editingBlockIndex, { ...currentEditingContent, [key]: e.target.value })} className="w-full px-5 md:px-6 py-4 md:py-5 bg-slate-50/50 border border-slate-200 rounded-xl md:rounded-2xl text-sm font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/20 focus:bg-white transition-all shadow-sm" />
                )}
              </div>
            );
          })}
        </div>
        <div className="p-6 md:p-10 border-t border-slate-100 bg-white">
          <div className="flex gap-2 mb-3">
            <button onClick={() => handleMoveBlock(editingBlockIndex, 'up')} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest"><ChevronUp className="w-4 h-4 inline" /> {t('builder.up')}</button>
            <button onClick={() => handleMoveBlock(editingBlockIndex, 'down')} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest"><ChevronDown className="w-4 h-4 inline" /> {t('builder.down')}</button>
            <button onClick={() => handleDeleteBlock(editingBlockIndex)} className="flex-1 py-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-black uppercase tracking-widest"><Trash2 className="w-4 h-4 inline" /> {t('builder.delete')}</button>
          </div>
          <button onClick={() => setEditingBlockIndex(null)} className="w-full py-4 md:py-5 bg-emerald-600 text-white rounded-2xl md:rounded-3xl text-sm font-black uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(16,185,129,0.3)] active:scale-95 transition-all flex items-center justify-center gap-2 md:gap-3">
            <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" /> {t('builder.done')}
          </button>
        </div>
      </aside>
    </>
  );
}
