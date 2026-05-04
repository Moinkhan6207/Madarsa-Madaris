'use client';

import React, { memo } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, Globe, Heart, Image as ImageIcon, Layers, MousePointer2, Plus, Sparkles, Target, Trash2, Users, X, Zap } from 'lucide-react';
import type { PageBlock } from '@/services/cms.service';

interface BuilderCanvasProps {
  blocks: PageBlock[];
  currentLang: string;
  editingBlockIndex: number | null;
  showMobileSidebar: boolean;
  setEditingBlockIndex: (index: number) => void;
  setShowMobileSidebar: (value: boolean) => void;
  onAddBlock: (type: string) => void;
  onMoveBlock: (index: number, direction: 'up' | 'down') => void;
  onDeleteBlock: (index: number) => void;
}

const blockTypes = [
  { type: 'hero', name: 'Home / Hero', icon: Layers, color: 'emerald' },
  { type: 'about', name: 'About Us', icon: Layers, color: 'blue' },
  { type: 'admission', name: 'Admission', icon: Zap, color: 'amber' },
  { type: 'contact', name: 'Contact', icon: MousePointer2, color: 'slate' },
  { type: 'courses', name: 'Courses', icon: Globe, color: 'indigo' },
  { type: 'donation', name: 'Donation', icon: Heart, color: 'pink' },
  { type: 'events', name: 'Events', icon: Target, color: 'rose' },
  { type: 'gallery', name: 'Gallery', icon: ImageIcon, color: 'cyan' },
  { type: 'results', name: 'Results', icon: Sparkles, color: 'orange' },
  { type: 'stats', name: 'Statistics', icon: CheckCircle2, color: 'purple' },
  { type: 'testimonials', name: 'Testimonials', icon: Users, color: 'blue' },
  { type: 'cta', name: 'Call to Action', icon: Zap, color: 'amber' },
];

const PageCard = memo(({ bt, onAdd }: { bt: any; onAdd: (type: string) => void }) => (
  <button onClick={() => onAdd(bt.type)} className="group relative bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-xl hover:shadow-slate-200/50 transition-all flex flex-col items-center text-center h-full overflow-hidden">
    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all group-hover:scale-110 group-hover:rotate-3 shadow-sm bg-slate-50 text-slate-600"><bt.icon className="w-7 h-7" /></div>
    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1">{bt.name}</h3>
    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Add Section</p>
    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-50 group-hover:bg-emerald-500 transition-colors" />
  </button>
));
PageCard.displayName = 'PageCard';

const BlockRow = memo(({ block, index, currentLang, isEditing, setEditingBlockIndex, onMoveBlock, onDeleteBlock }: {
  block: PageBlock;
  index: number;
  currentLang: string;
  isEditing: boolean;
  setEditingBlockIndex: (index: number) => void;
  onMoveBlock: (index: number, direction: 'up' | 'down') => void;
  onDeleteBlock: (index: number) => void;
}) => (
  <div onClick={() => setEditingBlockIndex(index)} className={`group relative bg-white rounded-[2rem] md:rounded-[2.5rem] border-2 transition-all cursor-pointer ${isEditing ? 'border-emerald-500 shadow-2xl shadow-emerald-500/10 ring-4 ring-emerald-500/5' : 'border-white hover:border-slate-200 shadow-sm'}`}>
    <div className="absolute -right-2 md:-left-16 top-0 flex md:flex-col gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all bg-white p-2 md:p-2.5 rounded-[1.2rem] md:rounded-[1.5rem] shadow-2xl border border-slate-100 z-[60]">
      <button onClick={(e) => { e.stopPropagation(); onMoveBlock(index, 'up'); }} className="p-2 md:p-2.5 hover:bg-slate-50 rounded-lg md:rounded-xl text-slate-400 hover:text-slate-900"><ChevronUp className="w-4 h-4 md:w-5 md:h-5" /></button>
      <button onClick={(e) => { e.stopPropagation(); onMoveBlock(index, 'down'); }} className="p-2 md:p-2.5 hover:bg-slate-50 rounded-lg md:rounded-xl text-slate-400 hover:text-slate-900"><ChevronDown className="w-4 h-4 md:w-5 md:h-5" /></button>
      <button onClick={(e) => { e.stopPropagation(); onDeleteBlock(index); }} className="p-2 md:p-2.5 hover:bg-rose-50 rounded-lg md:rounded-xl text-rose-500"><Trash2 className="w-4 h-4 md:w-5 md:h-5" /></button>
    </div>
    <div className="p-8 md:p-16 text-center">
      <span className="text-[10px] md:text-[11px] font-black text-emerald-600 uppercase tracking-widest">Section: {block.type}</span>
      <h4 className="text-lg md:text-2xl font-black text-slate-900 mt-2 uppercase tracking-tight truncate">{(block.content[currentLang] || block.content)?.title || 'Global Section'}</h4>
    </div>
  </div>
));
BlockRow.displayName = 'BlockRow';

