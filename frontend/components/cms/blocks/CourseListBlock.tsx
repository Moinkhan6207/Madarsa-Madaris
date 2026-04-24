
import React from 'react';
import { BookOpen, Clock, Users, ArrowRight } from 'lucide-react';

export default function CourseListBlock({ content, config, settings }: any) {
  const primary = settings?.primaryColor || '#10b981';
  const courses = content.courses || [
    { title: 'Hifz-e-Quran', duration: '3-4 Years', students: '500+', description: 'Memorization of the Holy Quran with Tajweed.' },
    { title: 'Alim Course', duration: '7 Years', students: '200+', description: 'Comprehensive study of Islamic sciences.' },
    { title: 'Deeniyat Junior', duration: '2 Years', students: '350+', description: 'Basic Islamic values and ethics for children.' },
  ];

  return (
    <section className="py-24 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <span 
              className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border mb-4 inline-block"
              style={{ color: primary, background: `${primary}15`, borderColor: `${primary}30` }}
            >
              Academic Excellence
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight uppercase tracking-tight">
              {content.title || 'Our Educational Programs'}
            </h2>
            <p className="mt-4 text-gray-500 font-medium">Explore our meticulously designed courses for balanced spiritual and intellectual growth.</p>
          </div>
          <button 
            className="flex items-center gap-2 px-8 py-3 text-white rounded-2xl font-bold hover:scale-105 transition-all shadow-xl uppercase tracking-widest text-xs"
            style={{ background: primary, boxShadow: `0 10px 25px ${primary}20` }}
          >
            Explore All
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course: any, i: number) => (
            <div key={i} className="group bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/40 hover:border-transparent hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-12 transition-all duration-500"
                style={{ background: `${primary}10`, color: primary }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = primary;
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = `${primary}10`;
                  e.currentTarget.style.color = primary;
                }}
              >
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4 group-hover:text-emerald-700 transition-colors uppercase tracking-tight">{course.title}</h3>
              <p className="text-gray-500 mb-8 text-sm leading-relaxed font-medium line-clamp-3 italic">"{course.description}"</p>
              
              <div className="flex items-center gap-6 pt-6 border-t border-gray-50">
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <Clock className="w-3.5 h-3.5" style={{ color: primary }} />
                  {course.duration}
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <Users className="w-3.5 h-3.5" style={{ color: primary }} />
                   Active: {course.students}
                </div>
              </div>

              {/* Decorative side accent */}
              <div 
                className="absolute top-0 right-0 w-1 h-full opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: primary }}
              ></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
