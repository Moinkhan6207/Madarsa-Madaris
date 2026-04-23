'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function TrustSection() {
  return (
    <section className="py-6 bg-white border-y border-gray-100 relative z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-500 tracking-wide uppercase mb-8">
            Trusted by Madarsas & Islamic Institutions
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 items-center justify-center opacity-80">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center justify-center gap-2"
            >
              <div className="text-4xl font-bold text-gray-900">100+</div>
              <div className="text-sm text-gray-500 font-medium">Institutions</div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center justify-center gap-2"
            >
              <div className="text-4xl font-bold text-gray-900">10,000+</div>
              <div className="text-sm text-gray-500 font-medium">Students Managed</div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center justify-center gap-2"
            >
              <div className="text-4xl font-bold text-gray-900">50+</div>
              <div className="text-sm text-gray-500 font-medium">Cities</div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center justify-center gap-2 text-primary-600"
            >
              <div className="text-4xl font-bold">100%</div>
              <div className="text-sm font-medium">Secure & Halal</div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
