
import React from 'react';

export default function CTABlock({ content, config }: any) {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-[var(--primary-color)] rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-emerald-200">
           {/* Decorative elements */}
           <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
           <div className="absolute bottom-0 right-0 w-96 h-96 bg-black opacity-10 rounded-full translate-x-1/3 translate-y-1/3"></div>

           <div className="relative z-10 max-w-3xl mx-auto">
             <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
               {content.title || 'Take the First Step Towards a Brighter Future'}
             </h2>
             <p className="mt-6 text-emerald-50 text-lg font-medium opacity-90">
               {content.description || 'Join our vibrant community of learners and scholars today. Admissions are currently open for the next academic session.'}
             </p>
             <div className="mt-10 flex flex-wrap justify-center gap-4">
               <button className="px-10 py-4 bg-white text-emerald-700 font-black rounded-2xl shadow-xl hover:scale-105 transition-all">
                 {content.buttonText || 'Apply Now'}
               </button>
               <button className="px-10 py-4 bg-emerald-700 text-white font-black rounded-2xl hover:bg-emerald-800 transition-all border border-emerald-500/50">
                 Contact Us
               </button>
             </div>
           </div>
        </div>
      </div>
    </section>
  );
}
