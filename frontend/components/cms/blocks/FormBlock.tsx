import React from 'react';
import ContactForm from '../forms/ContactForm';

interface FormBlockProps {
  content: {
    title?: string;
    description?: string;
    formType?: string;
  };
  tenant: any;
}

export default function FormBlock({ content, tenant }: FormBlockProps) {
  const formType = content.formType || 'CONTACT';

  return (
    <section className="py-24 bg-white relative">
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 uppercase tracking-tight">
            {content.title || 'Get in Touch'}
          </h2>
          {content.description && (
            <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto">
              {content.description}
            </p>
          )}
        </div>
        
        <div className="bg-gray-50 p-2 md:p-4 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <ContactForm tenantId={tenant.id} type={formType} />
        </div>
      </div>
    </section>
  );
}
