'use client';

import React, { useState } from 'react';
import { leadService } from '@/services/lead.service';
import { Send, CheckCircle2, User, Phone, Mail, MessageSquare, BookOpen, Calendar, Users } from 'lucide-react';

const Field = ({
  label, icon: Icon, children
}: { label: string; icon?: any; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
      {Icon && <Icon className="w-3 h-3" />}
      {label}
    </label>
    {children}
  </div>
);

const inputClass = "w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium text-sm";

// ─── Admission Form ───────────────────────────────────────────────────────────
function AdmissionForm({ tenantId }: { tenantId: string }) {
  const [data, setData] = useState({
    name: '', email: '', phone: '', dob: '',
    fatherName: '', fatherPhone: '', address: '',
    programApplied: '', previousEducation: '', message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (key: string, val: string) => setData(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await leadService.captureLead({ tenantId, type: 'ADMISSION', formData: data });
      setSubmitted(true);
    } catch {
      alert('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return <SuccessMessage type="ADMISSION" onReset={() => setSubmitted(false)} />;

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] p-8 md:p-12 shadow-2xl border border-gray-100 space-y-8">
      {/* Personal Info */}
      <section>
        <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-6">Personal Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Full Name" icon={User}>
            <input required value={data.name} onChange={e => set('name', e.target.value)} className={inputClass} placeholder="Applicant's full name" />
          </Field>
          <Field label="Date of Birth" icon={Calendar}>
            <input type="date" required value={data.dob} onChange={e => set('dob', e.target.value)} className={inputClass} />
          </Field>
          <Field label="Phone Number" icon={Phone}>
            <input required value={data.phone} onChange={e => set('phone', e.target.value)} className={inputClass} placeholder="+91 98765 43210" />
          </Field>
          <Field label="Email Address" icon={Mail}>
            <input type="email" value={data.email} onChange={e => set('email', e.target.value)} className={inputClass} placeholder="example@email.com (optional)" />
          </Field>
        </div>
        <div className="mt-6">
          <Field label="Home Address">
            <textarea rows={2} value={data.address} onChange={e => set('address', e.target.value)} className={`${inputClass} resize-none`} placeholder="Full residential address" />
          </Field>
        </div>
      </section>

      {/* Parent/Guardian Info */}
      <section>
        <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-6">Parent / Guardian</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Father / Guardian Name" icon={Users}>
            <input required value={data.fatherName} onChange={e => set('fatherName', e.target.value)} className={inputClass} placeholder="Father or guardian's name" />
          </Field>
          <Field label="Guardian Phone" icon={Phone}>
            <input required value={data.fatherPhone} onChange={e => set('fatherPhone', e.target.value)} className={inputClass} placeholder="+91 98765 43210" />
          </Field>
        </div>
      </section>

      {/* Academic Info */}
      <section>
        <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-6">Academic Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Program Applying For" icon={BookOpen}>
            <select required value={data.programApplied} onChange={e => set('programApplied', e.target.value)} className={inputClass}>
              <option value="">Select a program...</option>
              <option value="Hifz ul Quran">Hifz ul Quran</option>
              <option value="Aalimiyat">Aalimiyat</option>
              <option value="Nazra">Nazra</option>
              <option value="Other">Other</option>
            </select>
          </Field>
          <Field label="Previous Education">
            <input value={data.previousEducation} onChange={e => set('previousEducation', e.target.value)} className={inputClass} placeholder="e.g. Primary School, Class 7" />
          </Field>
        </div>
        <div className="mt-6">
          <Field label="Additional Notes / Message" icon={MessageSquare}>
            <textarea rows={3} value={data.message} onChange={e => set('message', e.target.value)} className={`${inputClass} resize-none`} placeholder="Anything else you'd like to share..." />
          </Field>
        </div>
      </section>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-lg hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-50"
      >
        {loading ? 'Submitting Application...' : (<><Send className="w-5 h-5" />Submit Admission Application</>)}
      </button>
    </form>
  );
}

// ─── Inquiry / Volunteer Form ─────────────────────────────────────────────────
function InquiryForm({ tenantId, type }: { tenantId: string; type: string }) {
  const [data, setData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (key: string, val: string) => setData(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await leadService.captureLead({ tenantId, type, formData: data });
      setSubmitted(true);
    } catch {
      alert('Failed to send inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return <SuccessMessage type={type} onReset={() => setSubmitted(false)} />;

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] p-8 md:p-12 shadow-2xl border border-gray-100 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Full Name" icon={User}>
          <input required value={data.name} onChange={e => set('name', e.target.value)} className={inputClass} placeholder="Your Name" />
        </Field>
        <Field label="Phone Number" icon={Phone}>
          <input required value={data.phone} onChange={e => set('phone', e.target.value)} className={inputClass} placeholder="+91..." />
        </Field>
      </div>
      <Field label="Email Address" icon={Mail}>
        <input type="email" required value={data.email} onChange={e => set('email', e.target.value)} className={inputClass} placeholder="example@email.com" />
      </Field>
      {type === 'INQUIRY' && (
        <Field label="Subject">
          <input value={data.subject} onChange={e => set('subject', e.target.value)} className={inputClass} placeholder="What is your inquiry about?" />
        </Field>
      )}
      {type === 'VOLUNTEER' && (
        <Field label="How would you like to help?">
          <input value={data.subject} onChange={e => set('subject', e.target.value)} className={inputClass} placeholder="e.g. Teaching, Administration, Fundraising..." />
        </Field>
      )}
      <Field label="Message" icon={MessageSquare}>
        <textarea
          required
          rows={4}
          value={data.message}
          onChange={e => set('message', e.target.value)}
          className={`${inputClass} resize-none`}
          placeholder={type === 'VOLUNTEER' ? 'Tell us about your skills and availability...' : 'How can we help you?'}
        />
      </Field>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-lg hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-50"
      >
        {loading ? 'Sending...' : (<><Send className="w-5 h-5" />{type === 'VOLUNTEER' ? 'Submit Volunteer Interest' : 'Send Inquiry'}</>)}
      </button>
    </form>
  );
}

// ─── Contact Form ─────────────────────────────────────────────────────────────
function ContactFormInner({ tenantId }: { tenantId: string }) {
  const [data, setData] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (key: string, val: string) => setData(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await leadService.captureLead({ tenantId, type: 'CONTACT', formData: data });
      setSubmitted(true);
    } catch {
      alert('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return <SuccessMessage type="CONTACT" onReset={() => setSubmitted(false)} />;

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] p-8 md:p-12 shadow-2xl border border-gray-100 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Full Name" icon={User}>
          <input required value={data.name} onChange={e => set('name', e.target.value)} className={inputClass} placeholder="Your Name" />
        </Field>
        <Field label="Phone Number" icon={Phone}>
          <input required value={data.phone} onChange={e => set('phone', e.target.value)} className={inputClass} placeholder="+91..." />
        </Field>
      </div>
      <Field label="Email Address" icon={Mail}>
        <input required type="email" value={data.email} onChange={e => set('email', e.target.value)} className={inputClass} placeholder="example@email.com" />
      </Field>
      <Field label="Message" icon={MessageSquare}>
        <textarea
          required
          rows={4}
          value={data.message}
          onChange={e => set('message', e.target.value)}
          className={`${inputClass} resize-none`}
          placeholder="How can we help you?"
        />
      </Field>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-lg hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-50"
      >
        {loading ? 'Sending...' : (<><Send className="w-5 h-5" />Send Message</>)}
      </button>
    </form>
  );
}

// ─── Success State ────────────────────────────────────────────────────────────
function SuccessMessage({ type, onReset }: { type: string; onReset: () => void }) {
  const messages: Record<string, { title: string; body: string }> = {
    ADMISSION: { title: 'Application Submitted!', body: 'JazakAllah Khair! Our admissions team will review your application and contact you within 2–3 working days.' },
    CONTACT: { title: 'Message Sent!', body: 'Thank you for contacting us. Our team will get back to you shortly.' },
    INQUIRY: { title: 'Inquiry Received!', body: 'We have received your inquiry. Our team will respond shortly.' },
    VOLUNTEER: { title: 'Interest Noted!', body: 'JazakAllah Khair for your interest in volunteering. We will be in touch soon.' },
  };
  const msg = messages[type] || messages.CONTACT;

  return (
    <div className="bg-emerald-50 border border-emerald-100 rounded-[2rem] p-12 text-center animate-in zoom-in-95 duration-500">
      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-8 h-8" />
      </div>
      <h3 className="text-2xl font-black text-emerald-900 mb-2 uppercase">{msg.title}</h3>
      <p className="text-emerald-700 font-medium max-w-md mx-auto">{msg.body}</p>
      <button onClick={onReset} className="mt-8 text-emerald-600 font-bold border-b-2 border-emerald-600 pb-1">
        Submit another
      </button>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function ContactForm({ tenantId, type = 'CONTACT' }: { tenantId: string; type?: string }) {
  if (type === 'ADMISSION') return <AdmissionForm tenantId={tenantId} />;
  if (type === 'INQUIRY' || type === 'VOLUNTEER') return <InquiryForm tenantId={tenantId} type={type} />;
  return <ContactFormInner tenantId={tenantId} />;
}
