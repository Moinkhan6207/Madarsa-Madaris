'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, ShieldCheck, Zap, Database } from 'lucide-react';

const benefits = [
  {
    icon: <Clock className="w-5 h-5" />,
    title: 'Save Time',
    description: 'Automate repetitive tasks like fee reminders and attendance.',
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: 'Reduce Manual Work',
    description: 'No more confusing spreadsheets or piles of paper registers.',
  },
  {
    icon: <Database className="w-5 h-5" />,
    title: 'Centralized System',
    description: 'Access everything from one dashboard, anywhere, anytime.',
  },
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    title: 'Secure Access',
    description: 'Role-based control to keep sensitive Madarsa data safe.',
  },
];

export function BenefitsSection() {
  return (
    <section id="benefits" className="py-10 bg-white text-gray-900 relative overflow-hidden">
      {/* Background light pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0 bg-[linear-gradient(30deg,#10b981_12%,transparent_12.5%,transparent_87%,#10b981_87.5%,#10b981),linear-gradient(150deg,#10b981_12%,transparent_12.5%,transparent_87%,#10b981_87.5%,#10b981)] bg-[length:40px_70px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight text-gray-900">
              Why transition to <span className="text-primary-600 border-b-4 border-primary-100">IdaraSys?</span>
            </h2>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed max-w-lg">
              Embrace modern technology while maintaining traditional values. Our platform acts as a digital upgrade for your institution, built from the ground up for the Islamic education sector.
            </p>
            <div className="flex gap-4">
              <div className="h-1 w-12 bg-primary-600 rounded" />
              <div className="h-1 w-4 bg-primary-600/50 rounded" />
              <div className="h-1 w-2 bg-primary-600/20 rounded" />
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-primary-50/50 backdrop-blur-sm p-6 rounded-2xl border border-primary-100 hover:bg-white hover:shadow-xl hover:shadow-primary-600/5 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-primary-600 mb-4 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
