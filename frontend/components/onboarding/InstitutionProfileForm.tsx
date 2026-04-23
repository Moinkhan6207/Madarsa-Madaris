'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getProfile, updateProfile, updateOnboardingStep } from '@services/onboarding.service';
import { FormField, inputClass, SubmitButton, Alert, SectionCard, SkeletonLoader } from '@components/ui/FormElements';

const schema = z.object({
  shortName: z.string().min(2, 'Short name must be at least 2 characters'),
  principalName: z.string().min(2, 'Principal name is required'),
  email: z.string().email('Must be a valid email').optional().or(z.literal('')),
  phone: z.string().min(7, 'Phone must be at least 7 digits').optional().or(z.literal('')),
  alternatePhone: z.string().optional().or(z.literal('')),
  addressLine1: z.string().min(5, 'Address is required'),
  addressLine2: z.string().optional().or(z.literal('')),
  city: z.string().min(2, 'City is required'),
  state: z.string().optional().or(z.literal('')),
  country: z.string().optional().or(z.literal('')),
  postalCode: z.string().optional().or(z.literal('')),
  trustName: z.string().optional().or(z.literal('')),
  registrationNumber: z.string().optional().or(z.literal('')),
  websiteUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  establishedYear: z.coerce.number().min(1800).max(new Date().getFullYear()).optional(),
  description: z.string().optional().or(z.literal('')),
  divisionType: z.enum(['MALE', 'FEMALE', 'BOTH']),
  hasHostel: z.boolean(),
  hasTransport: z.boolean(),
  hasMasjidLinkedOps: z.boolean(),
  hasMultiBranch: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export function InstitutionProfileForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
    retry: false,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema as any),
    values: profile
      ? {
          shortName: profile.shortName ?? '',
          principalName: profile.principalName ?? '',
          email: profile.email ?? '',
          phone: profile.phone ?? '',
          alternatePhone: profile.alternatePhone ?? '',
          addressLine1: profile.addressLine1 ?? '',
          addressLine2: profile.addressLine2 ?? '',
          city: profile.city ?? '',
          state: profile.state ?? '',
          country: profile.country ?? '',
          postalCode: profile.postalCode ?? '',
          trustName: profile.trustName ?? '',
          registrationNumber: profile.registrationNumber ?? '',
          websiteUrl: profile.websiteUrl ?? '',
          establishedYear: profile.establishedYear ?? undefined,
          description: profile.description ?? '',
          divisionType: profile.divisionType ?? 'BOTH',
          hasHostel: profile.hasHostel ?? false,
          hasTransport: profile.hasTransport ?? false,
          hasMasjidLinkedOps: profile.hasMasjidLinkedOps ?? false,
          hasMultiBranch: profile.hasMultiBranch ?? false,
        }
      : undefined,
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      await updateProfile(data as any);
      await updateOnboardingStep('profileStep', 'COMPLETED');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
      router.push('/setup/branding');
    },
  });

  if (isLoading) return <SkeletonLoader rows={6} />;

  return (
    <SectionCard
      title="Institution Profile"
      description="Tell us about your Madarsa or Islamic institution. This information will be displayed publicly."
    >
      {mutation.error && <Alert type="error" message={(mutation.error as Error).message} />}

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="mt-6 space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Short Name / Popular Name" error={errors.shortName?.message} required>
            <input {...register('shortName')} className={inputClass(errors.shortName?.message)} placeholder="e.g. Darul Uloom" />
          </FormField>
          <FormField label="Principal / Nazim Name" error={errors.principalName?.message} required>
            <input {...register('principalName')} className={inputClass(errors.principalName?.message)} placeholder="Mufti Abdullah" />
          </FormField>
          <FormField label="Trust / Society Name" error={errors.trustName?.message}>
            <input {...register('trustName')} className={inputClass(errors.trustName?.message)} placeholder="Al-Rashid Trust" />
          </FormField>
          <FormField label="Registration Number" error={errors.registrationNumber?.message}>
            <input {...register('registrationNumber')} className={inputClass()} placeholder="Reg. No." />
          </FormField>
          <FormField label="Year Established" error={errors.establishedYear?.message}>
            <input {...register('establishedYear')} type="number" className={inputClass(errors.establishedYear?.message)} placeholder="e.g. 1985" />
          </FormField>
          <FormField label="Division Type" error={errors.divisionType?.message} required>
            <select {...register('divisionType')} className={inputClass(errors.divisionType?.message)}>
              <option value="BOTH">Boys & Girls (Both)</option>
              <option value="MALE">Boys Only</option>
              <option value="FEMALE">Girls Only</option>
            </select>
          </FormField>
        </div>

        {/* Contact */}
        <div className="border-t border-gray-100 pt-6">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Email Address" error={errors.email?.message}>
              <input {...register('email')} type="email" className={inputClass(errors.email?.message)} placeholder="info@madarsa.org" />
            </FormField>
            <FormField label="Phone Number" error={errors.phone?.message}>
              <input {...register('phone')} className={inputClass(errors.phone?.message)} placeholder="+91 9876543210" />
            </FormField>
            <FormField label="Alternate Phone" error={errors.alternatePhone?.message}>
              <input {...register('alternatePhone')} className={inputClass()} placeholder="+91 9876543211" />
            </FormField>
            <FormField label="Website URL" error={errors.websiteUrl?.message}>
              <input {...register('websiteUrl')} className={inputClass(errors.websiteUrl?.message)} placeholder="https://madarsa.org" />
            </FormField>
          </div>
        </div>

        {/* Address */}
        <div className="border-t border-gray-100 pt-6">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">Address</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Address Line 1" error={errors.addressLine1?.message} required>
              <input {...register('addressLine1')} className={inputClass(errors.addressLine1?.message)} placeholder="Street address" />
            </FormField>
            <FormField label="Address Line 2" error={errors.addressLine2?.message}>
              <input {...register('addressLine2')} className={inputClass()} placeholder="Area, landmark" />
            </FormField>
            <FormField label="City" error={errors.city?.message} required>
              <input {...register('city')} className={inputClass(errors.city?.message)} placeholder="City" />
            </FormField>
            <FormField label="State" error={errors.state?.message}>
              <input {...register('state')} className={inputClass()} placeholder="State" />
            </FormField>
            <FormField label="Country" error={errors.country?.message}>
              <input {...register('country')} className={inputClass()} placeholder="India" />
            </FormField>
            <FormField label="Postal Code" error={errors.postalCode?.message}>
              <input {...register('postalCode')} className={inputClass()} placeholder="110001" />
            </FormField>
          </div>
        </div>

        {/* Facilities */}
        <div className="border-t border-gray-100 pt-6">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">Facilities & Features</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { key: 'hasHostel', label: 'Has Hostel Facility' },
              { key: 'hasTransport', label: 'Has Transport Facility' },
              { key: 'hasMasjidLinkedOps', label: 'Masjid-Linked Operations' },
              { key: 'hasMultiBranch', label: 'Multi-Branch Institution' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register(key as keyof FormValues)}
                  className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="border-t border-gray-100 pt-6">
          <FormField label="Brief Description" error={errors.description?.message}>
            <textarea
              {...register('description')}
              className={`${inputClass()} resize-none`}
              rows={3}
              placeholder="Brief description of your institution..."
            />
          </FormField>
        </div>

        <div className="flex justify-end pt-2">
          <SubmitButton isLoading={mutation.isPending} />
        </div>
      </form>
    </SectionCard>
  );
}
