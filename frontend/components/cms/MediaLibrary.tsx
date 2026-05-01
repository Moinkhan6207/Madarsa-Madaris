'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { X, Upload, Trash2, Check, Image as ImageIcon, Loader2, Link as LinkIcon, Video, Film } from 'lucide-react';

interface Media {
  id: string;
  url: string;
  fileName: string;
  type: string;
  mimeType?: string;
}

interface MediaLibraryProps {
  onSelect: (url: string) => void;
  onClose: () => void;
  allowVideo?: boolean;
}

const isVideoUrl = (url: string) => {
  return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com');
};

export default function MediaLibrary({ onSelect, onClose, allowVideo = true }: MediaLibraryProps) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'images' | 'video'>('images');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoError, setVideoError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['cms-media'],
    queryFn: async () => {
      const res = await apiClient.get<{ success: boolean; data: Media[] }>('/tenant/cms/media');
      return res.data;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE');
      const res = await apiClient.post<{ success: boolean; data: Media }>('/tenant/cms/media/upload', formData);
      return res.data;
    },
    onSuccess: (uploadedMedia) => {
      queryClient.invalidateQueries({ queryKey: ['cms-media'] });
      // Auto-select the newly uploaded image immediately to avoid user error
      if (uploadedMedia?.url) {
        onSelect(uploadedMedia.url);
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/tenant/cms/media/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-media'] });
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadMutation.mutateAsync(file);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleVideoLink = () => {
    setVideoError('');
    if (!videoUrl.trim()) {
      setVideoError('Please enter a video URL');
      return;
    }
    if (!isVideoUrl(videoUrl)) {
      setVideoError('Please enter a valid YouTube or Vimeo URL');
      return;
    }
    onSelect(videoUrl.trim());
  };

  const getYouTubeThumb = (url: string) => {
    const match = url.match(/(?:youtube\.com.*v=|youtu\.be\/)([^&?/]+)/);
    return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
  };

  const media = data || [];
  const images = media.filter(m => m.type === 'IMAGE');
  const videos = media.filter(m => m.type === 'VIDEO');

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-5xl h-full max-h-[85vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/10">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2 tracking-tight">
              <ImageIcon className="w-6 h-6 text-emerald-600" />
              Media Library
            </h2>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">
              Manage your institution's assets
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-all">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        {allowVideo && (
          <div className="flex gap-1 px-8 pt-4 flex-shrink-0">
            {[
              { id: 'images', label: 'Images', icon: ImageIcon },
              { id: 'video', label: 'Video Links', icon: Film },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.id
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'text-gray-400 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'images' ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {/* Upload Placeholder */}
              <label className="aspect-square border-4 border-dashed border-gray-100 rounded-[2rem] flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group">
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept="image/*"
                  disabled={uploading}
                />
                {uploading ? (
                  <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                ) : (
                  <>
                    <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-emerald-100 transition-colors">
                      <Upload className="w-6 h-6 text-gray-400 group-hover:text-emerald-600" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-emerald-700 text-center px-2">
                      Upload Image
                    </span>
                  </>
                )}
              </label>

              {/* Loading skeleton */}
              {isLoading && [1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-square bg-gray-50 rounded-[2rem] animate-pulse" />
              ))}

              {/* Image Items */}
              {!isLoading && images.map((item) => (
                <div
                  key={item.id}
                  className="group relative aspect-square bg-gray-50 rounded-[2rem] overflow-hidden border-2 border-transparent hover:border-emerald-500 transition-all shadow-sm hover:shadow-xl hover:-translate-y-1"
                >
                  <Image
                    src={item.url}
                    alt={item.fileName}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 20vw"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2 p-3">
                    <button
                      onClick={() => onSelect(item.url)}
                      className="w-full py-2 bg-emerald-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 hover:bg-emerald-700"
                    >
                      <Check className="w-3 h-3" /> Select
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this image?')) deleteMutation.mutate(item.id);
                      }}
                      className="p-2 text-red-400 hover:text-red-600 rounded-lg bg-white/10 backdrop-blur-sm w-full flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <p className="text-[8px] font-bold text-white truncate">{item.fileName}</p>
                  </div>
                </div>
              ))}

              {!isLoading && images.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-300">
                  <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-bold text-sm">No images uploaded yet</p>
                </div>
              )}
            </div>
          ) : (
            /* Video Links Tab */
            <div className="max-w-2xl mx-auto space-y-8">
              <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                <h3 className="font-black text-gray-900 text-sm uppercase tracking-widest mb-2 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-emerald-600" />
                  Paste a Video URL
                </h3>
                <p className="text-gray-400 text-xs font-medium mb-6">
                  Supports YouTube and Vimeo video links
                </p>
                <div className="space-y-4">
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={e => { setVideoUrl(e.target.value); setVideoError(''); }}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-500 font-medium text-sm"
                  />
                  {videoError && (
                    <p className="text-red-500 text-xs font-bold">{videoError}</p>
                  )}

                  {/* Preview */}
                  {videoUrl && isVideoUrl(videoUrl) && (
                    <div className="rounded-2xl overflow-hidden border border-gray-100 bg-gray-100 aspect-video">
                      {videoUrl.includes('youtube') || videoUrl.includes('youtu.be') ? (
                        (() => {
                          const thumb = getYouTubeThumb(videoUrl);
                          return thumb ? (
                            <div className="relative w-full h-full">
                              <Image
                                src={thumb}
                                alt="Video preview"
                                fill
                                className="object-cover"
                                sizes="100vw"
                                unoptimized
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center shadow-xl">
                                  <Video className="w-8 h-8 text-white fill-white" />
                                </div>
                              </div>
                            </div>
                          ) : null;
                        })()
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="w-12 h-12 text-gray-300" />
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={handleVideoLink}
                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all"
                  >
                    Use This Video
                  </button>
                </div>
              </div>

              {/* Examples */}
              <div className="text-center">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  Supported Platforms
                </p>
                <div className="flex justify-center gap-4 mt-3">
                  {['YouTube', 'Vimeo'].map(p => (
                    <span key={p} className="px-4 py-1.5 bg-gray-100 text-gray-500 rounded-full text-[10px] font-bold uppercase tracking-widest">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
