'use client';

import React, { Profiler, useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cmsService, Page, PageBlock } from '@/services/cms.service';
import dynamic from 'next/dynamic';
import { Monitor, Smartphone } from 'lucide-react';
import { useParams } from 'next/navigation';

const BuilderTopBar = dynamic(() => import('@/components/cms/builder/BuilderTopBar'));
const BuilderCanvas = dynamic(() => import('@/components/cms/builder/BuilderCanvas'));
const MediaLibrary = dynamic(() => import('@/components/cms/MediaLibrary'), { ssr: false });
const BuilderPreview = dynamic(() => import('@/components/cms/builder/BuilderPreview'), { ssr: false });
const BuilderEditorPanel = dynamic(() => import('@/components/cms/builder/BuilderEditorPanel'), { ssr: false });
const BuilderSettingsModal = dynamic(() => import('@/components/cms/builder/BuilderSettingsModal'), { ssr: false });

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

  const onProfileRender = useCallback((id: string, phase: 'mount' | 'update' | 'nested-update', actualDuration: number) => {
    if (process.env.NODE_ENV !== 'development') return;
    console.debug('[Profiler]', id, phase, `${actualDuration.toFixed(2)}ms`);
  }, []);

  const { data: pageData, isLoading } = useQuery({
    queryKey: ['cms-page', id],
    queryFn: async () => (await cmsService.getPage(id as string)).data,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!pageData) return;
    const pageBlocks = pageData.blocks?.length
      ? pageData.blocks
      : [{
          type: 'hero',
          content: { en: { title: 'Welcome to your new page', subtitle: 'Start by customizing this section or add new ones from the library.', ctaText: 'Get Started', ctaLink: '#', imageUrl: '', videoUrl: '', badge: 'NEW PAGE' } },
          config: {},
          order: 0,
        } as PageBlock];

    setBlocks(pageBlocks);
    setEditingBlockIndex((prev) => (prev !== null ? prev : 0));
    setLocalPageData({ ...pageData, blocks: undefined });
  }, [pageData]);

  const saveMutation = useMutation({
    mutationFn: (overrides?: Partial<Page>) =>
      cmsService.updatePage(id as string, {
        ...localPageData,
        blocks,
        isPublished: overrides?.isPublished !== undefined ? overrides.isPublished : localPageData.isPublished,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-page', id] });
      queryClient.invalidateQueries({ queryKey: ['cms-pages'] });
      alert('Changes saved successfully!');
      setShowPageSettings(false);
    },
  });

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
    setBlocks((prev) => {
      const nextIndex = prev.length;
      const newBlock: PageBlock = { type, content: { en: getInitialContent(type) }, config: {}, order: nextIndex };
      setEditingBlockIndex(nextIndex);
      return [...prev, newBlock];
    });
  }, [getInitialContent]);

  const handleMoveBlock = useCallback((index: number, direction: 'up' | 'down') => {
    setBlocks((prev) => {
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[newIndex]] = [next[newIndex], next[index]];
      next[index] = { ...next[index], order: index };
      next[newIndex] = { ...next[newIndex], order: newIndex };
      setEditingBlockIndex(newIndex);
      return next;
    });
  }, []);

  const handleDeleteBlock = useCallback((index: number) => {
    setBlocks((prev) => {
      const next = prev.filter((_, i) => i !== index);
      setEditingBlockIndex(next.length > 0 ? Math.min(index, next.length - 1) : null);
      return next;
    });
  }, []);

  const handleUpdateBlock = useCallback((index: number, content: any) => {
    setBlocks((prev) => {
      if (!prev[index]) return prev;
      const target = prev[index];
      const updated = { ...target, content: { ...target.content, [currentLang]: content } };
      const next = [...prev];
      next[index] = updated;
      return next;
    });
  }, [currentLang]);

  const handleMediaSelect = useCallback((url: string) => {
    if (!mediaTarget) return;

    if (mediaTarget.index === -1) {
      setLocalPageData((prev) => ({ ...prev, [mediaTarget.key]: url }));
    } else if (mediaTarget.key.includes('.')) {
      const [parentKey, indexStr, childKey] = mediaTarget.key.split('.');
      const itemIndex = Number.parseInt(indexStr, 10);
      const source = blocks[mediaTarget.index]?.content?.[currentLang] || {};
      const list = [...(source[parentKey] || [])];
      list[itemIndex] = { ...list[itemIndex], [childKey]: url };
      handleUpdateBlock(mediaTarget.index, { ...source, [parentKey]: list });
    } else {
      const source = blocks[mediaTarget.index]?.content?.[currentLang] || {};
      handleUpdateBlock(mediaTarget.index, { ...source, [mediaTarget.key]: url });
    }

    setMediaLibraryOpen(false);
    setMediaTarget(null);
  }, [mediaTarget, blocks, currentLang, handleUpdateBlock]);

  if (isLoading) return <div className="p-8 text-slate-400 font-bold italic animate-pulse">Initializing Portal...</div>;

  const currentEditingBlock = editingBlockIndex !== null ? blocks[editingBlockIndex] : null;
  const currentEditingContent = currentEditingBlock?.content[currentLang] || currentEditingBlock?.content || {};

  return (
    <div className="min-h-screen bg-slate-50 -m-8 flex flex-col overflow-hidden h-screen relative">
      <BuilderTopBar
        pageData={pageData}
        currentLang={currentLang}
        previewMode={previewMode}
        setCurrentLang={setCurrentLang}
        setPreviewMode={setPreviewMode}
        setShowPageSettings={setShowPageSettings}
        onPublish={() => saveMutation.mutate({ isPublished: true })}
        isSaving={saveMutation.isPending}
      />

      <div className="flex flex-1 overflow-hidden relative">
        <main className={`flex-1 overflow-y-auto bg-slate-100/50 custom-scrollbar ${previewMode ? 'p-0' : 'p-4 md:p-14'}`}>
          {previewMode ? (
            <Profiler id="BuilderPreview" onRender={onProfileRender}>
              <BuilderPreview active={previewMode} previewDevice={previewDevice} pageData={pageData} blocks={blocks} />
            </Profiler>
          ) : (
            <Profiler id="BuilderEditorUI" onRender={onProfileRender}>
              <BuilderCanvas
                blocks={blocks}
                currentLang={currentLang}
                editingBlockIndex={editingBlockIndex}
                showMobileSidebar={showMobileSidebar}
                setEditingBlockIndex={setEditingBlockIndex}
                setShowMobileSidebar={setShowMobileSidebar}
                onAddBlock={handleAddBlock}
                onMoveBlock={handleMoveBlock}
                onDeleteBlock={handleDeleteBlock}
              />
            </Profiler>
          )}
        </main>

        <BuilderEditorPanel
          visible={!previewMode && editingBlockIndex !== null}
          editingBlockIndex={editingBlockIndex}
          currentEditingBlock={currentEditingBlock}
          currentEditingContent={currentEditingContent}
          setEditingBlockIndex={setEditingBlockIndex}
          setMediaTarget={setMediaTarget}
          setMediaLibraryOpen={setMediaLibraryOpen}
          handleMoveBlock={handleMoveBlock}
          handleDeleteBlock={handleDeleteBlock}
          handleUpdateBlock={handleUpdateBlock}
        />
      </div>

      {mediaLibraryOpen ? <MediaLibrary onSelect={handleMediaSelect} onClose={() => setMediaLibraryOpen(false)} /> : null}

      {previewMode && (
        <div className="fixed bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-2xl border border-white p-2 md:p-2.5 rounded-[1.5rem] md:rounded-[2rem] shadow-2xl flex gap-2 md:gap-3 z-[300] items-center scale-100 md:scale-110">
          <button onClick={() => setPreviewDevice('desktop')} className={`px-4 md:px-5 py-2.5 md:py-3 rounded-xl md:rounded-2xl transition-all flex items-center gap-2 ${previewDevice === 'desktop' ? 'bg-slate-900 text-white shadow-2xl' : 'text-slate-400 hover:text-slate-900'}`}><Monitor className="w-4 md:w-5 h-4 md:h-5" /></button>
          <button onClick={() => setPreviewDevice('mobile')} className={`px-4 md:px-5 py-2.5 md:py-3 rounded-xl md:rounded-2xl transition-all flex items-center gap-2 ${previewDevice === 'mobile' ? 'bg-slate-900 text-white shadow-2xl' : 'text-slate-400 hover:text-slate-900'}`}><Smartphone className="w-4 md:w-5 h-4 md:h-5" /></button>
        </div>
      )}

      <BuilderSettingsModal
        open={showPageSettings}
        localPageData={localPageData}
        setLocalPageData={setLocalPageData}
        setShowPageSettings={setShowPageSettings}
        onSave={() => saveMutation.mutate({})}
        isSaving={saveMutation.isPending}
      />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
}
