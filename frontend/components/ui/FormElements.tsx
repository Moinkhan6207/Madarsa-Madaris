'use client';

import React from 'react';
import { AlertCircle, CheckCircle2, Loader2, Eye, EyeOff, Lock } from 'lucide-react';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}

export function FormField({ label, error, required, children, hint }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-600">
          <AlertCircle className="w-3 h-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

const inputBase =
  'w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-150 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-gray-50 disabled:text-gray-500';

export const inputClass = (error?: string) =>
  `${inputBase} ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`;

interface SubmitButtonProps {
  isLoading?: boolean;
  label?: string;
  loadingLabel?: string;
  icon?: React.ReactNode;
}

export function SubmitButton({ isLoading, label = 'Save & Continue', loadingLabel = 'Saving...', icon }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className="flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : icon ? (
        icon
      ) : (
        <CheckCircle2 className="w-4 h-4" />
      )}
      {isLoading ? loadingLabel : label}
    </button>
  );
}

interface AlertProps {
  type: 'error' | 'success' | 'info';
  message: string;
  className?: string;
}

export function Alert({ type, message, className = '' }: AlertProps) {
  const styles = {
    error: 'bg-red-50 border-red-200 text-red-700',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700',
  };
  return (
    <div className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${styles[type]} ${className}`}>
      <AlertCircle className="w-4 h-4 shrink-0" />
      {message}
    </div>
  );
}

interface SectionCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function SectionCard({ title, description, children }: SectionCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
      {children}
    </div>
  );
}

export function SkeletonLoader({ rows = 4 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-3 w-24 rounded bg-gray-200" />
          <div className="h-10 rounded-lg bg-gray-100" />
        </div>
      ))}
    </div>
  );
}

export const PasswordInput = React.forwardRef<HTMLInputElement, any>(({ error, ...props }, ref) => {
  const [show, setShow] = React.useState(false);
  return (
    <div className="relative font-inter">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Lock className="h-4 w-4 text-gray-400 font-medium" />
      </div>
      <input
        {...props}
        ref={ref}
        type={show ? 'text' : 'password'}
        className={`${inputClass(error)} pl-10 pr-10`}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-emerald-600 transition-colors focus:outline-none"
        tabIndex={-1}
      >
        {show ? (
          <EyeOff className="h-4 w-4 animate-in fade-in zoom-in duration-200" />
        ) : (
          <Eye className="h-4 w-4 animate-in fade-in zoom-in duration-200" />
        )}
      </button>
    </div>
  );
});
PasswordInput.displayName = 'PasswordInput';
