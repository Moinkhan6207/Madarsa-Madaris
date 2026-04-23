
import React from 'react';

export default function AboutBlock({ content, config }: any) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="relative">
             <div className="aspect-square bg-gray-100 rounded-[3rem] overflow-hidden rotate-3 hover:rotate-0 transition-transform duration-700 shadow-2xl">
               <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-transparent"></div>
               {/* Image placeholder */}
               <div className="w-full h-full flex items-center justify-center text-gray-300">
                 <span className="font-bold text-xl uppercase tracking-widest">Our Legacy</span>
               </div>
             </div>
             <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-emerald-600 rounded-3xl -z-10 shadow-xl"></div>
          </div>
          
          <div>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">About Our Institution</span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mt-6 leading-tight">
              {content.title || 'A Legacy of Excellence in Education'}
            </h2>
            <div className="mt-8 space-y-6 text-gray-600 leading-relaxed font-medium">
              <p>{content.description || 'Our institution was founded with a vision to provide a balanced education that combines traditional values with modern academic excellence. We take pride in our community and our students\' achievements.'}</p>
              <p>With over 20 years of experience, we have successfully nurtured thousands of students who are now serving society in various capacities.</p>
            </div>
            <div className="mt-10">
              <button className="text-emerald-600 font-bold border-b-2 border-emerald-600 pb-1 hover:text-emerald-700 transition-colors">
                Learn more about our mission
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
