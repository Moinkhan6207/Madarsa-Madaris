'use client';
import React from 'react';
import { BookOpen, Clock, Users, ArrowRight, Star } from 'lucide-react';

const CourseListBlock = React.memo(({ content, settings }: any) => {
  const primary = settings?.primaryColor || '#10b981';
  const courses = content.courses || [
    { title: 'Hifz-e-Quran', duration: '3-4 Years', students: '500+', description: 'Memorization of the Holy Quran with Tajweed.' },
    { title: 'Alim Course', duration: '7 Years', students: '200+', description: 'Comprehensive study of Islamic sciences.' },
    { title: 'Deeniyat Junior', duration: '2 Years', students: '350+', description: 'Basic Islamic values and ethics for children.' },
  ];

  return (
    <section className="py-24 bg-[#f8fafc] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" style={{ background: `${primary}08` }}></div>
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" style={{ background: `${primary}05` }}></div>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-end mb-20 gap-8">
          <div className="max-w-2xl text-center lg:text-left">
            <span className="text-[11px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-full border mb-6 inline-block" style={{ color: primary, background: `${primary}10`, borderColor: `${primary}30` }}>Academic Excellence</span>
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 leading-[1.1] tracking-tight">{content.title || 'Our Educational Programs'}</h2>
          </div>
          <button className="flex items-center gap-3 px-10 py-5 text-white rounded-2xl font-black hover:shadow-2xl transition-all uppercase tracking-widest text-xs hover:-translate-y-1" style={{ background: primary, boxShadow: `0 20px 40px ${primary}30` }}>Explore All Courses<ArrowRight className="w-5 h-5" /></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {courses.map((course: any, i: number) => (
            <div key={i} className="group bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.1)] transition-all duration-500 relative overflow-hidden hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] rounded-bl-full transition-opacity group-hover:opacity-[0.08]" style={{ background: primary }}></div>
              <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-10 transition-all duration-500 shadow-xl group-hover:rotate-[15deg]" style={{ background: `linear-gradient(135deg, ${primary}15, ${primary}30)`, color: primary }}><BookOpen className="w-8 h-8" /></div>
              <h3 className="text-3xl font-black text-gray-900 mb-5 leading-tight">{course.title}</h3>
              <p className="text-gray-500 mb-10 text-base leading-relaxed font-medium line-clamp-3">{course.description}</p>
              <div className="flex flex-wrap items-center gap-6 pt-8 border-t border-gray-50">
                <div className="flex items-center gap-3 text-xs font-black text-gray-400 uppercase tracking-widest"><Clock className="w-4 h-4" style={{ color: primary }} />{course.duration}</div>
                <div className="flex items-center gap-3 text-xs font-black text-gray-400 uppercase tracking-widest"><Users className="w-4 h-4" style={{ color: primary }} />{course.students} Students</div>
              </div>
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity"><Star className="w-6 h-6" style={{ fill: primary, color: primary }} /></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

CourseListBlock.displayName = 'CourseListBlock';

export default CourseListBlock;
