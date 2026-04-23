
import React from 'react';

export default function StatsBlock({ content, config }: any) {
  const items = content.items || [
    { label: 'Total Students', value: '1,200+' },
    { label: 'Gold Medalists', value: '45+' },
    { label: 'Qualified Teachers', value: '80+' },
    { label: 'Events Hosted', value: '150+' },
  ];

  return (
    <section className="py-16 bg-gray-50 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {items.map((item: any, i: number) => (
            <div key={i} className="text-center group">
              <div className="text-4xl md:text-5xl font-black text-gray-900 mb-2 transition-transform group-hover:scale-110">
                {item.value}
              </div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
