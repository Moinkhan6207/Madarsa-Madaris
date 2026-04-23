'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cmsService, WebsiteSettings } from '@/services/cms.service';
import { Save, Globe, Palette, Share2, Info, CheckCircle2 } from 'lucide-react';

export default function WebsiteSettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState<WebsiteSettings>({});

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
      alert('Settings updated successfully!');
    },
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
    <div className="max-w-5xl space-y-8">
      <div className="flex justify-between items-end border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Site Settings</h1>
          <p className="text-gray-500 mt-1">Configure your institution's public website identity.</p>
        </div>
        <button
          onClick={() => updateMutation.mutate(formData)}
          disabled={updateMutation.isPending}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all font-bold shadow-xl shadow-emerald-100 disabled:opacity-50"
        >
          {updateMutation.isPending ? 'Saving...' : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>

      <div className="flex gap-8">
        {/* Tabs Sidebar */}
        <div className="w-64 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-emerald-50 text-emerald-700 shadow-sm' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-emerald-600' : 'text-gray-400'}`} />
              {tab.name}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-3xl border border-gray-100 p-8 shadow-xl shadow-gray-200/30 min-h-[500px]">
          {activeTab === 'general' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4 mb-6">General Website Info</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Website Title</label>
                  <input
                    name="siteTitle"
                    value={formData.siteTitle || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                    placeholder="e.g. Madarsa Darul Uloom"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Meta Description (SEO)</label>
                  <textarea
                    name="metaDescription"
                    rows={4}
                    value={formData.metaDescription || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all resize-none"
                    placeholder="Brief summary of your institution for search engines..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Footer Text</label>
                  <input
                    name="footerText"
                    value={formData.footerText || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                    placeholder="e.g. © 2024 Madarsa Darul Uloom. All rights reserved."
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4 mb-6">Appearance & Colors</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Primary Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      name="primaryColor"
                      value={formData.primaryColor || '#10b981'}
                      onChange={handleChange}
                      className="h-11 w-11 rounded-lg cursor-pointer overflow-hidden border-0"
                    />
                    <input
                      name="primaryColor"
                      value={formData.primaryColor || '#10b981'}
                      onChange={handleChange}
                      className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl font-mono text-sm uppercase"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Secondary Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      name="secondaryColor"
                      value={formData.secondaryColor || '#0f172a'}
                      onChange={handleChange}
                      className="h-11 w-11 rounded-lg cursor-pointer overflow-hidden border-0"
                    />
                    <input
                      name="secondaryColor"
                      value={formData.secondaryColor || '#0f172a'}
                      onChange={handleChange}
                      className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl font-mono text-sm uppercase"
                    />
                  </div>
                </div>
              </div>
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex gap-3 text-emerald-700">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium">Use these colors to match your institution's identity across the public website.</p>
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4 mb-6">Public Contact Info</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Public Email</label>
                    <input
                      name="contactEmail"
                      value={formData.contactEmail || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Public Phone</label>
                    <input
                      name="contactPhone"
                      value={formData.contactPhone || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">WhatsApp Number</label>
                  <input
                    name="whatsappNumber"
                    value={formData.whatsappNumber || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none"
                    placeholder="With country code, e.g. +919876543210"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4 mb-6">Social Media Presence</h3>
              <div className="space-y-4 text-sm font-medium">
                <div className="flex items-center gap-4">
                  <div className="w-24 text-gray-500">Facebook</div>
                  <input name="facebookUrl" value={formData.facebookUrl||''} onChange={handleChange} className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none" placeholder="https://facebook.com/..." />
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-24 text-gray-500">Instagram</div>
                  <input name="instagramUrl" value={formData.instagramUrl||''} onChange={handleChange} className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none" placeholder="https://instagram.com/..." />
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-24 text-gray-500">YouTube</div>
                  <input name="youtubeUrl" value={formData.youtubeUrl||''} onChange={handleChange} className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none" placeholder="https://youtube.com/..." />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
