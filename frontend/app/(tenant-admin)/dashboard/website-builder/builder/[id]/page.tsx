'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cmsService, Page, PageBlock } from '@/services/cms.service';
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Save,
  Settings2,
  Layers,
  Layout,
  Eye,
  ArrowLeft,
  Image as ImageIcon,
  CheckCircle2,
  X,
  Globe,
  Smartphone,
  Monitor,
  PanelRight,
  Maximize2,
  Heart,
  Users,
  Menu,
  ChevronLeft,
  Sparkles,
  Zap,
  MousePointer2,
  Lock,
  Search,
  Type,
  Target
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import MediaLibrary from '@/components/cms/MediaLibrary';
import PublicRenderer from '@/components/cms/PublicRenderer';

// Prevent prerendering during build to avoid QueryClient errors
export const dynamic = 'force-dynamic';

// Component for block cards - memoized to prevent unnecessary re-renders
const PageCard = React.memo(({ bt, onAdd }: { bt: any; onAdd: (type: string) => void }) => (
  <motion.button
    whileHover={{ y: -5, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={() => onAdd(bt.type)}
    className="group relative bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-xl hover:shadow-slate-200/50 transition-all flex flex-col items-center text-center h-full overflow-hidden"
  >
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all group-hover:scale-110 group-hover:rotate-3 shadow-sm
      ${bt.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
        bt.color === 'blue' ? 'bg-blue-50 text-blue-600' :
        bt.color === 'purple' ? 'bg-purple-50 text-purple-600' :
        bt.color === 'amber' ? 'bg-amber-50 text-amber-600' :
        bt.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
        bt.color === 'rose' ? 'bg-rose-50 text-rose-600' :
        bt.color === 'cyan' ? 'bg-cyan-50 text-cyan-600' :
        bt.color === 'pink' ? 'bg-pink-50 text-pink-600' :
        'bg-slate-50 text-slate-600'}`}
    >
      <bt.icon className="w-7 h-7" />
    </div>
    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1">{bt.name}</h3>
    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Add Section</p>
    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-50 group-hover:bg-emerald-500 transition-colors" />
  </motion.button>
));

PageCard.displayName = 'PageCard';

export default function PageBuilder() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [blocks, setBlocks] = useState<PageBlock[]>([]);
  const [editingBlockIndex, setEditingBlockIndex] = useState<number | null>(null);
  const [currentLang, setCurrentLang] = useState('en');
  const [previewMode, setPreviewMode] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [showPageSettings, setShowPageSettings] = useState(false);
  const [localPageData, setLocalPageData] = useState<Partial<Page>>({});
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<{ index: number; key: string } | null>(null);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const { data: pageData, isLoading } = useQuery({
    queryKey: ['cms-page', id],
    queryFn: async () => {
      const res = await cmsService.getPage(id as string);
      return res.data;
    },
    refetchOnWindowFocus: false, // Prevent losing unsaved changes
  });

  useEffect(() => {
    if (pageData) {
      let pageBlocks = pageData.blocks || [];
      if (pageBlocks.length === 0) {
        pageBlocks = [{
          type: 'hero',
          content: {
            en: {
              title: 'Welcome to your new page',
              subtitle: 'Start by customizing this section or add new ones from the library.',
              ctaText: 'Get Started',
              ctaLink: '#',
              imageUrl: '',
              videoUrl: '',
              badge: 'NEW PAGE'
            }
          },
          config: {},
          order: 0
        }];
        setEditingBlockIndex(0);
      } else {
        setEditingBlockIndex(prev => prev !== null ? prev : 0);
      }
      setBlocks(pageBlocks);
      setLocalPageData({ ...pageData, blocks: undefined }); // omit blocks to avoid overriding
    }
  }, [pageData]);

  const saveMutation = useMutation({
    mutationFn: (overrides?: Partial<Page>) =>
      cmsService.updatePage(id as string, {
        ...localPageData,
        blocks,
        isPublished: overrides?.isPublished !== undefined ? overrides.isPublished : localPageData.isPublished
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-page', id] });
      queryClient.invalidateQueries({ queryKey: ['cms-pages'] });
      alert('Changes saved successfully!');
      setShowPageSettings(false);
    },
  });

  // Memoize block type handlers to prevent unnecessary re-renders
  const getInitialContent = useCallback((type: string) => {
    switch (type) {
      case 'hero': return { title: 'Welcome to Darul Huda', subtitle: 'Leading the way in Islamic education and spiritual growth.', ctaText: 'Join Us Today', ctaLink: '#', imageUrl: '', videoUrl: '', badge: 'ALHAMDULILLAH' };
      case 'about': return { title: 'Our Noble Mission', description: 'Established with the vision of nurturing scholars who serve the Ummah with wisdom and faith.', imageUrl: '', features: [] };
      case 'stats': return { items: [{ label: 'Total Students', value: '1200+' }, { label: 'Expert Teachers', value: '45+' }] };
      case 'cta': return { title: 'Embark on your journey', buttonText: 'Enroll Now', link: '/admission' };
      case 'gallery': return { title: 'Life at Darul Huda', images: [] };
      case 'courses': return { title: 'Available Programs', courses: [{ title: 'Hifz ul Quran', duration: '3 Years', description: 'Complete memorization with Tajweed rules.' }] };
      case 'donation-banner': return { title: 'Support the House of Allah', description: 'Your contributions help us provide quality education to all.', ctaText: 'Donate Now', campaignGoal: '500000', amountRaised: '0', currency: 'INR' };
      case 'testimonials': return { title: 'Words of Wisdom', testimonials: [{ name: 'Ahmad Khan', role: 'Graduate', text: 'This institution transformed my life and understanding of Islam.', imageUrl: '' }] };
      case 'form': return { formType: 'CONTACT', title: 'Reach Out to Us', description: 'We are here to assist you with any inquiries.' };
      case 'events': return { title: 'Upcoming Events', subtitle: 'Stay connected with our latest seminars, graduation ceremonies, and community gatherings.', events: [{ title: 'Annual Convocation', date: 'June 15, 2024', location: 'Main Auditorium' }] };
      case 'results': return { title: 'Academic Achievements', subtitle: 'Celebrating the success of our students in regional and national examinations.', metrics: [{ label: 'Top Performers', value: '85' }, { label: 'Pass Percentage', value: '98%' }] };
      default: return {};
    }
  }, []);

  const handleAddBlock = useCallback((type: string) => {
    const newBlock: PageBlock = {
      type,
      content: { en: getInitialContent(type) },
      config: {},
      order: blocks.length
    };
    setBlocks([...blocks, newBlock]);
    setEditingBlockIndex(blocks.length);
  }, [blocks, getInitialContent]);

  const handleMoveBlock = useCallback((index: number, direction: 'up' | 'down') => {
    const newBlocks = [...blocks];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newBlocks.length) return;
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
    newBlocks[index].order = index;
    newBlocks[newIndex].order = newIndex;
    setBlocks(newBlocks);
    setEditingBlockIndex(newIndex);
  }, [blocks]);

  const handleDeleteBlock = useCallback((index: number) => {
    const newBlocks = blocks.filter((_, i) => i !== index);
    setBlocks(newBlocks);
    setEditingBlockIndex(newBlocks.length > 0 ? Math.min(index, newBlocks.length - 1) : null);
  }, [blocks]);

  const handleUpdateBlock = useCallback((index: number, content: any) => {
    const newBlocks = [...blocks];
    newBlocks[index] = { ...newBlocks[index], content: { ...newBlocks[index].content, [currentLang]: content } };
    setBlocks(newBlocks);
  }, [blocks, currentLang]);

  const handleMediaSelect = useCallback((url: string) => {
    if (mediaTarget) {
      if (mediaTarget.index === -1) {
        setLocalPageData({ ...localPageData, [mediaTarget.key]: url });
      } else if (mediaTarget.key.includes('.')) {
        const [parentKey, indexStr, childKey] = mediaTarget.key.split('.');
        const index = parseInt(indexStr);
        const newBlocks = [...blocks];
        const currentBlockContent = newBlocks[mediaTarget.index].content;
        const langContent = currentBlockContent[currentLang] || { ...currentBlockContent };
        const list = [...(langContent[parentKey] || [])];
        list[index] = { ...list[index], [childKey]: url };
        handleUpdateBlock(mediaTarget.index, { ...blocks[mediaTarget.index].content[currentLang], [parentKey]: list });
      } else {
        handleUpdateBlock(mediaTarget.index, { ...blocks[mediaTarget.index].content[currentLang], [mediaTarget.key]: url });
      }
    }
    setMediaLibraryOpen(false);
    setMediaTarget(null);
  }, [mediaTarget, localPageData, blocks, currentLang, handleUpdateBlock]);

  const blockTypes = useMemo(() => [
    { type: 'hero', name: 'Home / Hero', icon: Layout, color: 'emerald' },
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
  ], []);

  if (isLoading) {
    return <div className="p-8 text-slate-400 font-bold italic animate-pulse">Initializing Portal...</div>;
  }

  const currentEditingBlock = editingBlockIndex !== null ? blocks[editingBlockIndex] : null;
  const currentEditingContent = currentEditingBlock?.content[currentLang] || currentEditingBlock?.content || {};

  return (
    <div className="min-h-screen bg-slate-50 -m-8 flex flex-col overflow-hidden h-screen relative">
      {/* Top Bar - Responsive Fix */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-slate-200/60 px-4 md:px-10 py-3 md:py-4 flex flex-col md:flex-row justify-between items-center sticky top-0 z-[100] shadow-sm gap-4">
        <div className="flex items-center gap-3 md:gap-6 w-full md:w-auto overflow-hidden">
          <Link href="/dashboard/website-builder" className="w-9 h-9 md:w-11 md:h-11 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-xl transition-all border border-slate-200/40 flex-shrink-0">
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-slate-500" />
          </Link>
          <div className="flex flex-col overflow-hidden">
            <div className="flex items-center gap-2">
              <h1 className="font-black text-slate-900 tracking-tight text-sm md:text-xl leading-none truncate">{pageData?.title}</h1>
              <span className="hidden xs:inline-block bg-emerald-50 text-emerald-600 text-[8px] md:text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-emerald-100 whitespace-nowrap">Live Editor</span>
            </div>
            <p className="text-[8px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 md:mt-1.5 flex items-center gap-1.5 md:gap-2 truncate">
              <Globe className="w-3 h-3" /> <span className="truncate">/ {pageData?.slug}</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full flex-shrink-0"></span>
              Draft
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto justify-between md:justify-end">
          {/* Lang Switch Hidden on Mobile */}
          <div className="bg-slate-100 p-1 rounded-xl hidden xl:flex border border-slate-200/50">
            {['en', 'ur', 'ar'].map((l) => (
              <button key={l} onClick={() => setCurrentLang(l)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${currentLang === l ? 'bg-white text-emerald-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
                {l}
              </button>
            ))}
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50 items-center overflow-hidden">
            <button onClick={() => setShowPageSettings(true)} className="p-2 md:p-2.5 hover:bg-white rounded-lg text-slate-500 hover:text-slate-900 transition-all flex-shrink-0">
              <Settings2 className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <div className="w-px h-5 bg-slate-200 mx-1"></div>
            <button onClick={() => setPreviewMode(!previewMode)} className={`flex items-center gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-lg text-[9px] md:text-[10px] font-black uppercase transition-all whitespace-nowrap ${previewMode ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white hover:text-slate-900'}`}>
              {previewMode ? <Maximize2 className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" />}
              <span>{previewMode ? 'Exit' : 'Preview'}</span>
            </button>
          </div>
          
          <button 
            onClick={() => {
              saveMutation.mutate({ isPublished: true });
            }} 
            disabled={saveMutation.isPending} 
            className="flex items-center gap-2 px-4 md:px-10 py-2.5 md:py-3 bg-slate-900 text-white rounded-xl md:rounded-2xl hover:bg-black transition-all font-black shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50 text-[10px] md:text-sm uppercase tracking-widest whitespace-nowrap"
          >
            <Save className="w-3.5 h-3.5 md:w-4.5 md:h-4.5" />
            <span>{saveMutation.isPending ? '...' : 'Publish'}</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {!previewMode && (
          <aside className="w-72 bg-white border-r border-slate-200/60 hidden lg:flex flex-col h-full sticky top-0 shadow-sm">
            <div className="p-8 border-b border-slate-50">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Library</h3>
              <p className="text-[11px] font-bold text-slate-900">Add Sections</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
              {blockTypes.map((bt) => (
                <button key={bt.type} onClick={() => handleAddBlock(bt.type)} className="flex items-center gap-3 w-full p-4 bg-slate-50/50 hover:bg-white border border-transparent hover:border-slate-200 rounded-2xl transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <bt.icon className="w-5 h-5 text-slate-400 group-hover:text-emerald-500" />
                  </div>
                  <div className="text-left">
                    <div className="text-[11px] font-black text-slate-700 uppercase tracking-tight">{bt.name}</div>
                  </div>
                </button>
              ))}
            </div>
          </aside>
        )}

        <main className={`flex-1 overflow-y-auto bg-slate-100/50 custom-scrollbar ${previewMode ? 'p-0' : 'p-4 md:p-14'}`}>
          {previewMode ? (
            <div className={`mx-auto bg-white shadow-2xl transition-all duration-700 ${previewDevice === 'mobile' ? 'max-w-[400px] my-10 rounded-[3rem] border-[12px] border-slate-900 overflow-hidden' : 'w-full min-h-full'}`}>
              <PublicRenderer settings={(pageData as any)?.settings} page={{ blocks }} tenant={(pageData as any)?.tenant} />
            </div>
          ) : (
            <div className="max-w-5xl mx-auto space-y-6 md:space-y-10">
              {blocks.length === 0 ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                  <div className="text-center pt-8">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-emerald-600 rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center text-white mx-auto mb-6 md:mb-8 shadow-2xl">
                      <Sparkles className="w-10 h-10 md:w-12 md:h-12" />
                    </div>
                    <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight capitalize px-4">Canvas Ready</h2>
                    <p className="text-slate-500 font-medium text-sm md:text-lg mt-2 md:mt-3 px-4">Select a section from the library or below to begin building.</p>
                  </div>
                  <div className="bg-white rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-12 border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 relative z-10">
                      {blockTypes.map((bt) => (
                        <PageCard key={bt.type} bt={bt} onAdd={handleAddBlock} />
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-4 md:space-y-6 pb-40 px-2 md:px-0">
                  {blocks.map((block, index) => (
                    <motion.div key={index} onClick={() => setEditingBlockIndex(index)} className={`group relative bg-white rounded-[2rem] md:rounded-[2.5rem] border-2 transition-all cursor-pointer ${editingBlockIndex === index ? 'border-emerald-500 shadow-2xl shadow-emerald-500/10 ring-4 ring-emerald-500/5' : 'border-white hover:border-slate-200 shadow-sm'}`}>
                      <div className={`absolute -right-2 md:-left-16 top-0 flex md:flex-col gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all bg-white p-2 md:p-2.5 rounded-[1.2rem] md:rounded-[1.5rem] shadow-2xl border border-slate-100 z-[60]`}>
                        <button onClick={(e) => { e.stopPropagation(); handleMoveBlock(index, 'up'); }} className="p-2 md:p-2.5 hover:bg-slate-50 rounded-lg md:rounded-xl text-slate-400 hover:text-slate-900"><ChevronUp className="w-4 h-4 md:w-5 md:h-5" /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleMoveBlock(index, 'down'); }} className="p-2 md:p-2.5 hover:bg-slate-50 rounded-lg md:rounded-xl text-slate-400 hover:text-slate-900"><ChevronDown className="w-4 h-4 md:w-5 md:h-5" /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteBlock(index); }} className="p-2 md:p-2.5 hover:bg-rose-50 rounded-lg md:rounded-xl text-rose-500"><Trash2 className="w-4 h-4 md:w-5 md:h-5" /></button>
                      </div>
                      <div className="p-8 md:p-16 text-center">
                        <span className="text-[10px] md:text-[11px] font-black text-emerald-600 uppercase tracking-widest">Section: {block.type}</span>
                        <h4 className="text-lg md:text-2xl font-black text-slate-900 mt-2 uppercase tracking-tight truncate">{(block.content[currentLang] || block.content)?.title || 'Global Section'}</h4>
                      </div>
                    </motion.div>
                  ))}
                  <div className="flex justify-center py-6 md:py-10">
                    <button onClick={() => setShowMobileSidebar(true)} className="bg-white px-8 md:px-10 py-4 md:py-5 rounded-[1.5rem] md:rounded-[2rem] border border-slate-200 shadow-xl flex items-center gap-3 md:gap-4 text-slate-600 font-black text-[12px] md:text-sm uppercase tracking-widest active:scale-95 transition-all">
                      <Plus className="w-4 h-4 md:w-5 md:h-5" /> Add Section
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Responsive Editor Panel Fix */}
        <AnimatePresence>
          {!previewMode && editingBlockIndex !== null && (
            <>
              {/* Overlay for mobile to close the panel when tapping outside */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingBlockIndex(null)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[190] md:hidden" />
              
              <motion.aside 
                initial={{ x: '100%', opacity: 0 }} 
                animate={{ x: 0, opacity: 1 }} 
                exit={{ x: '100%', opacity: 0 }} 
                className="fixed right-0 md:right-6 top-0 md:top-6 bottom-0 md:bottom-6 w-full md:w-[420px] bg-white md:rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.15)] z-[200] flex flex-col overflow-hidden border border-slate-100 ring-1 ring-slate-100"
              >
                <div className="px-6 md:px-10 py-6 md:py-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                   <div>
                      <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-none">Editor Panel</h3>
                      <p className="text-[9px] md:text-[10px] text-emerald-600 font-black uppercase mt-1 md:mt-2 tracking-widest">{currentEditingBlock?.type} Configuration</p>
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
                                  <Image
                                    src={value}
                                    alt="Preview"
                                    fill
                                    className="object-cover transition-transform group-hover:scale-105 duration-500"
                                    sizes="100vw"
                                  />
                                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <button onClick={() => { setMediaTarget({ index: editingBlockIndex, key }); setMediaLibraryOpen(true); }} className="bg-white/90 backdrop-blur p-3 md:p-4 rounded-full shadow-2xl text-slate-900 transform scale-90 group-hover:scale-100 transition-transform"><Plus className="w-5 h-5 md:w-6 md:h-6" /></button>
                                  </div>
                              </div>
                            )}
                            <button onClick={() => { setMediaTarget({ index: editingBlockIndex, key }); setMediaLibraryOpen(true); }} className={`w-full py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all border-2 flex items-center justify-center gap-2 md:gap-3 ${value ? 'bg-white border-slate-100 text-slate-900 hover:bg-slate-50' : 'bg-slate-900 border-slate-900 text-white hover:bg-black shadow-xl shadow-slate-200'}`}>
                              {value ? 'Replace Highlight' : 'Select Resource'}
                            </button>
                        </div>
                        ) : typeof value === 'string' && value.length > 50 ? (
                          <textarea rows={5} value={value} onChange={(e) => handleUpdateBlock(editingBlockIndex, { ...currentEditingContent, [key]: e.target.value })} className="w-full px-5 md:px-6 py-5 md:py-6 bg-slate-50/50 border border-slate-200 rounded-2xl md:rounded-3xl text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/20 focus:bg-white transition-all resize-none shadow-sm" placeholder={`Enter ${key}...`} />
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
                                              <button onClick={() => { setMediaTarget({ index: editingBlockIndex, key: `${key}.${i}.${subKey}` }); setMediaLibraryOpen(true); }} className="flex-1 py-2.5 md:py-3.5 bg-slate-50 text-slate-900 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-slate-200 hover:bg-emerald-50">Select</button>
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
                  <button onClick={() => setEditingBlockIndex(null)} className="w-full py-4 md:py-5 bg-emerald-600 text-white rounded-2xl md:rounded-3xl text-sm font-black uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(16,185,129,0.3)] active:scale-95 transition-all flex items-center justify-center gap-2 md:gap-3">
                      <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" /> Done
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showMobileSidebar && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowMobileSidebar(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[200] lg:hidden" />
              <motion.aside initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed bottom-0 left-0 right-0 bg-white z-[210] lg:hidden rounded-t-[3rem] md:rounded-t-[3.5rem] shadow-2xl p-6 md:p-8 flex flex-col max-h-[85vh]">
                <div className="w-12 md:w-16 h-1 md:h-1.5 bg-slate-100 rounded-full mx-auto mb-6 md:mb-8" />
                <div className="flex items-center justify-between mb-8 md:mb-10 px-2 md:px-4">
                  <h3 className="text-xl md:text-2xl font-black text-slate-900 uppercase">Section Library</h3>
                  <button onClick={() => setShowMobileSidebar(false)} className="bg-slate-100 p-2 md:p-3 rounded-xl md:rounded-2xl"><X className="w-5 h-5 md:w-6 md:h-6 text-slate-500" /></button>
                </div>
                <div className="flex-1 overflow-y-auto pb-12 custom-scrollbar px-1 md:px-2">
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {blockTypes.map((bt) => (
                      <PageCard key={bt.type} bt={bt} onAdd={handleAddBlock} />
                    ))}
                  </div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>

      {mediaLibraryOpen && <MediaLibrary onSelect={handleMediaSelect} onClose={() => setMediaLibraryOpen(false)} />}

      {previewMode && (
        <div className="fixed bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-2xl border border-white p-2 md:p-2.5 rounded-[1.5rem] md:rounded-[2rem] shadow-2xl flex gap-2 md:gap-3 z-[300] items-center scale-100 md:scale-110">
          <button onClick={() => setPreviewDevice('desktop')} className={`px-4 md:px-5 py-2.5 md:py-3 rounded-xl md:rounded-2xl transition-all flex items-center gap-2 ${previewDevice === 'desktop' ? 'bg-slate-900 text-white shadow-2xl' : 'text-slate-400 hover:text-slate-900'}`}><Monitor className="w-4 md:w-5 h-4 md:h-5" /></button>
          <button onClick={() => setPreviewDevice('mobile')} className={`px-4 md:px-5 py-2.5 md:py-3 rounded-xl md:rounded-2xl transition-all flex items-center gap-2 ${previewDevice === 'mobile' ? 'bg-slate-900 text-white shadow-2xl' : 'text-slate-400 hover:text-slate-900'}`}><Smartphone className="w-4 md:w-5 h-4 md:h-5" /></button>
        </div>
      )}

      <AnimatePresence>
        {showPageSettings && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 md:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPageSettings(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 50 }} className="bg-white w-full max-w-2xl rounded-[3rem] md:rounded-[4rem] shadow-2xl p-8 md:p-12 relative overflow-hidden z-[410] border border-white">
              <button onClick={() => setShowPageSettings(false)} className="absolute top-6 md:top-8 right-6 md:right-8 p-2 md:p-3 hover:bg-slate-50 rounded-xl md:rounded-2xl transition-all"><X className="w-5 h-5 md:w-6 md:h-6 text-slate-300" /></button>
              <div className="mb-8 md:mb-10 text-center">
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase">SEO & Settings</h2>
              </div>
              <div className="space-y-6 md:space-y-8">
                <div>
                  <label className="block text-[10px] md:text-[11px] font-black text-slate-400 uppercase mb-2 md:mb-2.5 ml-2">Meta Title</label>
                  <input value={localPageData.metaTitle || ''} onChange={(e) => setLocalPageData({ ...localPageData, metaTitle: e.target.value })} className="w-full px-5 md:px-6 py-4 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl focus:border-emerald-500 transition-all font-black text-slate-900" />
                </div>
                <div>
                  <label className="block text-[10px] md:text-[11px] font-black text-slate-400 uppercase mb-2 md:mb-2.5 ml-2">Meta Description</label>
                  <textarea rows={4} value={localPageData.metaDescription || ''} onChange={(e) => setLocalPageData({ ...localPageData, metaDescription: e.target.value })} className="w-full px-5 md:px-6 py-4 md:py-5 bg-slate-50 border border-slate-100 rounded-2xl md:rounded-3xl resize-none font-bold text-slate-900" />
                </div>
                <div className="flex gap-3 md:gap-4 pt-4 md:pt-6">
                  <button onClick={() => setShowPageSettings(false)} className="flex-1 py-4 md:py-5 bg-slate-100 text-slate-500 rounded-2xl md:rounded-3xl font-black text-[11px] md:text-xs uppercase">Discard</button>
                  <button onClick={() => saveMutation.mutate({})} className="flex-[2] py-4 md:py-5 bg-slate-900 text-white rounded-2xl md:rounded-3xl font-black text-[11px] md:text-xs uppercase shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-2 md:gap-3">
                    {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
}
