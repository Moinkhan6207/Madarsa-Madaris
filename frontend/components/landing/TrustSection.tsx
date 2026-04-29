'use client';

import React from 'react';

// CSS animation styles for performance
const fadeInUp = (delay: number) => ({
  animation: `fadeInUp 0.5s ease-out ${delay}s forwards`,
  opacity: 0,
});

export function TrustSection() {
  return (
    <section className="py-6 bg-white border-y border-gray-100 relative z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-500 tracking-wide uppercase mb-8">
            Trusted by Madarsas & Islamic Institutions
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 items-center justify-center opacity-80">
            <div 
              className="flex flex-col items-center justify-center gap-2"
              style={fadeInUp(0)}
            >
              <div className="text-4xl font-bold text-gray-900">100+</div>
              <div className="text-sm text-gray-500 font-medium">Institutions</div>
            </div>
            <div 
              className="flex flex-col items-center justify-center gap-2"
              style={fadeInUp(0.1)}
            >
              <div className="text-4xl font-bold text-gray-900">10,000+</div>
              <div className="text-sm text-gray-500 font-medium">Students Managed</div>
            </div>
            <div 
              className="flex flex-col items-center justify-center gap-2"
              style={fadeInUp(0.2)}
            >
              <div className="text-4xl font-bold text-gray-900">50+</div>
              <div className="text-sm text-gray-500 font-medium">Cities</div>
            </div>
            <div 
              className="flex flex-col items-center justify-center gap-2 text-primary-600"
              style={fadeInUp(0.3)}
            >
              <div className="text-4xl font-bold">100%</div>
              <div className="text-sm font-medium">Secure & Halal</div>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
