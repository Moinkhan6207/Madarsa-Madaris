'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Pencil, Phone, Mail, MapPin, Star, X, CheckCircle2, Loader2 } from 'lucide-react';
import type { StudentGuardian, StudentGuardianRelation } from '../types/student';
import { RELATION_LABELS } from '../types/student';

const guardianSchema = z.object({
  relation: z.enum(['FATHER', 'MOTHER', 'BROTHER', 'SISTER', 'UNCLE', 'AUNT', 'GRANDPARENT', 'SPOUSE', 'OTHER'] as const),
  fullName: z.string().min(2),
  phone: z.string().min(7),
  alternatePhone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  occupation: z.string().optional(),
  addressLine1: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  isPrimary: z.boolean().optional(),
  notes: z.string().optional(),
});

type GuardianFormData = z.infer<typeof guardianSchema>;

interface GuardianSectionProps {
  guardians: StudentGuardian[];
  studentId: string;
  onAdd: (data: GuardianFormData) => void;
  onUpdate: (guardianId: string, data: GuardianFormData) => void;
  onDelete: (guardianId: string) => void;
  isAdding: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  canManage: boolean;
}

export function GuardianSection({
  guardians,
  onAdd,
  onUpdate,
  onDelete,
  isAdding,
  isUpdating,
  isDeleting,
  canManage,
}: GuardianSectionProps) {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<GuardianFormData>({
    resolver: zodResolver(guardianSchema),
  });

  const handleAdd = (data: GuardianFormData) => {
    onAdd(data);
    setIsAddingNew(false);
    reset();
  };

  const handleUpdate = (guardianId: string, data: GuardianFormData) => {
    onUpdate(guardianId, data);
    setEditingId(null);
    reset();
  };

  const startEdit = (guardian: StudentGuardian) => {
    reset({
      relation: guardian.relation,
      fullName: guardian.fullName,
      phone: guardian.phone,
      alternatePhone: guardian.alternatePhone ?? undefined,
      email: guardian.email ?? undefined,
      occupation: guardian.occupation ?? undefined,
      addressLine1: guardian.addressLine1 ?? undefined,
      city: guardian.city ?? undefined,
      state: guardian.state ?? undefined,
      isPrimary: guardian.isPrimary,
      notes: guardian.notes ?? undefined,
    });
    setEditingId(guardian.id);
    setIsAddingNew(false);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-black text-slate-900">Guardians</h3>
          <p className="text-sm font-medium text-slate-400 mt-1">{guardians.length} guardian(s) mapped</p>
        </div>
        {canManage && !isAddingNew && !editingId && (
          <button
            onClick={() => { setIsAddingNew(true); setEditingId(null); reset(); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Guardian
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(isAddingNew || editingId) && (
        <form
          onSubmit={handleSubmit((data) => editingId ? handleUpdate(editingId, data) : handleAdd(data))}
          className="mb-6 p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-700">{editingId ? 'Edit Guardian' : 'New Guardian'}</span>
            <button type="button" onClick={() => { setIsAddingNew(false); setEditingId(null); }} className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Relation *</label>
              <select {...register('relation')} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                {Object.entries(RELATION_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Full Name *</label>
              <input {...register('fullName')} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="Full name" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Phone *</label>
              <input {...register('phone')} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="Phone" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Email</label>
              <input type="email" {...register('email')} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="Email" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Occupation</label>
              <input {...register('occupation')} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="Occupation" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Alternate Phone</label>
              <input {...register('alternatePhone')} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="Alt phone" />
            </div>
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register('isPrimary')} className="rounded border-slate-300 text-emerald-600" />
            <span className="text-xs font-semibold text-slate-600">Primary Guardian</span>
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setIsAddingNew(false); setEditingId(null); }}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAdding || isUpdating}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {(isAdding || isUpdating) ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {editingId ? 'Save Changes' : 'Add Guardian'}
            </button>
          </div>
        </form>
      )}

      {/* Guardian List */}
      <div className="space-y-3">
        {guardians.map((guardian) => (
          <div
            key={guardian.id}
            className={`flex items-start gap-4 p-4 rounded-2xl border transition-colors ${
              guardian.isPrimary ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white border-slate-100 hover:border-slate-200'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
              guardian.isPrimary ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
            }`}>
              {guardian.fullName?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-slate-800">{guardian.fullName}</span>
                <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                  {RELATION_LABELS[guardian.relation]}
                </span>
                {guardian.isPrimary && (
                  <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3" /> Primary
                  </span>
                )}
              </div>
              <div className="mt-1.5 flex flex-wrap gap-3 text-xs font-medium text-slate-500">
                {guardian.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {guardian.phone}</span>}
                {guardian.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {guardian.email}</span>}
                {guardian.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {guardian.city}</span>}
              </div>
            </div>
            {canManage && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => startEdit(guardian)}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDelete(guardian.id)}
                  disabled={isDeleting}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ))}
        {guardians.length === 0 && (
          <div className="text-center py-8 text-sm font-medium text-slate-400">No guardians added yet.</div>
        )}
      </div>
    </div>
  );
}
