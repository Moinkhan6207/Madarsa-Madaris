'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Trash2, PlusCircle, CalendarDays, CheckCircle2 } from 'lucide-react';
import { getSessions, createSession, deleteSession, updateOnboardingStep } from '@services/onboarding.service';
import { FormField, inputClass, Alert, SectionCard, SkeletonLoader } from '@components/ui/FormElements';
import type { AcademicSession } from '@/types/onboarding';
import { useState, useEffect } from 'react';

const schema = z.object({
  name: z.string().min(2, 'Session name is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  isCurrent: z.boolean(),
}).refine((d) => new Date(d.startDate) < new Date(d.endDate), {
  message: 'Start date must be before end date',
  path: ['endDate'],
});

type FormValues = z.infer<typeof schema>;

function SessionCard({ session, onDelete }: { session: AcademicSession; onDelete: () => void }) {
  return (
    <div className={`rounded-xl border-2 p-4 flex items-start justify-between gap-4 ${session.isCurrent ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 rounded-full p-2 ${session.isCurrent ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
          <CalendarDays className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 text-sm">{session.name}</span>
            {session.isCurrent && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                <CheckCircle2 className="w-3 h-3" /> Active
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {new Date(session.startDate).toLocaleDateString()} – {new Date(session.endDate).toLocaleDateString()}
          </p>
        </div>
      </div>
      {!session.isCurrent && (
        <button onClick={onDelete} className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export function SessionForm() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const queryClient = useQueryClient();

  const { data: sessionsData, isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: getSessions,
    enabled: isMounted,
  });

  const sessions = sessionsData ?? [];
  const hasActive = sessions.some((s) => s.isCurrent);

  const { register, handleSubmit, reset, watch, getValues, trigger, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema as any),
    defaultValues: { isCurrent: !hasActive },
  });

  const createMutation = useMutation({
    mutationFn: (data: FormValues) => createSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      reset({ isCurrent: false });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSession(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sessions'] }),
  });

  const finalizeMutation = useMutation({
    mutationFn: async () => updateOnboardingStep('sessionStep', 'COMPLETED'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
      router.push('/setup/review');
    },
  });

  const saveAndContinueMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      await createSession(data);
      await updateOnboardingStep('sessionStep', 'COMPLETED');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
      router.push('/setup/review');
    },
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || isLoading) return <SkeletonLoader rows={4} />;

  const isCurrentWatched = watch('isCurrent');

  return (
    <SectionCard title="Academic Session" description="Define the academic year(s) for your institution. Only one session can be active at a time.">
      {/* Existing sessions */}
      {sessions.length > 0 && (
        <div className="mb-6 space-y-3">
          <p className="text-sm font-medium text-gray-600">Configured Sessions ({sessions.length})</p>
          {sessions.map((s) => (
            <SessionCard key={s.id} session={s} onDelete={() => deleteMutation.mutate(s.id)} />
          ))}
        </div>
      )}

      {/* Add session form */}
      <div className="border-t border-gray-100 pt-6">
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4 flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-emerald-500" /> Add Academic Session
        </h3>
        {(createMutation.error || deleteMutation.error) && (
          <Alert type="error" message={((createMutation.error || deleteMutation.error) as Error).message} />
        )}
        {saveAndContinueMutation.error && (
          <Alert type="error" message={(saveAndContinueMutation.error as Error).message} />
        )}
        <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Session Name" error={errors.name?.message} required>
              <input {...register('name')} className={inputClass(errors.name?.message)} placeholder="2024-25 Academic Year" />
            </FormField>
            <div /> {/* spacer */}
            <FormField label="Start Date" error={errors.startDate?.message} required>
              <input {...register('startDate')} type="date" className={inputClass(errors.startDate?.message)} />
            </FormField>
            <FormField label="End Date" error={errors.endDate?.message} required>
              <input {...register('endDate')} type="date" className={inputClass(errors.endDate?.message)} />
            </FormField>
          </div>

          <label className={`flex items-center gap-3 cursor-pointer rounded-xl border-2 p-4 transition-all ${isCurrentWatched ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200'} ${hasActive ? 'opacity-50 pointer-events-none' : ''}`}>
            <input type="checkbox" {...register('isCurrent')} disabled={hasActive} className="h-4 w-4 rounded border-gray-300 text-emerald-600" />
            <div>
              <span className="text-sm font-medium text-gray-800">Mark as Active Session</span>
              {hasActive && <p className="text-xs text-gray-400 mt-0.5">An active session already exists — only one allowed</p>}
            </div>
          </label>

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="flex items-center gap-2 rounded-lg border-2 border-dashed border-emerald-400 text-emerald-600 px-4 py-2.5 text-sm font-medium hover:bg-emerald-50 transition-colors disabled:opacity-60"
          >
            <PlusCircle className="w-4 h-4" />
            {createMutation.isPending ? 'Adding...' : 'Add Session'}
          </button>
        </form>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-6">
        <button type="button" onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700">
          ← Back
        </button>
        <button
          onClick={async () => {
            const values = getValues();
            const hasTypedSessionData = Boolean(
              values.name?.trim() || values.startDate || values.endDate
            );

            if (!hasTypedSessionData && sessions.length > 0) {
              finalizeMutation.mutate();
              return;
            }

            const isValid = await trigger();
            if (!isValid) return;
            saveAndContinueMutation.mutate(getValues());
          }}
          disabled={finalizeMutation.isPending || saveAndContinueMutation.isPending}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {finalizeMutation.isPending || saveAndContinueMutation.isPending ? 'Saving...' : 'Continue →'}
        </button>
      </div>
    </SectionCard>
  );
}
