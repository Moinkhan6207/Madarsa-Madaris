
'use client';
import React from 'react';
import { BookOpen, Clock, Users, ArrowRight, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CourseListBlock({ content, config, settings }: any) {
  const primary = settings?.primaryColor || '#10b981';
  const courses = content.courses || [
    { title: 'Hifz-e-Quran', duration: '3-4 Years', students: '500+', description: 'Memorization of the Holy Quran with Tajweed.' },
    { title: 'Alim Course', duration: '7 Years', students: '200+', description: 'Comprehensive study of Islamic sciences.' },
    { title: 'Deeniyat Junior', duration: '2 Years', students: '350+', description: 'Basic Islamic values and ethics for children.' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const }
    }
  };

  return (
    <section className="py-24 bg-[#f8fafc] relative overflow-hidden">
      {/* Dynamic Background Shapes */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" style={{ background: `${primary}08` }}></div>
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" style={{ background: `${primary}05` }}></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-end mb-20 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl text-center lg:text-left"
          >
            <span 
              className="text-[11px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-full border mb-6 inline-block"
              style={{ color: primary, background: `${primary}10`, borderColor: `${primary}30` }}
            >
              Academic Excellence
            </span>
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 leading-[1.1] tracking-tight">
              {content.title || 'Our Educational Programs'}
            </h2>
            <p className="mt-6 text-gray-500 font-medium text-lg leading-relaxed">
              Explore our meticulously designed courses for balanced spiritual and intellectual growth.
            </p>
          </motion.div>
          <motion.button 
            whileHover={{ scale: 1.05, x: 5 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-3 px-10 py-5 text-white rounded-2xl font-black hover:shadow-2xl transition-all uppercase tracking-widest text-xs"
            style={{ background: primary, boxShadow: `0 20px 40px ${primary}30` }}
          >
            Explore All Courses
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
        >
          {courses.map((course: any, i: number) => (
            <motion.div 
              key={i} 
              variants={itemVariants}
              whileHover={{ y: -15, rotateY: 5, rotateX: -5 }}
              style={{ perspective: 1000 }}
              className="group bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.1)] transition-all duration-500 relative overflow-hidden"
            >
              {/* Card Accent Gradient */}
              <div 
                className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] rounded-bl-full transition-opacity group-hover:opacity-[0.08]"
                style={{ background: primary }}
              ></div>

              <div 
                className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-10 group-hover:rotate-[15deg] transition-all duration-500 shadow-xl"
                style={{ background: `linear-gradient(135deg, ${primary}15, ${primary}30)`, color: primary }}
              >
                <BookOpen className="w-8 h-8" />
              </div>

              <h3 className="text-3xl font-black text-gray-900 mb-5 leading-tight group-hover:text-primary transition-colors" style={{ '--primary': primary } as any}>{course.title}</h3>
              
              <p className="text-gray-500 mb-10 text-base leading-relaxed font-medium line-clamp-3">
                {course.description}
              </p>
              
              <div className="flex flex-wrap items-center gap-6 pt-8 border-t border-gray-50">
                <div className="flex items-center gap-3 text-xs font-black text-gray-400 uppercase tracking-widest">
                  <Clock className="w-4 h-4" style={{ color: primary }} />
                  {course.duration}
                </div>
                <div className="flex items-center gap-3 text-xs font-black text-gray-400 uppercase tracking-widest">
                  <Users className="w-4 h-4" style={{ color: primary }} />
                   {course.students} Students
                </div>
              </div>

              {/* Hover Badge */}
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <Star className="w-6 h-6 fill-primary text-primary" style={{ fill: primary, color: primary }} />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

