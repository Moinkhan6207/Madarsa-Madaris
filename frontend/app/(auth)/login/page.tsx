'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login } from '@services/auth.service';
import { FormField, inputClass, Alert, SectionCard, PasswordInput } from '@components/ui/FormElements';
import { Loader2, LogIn, Mail } from 'lucide-react';
import { TenantStatus } from '@/types/tenant';

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
        // Clean up the URL
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
      // Intelligent redirection based on tenant status
      const { tenantStatus, roles } = data.user;
      
      if (roles && roles.includes('SUPER_ADMIN')) {
        router.push('/platform/tenants');
        return;
      }

      const status = tenantStatus;
      if (status === TenantStatus.DRAFT) {
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
    <>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">

        <h2 className="text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link href="/register" className="font-medium text-emerald-600 hover:text-emerald-500 underline decoration-emerald-200 underline-offset-4">
            register your institution
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px- shadow-xl rounded-2xl border border-gray-100 sm:px-10">
          {error && <Alert type="error" message={error} className="mb-6" />}
          
          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-6">
            <FormField label="Email Address" error={errors.email?.message}>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  className={`${inputClass(errors.email?.message)} pl-10`}
                  placeholder="admin@madarsa.org"
                />
              </div>
            </FormField>

            <FormField label="Password" error={errors.password?.message}>
              <PasswordInput
                {...register('password')}
                error={errors.password?.message}
                placeholder="••••••••"
              />
            </FormField>

            <div>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all active:scale-95 disabled:opacity-50"
              >
                {mutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    Sign in
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
