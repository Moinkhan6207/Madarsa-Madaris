'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cmsService, WebsiteSettings } from '@/services/cms.service';
import { useRouter } from 'next/navigation';
import { Save, Globe, Palette, Share2, Info, CheckCircle2, Image as ImageIcon, X, ArrowLeft } from 'lucide-react';
import MediaLibrary from '@/components/cms/MediaLibrary';

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] px-6 py-3.5 rounded-2xl shadow-xl text-sm font-bold flex items-center gap-2 animate-in slide-in-from-bottom-4 duration-300 ${
      type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
    }`}>
      <CheckCircle2 className="w-4 h-4" />
      {message}
    </div>
  );
}

export default function WebsiteSettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState<WebsiteSettings>({});
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['cms-settings'],
    queryFn: async () => {
      const res = await cmsService.getSettings();
      setFormData(res.data);
      return res.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: WebsiteSettings) => cmsService.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-settings'] });
      showToast('Settings saved successfully!');
    },
    onError: () => showToast('Failed to save settings', 'error'),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (isLoading) return <div className="p-8 animate-pulse text-gray-400">Loading settings...</div>;

  const tabs = [
    { id: 'general', name: 'General Information', icon: Info },
    { id: 'appearance', name: 'Branding & Colors', icon: Palette },
    { id: 'contact', name: 'Contact Details', icon: Globe },
    { id: 'social', name: 'Social Links', icon: Share2 },
  ];

  return (
    <div className="max-w-5xl space-y-8 pb-20">
      {toast && <Toast message={toast.message} type={toast.type} />}
      {mediaLibraryOpen && (
        <MediaLibrary 
          onClose={() => setMediaLibraryOpen(false)} 
          onSelect={(url) => {
            setFormData(prev => ({ ...prev, logoUrl: url }));
            setMediaLibraryOpen(false);
          }}
        />
      )}

      <div className="flex justify-between items-end border-b border-gray-100 pb-6">
        <div>
          <button 
            onClick={() => router.push('/dashboard/website-builder')}
            className="flex items-center gap-2 mb-4 text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Website Builder
          </button>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight text-[var(--primary-color)]">Site Settings</h1>
          <p className="text-gray-500 mt-1 font-medium">Configure your institution's public website identity.</p>
        </div>
        <button
          onClick={() => updateMutation.mutate(formData)}
          disabled={updateMutation.isPending}
          className="flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all font-black shadow-xl disabled:opacity-50 uppercase tracking-widest text-sm"
        >
          {updateMutation.isPending ? 'Saving...' : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Tabs Sidebar */}
        <div className="w-full md:w-64 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id 
                  ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100' 
                  : 'text-gray-400 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-emerald-600' : 'text-gray-300'}`} />
              {tab.name}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-2xl shadow-gray-200/40 min-h-[500px]">
          {activeTab === 'general' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h3 className="text-lg font-black text-gray-900 border-b border-gray-50 pb-4 mb-8 uppercase tracking-tighter">General Website Info</h3>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 ml-1">Website Title</label>
                  <input
                    name="siteTitle"
                    value={formData.siteTitle || ''}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-emerald-500 transition-all font-medium"
                    placeholder="e.g. Madarsa Darul Uloom"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 ml-1">Meta Description (SEO)</label>
                  <textarea
                    name="metaDescription"
                    rows={4}
                    value={formData.metaDescription || ''}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-emerald-500 transition-all resize-none font-medium text-sm"
                    placeholder="Brief summary of your institution for search engines..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 ml-1">Footer Text</label>
                  <input
                    name="footerText"
                    value={formData.footerText || ''}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-emerald-500 transition-all font-medium"
                    placeholder="e.g. © 2024 Madarsa Darul Uloom. All rights reserved."
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-lg font-black text-gray-900 border-b border-gray-50 pb-4 mb-8 uppercase tracking-tighter">Branding & Colors</h3>
              
              <div className="space-y-8">
                {/* Logo Selection */}
                <div>
                   <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Institution Logo</label>
                   <div className="flex items-center gap-6">
                      <div className="w-24 h-24 bg-gray-50 border-2 border-dashed border-gray-100 rounded-3xl flex items-center justify-center overflow-hidden">
                        {formData.logoUrl ? (
                          <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-gray-200" />
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setMediaLibraryOpen(true)}
                          className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-all"
                        >
                          Select Logo
                        </button>
                        {formData.logoUrl && (
                          <button 
                            onClick={() => setFormData(prev => ({ ...prev, logoUrl: '' }))}
                            className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all border border-red-100"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                   </div>
                   <p className="text-[10px] text-gray-400 font-medium mt-3 italic">* Recommended size: 200x200px or wide SVG/PNG</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 ml-1">Primary Color</label>
                    <div className="flex gap-3">
                      <div className="relative">
                        <input
                          type="color"
                          name="primaryColor"
                          value={formData.primaryColor || '#10b981'}
                          onChange={handleChange}
                          className="h-14 w-14 rounded-2xl cursor-pointer overflow-hidden border-2 border-white shadow-sm"
                        />
                      </div>
                      <input
                        name="primaryColor"
                        value={formData.primaryColor || '#10b981'}
                        onChange={handleChange}
                        className="flex-1 px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-black text-sm uppercase tracking-widest text-gray-700"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 ml-1">Secondary Color</label>
                    <div className="flex gap-3">
                      <div className="relative">
                        <input
                          type="color"
                          name="secondaryColor"
                          value={formData.secondaryColor || '#0f172a'}
                          onChange={handleChange}
                          className="h-14 w-14 rounded-2xl cursor-pointer overflow-hidden border-2 border-white shadow-sm"
                        />
                      </div>
                      <input
                        name="secondaryColor"
                        value={formData.secondaryColor || '#0f172a'}
                        onChange={handleChange}
                        className="flex-1 px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-black text-sm uppercase tracking-widest text-gray-700"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 flex gap-4 text-emerald-700">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-black uppercase tracking-tight mb-1">Visual Identity</p>
                  <p className="text-[11px] font-medium leading-relaxed opacity-80">These colors will be used as the decorative theme for your entire public presence, ensuring brand consistency.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-lg font-black text-gray-900 border-b border-gray-50 pb-4 mb-8 uppercase tracking-tighter">Public Contact Info</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 ml-1">Public Email</label>
                    <input
                      name="contactEmail"
                      value={formData.contactEmail || ''}
                      onChange={handleChange}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-emerald-500 transition-all font-medium"
                      placeholder="contact@institution.com"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 ml-1">Public Phone</label>
                    <input
                      name="contactPhone"
                      value={formData.contactPhone || ''}
                      onChange={handleChange}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-emerald-500 transition-all font-medium"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 ml-1">WhatsApp Number</label>
                  <input
                    name="whatsappNumber"
                    value={formData.whatsappNumber || ''}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-emerald-500 transition-all font-medium"
                    placeholder="Provide full number with country code, e.g. +919876543210"
                  />
                  <p className="text-[10px] text-gray-400 font-medium mt-2 ml-1 italic">This will enable a "Chat on WhatsApp" button on your website.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-lg font-black text-gray-900 border-b border-gray-50 pb-4 mb-8 uppercase tracking-tighter">Social Media Presence</h3>
              <div className="space-y-5">
                {[
                  { id: 'facebookUrl', label: 'Facebook', placeholder: 'https://facebook.com/yourpage' },
                  { id: 'instagramUrl', label: 'Instagram', placeholder: 'https://instagram.com/yourprofile' },
                  { id: 'youtubeUrl', label: 'YouTube', placeholder: 'https://youtube.com/@channel' },
                  { id: 'twitterUrl', label: 'Twitter / X', placeholder: 'https://x.com/yourhandle' },
                ].map(social => (
                  <div key={social.id} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                    <div className="w-32 text-[11px] font-black uppercase text-gray-400 tracking-widest">{social.label}</div>
                    <input 
                      name={social.id} 
                      value={(formData as any)[social.id] || ''} 
                      onChange={handleChange} 
                      className="flex-1 px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-emerald-500 transition-all font-medium text-sm" 
                      placeholder={social.placeholder} 
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
