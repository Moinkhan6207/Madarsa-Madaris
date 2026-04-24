'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login } from '@services/auth.service';
import { FormField, inputClass, Alert, PasswordInput } from '@components/ui/FormElements';
import { Loader2, LogIn, Mail, ChevronRight } from 'lucide-react';
import { TenantStatus } from '@/types/tenant';
import { motion } from 'framer-motion';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('error') === 'session_expired') {
        setError('Your session has expired. Please log in again.');
        window.history.replaceState({}, '', '/login');
      }
    }
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema as any),
  });

  const mutation = useMutation({
    mutationFn: (data: FormValues) => login(data.email, data.password),
    onSuccess: (data) => {
      const { tenantStatus, roles } = data.user;
      
      if (roles && roles.includes('SUPER_ADMIN')) {
        router.push('/platform/tenants');
        return;
      }

      const status = tenantStatus;
      if (!status || status === TenantStatus.DRAFT) {
        router.push('/setup');
      } else if (status === TenantStatus.PENDING_ACTIVATION) {
        router.push('/pending');
      } else {
        router.push('/dashboard');
      }
    },
    onError: (err: any) => {
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="mb-6 text-center lg:text-left">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
          Welcome <span className="text-emerald-600">Back</span>
        </h1>
        <p className="text-gray-500 font-medium text-lg">
          Sign in to manage your institution's operations.
        </p>
      </div>

      <div className="bg-white p-8 lg:p-10 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100">
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <Alert type="error" message={error} className="mb-8" />
          </motion.div>
        )}
        
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-6">
          <FormField label="Email Address" error={errors.email?.message}>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-emerald-600 text-gray-400">
                <Mail className="h-5 w-5" />
              </div>
              <input
                {...register('email')}
                type="email"
                className={`w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-sm font-medium ${errors.email ? 'border-red-500 bg-red-50' : ''}`}
                placeholder="admin@madarsa.org"
              />
            </div>
          </FormField>

          <FormField label="Password" error={errors.password?.message}>
            <div className="group">
              <PasswordInput
                {...register('password')}
                error={errors.password?.message}
                placeholder="••••••••"
                className="bg-gray-50 border-2 border-gray-100 rounded-2xl py-3.5 px-4 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
              />
            </div>
          </FormField>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded-md cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm font-semibold text-gray-600 cursor-pointer">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline underline-offset-4 decoration-emerald-200">
                Forgot password?
              </a>
            </div>
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full flex justify-center items-center gap-2 py-4 px-6 border border-transparent rounded-2xl shadow-lg shadow-emerald-600/20 text-base font-black text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/40 transition-all active:scale-[0.98] disabled:opacity-50 group"
          >
            {mutation.isPending ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                Sign in to Dashboard
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>

      <div className="mt-10 text-center">
        <p className="text-gray-500 font-medium">
          Don't have an institution registered?
        </p>
        <Link 
          href="/register" 
          className="inline-flex items-center mt-2 px-6 py-3 bg-white border-2 border-gray-100 rounded-2xl text-emerald-600 font-black hover:bg-emerald-50 hover:border-emerald-200 transition-all active:scale-95 shadow-sm"
        >
          Setup your Institution
          <ChevronRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    </motion.div>
  );
}
