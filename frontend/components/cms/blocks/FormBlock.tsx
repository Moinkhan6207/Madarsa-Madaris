'use client';
import React from 'react';
import { motion } from 'framer-motion';
import ContactForm from '../forms/ContactForm';

interface FormBlockProps {
  content: {
    title?: string;
    description?: string;
    formType?: string;
  };
  tenant: any;
  settings?: any;
}

const FormBlock = React.memo(({ content, tenant, settings }: FormBlockProps) => {
  const formType = content.formType || 'CONTACT';
  const primary = settings?.primaryColor || '#10b981';

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/4 h-full bg-gray-50/50 -skew-x-12 translate-x-1/2"></div>
      
      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span 
            className="text-[11px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-full border mb-6 inline-block"
            style={{ color: primary, background: `${primary}10`, borderColor: `${primary}30` }}
          >
            Connect With Us
          </span>
          <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">
            {content.title || 'Get in Touch'}
          </h2>
          {content.description && (
            <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto">
              {content.description}
            </p>
          )}
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-gray-100 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] relative"
        >
          {/* Form card decoration */}
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-10" style={{ background: primary }}></div>
          
          <div className="relative z-10">
            <ContactForm tenantId={tenant.id} type={formType} />
          </div>
        </motion.div>
      </div>
    </section>
  );
});

FormBlock.displayName = 'FormBlock';

export default FormBlock;
