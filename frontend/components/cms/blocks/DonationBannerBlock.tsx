
import React from 'react';
import { Heart, ArrowRight, ShieldCheck } from 'lucide-react';

export default function DonationBannerBlock({ content, config, settings }: any) {
  const primary = settings?.primaryColor || '#10b981';

  // Calculate campaign progress from content fields
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

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="relative rounded-[4rem] overflow-hidden bg-gray-900 min-h-[400px] flex items-center p-12 md:p-24 group">
          {/* Abstract background graphics */}
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 skew-x-12 translate-x-1/2" style={{ background: primary }}></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ background: primary }}></div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-8">
                <Heart className="w-3 h-3 animate-pulse" />
                Sadaqah Jariyah
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-6 uppercase">
                {content.title || 'Invest in the Hereafter'}
              </h2>
              <p className="text-gray-400 text-lg font-medium leading-relaxed mb-10 max-w-lg">
                {content.description || 'Your Sadaqah Jariyah sustains our student scholarships and campus infrastructure development.'}
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  className="px-10 py-5 text-white rounded-[2rem] font-black hover:scale-105 transition-all shadow-xl flex items-center gap-2"
                  style={{ background: primary }}
                >
                  {content.ctaText || 'Donate Now'}
                  <ArrowRight className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3 text-gray-500 font-bold text-xs uppercase tracking-widest px-6">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  Secure & Verified
                </div>
              </div>
            </div>

            <div className="hidden md:block">
              <div className="bg-white/5 backdrop-blur-md rounded-[3rem] p-10 border border-white/10">
                <h4 className="text-white font-black text-sm uppercase tracking-widest mb-6 opacity-60">
                  {content.campaignName || 'Campaign Progress'}
                </h4>
                {/* Progress Bar */}
                <div className="mb-8">
                  <div className="flex justify-between text-white text-[10px] font-bold uppercase tracking-widest mb-3">
                    <span>Raised</span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="h-4 bg-white/10 rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full rounded-full shadow-lg transition-all duration-1000"
                      style={{ width: `${progressPercent}%`, background: primary }}
                    ></div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-6 bg-white/5 rounded-[2rem] border border-white/5">
                    <div className="text-white font-black text-2xl">
                      {goal > 0 ? formatAmount(raised) : (content.raisedDisplay || '₹12.5L')}
                    </div>
                    <div className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-1">Raised</div>
                  </div>
                  <div className="text-center p-6 bg-white/5 rounded-[2rem] border border-white/5">
                    <div className="text-white font-black text-2xl">
                      {goal > 0 ? formatAmount(goal) : (content.goalDisplay || '₹20L')}
                    </div>
                    <div className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-1">Goal</div>
                  </div>
                </div>

                <p className="text-center text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-6">
                  Be part of this blessed cause
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
