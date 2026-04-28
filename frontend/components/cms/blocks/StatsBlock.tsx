'use client';
import React from 'react';
import { motion, useInView } from 'framer-motion';

function CountUp({ value }: { value: string }) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });
  const [displayValue, setDisplayValue] = React.useState(0);
  
  const numericValue = parseInt(value?.replace(/[^0-9]/g, '') || '0');
  const suffix = value?.replace(/[0-9]/g, '') || '';

  React.useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = numericValue;
      const duration = 2000;
      const increment = Math.ceil(end / (duration / 16));
      
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
    }
  }, [isInView, numericValue]);

  return <span ref={ref}>{displayValue}{suffix}</span>;
}

export default function StatsBlock({ content, config, settings }: any) {
  const primary = settings?.primaryColor || '#10b981';
  const secondary = settings?.secondaryColor || '#0f172a';
  const stats = content.stats || [
    { label: 'Students', value: '1500+' },
    { label: 'Teachers', value: '80+' },
    { label: 'Courses', value: '12+' },
    { label: 'Donations', value: '100K+' },
  ];

  return <section className="py-20 relative overflow-hidden" style={{ background: secondary }}>
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: `radial-gradient(${primary} 1px, transparent 1px)`, backgroundSize: '30px 30px' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-16">
          {stats.map((stat: any, i: number) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="text-center group"
            >
              <div className="relative inline-block mb-4">
                <div 
                  className="absolute inset-0 blur-3xl opacity-0 group-hover:opacity-40 transition-opacity rounded-full scale-150"
                  style={{ background: primary }}
                />
                <div className="text-4xl md:text-6xl font-black text-white relative z-10 tracking-tighter">
                  <CountUp value={stat.value} />
                </div>
              </div>
              <div className="text-xs md:text-sm font-bold uppercase tracking-[0.3em] text-gray-400 group-hover:text-white transition-colors duration-500">
                {stat.label}
              </div>
              <motion.div 
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + (i * 0.1), duration: 0.8 }}
                className="h-1 w-12 mx-auto mt-6 rounded-full"
                style={{ background: primary }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>;
}
