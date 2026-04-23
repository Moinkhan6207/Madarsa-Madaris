'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Trash2, PlusCircle, MapPin, Star } from 'lucide-react';
import { getBranches, createBranch, deleteBranch, updateOnboardingStep } from '@services/onboarding.service';
import { FormField, inputClass, Alert, SectionCard, SkeletonLoader } from '@components/ui/FormElements';
import type { Branch } from '@/types/onboarding';

const schema = z.object({
  name: z.string().min(2, 'Branch name is required'),
  code: z.string().optional().or(z.literal('')),
  headName: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  email: z.string().email('Must be a valid email').optional().or(z.literal('')),
  addressLine1: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  isPrimary: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

function BranchCard({ branch, onDelete }: { branch: Branch; onDelete: (id: string) => void }) {
  return (
    <div className={`rounded-xl border-2 p-4 flex items-start justify-between gap-4 transition-all ${branch.isPrimary ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 rounded-full p-2 ${branch.isPrimary ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
          <MapPin className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 text-sm">{branch.name}</span>
            {branch.isPrimary && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                <Star className="w-3 h-3" /> Primary
              </span>
            )}
          </div>
          {branch.city && <p className="text-xs text-gray-500 mt-0.5">{[branch.addressLine1, branch.city, branch.state].filter(Boolean).join(', ')}</p>}
          {branch.headName && <p className="text-xs text-gray-400 mt-0.5">Head: {branch.headName}</p>}
        </div>
      </div>
      {!branch.isPrimary && (
        <button
          onClick={() => onDelete(branch.id)}
          className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
          title="Delete branch"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export function BranchForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: branches = [], isLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: getBranches,
  });

  const hasPrimary = branches.some((b) => b.isPrimary);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema as any),
    defaultValues: { isPrimary: !hasPrimary },
  });

  const createMutation = useMutation({
    mutationFn: (data: FormValues) => createBranch({ ...data, isPrimary: data.isPrimary } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      reset({ isPrimary: false });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBranch(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['branches'] }),
  });

  const finalizeMutation = useMutation({
    mutationFn: async () => {
      await updateOnboardingStep('branchStep', 'COMPLETED');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
      router.push('/setup/session');
    },
  });

  if (isLoading) return <SkeletonLoader rows={4} />;

  const isPrimaryWatched = watch('isPrimary');

  return (
    <SectionCard title="Branch Setup" description="Add your institution branches. Only one branch can be set as primary.">
      {/* Existing branches */}
      {branches.length > 0 && (
        <div className="mb-6 space-y-3">
          <p className="text-sm font-medium text-gray-600">Current Branches ({branches.length})</p>
          {branches.map((b) => (
            <BranchCard key={b.id} branch={b} onDelete={(id) => deleteMutation.mutate(id)} />
          ))}
        </div>
      )}

      {/* Add branch form */}
      <div className="border-t border-gray-100 pt-6">
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4 flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-emerald-500" /> Add New Branch
        </h3>
        {(createMutation.error || deleteMutation.error) && (
          <Alert type="error" message={((createMutation.error || deleteMutation.error) as Error).message} />
        )}
        <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Branch Name" error={errors.name?.message} required>
              <input {...register('name')} className={inputClass(errors.name?.message)} placeholder="Main Campus" />
            </FormField>
            <FormField label="Branch Code" error={errors.code?.message} hint="Optional short identifier">
              <input {...register('code')} className={inputClass()} placeholder="MAIN-01" />
            </FormField>
            <FormField label="Branch Head / In-charge" error={errors.headName?.message}>
              <input {...register('headName')} className={inputClass()} placeholder="Maulana Ahmed" />
            </FormField>
            <FormField label="Branch Phone" error={errors.phone?.message}>
              <input {...register('phone')} className={inputClass()} placeholder="+91 9876543210" />
            </FormField>
            <FormField label="Branch Email" error={errors.email?.message}>
              <input {...register('email')} type="email" className={inputClass(errors.email?.message)} placeholder="branch@madarsa.org" />
            </FormField>
            <FormField label="Address" error={errors.addressLine1?.message}>
              <input {...register('addressLine1')} className={inputClass()} placeholder="Street address" />
            </FormField>
            <FormField label="City" error={errors.city?.message}>
              <input {...register('city')} className={inputClass()} placeholder="City" />
            </FormField>
            <FormField label="State" error={errors.state?.message}>
              <input {...register('state')} className={inputClass()} placeholder="State" />
            </FormField>
          </div>

          {/* Primary toggle */}
          <label className={`flex items-center gap-3 cursor-pointer rounded-xl border-2 p-4 transition-all ${isPrimaryWatched ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200'} ${hasPrimary ? 'opacity-50 pointer-events-none' : ''}`}>
            <input
              type="checkbox"
              {...register('isPrimary')}
              disabled={hasPrimary}
              className="h-4 w-4 rounded border-gray-300 text-emerald-600"
            />
            <div>
              <span className="text-sm font-medium text-gray-800">Set as Primary Branch</span>
              {hasPrimary && <p className="text-xs text-gray-400 mt-0.5">A primary branch already exists — only one allowed</p>}
            </div>
          </label>

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="flex items-center gap-2 rounded-lg border-2 border-dashed border-emerald-400 text-emerald-600 px-4 py-2.5 text-sm font-medium hover:bg-emerald-50 transition-colors disabled:opacity-60"
          >
            <PlusCircle className="w-4 h-4" />
            {createMutation.isPending ? 'Adding...' : 'Add Branch'}
          </button>
        </form>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-6">
        <button type="button" onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700">
          ← Back
        </button>
        <button
          onClick={() => finalizeMutation.mutate()}
          disabled={branches.length === 0 || finalizeMutation.isPending}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {finalizeMutation.isPending ? 'Saving...' : 'Continue →'}
        </button>
      </div>
    </SectionCard>
  );
}
