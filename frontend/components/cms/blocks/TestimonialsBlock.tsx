
import React from 'react';
import { Quote } from 'lucide-react';

export default function TestimonialsBlock({ content, config, settings }: any) {
  const primary = settings?.primaryColor || '#10b981';
  const testimonials = content.testimonials || [
    { name: 'Dr. Abdul Rahim', role: 'Parent', text: 'The balance between academic excellence and spiritual growth is what makes this institution unique.' },
    { name: 'Sadiq Al-Amin', role: 'Grandfather', text: 'My grandsons have shown remarkable behavioral and moral improvement since joining this Madarsa.' },
    { name: 'Zainab Fatima', role: 'Former Scholar', text: 'The mentorship here shaped my career and my character. Forever grateful.' },
  ];

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <div className="relative inline-block">
             <Quote className="w-16 h-16 opacity-10 mx-auto mb-6" style={{ color: primary }} />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-12 h-1 bg-emerald-500 rounded-full" style={{ background: primary }}></div>
             </div>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight uppercase">
            {content.title || 'Echoes of Appreciation'}
          </h2>
          <p className="mt-4 text-gray-500 font-medium">Stories of transformation and trust from our beloved community.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {testimonials.map((t: any, i: number) => (
            <div key={i} className="relative group p-10 bg-gray-50 rounded-[3rem] border border-transparent hover:border-emerald-100 hover:bg-white hover:shadow-2xl hover:shadow-gray-200 transition-all duration-500">
              <div className="mb-6">
                <Quote className="w-8 h-8 opacity-40" style={{ color: primary }} />
              </div>
              <p className="text-gray-700 font-medium leading-relaxed italic mb-8 relative z-10">"{t.text}"</p>
              <div className="flex items-center gap-4 relative z-10">
                {t.imageUrl ? (
                   <img src={t.imageUrl} alt={t.name} className="w-12 h-12 rounded-2xl object-cover shadow-sm" />
                ) : (
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center font-black text-sm" style={{ color: primary }}>
                    {t.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight">{t.name}</h4>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: primary }}>{t.role}</p>
                </div>
              </div>
              {/* Decorative Background */}
              <div 
                className="absolute top-0 right-0 w-32 h-32 rounded-bl-[100%] opacity-0 group-hover:opacity-5 transition-opacity"
                style={{ background: primary }}
              ></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
