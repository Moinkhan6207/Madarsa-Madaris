
import React from 'react';

export default function StatsBlock({ content, config, settings }: any) {
  const primary = settings?.primaryColor || '#10b981';
  const items = content.items || [
    { label: 'Total Students', value: '1,200+' },
    { label: 'Gold Medalists', value: '45+' },
    { label: 'Qualified Teachers', value: '80+' },
    { label: 'Events Hosted', value: '150+' },
  ];

  return (
    <section className="py-20 bg-white sm:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div 
          className="relative rounded-[4rem] px-8 py-16 md:py-20 overflow-hidden shadow-2xl border border-gray-100/50"
          style={{ background: 'linear-gradient(135deg, #f9fafb 0%, #ffffff 100%)' }}
        >
          {/* Abstract Decorations */}
          <div 
            className="absolute top-0 right-0 w-64 h-64 opacity-5 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3"
            style={{ background: primary }}
          ></div>
          <div 
            className="absolute bottom-0 left-0 w-64 h-64 opacity-5 blur-3xl rounded-full -translate-x-1/3 translate-y-1/3"
            style={{ background: primary }}
          ></div>

          <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-8">
            {items.map((item: any, i: number) => (
              <div key={i} className="text-center group flex flex-col items-center">
                <div 
                  className="mb-4 w-1 h-8 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 transform -translate-y-4 group-hover:translate-y-0"
                  style={{ background: primary }}
                ></div>
                <div className="text-4xl md:text-6xl font-black text-gray-900 mb-3 tracking-tighter transition-all duration-500 group-hover:scale-110">
                  {item.value}
                </div>
                <div className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-[0.25em] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: primary }}></span>
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
