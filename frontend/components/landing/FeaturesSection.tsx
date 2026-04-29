'use client';

import React, { useEffect, useRef, useState } from 'react';
import { 
  Users, 
  Wallet, 
  CalendarCheck, 
  GitMerge, 
  MessageSquare, 
  BarChart3 
} from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Student Management',
    description: 'Complete digital records for admissions, documents, and student history.',
  },
  {
    icon: Wallet,
    title: 'Fee & Donation Tracking',
    description: 'Automated fee collection, receipt generation, and donation records.',
  },
  {
    icon: CalendarCheck,
    title: 'Attendance System',
    description: 'Daily tracking for students and staff with instant SMS alerts.',
  },
  {
    icon: GitMerge,
    title: 'Multi-Branch Support',
    description: 'Manage all your Madarsa branches from a single unified dashboard.',
  },
  {
    icon: MessageSquare,
    title: 'Parent Communication',
    description: 'Seamlessly broadcast updates and academic reports to parents.',
  },
  {
    icon: BarChart3,
    title: 'Reports & Analytics',
    description: 'Data-driven insights to help optimize your institution\'s operations.',
  },
];

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  const Icon = feature.icon;

  return (
    <div
      ref={ref}
      className={`bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-500 group relative overflow-hidden ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Hover gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10">
        <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary-600 group-hover:text-white transition-all">
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
        <p className="text-gray-600 leading-relaxed">
          {feature.description}
        </p>
      </div>
    </div>
  );
}

export function FeaturesSection() {
  return (
    <section id="features" className="py-10 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Everything you need to manage your institution
          </h2>
          <p className="text-lg text-gray-600">
            Powerful tools designed specifically for the unique requirements of Madarsas, Maktabs, and Islamic Centers.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
