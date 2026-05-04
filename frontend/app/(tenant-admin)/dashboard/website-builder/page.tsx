'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cmsService, Page } from '@/services/cms.service';
import {
  Plus,
  Edit2,
  Trash2,
  Settings,
  Globe,
  Home,
  Star,
  Eye,
  CheckCircle2,
  MoreVertical,
  ExternalLink,
  Copy,
  Layout,
  MousePointer2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/useTranslation';

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div
      className={`fixed bottom-8 left-1/2 z-[999] px-6 py-4 rounded-2xl shadow-2xl text-sm font-black flex items-center gap-3 border ${
        type === 'success' ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-red-600 text-white border-red-500'
      }`}
    >
      {type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
      {message}
    </div>
  );
}

// Memoized PageCard to prevent unnecessary re-renders
const PageCard = React.memo(({
  page,
  tenantSlug,
  onDelete,
  onTogglePublish,
  onSetHome,
  i,
  t
}: {
  page: Page;
  tenantSlug: string;
  onDelete: (id: string) => void;
  onTogglePublish: (id: string, status: boolean) => void;
  onSetHome: (id: string) => void;
  i: number;
  t: (key: string) => string;
}) => {
  const publicUrl = tenantSlug
    ? `/public/${tenantSlug}${page.slug === 'home' ? '' : '/' + page.slug}`
    : null;

  return (
    <div
      className="group bg-white rounded-[2rem] border border-slate-100 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col h-full relative overflow-hidden"
    >
      {/* Page Header */}
      <div className="flex justify-between items-start mb-6">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${page.isPublished ? 'bg-emerald-50 text-emerald-600 ring-4 ring-emerald-50' : 'bg-amber-50 text-amber-600 ring-4 ring-amber-50'}`}>
            {page.isHomePage ? <Home className="w-6 h-6" /> : <Layout className="w-6 h-6" />}
        </div>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
             {publicUrl && (
                <a
                    href={publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                >
                    <Eye className="w-4 h-4" />
                </a>
             )}
             <button
                onClick={() => onDelete(page.id!)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
             >
                <Trash2 className="w-4 h-4" />
             </button>
        </div>
      </div>

      {/* Title & Info */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-black text-slate-900 truncate tracking-tight">{page.title}</h3>
            {page.isHomePage && (
                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest">{t('websiteBuilder.home')}</span>
            )}
        </div>
        <p className="text-slate-400 text-sm font-bold flex items-center gap-1.5 mb-6">
            <Globe className="w-3.5 h-3.5" />
            /{page.slug}
        </p>

        <div className="flex items-center gap-3 mb-6">
            <button
                onClick={() => onTogglePublish(page.id!, !page.isPublished)}
                className={`flex-1 items-center justify-center py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                    page.isPublished
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20'
                    : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
                }`}
            >
                {page.isPublished ? t('websiteBuilder.published') : t('websiteBuilder.draft')}
            </button>
            {!page.isHomePage && page.isPublished && (
                <button
                    onClick={() => onSetHome(page.id!)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-amber-500 hover:bg-amber-50 border border-transparent hover:border-amber-100 transition-all font-bold"
                    title={t('websiteBuilder.setHomepage')}
                >
                    <Star className="w-4 h-4" />
                </button>
            )}
        </div>
      </div>

      {/* Footer / Main Action */}
      <Link
        href={`/dashboard/website-builder/builder/${page.id}`}
        prefetch={true}
        className="w-full py-4 bg-slate-900 group-hover:bg-emerald-600 text-white rounded-2xl font-black text-sm text-center transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 group-hover:shadow-emerald-600/20"
      >
        <Edit2 className="w-4 h-4" />
        {t('websiteBuilder.openSiteEditor')}
      </Link>
    </div>
  );
});

PageCard.displayName = 'PageCard';

export default function WebsiteBuilderPage() {
  const { t, direction } = useTranslation();
  const queryClient = useQueryClient();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [tenantSlug, setTenantSlug] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const resolveSlug = async () => {
      // 1. Check direct keys
      let slug = localStorage.getItem('tenant_slug') || localStorage.getItem('tenantSlug');
      
      // 2. Fallback: Check user object
      if (!slug) {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            slug = user.tenantSlug;
          } catch (e) {}
        }
      }
      
      // 3. Last Resort: Fetch from API
      if (!slug) {
        try {
          const res = await cmsService.getTenantInfo();
          if (res?.success && res?.data) {
            slug = res.data.slug;
          }

          if (slug) {
            localStorage.setItem('tenant_slug', slug);
          }
        } catch (e) {
          console.error('Failed to resolve tenant slug:', e);
        }
      }
      
      setTenantSlug(slug || '');
    };

    resolveSlug();
  }, []);



  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['cms-pages'],
    queryFn: () => cmsService.listPages(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => cmsService.deletePage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-pages'] });
      showToast(t('websiteBuilder.pageDeleted'));
    },
    onError: () => showToast(t('websiteBuilder.deleteFailed'), 'error'),
  });

  const togglePublishMutation = useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      cmsService.updatePage(id, { isPublished } as Partial<Page>),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['cms-pages'] });
      showToast(vars.isPublished ? t('websiteBuilder.pagePublished') : t('websiteBuilder.pageUnpublished'));
    },
    onError: () => showToast(t('websiteBuilder.statusFailed'), 'error'),
  });

  const bootstrapMutation = useMutation({
    mutationFn: () => cmsService.bootstrapWebsite(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-pages'] });
      showToast(t('websiteBuilder.bootstrapSuccess'));
    },
    onError: () => showToast(t('websiteBuilder.bootstrapFailed'), 'error'),
  });

  const setHomePageMutation = useMutation({
    mutationFn: (id: string) => cmsService.updatePage(id, { isHomePage: true } as Partial<Page>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-pages'] });
      showToast(t('websiteBuilder.homepageUpdated'));
    },
  });

  const createPageMutation = useMutation({
    mutationFn: (data: { title: string; slug: string }) =>
      cmsService.createPage({ ...data, isPublished: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-pages'] });
      showToast(t('websiteBuilder.newPageCreated'));
    },
    onError: (err: any) => showToast(err?.message || t('websiteBuilder.createPageFailed'), 'error'),
  });

  const pages = useMemo(() => data?.data?.pages || [], [data?.data?.pages]);

  // Pagination logic
  const totalPages = Math.ceil(pages.length / itemsPerPage);
  const paginatedPages = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return pages.slice(startIndex, startIndex + itemsPerPage);
  }, [pages, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset to page 1 when pages change
  useEffect(() => {
    setCurrentPage(1);
  }, [pages.length]);

  const handleCreatePage = () => {
    const title = window.prompt(t('websiteBuilder.pageTitlePrompt'));
    if (!title) return;
    const slug = window.prompt(t('websiteBuilder.pageSlugPrompt'), title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
    if (!slug) return;
    createPageMutation.mutate({ title, slug });
  };

  return (
    <div className="space-y-10" dir={direction}>
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-2 mb-2">
            <Layout className="w-5 h-5 text-emerald-600 fill-emerald-600/10" />
            <span className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em]">{t('websiteBuilder.cmsEngine')}</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">{t('websiteBuilder.title')}</h1>
          <p className="text-slate-500 font-medium text-lg mt-1">{t('websiteBuilder.subtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              if (tenantSlug) {
                window.open(`/public/${tenantSlug}`, '_blank');
              } else {
                showToast(t('websiteBuilder.tenantSlugMissing'), 'error');
              }
            }}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all font-bold shadow-lg"
          >
            <Eye className="w-5 h-5" />
            {t('websiteBuilder.viewLiveSite')}
          </button>
          <Link
            href="/dashboard/website-builder/settings"
            prefetch={true}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all font-bold shadow-sm"
          >
            <Settings className="w-5 h-5" />
            {t('websiteBuilder.siteSettings')}
          </Link>
          <button
            onClick={handleCreatePage}
            disabled={createPageMutation.isPending}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all font-bold shadow-xl shadow-emerald-100"
          >
            <Plus className="w-5 h-5" />
            {t('websiteBuilder.newPage')}
          </button>
        </div>

      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-64 bg-slate-100 rounded-[2rem] animate-pulse" />
            ))}
        </div>
      ) : pages.length === 0 ? (
        <div className="bg-white rounded-[3rem] border border-slate-100 p-20 text-center shadow-sm">
          <div className="flex flex-col items-center gap-6">
            <div className="w-24 h-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center text-emerald-600 ring-8 ring-emerald-50/50">
              <Globe className="w-10 h-10" />
            </div>
            <div className="max-w-md mx-auto">
              <h2 className="text-2xl font-black text-slate-900 mb-2">{t('websiteBuilder.noPagesFound')}</h2>
              <p className="text-slate-500 font-medium mb-10 leading-relaxed">
                {t('websiteBuilder.noPagesSubtitle')}
              </p>
              <button
                onClick={() => {
                  if (confirm(t('websiteBuilder.bootstrapConfirm'))) {
                    bootstrapMutation.mutate();
                  }
                }}
                disabled={bootstrapMutation.isPending}
                className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] hover:bg-black transition-all font-black text-lg mx-auto shadow-2xl shadow-slate-200 active:scale-95 disabled:opacity-50"
              >
                {bootstrapMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-6 h-6 text-amber-400" />}
                {bootstrapMutation.isPending ? t('websiteBuilder.bootstrapping') : t('websiteBuilder.bootstrapButton')}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
            {paginatedPages.map((page: Page, i: number) => (
              <PageCard
                  key={page.id}
                  page={page}
                  tenantSlug={tenantSlug}
                  onDelete={(id) => {
                      if (confirm(t('websiteBuilder.deleteConfirm').replace('{title}', page.title))) {
                          deleteMutation.mutate(id);
                      }
                  }}
                  onTogglePublish={(id, status) => togglePublishMutation.mutate({ id, isPublished: status })}
                  onSetHome={(id) => {
                      if (confirm(t('websiteBuilder.setHomeConfirm'))) {
                          setHomePageMutation.mutate(id);
                      }
                  }}
                  i={i}
                  t={t}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-sm"
              >
                {t('websiteBuilder.previous')}
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                    currentPage === page
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-sm"
              >
                {t('websiteBuilder.next')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Sparkles(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
    </svg>
  );
}

function Loader2(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className="animate-spin"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  );
}
