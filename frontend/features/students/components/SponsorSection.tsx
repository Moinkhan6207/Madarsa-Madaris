'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Phone, Mail, Briefcase, X, CheckCircle2, Loader2 } from 'lucide-react';
import type { StudentSponsorMapping, Sponsor } from '../types/student';

const sponsorMappingSchema = z.object({
  sponsorId: z.string().uuid('Select a sponsor'),
  supportLabel: z.string().optional(),
  amount: z.number().nonnegative().optional(),
  currencyCode: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  notes: z.string().optional(),
});

type SponsorMappingFormData = z.infer<typeof sponsorMappingSchema>;

interface SponsorSectionProps {
  mappings: StudentSponsorMapping[];
  sponsors: Sponsor[];
  studentId: string;
  onMap: (data: SponsorMappingFormData) => void;
  onUnlink: (sponsorId: string) => void;
  isMapping: boolean;
  isUnlinking: boolean;
  canManage: boolean;
}

export function SponsorSection({
  mappings,
  sponsors,
  onMap,
  onUnlink,
  isMapping,
  isUnlinking,
  canManage,
}: SponsorSectionProps) {
  const [isAddingNew, setIsAddingNew] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SponsorMappingFormData>({
    resolver: zodResolver(sponsorMappingSchema),
  });

  const handleMap = (data: SponsorMappingFormData) => {
    onMap(data);
    setIsAddingNew(false);
    reset();
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-black text-slate-900">Sponsors</h3>
          <p className="text-sm font-medium text-slate-400 mt-1">{mappings.length} sponsor(s) linked</p>
        </div>
        {canManage && !isAddingNew && (
          <button
            onClick={() => { setIsAddingNew(true); reset(); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
          >
            <Plus className="w-4 h-4" /> Link Sponsor
          </button>
        )}
      </div>

      {/* Add Form */}
      {isAddingNew && (
        <form
          onSubmit={handleSubmit(handleMap)}
          className="mb-6 p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-700">Link Sponsor</span>
            <button type="button" onClick={() => { setIsAddingNew(false); reset(); }} className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Sponsor *</label>
              <select {...register('sponsorId')} className={`w-full px-3 py-2 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${errors.sponsorId ? 'border-red-400' : 'border-slate-200'}`}>
                <option value="">Select sponsor</option>
                {sponsors.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Support Label</label>
              <input {...register('supportLabel')} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="e.g. Monthly, Annual" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Amount</label>
              <input type="number" step="0.01" {...register('amount', { valueAsNumber: true })} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="0.00" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Currency</label>
              <input {...register('currencyCode')} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="INR" />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setIsAddingNew(false); reset(); }}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isMapping}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {isMapping ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Link Sponsor
            </button>
          </div>
        </form>
      )}

      {/* Mappings List */}
      <div className="space-y-3">
        {mappings.map((mapping) => (
          <div
            key={mapping.id}
            className="flex items-start gap-4 p-4 rounded-2xl border border-slate-100 bg-white hover:border-slate-200 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-slate-800">{mapping.sponsor?.name}</span>
                {mapping.supportLabel && (
                  <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{mapping.supportLabel}</span>
                )}
              </div>
              <div className="mt-1.5 flex flex-wrap gap-3 text-xs font-medium text-slate-500">
                {mapping.amount && (
                  <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                    {mapping.currencyCode || 'INR'} {mapping.amount}
                  </span>
                )}
                {mapping.sponsor?.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {mapping.sponsor.phone}</span>}
                {mapping.sponsor?.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {mapping.sponsor.email}</span>}
              </div>
            </div>
            {canManage && (
              <button
                onClick={() => onUnlink(mapping.sponsorId)}
                disabled={isUnlinking}
                className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50 shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
        {mappings.length === 0 && (
          <div className="text-center py-8 text-sm font-medium text-slate-400">No sponsors linked yet.</div>
        )}
      </div>
    </div>
  );
}