function BuilderCanvasComponent(props: BuilderCanvasProps) {
  const {
    blocks,
    currentLang,
    editingBlockIndex,
    showMobileSidebar,
    setEditingBlockIndex,
    setShowMobileSidebar,
    onAddBlock,
    onMoveBlock,
    onDeleteBlock,
  } = props;

  return (
    <>
      <div className="max-w-5xl mx-auto space-y-6 md:space-y-10">
        {blocks.length === 0 ? (
          <div className="space-y-12">
            <div className="text-center pt-8">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-emerald-600 rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center text-white mx-auto mb-6 md:mb-8 shadow-2xl"><Sparkles className="w-10 h-10 md:w-12 md:h-12" /></div>
              <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight capitalize px-4">Canvas Ready</h2>
            </div>
            <div className="bg-white rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-12 border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 relative z-10">{blockTypes.map((bt) => <PageCard key={bt.type} bt={bt} onAdd={onAddBlock} />)}</div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-6 pb-40 px-2 md:px-0">
            {blocks.map((block, index) => (
              <BlockRow key={`${block.type}-${index}`} block={block} index={index} currentLang={currentLang} isEditing={editingBlockIndex === index} setEditingBlockIndex={setEditingBlockIndex} onMoveBlock={onMoveBlock} onDeleteBlock={onDeleteBlock} />
            ))}
            <div className="flex justify-center py-6 md:py-10">
              <button onClick={() => setShowMobileSidebar(true)} className="bg-white px-8 md:px-10 py-4 md:py-5 rounded-[1.5rem] md:rounded-[2rem] border border-slate-200 shadow-xl flex items-center gap-3 md:gap-4 text-slate-600 font-black text-[12px] md:text-sm uppercase tracking-widest active:scale-95 transition-all"><Plus className="w-4 h-4 md:w-5 md:h-5" /> Add Section</button>
            </div>
          </div>
        )}
      </div>

      {showMobileSidebar && (
        <>
          <div onClick={() => setShowMobileSidebar(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[200] lg:hidden" />
          <aside className="fixed bottom-0 left-0 right-0 bg-white z-[210] lg:hidden rounded-t-[3rem] md:rounded-t-[3.5rem] shadow-2xl p-6 md:p-8 flex flex-col max-h-[85vh]">
            <div className="w-12 md:w-16 h-1 md:h-1.5 bg-slate-100 rounded-full mx-auto mb-6 md:mb-8" />
            <div className="flex items-center justify-between mb-8 md:mb-10 px-2 md:px-4"><h3 className="text-xl md:text-2xl font-black text-slate-900 uppercase">Section Library</h3><button onClick={() => setShowMobileSidebar(false)} className="bg-slate-100 p-2 md:p-3 rounded-xl md:rounded-2xl"><X className="w-5 h-5 md:w-6 md:h-6 text-slate-500" /></button></div>
            <div className="flex-1 overflow-y-auto pb-12 custom-scrollbar px-1 md:px-2"><div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">{blockTypes.map((bt) => <PageCard key={bt.type} bt={bt} onAdd={onAddBlock} />)}</div></div>
          </aside>
        </>
      )}
    </>
  );
}

export default memo(BuilderCanvasComponent);
