'use client';
import React from 'react';
import Image from 'next/image';
import { Quote, Star } from 'lucide-react';

const TestimonialsBlock = React.memo(({ content, settings }: any) => {
  const primary = settings?.primaryColor || '#10b981';
  const testimonials = content.testimonials || [
    { name: 'Abdullah Khan', role: 'Parent', content: 'The dedication and moral values taught here are exceptional. My son has shown great progress.' },
    { name: 'Dr. Fatima', role: 'Educator', content: 'A perfect blend of modern curriculum and Islamic teachings. Truly a visionary institution.' },
    { name: 'Mohammad Ali', role: 'Student', content: 'I am proud to be part of an institution that values both knowledge and character.' },
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full blur-[100px] opacity-10 -translate-x-1/2 -translate-y-1/2" style={{ background: primary }}></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full blur-[80px] opacity-10 translate-x-1/2 translate-y-1/2" style={{ background: primary }}></div>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-[11px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-full border mb-6 inline-block" style={{ color: primary, background: `${primary}10`, borderColor: `${primary}30` }}>Voices of Trust</span>
          <h2 className="text-4xl md:text-6xl font-black text-gray-900 leading-[1.1] tracking-tight">{content.title || 'What Our Community Says'}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {testimonials.map((test: any, i: number) => (
            <div key={i} className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] relative group transition-all hover:-translate-y-2">
              <div className="absolute top-0 right-10 w-20 h-20 -translate-y-1/2 rounded-[2rem] flex items-center justify-center text-white shadow-2xl transition-transform duration-500 group-hover:rotate-12" style={{ background: primary }}><Quote className="w-10 h-10 fill-white" /></div>
              <div className="flex gap-1 mb-6">{[...Array(5)].map((_, idx) => (<Star key={idx} className="w-4 h-4" style={{ color: primary, fill: primary }} />))}</div>
              <p className="text-gray-600 italic text-lg leading-relaxed mb-10 font-medium font-serif">"{test.content || test.text}"</p>
              <div className="flex items-center gap-5 pt-8 border-t border-gray-50">
                {test.imageUrl ? <Image src={test.imageUrl} alt={test.name} width={56} height={56} className="w-14 h-14 rounded-2xl object-cover shadow-lg" /> : <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${primary}dd, ${primary})` }}>{test.name?.[0]}</div>}
                <div><div className="text-xl font-black text-gray-900 leading-tight">{test.name}</div><div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{test.role}</div></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

TestimonialsBlock.displayName = 'TestimonialsBlock';

export default TestimonialsBlock;
