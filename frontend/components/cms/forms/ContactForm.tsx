'use client';

import React, { useState } from 'react';
import { leadService } from '@/services/lead.service';
import { Send, CheckCircle2 } from 'lucide-react';

export default function ContactForm({ tenantId, type = 'CONTACT' }: { tenantId: string, type?: string }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await leadService.captureLead({
        tenantId,
        type,
        formData
      });
      setSubmitted(true);
    } catch (e) {
      alert('Failed to send inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-emerald-50 border border-emerald-100 rounded-[2rem] p-12 text-center animate-in zoom-in-95 duration-500">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-black text-emerald-900 mb-2 uppercase">Inquiry Sent!</h3>
        <p className="text-emerald-700 font-medium">Thank you for contacting us. Our team will get back to you shortly.</p>
        <button 
          onClick={() => setSubmitted(false)}
          className="mt-8 text-emerald-600 font-bold border-b-2 border-emerald-600 pb-1"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] p-8 md:p-12 shadow-2xl border border-gray-100">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
            <input
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium"
              placeholder="Your Name"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Phone Number</label>
            <input
              required
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium"
              placeholder="+91..."
            />
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
          <input
            required
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium"
            placeholder="example@email.com"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Your Message</label>
          <textarea
            required
            rows={4}
            value={formData.message}
            onChange={(e) => setFormData({...formData, message: e.target.value})}
            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium resize-none"
            placeholder="How can we help you?"
          />
        </div>
        <button
          disabled={loading}
          className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-lg hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-50"
        >
          {loading ? 'Sending...' : (
            <>
              Send Inquiry
              <Send className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
