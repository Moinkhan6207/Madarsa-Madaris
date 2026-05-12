'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import type { Student, StudentGuardianRelation, CreateStudentPayload, UpdateStudentPayload, Branch, AcademicSession } from '../types/student';

const guardianSchema = z.object({
  relation: z.enum(['FATHER', 'MOTHER', 'BROTHER', 'SISTER', 'UNCLE', 'AUNT', 'GRANDPARENT', 'SPOUSE', 'OTHER'] as const),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(7, 'Phone must be at least 7 digits'),
  alternatePhone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  occupation: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  isPrimary: z.boolean().optional(),
  notes: z.string().optional(),
});

const sponsorMappingSchema = z.object({
  sponsorId: z.string().min(1, 'Please select a sponsor').uuid('Invalid sponsor ID'),
  supportLabel: z.string().optional(),
  amount: z.number().nonnegative('Amount must be positive').optional().or(z.nan().transform(() => undefined)),
  currencyCode: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  notes: z.string().optional(),
});

const baseStudentSchema = z.object({
  branchId: z.string().uuid('Select a branch'),
  academicSessionId: z.string().uuid().optional(),
  rollNumber: z.string().optional(),
  firstName: z.string().min(2, 'First name required').max(100),
  lastName: z.string().optional(),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
  admissionDate: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  isOrphan: z.boolean().optional(),
  isNeedy: z.boolean().optional(),
  currentProgram: z.string().optional(),
  currentClass: z.string().optional(),
  leadSource: z.string().optional(),
  notes: z.string().optional(),
  guardians: z.array(guardianSchema).max(10).optional(),
  sponsorMappings: z.array(sponsorMappingSchema).max(20).optional(),
}).superRefine((data, ctx) => {
  const primaryCount = data.guardians?.filter((guardian) => guardian.isPrimary).length ?? 0;
  if (primaryCount > 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Only one primary guardian is allowed',
      path: ['guardians'],
    });
  }
});

type StudentFormData = z.infer<typeof baseStudentSchema>;

