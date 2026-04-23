'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cmsService, Page } from '@/services/cms.service';
import { Plus, Edit2, Trash2, Eye, ExternalLink, Settings, Globe, Home, Star } from 'lucide-react';
import Link from 'next/link';

export default function WebsiteBuilderPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['cms-pages'],
    queryFn: () => cmsService.listPages(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => cmsService.deletePage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-pages'] });
    },
  });

  const bootstrapMutation = useMutation({
    mutationFn: () => cmsService.bootstrapWebsite(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-pages'] });
      alert('Website bootstrapped successfully!');
    },
  });

  const setHomePageMutation = useMutation({
    mutationFn: (id: string) => cmsService.updatePage(id, { isHomePage: true } as Partial<Page>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-pages'] });
    },
  });

  const pages = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Website Builder</h1>
          <p className="text-gray-500 text-sm">Manage your institution's public presence and content.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/website-builder/settings"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold shadow-sm text-sm"
          >
            <Settings className="w-4 h-4" />
            Site Settings
          </Link>
          {pages.length === 0 && (
            <button
              onClick={() => {
                if(confirm('This will generate default pages (Home, About, Contact, etc.). Continue?')) {
                  bootstrapMutation.mutate();
                }
              }}
              disabled={bootstrapMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl hover:bg-indigo-100 transition-all font-semibold shadow-sm text-sm"
            >
              <Globe className="w-4 h-4" />
              {bootstrapMutation.isPending ? 'Bootstrapping...' : 'Bootstrap Site'}
            </button>
          )}
          <button
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-semibold shadow-lg shadow-emerald-100 text-sm"
            onClick={() => {
              const title = prompt('Enter page title:');
              const slug = prompt('Enter page slug (e.g. about-us):');
              if (title && slug) {
                cmsService.createPage({ title, slug, isPublished: false }).then(() => {
                  queryClient.invalidateQueries({ queryKey: ['cms-pages'] });
                });
              }
            }}
          >
            <Plus className="w-4 h-4" />
            New Page
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xl shadow-gray-200/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">Page Details</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">Public URL</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="px-8 py-6"><div className="h-4 bg-gray-100 rounded-lg w-full"></div></td>
                  </tr>
                ))
              ) : pages.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                       <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300">
                         <Globe className="w-6 h-6" />
                       </div>
                       <p className="text-gray-400 font-medium">No pages created yet.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                pages.map((page: Page) => (
                  <tr key={page.id} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">{page.title}</div>
                      <div className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mt-1">ID: {page.id?.slice(0, 8)}</div>
                    </td>
                    <td className="px-8 py-6">
                      <code className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-md font-medium">
                        /{page.slug}
                      </code>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                       <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                         page.isPublished 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                          : 'bg-amber-50 text-amber-600 border border-amber-100'
                       }`}>
                         <span className={`w-1.5 h-1.5 rounded-full ${page.isPublished ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                         {page.isPublished ? 'Live' : 'Draft'}
                       </span>
                       {page.isHomePage && (
                         <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-100">
                           <Home className="w-3 h-3" />
                           Home
                         </span>
                       )}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="flex justify-end gap-2">
                         {!page.isHomePage && page.isPublished && (
                           <button
                             className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                             title="Set as Homepage"
                             onClick={() => {
                               if(confirm('Set this page as the main homepage?')) {
                                 setHomePageMutation.mutate(page.id!);
                               }
                             }}
                           >
                             <Star className="w-4 h-4" />
                           </button>
                         )}
                         <Link
                           href={`/dashboard/website-builder/builder/${page.id}`}
                           className="p-2.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                           title="Design Page"
                         >
                           <Edit2 className="w-4 h-4" />
                         </Link>
                         <button
                           className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                           onClick={() => {
                             if (confirm('Are you sure you want to delete this page?')) {
                               deleteMutation.mutate(page.id!);
                             }
                           }}
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
