
import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function AboutBlock({ content, config, settings }: any) {
  const primary = settings?.primaryColor || '#10b981';
  const hasImage = !!content.imageUrl;

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* Image Side */}
          <div className="relative">
            <div className="aspect-square bg-gray-100 rounded-[3rem] overflow-hidden rotate-3 hover:rotate-0 transition-transform duration-700 shadow-2xl">
              {hasImage ? (
                <img
                  src={content.imageUrl}
                  alt={content.title || 'About Us'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-gray-50 to-gray-100">
                  <div
                    className="w-24 h-24 rounded-2xl flex items-center justify-center text-white text-4xl font-black shadow-xl"
                    style={{ background: primary }}
                  >
                    ع
                  </div>
                  <span className="font-bold text-sm uppercase tracking-widest text-gray-300">Our Legacy</span>
                </div>
              )}
            </div>
            <div
              className="absolute -bottom-6 -right-6 w-40 h-40 rounded-3xl -z-10 shadow-xl"
              style={{ background: primary, opacity: 0.15 }}
            ></div>
            <div
              className="absolute -top-4 -left-4 w-24 h-24 rounded-2xl -z-10"
              style={{ background: primary, opacity: 0.08 }}
            ></div>
          </div>

          {/* Content Side */}
          <div>
            <span
              className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border inline-block mb-6"
              style={{ color: primary, background: `${primary}15`, borderColor: `${primary}30` }}
            >
              About Our Institution
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              {content.title || 'A Legacy of Excellence in Education'}
            </h2>
            <div className="mt-8 space-y-5 text-gray-600 leading-relaxed font-medium">
              <p>{content.description || 'Our institution was founded with a vision to provide a balanced education that combines traditional Islamic values with modern academic excellence.'}</p>
              {content.description2 && <p>{content.description2}</p>}
            </div>

            {/* Feature Points */}
            {content.features && content.features.length > 0 && (
              <ul className="mt-8 space-y-3">
                {content.features.map((feat: string, i: number) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: primary }} />
                    <span className="text-gray-700 font-medium text-sm">{feat}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-10 flex gap-4">
              <a
                href="#contact"
                className="px-6 py-3 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg"
                style={{ background: primary }}
              >
                Get in Touch
              </a>
              <a
                href="#courses"
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all"
              >
                View Programs
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
