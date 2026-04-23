'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Settings2, Sparkles } from 'lucide-react';

const steps = [
  {
    icon: <Building2 className="w-8 h-8" />,
    title: 'Register your institution',
    description: 'Create an account for your Madarsa or Masjid with basic details.',
  },
  {
    icon: <Settings2 className="w-8 h-8" />,
    title: 'Setup profile & branches',
    description: 'Add your custom branding, configure multiple branches, and setup academic sessions.',
  },
  {
    icon: <Sparkles className="w-8 h-8" />,
    title: 'Start managing everything',
    description: 'Your dashboard is ready! Add students, collect fees, and manage operations digitally.',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            How it works
          </h2>
          <p className="text-lg text-gray-600">
            Get your institution online and completely operational in three simple steps.
          </p>
        </div>

        <div className="relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0" />
          
          <div className="grid md:grid-cols-3 gap-12 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="relative bg-white text-center"
              >
                <div className="mx-auto w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center border-4 border-white shadow-sm mb-6 text-primary-600 relative z-10 group hover:bg-primary-600 hover:text-white transition-colors">
                  {step.icon}
                  {/* Step number badge */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold border-4 border-white">
                    {index + 1}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 px-4">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
