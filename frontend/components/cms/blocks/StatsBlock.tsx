'use client';
import React from 'react';

const CountUp = React.memo(({ value }: { value: string }) => {
  const ref = React.useRef<HTMLSpanElement | null>(null);
  const [isInView, setIsInView] = React.useState(false);
  const [displayValue, setDisplayValue] = React.useState(0);

  const numericValue = parseInt(value?.replace(/[^0-9]/g, '') || '0', 10);
  const suffix = value?.replace(/[0-9]/g, '') || '';

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        observer.disconnect();
      }
    }, { threshold: 0.2 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = numericValue;
    const duration = 1200;
    const increment = Math.max(1, Math.ceil(end / (duration / 16)));
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, numericValue]);

  return <span ref={ref}>{displayValue}{suffix}</span>;
});

CountUp.displayName = 'CountUp';

const StatsBlock = React.memo(({ content, settings }: any) => {
  const primary = settings?.primaryColor || '#10b981';
  const secondary = settings?.secondaryColor || '#0f172a';
  const stats = content.stats || [
    { label: 'Students', value: '1500+' },
    { label: 'Teachers', value: '80+' },
    { label: 'Courses', value: '12+' },
    { label: 'Donations', value: '100K+' },
  ];

  return (
    <section className="py-20 relative overflow-hidden" style={{ background: secondary }}>
      <div className="absolute inset-0 opacity-10 pointer-events-none"><div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: `radial-gradient(${primary} 1px, transparent 1px)`, backgroundSize: '30px 30px' }}></div></div>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-16">
          {stats.map((stat: any, i: number) => (
            <div key={i} className="text-center group animate-[fadeIn_500ms_ease-out]" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="relative inline-block mb-4">
                <div className="absolute inset-0 blur-3xl opacity-0 group-hover:opacity-40 transition-opacity rounded-full scale-150" style={{ background: primary }} />
                <div className="text-4xl md:text-6xl font-black text-white relative z-10 tracking-tighter"><CountUp value={stat.value} /></div>
              </div>
              <div className="text-xs md:text-sm font-bold uppercase tracking-[0.3em] text-gray-400 group-hover:text-white transition-colors duration-500">{stat.label}</div>
              <div className="h-1 w-12 mx-auto mt-6 rounded-full" style={{ background: primary }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

StatsBlock.displayName = 'StatsBlock';

export default StatsBlock;
