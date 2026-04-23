'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerTenant } from '@services/auth.service';
import { FormField, inputClass, Alert, SectionCard, PasswordInput } from '@components/ui/FormElements';
import { Loader2, ArrowRight, Building2, UserPlus, Globe, Hash } from 'lucide-react';

const schema = z.object({
  displayName: z.string().min(3, 'Institution name must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  institutionType: z.enum(['SMALL_LOCAL_MADARSA', 'RESIDENTIAL_MADARSA', 'HYBRID_DEENI_SCHOOL', 'TRUST_RUN_IDARA', 'MASJID_MADARSA_COMBINED', 'OTHER']),
  adminUser: z.object({
    fullName: z.string().min(2, 'Full name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  }),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { errors, isValid } } = useForm<FormValues>({
    resolver: zodResolver(schema as any),
    mode: 'onChange',
  });

  const mutation = useMutation({
    mutationFn: (data: FormValues) => registerTenant(data),
    onSuccess: () => {
      router.push('/setup');
    },
    onError: (err: any) => {
      setError(err.message || 'Registration failed. The slug or email might already be in use.');
    }
  });

  const displayName = watch('displayName');

  return (
    <>
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <h2 className="text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          Create your institution account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-emerald-600 hover:text-emerald-500 underline decoration-emerald-200 underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-10 px-4 shadow-xl rounded-2xl border border-gray-100 sm:px-10">
          {error && <Alert type="error" message={error} className="mb-6" />}
          
          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-6">
            {step === 1 ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="pb-4 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-emerald-500" /> Institution Details
                  </h3>
                  <p className="text-xs text-gray-500">Basic information about your Madarsa or trust.</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <FormField label="Institution Name" error={errors.displayName?.message} required>
                    <input
                      {...register('displayName')}
                      className={inputClass(errors.displayName?.message)}
                      placeholder="e.g. Madarsa Darul Uloom"
                    />
                  </FormField>

                  <FormField label="Institution URL (Slug)" error={errors.slug?.message} required hint="This will be your unique identifier">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Globe className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        {...register('slug')}
                        className={`${inputClass(errors.slug?.message)} pl-10`}
                        placeholder="darul-uloom"
                      />
                    </div>
                  </FormField>

                  <FormField label="Institution Type" error={errors.institutionType?.message} required>
                    <select
                      {...register('institutionType')}
                      className={inputClass(errors.institutionType?.message)}
                    >
                      <option value="">Select Type...</option>
                      <option value="SMALL_LOCAL_MADARSA">Small Local Madarsa</option>
                      <option value="RESIDENTIAL_MADARSA">Residential Madarsa</option>
                      <option value="HYBRID_DEENI_SCHOOL">Deeni School / Hybrid</option>
                      <option value="TRUST_RUN_IDARA">Trust Run Idara</option>
                      <option value="MASJID_MADARSA_COMBINED">Masjid-Madarsa Combined</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </FormField>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full flex justify-center items-center py-3 px-4 rounded-xl shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all"
                >
                  Next: Account Details
                  <ArrowRight className="ml-2 w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="pb-4 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-emerald-500" /> Admin Account
                  </h3>
                  <p className="text-xs text-gray-500">Create the primary administrator for {displayName}.</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <FormField label="Admin Full Name" error={errors.adminUser?.fullName?.message} required>
                    <input
                      {...register('adminUser.fullName')}
                      className={inputClass(errors.adminUser?.fullName?.message)}
                      placeholder="Maulana Zaid"
                    />
                  </FormField>

                  <FormField label="Email Address" error={errors.adminUser?.email?.message} required>
                    <input
                      {...register('adminUser.email')}
                      type="email"
                      className={inputClass(errors.adminUser?.email?.message)}
                      placeholder="admin@institution.org"
                    />
                  </FormField>
                  <FormField label="Password" error={errors.adminUser?.password?.message} required>
                    <PasswordInput
                      {...register('adminUser.password')}
                      error={errors.adminUser?.password?.message}
                      placeholder="••••••••"
                    />
                  </FormField>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 px-4 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="flex-[2] flex justify-center items-center py-3 px-4 rounded-xl shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all disabled:opacity-50"
                  >
                    {mutation.isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      'Finish Registration'
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}
