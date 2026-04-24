
import React from 'react';
import { ArrowRight, Send } from 'lucide-react';

export default function CTABlock({ content, config, settings }: any) {
  const primary = settings?.primaryColor || '#10b981';
  const secondary = settings?.secondaryColor || '#0f172a';

  return (
    <section className="py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div 
          className="relative rounded-[4rem] p-12 md:p-24 text-center overflow-hidden shadow-2xl shadow-gray-200"
          style={{ background: secondary }}
        >
           {/* Dynamic Glow elements */}
           <div 
             className="absolute top-0 left-0 w-96 h-96 opacity-10 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2"
             style={{ background: primary }}
           ></div>
           <div 
             className="absolute bottom-0 right-0 w-full h-[50%] opacity-5"
             style={{ background: `linear-gradient(to top, ${primary}, transparent)` }}
           ></div>

           <div className="relative z-10 max-w-4xl mx-auto">
             <div 
               className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 mb-10 text-white/60"
               style={{ background: 'rgba(255,255,255,0.03)' }}
             >
               <Send className="w-3 h-3" style={{ color: primary }} />
               Next Steps
             </div>
             
             <h2 className="text-4xl md:text-7xl font-black text-white leading-[1.1] mb-8 uppercase tracking-tighter">
               {content.title || 'Start Your Journey With Us Today'}
             </h2>
             
             <p className="text-lg md:text-xl text-gray-400 font-medium leading-relaxed mb-12 max-w-2xl mx-auto">
               {content.description || 'Join our vibrant community of learners and scholars. Admissions are currently open for the next academic session.'}
             </p>

             <div className="flex flex-wrap justify-center gap-6">
               <button 
                 className="px-12 py-6 text-white font-black rounded-3xl shadow-2xl hover:scale-105 transition-all flex items-center gap-3 uppercase tracking-widest text-sm"
                 style={{ background: primary, boxShadow: `0 20px 40px ${primary}30` }}
               >
                 {content.buttonText || 'Apply for Admission'}
                 <ArrowRight className="w-5 h-5" />
               </button>
               
               <button className="px-12 py-6 bg-white/5 text-white border border-white/10 font-black rounded-3xl hover:bg-white/10 transition-all uppercase tracking-widest text-sm backdrop-blur-md">
                 Contact Administration
               </button>
             </div>

             <div className="mt-16 flex justify-center items-center gap-10 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
               {/* Minimalist social proof or logos can go here */}
               <div className="w-px h-8 bg-white/20"></div>
               <p className="text-[10px] font-bold text-white uppercase tracking-widest">Validated Institutional Standards</p>
               <div className="w-px h-8 bg-white/20"></div>
             </div>
           </div>
        </div>
      </div>
    </section>
  );
}
