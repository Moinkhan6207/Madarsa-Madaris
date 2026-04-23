'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { X, Upload, Trash2, Check, Image as ImageIcon, Loader2 } from 'lucide-react';

interface Media {
  id: string;
  url: string;
  fileName: string;
  type: string;
}

interface MediaLibraryProps {
  onSelect: (url: string) => void;
  onClose: () => void;
}

export default function MediaLibrary({ onSelect, onClose }: MediaLibraryProps) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

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
      formData.append('type', 'IMAGE');
      return apiClient.post('/tenant/cms/media/upload', formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-media'] });
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
    }
  };

  const media = data || [];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-5xl h-full max-h-[800px] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/10">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2 tracking-tight">
              <ImageIcon className="w-6 h-6 text-emerald-600" />
              Media Library
            </h2>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Manage and select your institution's assets</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-all">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {/* Upload Placeholder */}
            <label className="aspect-square border-4 border-dashed border-gray-100 rounded-[2rem] flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group relative overflow-hidden">
               <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" disabled={uploading} />
               {uploading ? (
                 <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
               ) : (
                 <>
                   <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-emerald-100 transition-colors">
                     <Upload className="w-6 h-6 text-gray-400 group-hover:text-emerald-600" />
                   </div>
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-emerald-700">Upload Media</span>
                 </>
               )}
            </label>

            {/* Media Items */}
            {isLoading ? (
              [1, 2, 3, 4].map(i => <div key={i} className="aspect-square bg-gray-50 rounded-[2rem] animate-pulse"></div>)
            ) : media.map((item) => (
              <div key={item.id} className="group relative aspect-square bg-gray-50 rounded-[2rem] overflow-hidden border border-transparent hover:border-emerald-500 transition-all shadow-sm hover:shadow-xl hover:-translate-y-1">
                <img src={item.url} alt={item.fileName} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2 p-4">
                  <button 
                    onClick={() => onSelect(item.url)}
                    className="w-full py-2 bg-emerald-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" /> Select
                  </button>
                  <button 
                    onClick={() => deleteMutation.mutate(item.id)}
                    className="p-2 text-red-400 hover:text-red-600 transition-colors rounded-lg bg-white/10 backdrop-blur-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute top-3 left-3 px-2 py-0.5 bg-black/20 backdrop-blur-md rounded-md text-[8px] font-bold text-white uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {item.fileName.slice(0, 15)}...
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
