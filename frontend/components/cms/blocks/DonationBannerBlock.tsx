
import React from 'react';
import { Heart, ArrowRight, ShieldCheck } from 'lucide-react';

export default function DonationBannerBlock({ content, config }: any) {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="relative rounded-[4rem] overflow-hidden bg-gray-900 min-h-[400px] flex items-center p-12 md:p-24 group">
          {/* Abstract background graphics */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-600/10 skew-x-12 translate-x-1/2"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl opacity-50"></div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600/10 border border-emerald-600/20 rounded-full text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-8">
                <Heart className="w-3 h-3 animate-pulse" />
                Support Education
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6 uppercase">
                {content.title || 'Invest in the Hereafter'}
              </h2>
              <p className="text-gray-400 text-lg font-medium leading-relaxed mb-10 max-w-lg">
                {content.description || 'Your Sadaqah Jariyah sustains our student scholarships and campus infrastructure development.'}
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="px-10 py-5 bg-emerald-600 text-white rounded-[2rem] font-black hover:scale-105 transition-all shadow-xl shadow-emerald-900/50 flex items-center gap-2">
                  {content.ctaText || 'Donate Now'}
                  <ArrowRight className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3 text-gray-500 font-bold text-xs uppercase tracking-widest px-6">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  Secure Transaction
                </div>
              </div>
            </div>

            <div className="hidden md:block">
               <div className="bg-white/5 backdrop-blur-md rounded-[3rem] p-12 border border-white/10">
                  <div className="mb-8">
                    <div className="flex justify-between text-white text-[10px] font-bold uppercase tracking-widest mb-3">
                      <span>Campaign Progress</span>
                      <span>{content.progress || '65%'}</span>
                    </div>
                    <div className="h-4 bg-white/10 rounded-full overflow-hidden p-1">
                      <div className="h-full bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50" style={{ width: content.progress || '65%' }}></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                     <div className="text-center p-6 bg-white/5 rounded-[2rem] border border-white/5">
                        <div className="text-white font-black text-2xl">₹12.5L</div>
                        <div className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-1">Raised</div>
                     </div>
                     <div className="text-center p-6 bg-white/5 rounded-[2rem] border border-white/5">
                        <div className="text-white font-black text-2xl">₹20L</div>
                        <div className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-1">Goal</div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
