'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerTenant } from '@services/auth.service';
import { FormField, inputClass, Alert, PasswordInput } from '@components/ui/FormElements';
import { Loader2, ArrowRight, Building2, UserPlus, Globe, ChevronRight, CheckCircle2, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const schema = z.object({
  displayName: z.string().min(3, 'Institution name must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  institutionType: z.enum(['SMALL_LOCAL_MADARSA', 'RESIDENTIAL_MADARSA', 'HYBRID_DEENI_SCHOOL', 'TRUST_RUN_IDARA', 'MASJID_MADARSA_COMBINED', 'OTHER']),
  adminUser: z.object({
    fullName: z.string(),
    email: z.string(),
    password: z.string(),
  }).optional(),
});

const fullSchema = z.object({
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

  const { register, handleSubmit, watch, formState: { errors }, trigger } = useForm<FormValues>({
    resolver: zodResolver(schema as any),
    mode: 'onSubmit',
    defaultValues: {
      adminUser: {
        fullName: '',
        email: '',
        password: '',
      },
    },
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
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="mb-6 text-center lg:text-left">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
          Get <span className="text-emerald-600">Started</span>
        </h1>
        <p className="text-gray-500 font-medium text-lg">
          Join 50+ institutions managing with Barakah.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-4 mb-8">
        <div className={`h-2 flex-1 rounded-full ${step === 1 ? 'bg-emerald-600 shadow-lg shadow-emerald-600/20' : 'bg-emerald-200 opacity-50'}`} />
        <div className={`h-2 flex-1 rounded-full ${step === 2 ? 'bg-emerald-600 shadow-lg shadow-emerald-600/20' : 'bg-emerald-200 opacity-50'}`} />
      </div>

      <div className="bg-white p-8 lg:p-10 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden">
        {error && <Alert type="error" message={error} className="mb-8" />}
        
        <form onSubmit={handleSubmit(async (d) => {
          try {
            const validatedData = fullSchema.parse(d);
            mutation.mutate(validatedData as any);
          } catch (err: any) {
            console.error('Validation error:', err);
            setError('Please fill in all required fields correctly.');
          }
        })} className="space-y-6">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
                        <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-black text-gray-900">Institution Details</h3>
                        <p className="text-xs text-gray-500 font-medium tracking-tight">Basic info about your Madarsa or Idara.</p>
                    </div>
                </div>

                <FormField label="Institution Name" error={errors.displayName?.message}>
                  <input
                    {...register('displayName')}
                    className={`w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-3.5 px-4 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-sm font-medium ${errors.displayName ? 'border-red-500 bg-red-50' : ''}`}
                    placeholder="e.g. Madarsa Darul Uloom"
                  />
                </FormField>

                <FormField label="Institution URL (Slug)" error={errors.slug?.message}>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-600 transition-colors">
                      <Globe className="h-4 w-4" />
                    </div>
                    <input
                      {...register('slug')}
                      className={`w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-3.5 pl-10 pr-4 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-sm font-medium ${errors.slug ? 'border-red-500 bg-red-50' : ''}`}
                      placeholder="darul-uloom"
                    />
                  </div>
                </FormField>

                <FormField label="Institution Type" error={errors.institutionType?.message}>
                  <select
                    {...register('institutionType')}
                    className={`w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-3.5 px-4 text-gray-900 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-sm font-medium cursor-pointer ${errors.institutionType ? 'border-red-500 bg-red-50' : ''}`}
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

                <button
                  type="button"
                  onClick={async () => {
                    const isValid = await trigger(['displayName', 'slug', 'institutionType']);
                    if (isValid) {
                      setStep(2);
                    }
                  }}
                  className="w-full flex justify-center items-center gap-2 py-4 px-6 border border-transparent rounded-2xl shadow-lg shadow-emerald-600/20 text-base font-black text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/40 transition-all active:scale-[0.98] group"
                >
                  Continue to Admin Details
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                 <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
                        <UserPlus className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-black text-gray-900">Admin Account</h3>
                        <p className="text-xs text-gray-500 font-medium tracking-tight">Setup primary admin for {displayName || 'institution'}.</p>
                    </div>
                </div>

                <FormField label="Admin Full Name" error={errors.adminUser?.fullName?.message}>
                  <input
                    {...register('adminUser.fullName')}
                    className={`w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-3.5 px-4 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-sm font-medium ${errors.adminUser?.fullName ? 'border-red-500 bg-red-50' : ''}`}
                    placeholder="Maulana Zaid"
                  />
                </FormField>

                <FormField label="Email Address" error={errors.adminUser?.email?.message}>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-600 transition-colors">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      {...register('adminUser.email')}
                      type="email"
                      className={`w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-3.5 pl-10 pr-4 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-sm font-medium ${errors.adminUser?.email ? 'border-red-500 bg-red-50' : ''}`}
                      placeholder="admin@institution.org"
                    />
                  </div>
                </FormField>

                <FormField label="Password" error={errors.adminUser?.password?.message}>
                  <PasswordInput
                    {...register('adminUser.password')}
                    error={errors.adminUser?.password?.message}
                    placeholder="••••••••"
                    className="bg-gray-50 border-2 border-gray-100 rounded-2xl py-3.5 px-4 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  />
                </FormField>

                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-4 px-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-100 hover:border-gray-200 transition-all active:scale-[0.98]"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="flex-[2] flex justify-center items-center gap-2 py-4 px-6 border border-transparent rounded-2xl shadow-lg shadow-emerald-600/20 text-base font-black text-white bg-emerald-600 hover:bg-emerald-700 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {mutation.isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      'Finish Registration'
                    )}
                  </button>
                </div>
                
                <div className="pt-2 flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest justify-center">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    Security verified by systems
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>

      <div className="mt-10 text-center">
        <p className="text-gray-500 font-medium">
          Already have an account?
        </p>
        <Link 
          href="/login" 
          className="inline-flex items-center mt-2 px-6 py-3 bg-white border-2 border-gray-100 rounded-2xl text-emerald-600 font-black hover:bg-emerald-50 hover:border-emerald-200 transition-all active:scale-95 shadow-sm"
        >
          Sign in to Account
          <ChevronRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    </motion.div>
  );
}
