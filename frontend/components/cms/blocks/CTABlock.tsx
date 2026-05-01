'use client';
import React from 'react';
import { ArrowRight, Send, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const CTABlock = React.memo(({ content, config, settings }: any) => {
  const primary = settings?.primaryColor || '#10b981';
  const secondary = settings?.secondaryColor || '#0f172a';

  return (
    <section className="py-24 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-[4rem] p-12 md:p-24 text-center overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)]"
          style={{ background: secondary }}
        >
          {/* Animated Glow elements */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{ background: `radial-gradient(circle at 0% 0%, ${primary}, transparent 50%)` }}
          ></motion.div>
          
          <div className="relative z-10 max-w-4xl mx-auto">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-3 px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.3em] border border-white/10 mb-10 text-white/80 bg-white/5 backdrop-blur-md"
            >
              <Send className="w-4 h-4" style={{ color: primary }} />
              Ready to take the next step?
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-8xl font-black text-white leading-[1.05] mb-10 tracking-tight"
            >
              {content.title || 'Start Your Journey Today'}
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-400 font-medium leading-relaxed mb-14 max-w-2xl mx-auto"
            >
              {content.description || 'Join our vibrant community of learners and scholars. Admissions are currently open for the next academic session.'}
            </motion.p>

            <div className="flex flex-wrap justify-center gap-8">
              <motion.button 
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-12 py-7 text-white font-black rounded-[2rem] shadow-2xl transition-all flex items-center gap-4 uppercase tracking-[0.2em] text-sm overflow-hidden"
                style={{ background: primary }}
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                <span>{content.buttonText || 'Apply Now'}</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="px-12 py-7 bg-white/5 text-white border border-white/10 font-black rounded-[2rem] hover:bg-white/10 transition-all uppercase tracking-[0.2em] text-sm backdrop-blur-xl"
              >
                Contact Us
              </motion.button>
            </div>

            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.4 }}
              transition={{ delay: 0.6 }}
              className="mt-20 flex flex-wrap justify-center items-center gap-10"
            >
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5" style={{ color: primary, fill: primary }} />
                <span className="text-xs font-black text-white uppercase tracking-widest">Premium Education</span>
              </div>
              <div className="w-px h-6 bg-white/20 hidden sm:block"></div>
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5" style={{ color: primary, fill: primary }} />
                <span className="text-xs font-black text-white uppercase tracking-widest">Global Community</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
});

CTABlock.displayName = 'CTABlock';

export default CTABlock;
