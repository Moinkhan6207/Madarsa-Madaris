'use client';

import React, { useState, useEffect } from 'react';
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
  Users
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import MediaLibrary from '@/components/cms/MediaLibrary';
import PublicRenderer from '@/components/cms/PublicRenderer';

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
  const [mediaTarget, setMediaTarget] = useState<{ index: number, key: string } | null>(null);

  const { data: pageData, isLoading } = useQuery({
    queryKey: ['cms-page', id],
    queryFn: async () => {
      const res = await cmsService.getPage(id as string);
      setBlocks(res.data.blocks || []);
      setLocalPageData(res.data);
      return res.data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: (data: Partial<Page>) => cmsService.updatePage(id as string, { ...localPageData, blocks }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-page', id] });
      alert('Page published successfully!');
      setShowPageSettings(false);
    },
  });

  const addBlock = (type: string) => {
    const newBlock: PageBlock = {
      type,
      content: { [currentLang]: getInitialContent(type) },
      config: {},
      order: blocks.length
    };
    setBlocks([...blocks, newBlock]);
    setEditingBlockIndex(blocks.length);
  };

  const removeBlock = (index: number) => {
    const newBlocks = [...blocks];
    newBlocks.splice(index, 1);
    setBlocks(newBlocks.map((b, i) => ({ ...b, order: i })));
    if (editingBlockIndex === index) setEditingBlockIndex(null);
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newBlocks.length) return;
    
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    setBlocks(newBlocks.map((b, i) => ({ ...b, order: i })));
    if (editingBlockIndex === index) setEditingBlockIndex(targetIndex);
    else if (editingBlockIndex === targetIndex) setEditingBlockIndex(index);
  };

  const updateBlockContent = (index: number, key: string, value: any) => {
    const newBlocks = [...blocks];
    const currentBlockContent = newBlocks[index].content;
    
    // Ensure structure: { [lang]: { ...items } }
    const langContent = currentBlockContent[currentLang] || { ...currentBlockContent };
    
    newBlocks[index].content = {
      ...currentBlockContent,
      [currentLang]: {
        ...langContent,
        [key]: value
      }
    };
    setBlocks(newBlocks);
  };

  const getInitialContent = (type: string) => {
    switch(type) {
      case 'hero': return { title: 'Welcome', subtitle: 'Supporting education', ctaText: 'Join Us', ctaLink: '#' };
      case 'about': return { title: 'About Us', description: 'Our history and mission...' };
      case 'stats': return { items: [{ label: 'Students', value: '500+' }, { label: 'Graduates', value: '1000+' }] };
      case 'cta': return { title: 'Ready to join?', buttonText: 'Apply Now', link: '/admission' };
      case 'gallery': return { title: 'Our Gallery', images: [] };
      case 'courses': return { title: 'Our Courses', courses: [] };
      case 'donation-banner': return { title: 'Donate Now', description: 'Help us grow', progress: '50%', ctaText: 'Donate' };
      case 'testimonials': return { title: 'Testimonials', testimonials: [] };
      case 'form': return { formType: 'CONTACT', title: 'Contact Us', description: 'Drop us a message' };
      default: return {};
    }
  };

  const openMediaLibrary = (index: number, key: string) => {
    setMediaTarget({ index, key });
    setMediaLibraryOpen(true);
  };

  const handleMediaSelect = (url: string) => {
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
        
        updateBlockContent(mediaTarget.index, parentKey, list);
      } else {
        updateBlockContent(mediaTarget.index, mediaTarget.key, url);
      }
    }
    setMediaLibraryOpen(false);
    setMediaTarget(null);
  };

  if (isLoading) return <div className="p-8 text-gray-400">Loading editor...</div>;

  const blockTypes = [
    { type: 'hero', name: 'Hero', icon: Layout },
    { type: 'about', name: 'About', icon: Layers },
    { type: 'stats', name: 'Stats', icon: CheckCircle2 },
    { type: 'cta', name: 'CTA', icon: Plus },
    { type: 'courses', name: 'Courses', icon: Globe },
    { type: 'testimonials', name: 'Testimonials', icon: Users },
    { type: 'gallery', name: 'Gallery', icon: ImageIcon },
    { type: 'donation-banner', name: 'Donation', icon: Heart },
    { type: 'form', name: 'Form', icon: CheckCircle2 },
  ];

  const currentEditingBlock = editingBlockIndex !== null ? blocks[editingBlockIndex] : null;
  const currentEditingContent = currentEditingBlock?.content[currentLang] || currentEditingBlock?.content || {};

  return (
    <div className="min-h-screen bg-gray-50/50 -m-8 flex flex-col overflow-hidden h-[calc(100vh-0px)]">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-6">
          <Link href="/dashboard/website-builder" className="p-2 hover:bg-gray-100 rounded-xl transition-all">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div className="flex items-center gap-4">
            <div>
              <h1 className="font-black text-gray-900 tracking-tight text-lg">{pageData?.title}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest bg-gray-50 px-1.5 py-0.5 rounded">Draft</span>
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">/ {pageData?.slug}</span>
              </div>
            </div>
            <div className="h-8 w-px bg-gray-100 hidden md:block"></div>
            <div className="flex bg-gray-100 p-1 rounded-xl">
               {['en', 'ur', 'ar'].map(l => (
                 <button 
                  key={l} 
                  onClick={() => setCurrentLang(l)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${currentLang === l ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                 >
                   {l}
                 </button>
               ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100 mr-4 items-center">
             <button 
               onClick={() => setShowPageSettings(true)}
               className="p-2.5 hover:bg-white rounded-lg text-gray-500 hover:text-gray-900 transition-all border border-transparent hover:border-gray-200 shadow-none hover:shadow-sm"
               title="SEO & Metadata"
             >
               <PanelRight className="w-4 h-4" />
             </button>
             <div className="w-px h-4 bg-gray-200 mx-1"></div>
             <button 
               onClick={() => setPreviewMode(!previewMode)}
               className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${previewMode ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-500 hover:bg-white hover:text-gray-900'}`}
             >
               {previewMode ? <Maximize2 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
               {previewMode ? 'Exit Preview' : 'Live Preview'}
             </button>
          </div>
          <button
            onClick={() => saveMutation.mutate({ blocks })}
            disabled={saveMutation.isPending}
            className="flex items-center gap-2 px-8 py-2.5 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all font-black shadow-xl shadow-gray-200 disabled:opacity-50 text-xs uppercase tracking-widest"
          >
            <Save className="w-4 h-4" />
            {saveMutation.isPending ? 'Saving...' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar: Blocks Panel */}
        {!previewMode && (
          <aside className="w-72 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-6 border-b border-gray-50">
               <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Add Blocks</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="grid grid-cols-1 gap-2">
                {blockTypes.map(bt => (
                  <button
                    key={bt.type}
                    onClick={() => addBlock(bt.type)}
                    className="flex items-center gap-3 w-full px-4 py-3 bg-gray-50/50 border border-transparent rounded-2xl hover:border-emerald-200 hover:bg-emerald-50 transition-all group text-left"
                  >
                    <div className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-100 group-hover:border-emerald-100 transition-all">
                      <bt.icon className="w-4 h-4 text-gray-400 group-hover:text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-[11px] font-black text-gray-700 uppercase tracking-tight">{bt.name}</div>
                      <div className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Section</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        )}

        {/* Canvas Area */}
        <main className={`flex-1 bg-gray-50/30 overflow-y-auto scroll-smooth transition-all duration-500 ${previewMode ? 'p-0' : 'p-12'}`}>
          {previewMode ? (
            <div className={`mx-auto bg-white shadow-2xl transition-all duration-700 ${previewDevice === 'mobile' ? 'max-w-[400px] my-10 rounded-[3rem] border-[12px] border-gray-900 overflow-hidden' : 'w-full min-h-full'}`}>
               <PublicRenderer settings={(pageData as any)?.settings} page={{ blocks }} tenant={(pageData as any)?.tenant} />
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {blocks.length === 0 ? (
                <div className="border-4 border-dashed border-gray-100 rounded-[3rem] p-32 text-center">
                  <Layout className="w-20 h-20 mx-auto mb-6 text-gray-100" />
                  <p className="font-black text-gray-300 uppercase tracking-widest text-lg">Canvas Empty</p>
                  <p className="text-gray-300 text-sm font-medium mt-2">Start your masterpiece by adding blocks from the left panel.</p>
                </div>
              ) : (
                blocks.map((block, index) => (
                  <div 
                    key={index} 
                    onClick={() => setEditingBlockIndex(index)}
                    className={`group relative bg-white rounded-[2rem] border-2 transition-all cursor-pointer ${
                      editingBlockIndex === index ? 'border-emerald-500 shadow-2xl shadow-emerald-100 ring-4 ring-emerald-500/5' : 'border-white hover:border-gray-200 shadow-sm'
                    }`}
                  >
                    {/* Block Toolbar */}
                    <div className="absolute -left-14 top-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all bg-white p-1 rounded-xl shadow-lg border border-gray-100">
                      <button onClick={(e) => { e.stopPropagation(); moveBlock(index, 'up'); }} className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-gray-900"><ChevronUp className="w-4 h-4" /></button>
                      <button onClick={(e) => { e.stopPropagation(); moveBlock(index, 'down'); }} className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-gray-900"><ChevronDown className="w-4 h-4" /></button>
                      <button onClick={(e) => { e.stopPropagation(); removeBlock(index); }} className="p-2 hover:bg-red-50 rounded-lg text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>

                    <div className="p-12 text-center pointer-events-none">
                       <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-4 block">Block: {block.type}</span>
                       <h4 className="text-xl font-black text-gray-900 uppercase tracking-tight">{(block.content[currentLang] || block.content)?.title || 'No Title'}</h4>
                       <p className="text-xs text-gray-400 mt-2 font-medium opacity-60 italic">Content rendering preview hidden in Edit mode</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </main>

        {/* Sidebar: Properties Panel */}
        {!previewMode && editingBlockIndex !== null && (
          <aside className="w-80 bg-white border-l border-gray-200 flex flex-col animate-in slide-in-from-right duration-500 shadow-2xl z-40">
            <div className="px-6 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
               <div>
                  <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Properties</h3>
                  <p className="text-[9px] text-emerald-600 font-bold uppercase mt-0.5 tracking-wider">{currentEditingBlock?.type} Section</p>
               </div>
               <button onClick={() => setEditingBlockIndex(null)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                 <X className="w-4 h-4 text-gray-400" />
               </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
               {Object.keys(currentEditingContent).map(key => {
                 const value = currentEditingContent[key];
                 const isImage = key.toLowerCase().includes('image') || key.toLowerCase().includes('logo') || key.toLowerCase().includes('url');
                 
                 return (
                   <div key={key} className="space-y-2">
                     <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] ml-1">{key.replace(/([A-Z])/g, ' $1')}</label>
                     {isImage ? (
                        <div className="relative group">
                           {value ? (
                             <div className="aspect-video rounded-2xl overflow-hidden mb-3 border-2 border-gray-50 shadow-sm bg-gray-50 flex items-center justify-center">
                               <img src={value} className="w-full h-full object-cover" />
                               <button 
                                 onClick={() => updateBlockContent(editingBlockIndex, key, '')}
                                 className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                               >
                                 <Trash2 className="w-3 h-3" />
                               </button>
                             </div>
                           ) : (
                             <button 
                               onClick={() => openMediaLibrary(editingBlockIndex, key)}
                               className="w-full aspect-video border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all group"
                             >
                               <ImageIcon className="w-6 h-6 text-gray-200 group-hover:text-emerald-500" />
                               <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest group-hover:text-emerald-600">Select Image</span>
                             </button>
                           )}
                           {value && (
                             <button 
                               onClick={() => openMediaLibrary(editingBlockIndex, key)}
                               className="w-full py-2 flex items-center justify-center gap-2 text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-all"
                             >
                               Change Image
                             </button>
                           )}
                        </div>
                     ) : typeof value === 'string' && value.length > 50 ? (
                       <textarea 
                         rows={4}
                         value={value}
                         onChange={(e) => updateBlockContent(editingBlockIndex, key, e.target.value)}
                         className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all resize-none"
                       />
                     ) : typeof value === 'object' && Array.isArray(value) ? (
                        <div className="space-y-4">
                           <div className="flex justify-between items-center">
                              <span className="text-[9px] font-black text-gray-400">List Items ({value.length})</span>
                              <button 
                                onClick={() => {
                                  let newItem = {};
                                  if (key === 'images') newItem = { url: '', caption: '' };
                                  else if (key === 'testimonials') newItem = { name: '', role: '', text: '' };
                                  else if (key === 'courses') newItem = { title: '', duration: '', description: '' };
                                  updateBlockContent(editingBlockIndex, key, [...value, newItem]);
                                }}
                                className="p-1 px-2 bg-emerald-50 text-emerald-600 rounded-lg text-[8px] font-bold uppercase"
                              >
                                Add Item
                              </button>
                           </div>
                           <div className="space-y-4 max-h-96 overflow-y-auto pr-2 scrollbar-thin">
                              {value.map((item, i) => (
                                <div key={i} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 relative group/item">
                                   <button 
                                     onClick={() => {
                                       const newValue = [...value];
                                       newValue.splice(i, 1);
                                       updateBlockContent(editingBlockIndex, key, newValue);
                                     }}
                                     className="absolute -right-2 -top-2 p-1.5 bg-white shadow-md border border-gray-100 rounded-lg text-red-500 opacity-0 group-hover/item:opacity-100 transition-all z-10"
                                   >
                                     <Trash2 className="w-3 h-3" />
                                   </button>
                                   {Object.keys(item).map(subKey => {
                                      const isSubImage = subKey.toLowerCase().includes('url') || subKey.toLowerCase().includes('image');
                                      return (
                                        <div key={subKey} className="mt-2">
                                           <label className="text-[8px] font-bold text-gray-400 capitalize">{subKey}</label>
                                           {isSubImage ? (
                                              <div className="flex gap-2 items-center mt-1">
                                                 <div className="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                                                    {item[subKey] && <img src={item[subKey]} className="w-full h-full object-cover" />}
                                                 </div>
                                                 <button 
                                                   onClick={() => openMediaLibrary(editingBlockIndex, `${key}.${i}.${subKey}`)}
                                                   className="flex-1 py-2 bg-white border border-gray-100 rounded-lg text-[8px] font-bold text-emerald-600 uppercase"
                                                 >
                                                   Choose
                                                 </button>
                                              </div>
                                           ) : (
                                              <input 
                                                value={item[subKey]} 
                                                onChange={(e) => {
                                                  const newValue = [...value];
                                                  newValue[i] = { ...item, [subKey]: e.target.value };
                                                  updateBlockContent(editingBlockIndex, key, newValue);
                                                }}
                                                className="w-full px-3 py-1.5 bg-white border border-gray-100 rounded-lg text-[10px] focus:outline-none" 
                                              />
                                           )}
                                        </div>
                                      )
                                   })}
                                </div>
                              ))}
                           </div>
                        </div>
                     ) : (
                       <input 
                         value={value}
                         onChange={(e) => updateBlockContent(editingBlockIndex, key, e.target.value)}
                         className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                       />
                     )}
                   </div>
                 );
               })}
            </div>
            
            <div className="p-6 border-t border-gray-50">
               <button 
                 onClick={() => setEditingBlockIndex(null)}
                 className="w-full py-3 bg-emerald-600/10 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600/20 transition-all"
               >
                 Done Editing
               </button>
            </div>
          </aside>
        )}
      </div>

      {/* Media Library Modal */}
      {mediaLibraryOpen && (
        <MediaLibrary 
          onSelect={handleMediaSelect}
          onClose={() => setMediaLibraryOpen(false)}
        />
      )}

      {/* Preview Device Toggle Floating */}
      {previewMode && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-xl border border-white p-2 rounded-2xl shadow-2xl flex gap-2 z-[300]">
           <button 
             onClick={() => setPreviewDevice('desktop')}
             className={`p-3 rounded-xl transition-all ${previewDevice === 'desktop' ? 'bg-emerald-600 text-white shadow-xl' : 'text-gray-400 hover:text-gray-900'}`}
           >
             <Monitor className="w-5 h-5" />
           </button>
           <button 
             onClick={() => setPreviewDevice('mobile')}
             className={`p-3 rounded-xl transition-all ${previewDevice === 'mobile' ? 'bg-emerald-600 text-white shadow-xl' : 'text-gray-400 hover:text-gray-900'}`}
           >
             <Smartphone className="w-5 h-5" />
           </button>
        </div>
      )}
      {/* Page Settings Modal */}
      {showPageSettings && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-10 relative overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300">
              <button 
                onClick={() => setShowPageSettings(false)}
                className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
              
              <div className="mb-8">
                 <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Page Settings</h2>
                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Configure SEO and Metadata for this page</p>
              </div>

              <div className="space-y-6">
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Meta Title</label>
                    <input 
                      value={localPageData.metaTitle || ''}
                      onChange={(e) => setLocalPageData({...localPageData, metaTitle: e.target.value})}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-emerald-500 font-medium"
                      placeholder="e.g. About Us | Madarsa Darul Uloom"
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Meta Description</label>
                    <textarea 
                      rows={3}
                      value={localPageData.metaDescription || ''}
                      onChange={(e) => setLocalPageData({...localPageData, metaDescription: e.target.value})}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-emerald-500 font-medium resize-none text-sm"
                      placeholder="Brief summary for search engines..."
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Social Image (OG Image)</label>
                    <div className="flex gap-3">
                       {(localPageData as any).ogImage ? (
                         <div className="flex-1 h-20 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                            <img src={(localPageData as any).ogImage} className="w-full h-full object-cover" />
                         </div>
                       ) : (
                         <div className="flex-1 h-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 flex items-center justify-center text-[8px] font-black text-gray-300 uppercase tracking-widest">
                            No Image Selected
                         </div>
                       )}
                       <button 
                         onClick={() => {
                           setMediaTarget({ index: -1, key: 'ogImage' }); // Special index -1 for page settings
                           setMediaLibraryOpen(true);
                         }}
                         className="px-6 py-2 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-100 transition-all border border-emerald-100"
                       >
                         {(localPageData as any).ogImage ? 'Change' : 'Select'}
                       </button>
                    </div>
                 </div>
                 
                 <div className="pt-4 flex gap-3">
                    <button 
                      onClick={() => setShowPageSettings(false)}
                      className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => saveMutation.mutate({})}
                      className="flex-2 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200"
                    >
                      Save Settings
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
