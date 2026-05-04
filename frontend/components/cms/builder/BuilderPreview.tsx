'use client';

import dynamic from 'next/dynamic';

const PublicRenderer = dynamic(() => import('@/components/cms/PublicRenderer'));

interface BuilderPreviewProps {
  active: boolean;
  previewDevice: 'desktop' | 'mobile';
  pageData: any;
  blocks: any[];
}

export default function BuilderPreview({ active, previewDevice, pageData, blocks }: BuilderPreviewProps) {
  if (!active) return null;

  return (
    <div className={`mx-auto bg-white shadow-2xl transition-all duration-700 ${previewDevice === 'mobile' ? 'max-w-[400px] my-10 rounded-[3rem] border-[12px] border-slate-900 overflow-hidden' : 'w-full min-h-full'}`}>
      <PublicRenderer settings={(pageData as any)?.settings} page={{ blocks }} tenant={(pageData as any)?.tenant} />
    </div>
  );
}
