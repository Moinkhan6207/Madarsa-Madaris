'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getBranding, updateBranding, updateOnboardingStep, uploadBrandingImage } from '@services/onboarding.service';
import { FormField, inputClass, SubmitButton, Alert, SectionCard, SkeletonLoader } from '@components/ui/FormElements';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Upload, Image as ImageIcon, X, Loader2 } from 'lucide-react';


const schema = z.object({
  logoUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  coverImageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  faviconUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  primaryColor: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'Must be a valid hex color').optional().or(z.literal('')),
  secondaryColor: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'Must be a valid hex color').optional().or(z.literal('')),
  accentColor: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'Must be a valid hex color').optional().or(z.literal('')),
  tagline: z.string().max(120).optional().or(z.literal('')),
  publicContactEmail: z.string().email('Must be a valid email').optional().or(z.literal('')),
  publicContactPhone: z.string().optional().or(z.literal('')),
  facebookUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  instagramUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  youtubeUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  whatsappNumber: z.string().optional().or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

function ColorInput({ label, name, register, value, error }: any) {
  return (
    <FormField label={label} error={error}>
      <div className="flex items-center gap-2">
        <input type="color" value={value || '#10b981'} onChange={(e) => register(name).onChange(e)} className="h-10 w-14 rounded-lg border border-gray-300 cursor-pointer p-1" />
        <input {...register(name)} className={`${inputClass(error)} flex-1`} placeholder="#10b981" />
      </div>
    </FormField>
  );
}

function ImageUploadField({ label, name, value, setValue, type, hint }: any) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { url } = await uploadBrandingImage(file, type);
      setValue(name, url);
    } catch (error) {
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <FormField label={label} hint={hint}>
      <div className="mt-1 flex flex-col gap-3">
        {value ? (
          <div className={`relative group ${type === 'logo' ? 'h-24 w-24' : 'h-32 w-full max-w-md'}`}>
            <Image 
              src={value} 
              alt={label} 
              fill 
              className="rounded-lg border border-gray-200 object-cover" 
            />
            <button
              type="button"
              onClick={() => setValue(name, '')}
              className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-all ${type === 'logo' ? 'h-24 w-24' : 'h-32 w-full max-w-md'}`}
          >
            {isUploading ? (
              <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
            ) : (
              <>
                <Upload className="w-6 h-6 text-gray-400" />
                <span className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-wider text-center px-2">Select Image</span>
              </>
            )}
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        <div className="flex items-center gap-2">
          <input
            value={value || ''}
            onChange={(e) => setValue(name, e.target.value)}
            className={`${inputClass()} flex-1`}
            placeholder="Or enter image URL..."
          />
        </div>
      </div>
    </FormField>
  );
}

export function BrandingForm() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const queryClient = useQueryClient();

  const { data: branding, isLoading } = useQuery({
    queryKey: ['branding'],
    queryFn: getBranding,
    retry: false,
    enabled: isMounted,
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema as any),
    values: branding ? {
      logoUrl: branding.logoUrl ?? '',
      coverImageUrl: branding.coverImageUrl ?? '',
      faviconUrl: branding.faviconUrl ?? '',
      primaryColor: branding.primaryColor ?? '',
      secondaryColor: branding.secondaryColor ?? '',
      accentColor: branding.accentColor ?? '',
      tagline: branding.tagline ?? '',
      publicContactEmail: branding.publicContactEmail ?? '',
      publicContactPhone: branding.publicContactPhone ?? '',
      facebookUrl: branding.facebookUrl ?? '',
      instagramUrl: branding.instagramUrl ?? '',
      youtubeUrl: branding.youtubeUrl ?? '',
      whatsappNumber: branding.whatsappNumber ?? '',
    } : undefined,
  });

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      await updateBranding(data);
      await updateOnboardingStep('brandingStep', 'COMPLETED');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
      router.push('/setup/branches');
    },
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || isLoading) return <SkeletonLoader rows={5} />;

  const primaryVal = watch('primaryColor');
  const secondaryVal = watch('secondaryColor');
  const accentVal = watch('accentColor');

  return (
    <SectionCard title="Branding" description="Customize your institution's visual identity. Upload logos and set your color scheme.">
      {mutation.error && <Alert type="error" message={(mutation.error as Error).message} />}

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="mt-6 space-y-6">
        {/* Logo & Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ImageUploadField
            label="Institution Logo"
            name="logoUrl"
            type="logo"
            value={watch('logoUrl')}
            setValue={setValue}
            hint="Recommended 200×200px (PNG/SVG)"
          />
          <ImageUploadField
            label="Cover / Banner Image"
            name="coverImageUrl"
            type="cover"
            value={watch('coverImageUrl')}
            setValue={setValue}
            hint="Recommended 1200×400px"
          />
          <FormField label="Favicon URL" error={errors.faviconUrl?.message} hint="16×16 or 32×32 .ico or .png">
            <input {...register('faviconUrl')} className={inputClass(errors.faviconUrl?.message)} placeholder="https://cdn.example.com/favicon.ico" />
          </FormField>
          <FormField label="Tagline" error={errors.tagline?.message} hint="A short slogan or motto (max 120 chars)">
            <input {...register('tagline')} className={inputClass(errors.tagline?.message)} placeholder="Spreading knowledge since 1985" />
          </FormField>
        </div>

        {/* Color Palette */}
        <div className="border-t border-gray-100 pt-6">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">Color Palette</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ColorInput label="Primary Color" name="primaryColor" register={register} value={primaryVal} error={errors.primaryColor?.message} />
            <ColorInput label="Secondary Color" name="secondaryColor" register={register} value={secondaryVal} error={errors.secondaryColor?.message} />
            <ColorInput label="Accent Color" name="accentColor" register={register} value={accentVal} error={errors.accentColor?.message} />
          </div>
        </div>

        {/* Public Contact */}
        <div className="border-t border-gray-100 pt-6">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">Public Contact Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Public Email" error={errors.publicContactEmail?.message}>
              <input {...register('publicContactEmail')} type="email" className={inputClass(errors.publicContactEmail?.message)} placeholder="contact@madarsa.org" />
            </FormField>
            <FormField label="Public Phone" error={errors.publicContactPhone?.message}>
              <input {...register('publicContactPhone')} className={inputClass()} placeholder="+91 9876543210" />
            </FormField>
          </div>
        </div>

        {/* Social Links */}
        <div className="border-t border-gray-100 pt-6">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">Social Media Links</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Facebook URL" error={errors.facebookUrl?.message}>
              <input {...register('facebookUrl')} className={inputClass(errors.facebookUrl?.message)} placeholder="https://facebook.com/yourpage" />
            </FormField>
            <FormField label="Instagram URL" error={errors.instagramUrl?.message}>
              <input {...register('instagramUrl')} className={inputClass(errors.instagramUrl?.message)} placeholder="https://instagram.com/yourhandle" />
            </FormField>
            <FormField label="YouTube URL" error={errors.youtubeUrl?.message}>
              <input {...register('youtubeUrl')} className={inputClass(errors.youtubeUrl?.message)} placeholder="https://youtube.com/channel/..." />
            </FormField>
            <FormField label="WhatsApp Number" error={errors.whatsappNumber?.message}>
              <input {...register('whatsappNumber')} className={inputClass()} placeholder="+919876543210" />
            </FormField>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button type="button" onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
            ← Back
          </button>
          <SubmitButton isLoading={mutation.isPending} />
        </div>
      </form>
    </SectionCard>
  );
}
