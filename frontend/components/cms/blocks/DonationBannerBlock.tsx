'use client';
import React from 'react';
import { Heart, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const DonationBannerBlock = React.memo(({ content, config, settings, tenant }: any) => {
  const primary = settings?.primaryColor || '#10b981';
  const secondary = settings?.secondaryColor || '#0f172a';
  const tenantSlug = tenant?.slug;

  const goal = parseFloat(content.campaignGoal || '0');
  const raised = parseFloat(content.amountRaised || '0');
  const currency = content.currency || 'INR';
  const progressPercent = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : parseInt(content.progress) || 65;

  const formatAmount = (amount: number) => {
    if (currency === 'INR') {
      if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
      if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
      return `₹${amount.toLocaleString()}`;
    }
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
    return `$${amount.toLocaleString()}`;
  };

  return <section className="py-24 px-6 relative overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="max-w-7xl mx-auto rounded-[4rem] overflow-hidden relative shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)]"
        style={{ background: secondary }}
      >
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute -top-1/2 -right-1/4 w-full h-full rounded-full blur-[120px]"
            style={{ background: primary }}
          />
          <motion.div 
            animate={{ scale: [1, 1.3, 1], rotate: [0, -45, 0] }}
            transition={{ duration: 25, repeat: Infinity, delay: 5 }}
            className="absolute -bottom-1/2 -left-1/4 w-full h-full rounded-full blur-[100px]"
            style={{ background: primary }}
          />
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 p-12 md:p-24 items-center">
          <div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white text-[10px] font-black uppercase tracking-[0.3em] mb-10"
            >
              <Heart className="w-3 h-3 animate-pulse text-red-400" />
              Sadaqah Jariyah
            </motion.div>
            <h2 className="text-4xl md:text-7xl font-black text-white leading-[1.05] tracking-tight mb-8">
              {content.title || 'Invest in the Hereafter'}
            </h2>
            <p className="text-xl text-gray-400 font-medium leading-relaxed mb-12 max-w-lg">
              {content.description || 'Your Sadaqah Jariyah sustains our student scholarships and campus infrastructure development.'}
            </p>
            <div className="flex flex-wrap gap-6 items-center">
              <motion.a
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                href={content.ctaLink || (tenantSlug ? `/public/${tenantSlug}/donate` : '#')}
                className="group relative flex items-center gap-3 px-10 py-5 text-white rounded-2xl font-black text-xl shadow-2xl overflow-hidden"
                style={{ background: primary }}
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                Donate Now
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </motion.a>
              <div className="flex items-center gap-3 text-gray-500 font-bold text-xs uppercase tracking-[0.2em]">
                <ShieldCheck className="w-5 h-5" style={{ color: primary }} />
                Secure & Verified
              </div>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
            <div className="bg-white/5 backdrop-blur-2xl rounded-[3.5rem] p-10 md:p-14 border border-white/10 shadow-2xl relative overflow-hidden group">
              <h4 className="text-white font-black text-xs uppercase tracking-[0.3em] mb-10 opacity-60 flex items-center gap-3">
                <Sparkles className="w-4 h-4" style={{ color: primary }} />
                {content.campaignName || 'Campaign Progress'}
              </h4>
              <div className="mb-12">
                <div className="flex justify-between text-white text-xs font-black uppercase tracking-widest mb-4">
                  <span>Funds Raised</span>
                  <span style={{ color: primary }}>{progressPercent}%</span>
                </div>
                <div className="h-4 bg-white/10 rounded-full overflow-hidden p-1">
                  <motion.div initial={{ width: 0 }} whileInView={{ width: `${progressPercent}%` }} transition={{ duration: 1.5, ease: "easeOut" }} className="h-full rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)]" style={{ background: `linear-gradient(90deg, ${primary}, ${primary}dd)` }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 transition-colors group-hover:bg-white/10">
                  <div className="text-white font-black text-3xl">{goal > 0 ? formatAmount(raised) : '₹12.5L'}</div>
                  <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-2">Raised</div>
                </div>
                <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 transition-colors group-hover:bg-white/10">
                  <div className="text-white font-black text-3xl opacity-60">{goal > 0 ? formatAmount(goal) : '₹20L'}</div>
                  <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-2">Target Goal</div>
                </div>
              </div>
              <div className="mt-10 text-center">
                 <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">Join {raised > 0 ? 'many' : '150+'} blessed donors</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>;
});

DonationBannerBlock.displayName = 'DonationBannerBlock';

export default DonationBannerBlock;