interface StudentFormProps {
  student?: Student;
  branches: Branch[];
  sessions: AcademicSession[];
  sponsors: { id: string; name: string }[];
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

export function StudentForm({ student, branches, sessions, sponsors, onSubmit, isLoading, mode }: StudentFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    basic: true,
    contact: false,
    academic: false,
    flags: false,
    guardians: false,
    sponsors: false,
  });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StudentFormData>({
    resolver: zodResolver(baseStudentSchema),
    defaultValues: student
      ? {
          branchId: student.branchId,
          academicSessionId: student.academicSessionId ?? undefined,
          rollNumber: student.rollNumber ?? undefined,
          firstName: student.firstName,
          lastName: student.lastName ?? undefined,
          gender: student.gender ?? undefined,
          dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : undefined,
          admissionDate: student.admissionDate ? new Date(student.admissionDate).toISOString().split('T')[0] : undefined,
          phone: student.phone ?? undefined,
          email: student.email ?? undefined,
          addressLine1: student.addressLine1 ?? undefined,
          addressLine2: student.addressLine2 ?? undefined,
          city: student.city ?? undefined,
          state: student.state ?? undefined,
          country: student.country ?? undefined,
          postalCode: student.postalCode ?? undefined,
          isOrphan: student.isOrphan,
          isNeedy: student.isNeedy,
          currentProgram: student.currentProgram ?? undefined,
          currentClass: student.currentClass ?? undefined,
          leadSource: student.leadSource ?? undefined,
          notes: student.notes ?? undefined,
          guardians: student.guardians?.map((g) => ({
            relation: g.relation,
            fullName: g.fullName,
            phone: g.phone,
            alternatePhone: g.alternatePhone ?? undefined,
            email: g.email ?? undefined,
            occupation: g.occupation ?? undefined,
            addressLine1: g.addressLine1 ?? undefined,
            addressLine2: g.addressLine2 ?? undefined,
            city: g.city ?? undefined,
            state: g.state ?? undefined,
            country: g.country ?? undefined,
            postalCode: g.postalCode ?? undefined,
            isPrimary: g.isPrimary,
            notes: g.notes ?? undefined,
          })) ?? [],
          sponsorMappings: [],
        }
      : {
          guardians: [],
          sponsorMappings: [],
          isOrphan: false,
          isNeedy: false,
        },
  });

  const {
    fields: guardianFields,
    append: appendGuardian,
    remove: removeGuardian,
  } = useFieldArray({ control, name: 'guardians' });

  const {
    fields: sponsorFields,
    append: appendSponsor,
    remove: removeSponsor,
  } = useFieldArray({ control, name: 'sponsorMappings' });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const SectionHeader = ({ title, sectionKey, icon: Icon, isOpen }: { title: string; sectionKey: string; icon: any; isOpen: boolean }) => (
    <button
      type="button"
      onClick={() => toggleSection(sectionKey)}
      className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500">
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-sm font-bold text-slate-800">{title}</span>
      </div>
      {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
    </button>
  );

  const onFormSubmit = async (data: StudentFormData) => {
    setError(null);
    try {
      const toDateTime = (value?: string) => (value ? new Date(`${value}T00:00:00.000Z`).toISOString() : undefined);
      const cleanedGuardians = data.guardians?.map((guardian) => ({
        ...guardian,
        alternatePhone: guardian.alternatePhone || undefined,
        email: guardian.email || undefined,
        occupation: guardian.occupation || undefined,
        addressLine1: guardian.addressLine1 || undefined,
        addressLine2: guardian.addressLine2 || undefined,
        city: guardian.city || undefined,
        state: guardian.state || undefined,
        country: guardian.country || undefined,
        postalCode: guardian.postalCode || undefined,
        notes: guardian.notes || undefined,
        isPrimary: guardian.isPrimary ?? false,
      }));
      const cleanedSponsorMappings = data.sponsorMappings
        ?.filter((mapping) => mapping.sponsorId)
        .map((mapping) => ({
          ...mapping,
          supportLabel: mapping.supportLabel || undefined,
          amount: typeof mapping.amount === 'number' && !Number.isNaN(mapping.amount) ? mapping.amount : undefined,
          currencyCode: mapping.currencyCode || undefined,
          startDate: toDateTime(mapping.startDate),
          endDate: toDateTime(mapping.endDate),
          notes: mapping.notes || undefined,
        }));
      const payload: CreateStudentPayload | UpdateStudentPayload = {
        ...data,
        academicSessionId: data.academicSessionId || undefined,
        rollNumber: data.rollNumber || undefined,
        lastName: data.lastName || undefined,
        gender: data.gender || undefined,
        dateOfBirth: toDateTime(data.dateOfBirth),
        admissionDate: toDateTime(data.admissionDate),
        phone: data.phone || undefined,
        email: data.email || undefined,
        addressLine1: data.addressLine1 || undefined,
        addressLine2: data.addressLine2 || undefined,
        city: data.city || undefined,
        state: data.state || undefined,
        country: data.country || undefined,
        postalCode: data.postalCode || undefined,
        currentProgram: data.currentProgram || undefined,
        currentClass: data.currentClass || undefined,
        leadSource: data.leadSource || undefined,
        notes: data.notes || undefined,
        guardians: cleanedGuardians?.length ? cleanedGuardians : undefined,
        sponsorMappings: cleanedSponsorMappings?.length ? cleanedSponsorMappings : undefined,
      };
      await onSubmit(payload);
    } catch (err: any) {
      setError(err?.message || 'Failed to save student. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {Object.keys(errors).length > 0 && !errors.guardians?.message && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          Please fix the validation errors below before submitting.
        </div>
      )}

      {errors.guardians?.message && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {errors.guardians.message}
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <SectionHeader title="Basic Information" sectionKey="basic" icon={() => <span className="text-sm font-bold">👤</span>} isOpen={openSections.basic} />
        {openSections.basic && (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">First Name *</label>
                <input {...register('firstName')} className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${errors.firstName ? 'border-red-400' : 'border-slate-200'}`} placeholder="Enter first name" />
                {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                <input {...register('lastName')} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="Enter last name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                <select {...register('gender')} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                <input type="date" {...register('dateOfBirth')} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input {...register('phone')} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="Phone number" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" {...register('email')} className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${errors.email ? 'border-red-400' : 'border-slate-200'}`} placeholder="Email address" />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contact */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <SectionHeader title="Contact & Address" sectionKey="contact" icon={() => <span className="text-sm font-bold">📍</span>} isOpen={openSections.contact} />
        {openSections.contact && (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Address Line 1</label>
                <input {...register('addressLine1')} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="Street address" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Address Line 2</label>
                <input {...register('addressLine2')} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="Apartment, suite, etc." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                <input {...register('city')} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="City" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                <input {...register('state')} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="State" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                <input {...register('country')} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="Country" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Postal Code</label>
                <input {...register('postalCode')} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="Postal code" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Academic */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <SectionHeader title="Academic Details" sectionKey="academic" icon={() => <span className="text-sm font-bold">🎓</span>} isOpen={openSections.academic} />
        {openSections.academic && (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Branch *</label>
                <select {...register('branchId')} className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${errors.branchId ? 'border-red-400' : 'border-slate-200'}`}>
                  <option value="">Select branch</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
                {errors.branchId && <p className="mt-1 text-xs text-red-600">{errors.branchId.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Academic Session</label>
                <select {...register('academicSessionId')} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                  <option value="">Select session</option>
                  {sessions.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} {s.isCurrent ? '(Current)' : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Roll Number</label>
                <input {...register('rollNumber')} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="Roll number" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Program</label>
                <input {...register('currentProgram')} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="Hifz, Nazra, etc." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
                <input {...register('currentClass')} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="Class / Section" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Admission Date</label>
                <input type="date" {...register('admissionDate')} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Flags */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <SectionHeader title="Flags & Welfare" sectionKey="flags" icon={() => <span className="text-sm font-bold">🏷️</span>} isOpen={openSections.flags} />
        {openSections.flags && (
          <div className="p-6">
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 cursor-pointer transition-colors">
                <input type="checkbox" {...register('isOrphan')} className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                <div>
                  <span className="text-sm font-bold text-slate-800">Orphan</span>
                  <p className="text-xs text-slate-400 mt-0.5">Student has no parents</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 cursor-pointer transition-colors">
                <input type="checkbox" {...register('isNeedy')} className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                <div>
                  <span className="text-sm font-bold text-slate-800">Needy</span>
                  <p className="text-xs text-slate-400 mt-0.5">Financially disadvantaged</p>
                </div>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Guardians */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <SectionHeader title={`Guardians (${guardianFields.length})`} sectionKey="guardians" icon={() => <span className="text-sm font-bold">👨‍👩‍👧</span>} isOpen={openSections.guardians} />
        {openSections.guardians && (
          <div className="p-6 space-y-4">
            {guardianFields.map((field, index) => (
              <div key={field.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700">Guardian #{index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeGuardian(index)}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Relation *</label>
                    <select {...register(`guardians.${index}.relation`)} className={`w-full px-3 py-2 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${errors.guardians?.[index]?.relation ? 'border-red-400' : 'border-slate-200'}`}>
                      {['FATHER', 'MOTHER', 'BROTHER', 'SISTER', 'UNCLE', 'AUNT', 'GRANDPARENT', 'SPOUSE', 'OTHER'].map((r) => (
                        <option key={r} value={r}>{r.charAt(0) + r.slice(1).toLowerCase()}</option>
                      ))}
                    </select>
                    {errors.guardians?.[index]?.relation && <p className="mt-1 text-xs text-red-600">{errors.guardians[index]?.relation?.message}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Full Name *</label>
                    <input {...register(`guardians.${index}.fullName`)} className={`w-full px-3 py-2 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${errors.guardians?.[index]?.fullName ? 'border-red-400' : 'border-slate-200'}`} placeholder="Full name" />
                    {errors.guardians?.[index]?.fullName && <p className="mt-1 text-xs text-red-600">{errors.guardians[index]?.fullName?.message}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Phone *</label>
                    <input {...register(`guardians.${index}.phone`)} className={`w-full px-3 py-2 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${errors.guardians?.[index]?.phone ? 'border-red-400' : 'border-slate-200'}`} placeholder="Phone" />
                    {errors.guardians?.[index]?.phone && <p className="mt-1 text-xs text-red-600">{errors.guardians[index]?.phone?.message}</p>}
                  </div>
                </div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" {...register(`guardians.${index}.isPrimary`)} className="rounded border-slate-300 text-emerald-600" />
                  <span className="text-xs font-semibold text-slate-600">Primary Guardian</span>
                </label>
              </div>
            ))}
            <button
              type="button"
              onClick={() => appendGuardian({ relation: 'FATHER', fullName: '', phone: '', isPrimary: false })}
              className="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 text-sm font-bold text-slate-500 hover:border-emerald-300 hover:text-emerald-600 flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Guardian
            </button>
          </div>
        )}
      </div>

      {/* Sponsors */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <SectionHeader title={`Sponsor Mappings (${sponsorFields.length})`} sectionKey="sponsors" icon={() => <span className="text-sm font-bold">🤝</span>} isOpen={openSections.sponsors} />
        {openSections.sponsors && (
          <div className="p-6 space-y-4">
            {sponsorFields.map((field, index) => (
              <div key={field.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700">Sponsor #{index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeSponsor(index)}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Sponsor *</label>
                    <select {...register(`sponsorMappings.${index}.sponsorId`)} className={`w-full px-3 py-2 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${errors.sponsorMappings?.[index]?.sponsorId ? 'border-red-400' : 'border-slate-200'}`}>
                      <option value="">Select sponsor</option>
                      {sponsors.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                    {errors.sponsorMappings?.[index]?.sponsorId && <p className="mt-1 text-xs text-red-600">{errors.sponsorMappings[index]?.sponsorId?.message}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Support Label</label>
                    <input {...register(`sponsorMappings.${index}.supportLabel`)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="e.g. Monthly" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Amount</label>
                    <input type="number" step="0.01" {...register(`sponsorMappings.${index}.amount`, { valueAsNumber: true })} className={`w-full px-3 py-2 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${errors.sponsorMappings?.[index]?.amount ? 'border-red-400' : 'border-slate-200'}`} placeholder="0.00" />
                    {errors.sponsorMappings?.[index]?.amount && <p className="mt-1 text-xs text-red-600">{errors.sponsorMappings[index]?.amount?.message}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Currency</label>
                    <input {...register(`sponsorMappings.${index}.currencyCode`)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="INR" />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => appendSponsor({ sponsorId: '', supportLabel: '', amount: undefined, currencyCode: 'INR' })}
              className="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 text-sm font-bold text-slate-500 hover:border-emerald-300 hover:text-emerald-600 flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Sponsor Mapping
            </button>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6">
          <label className="block text-sm font-medium text-slate-700 mb-1">Additional Notes</label>
          <textarea {...register('notes')} rows={3} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none" placeholder="Any additional notes..." />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 sticky bottom-4 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-lg">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 rounded-xl text-sm font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          {isLoading ? 'Saving...' : mode === 'create' ? 'Create Student' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
