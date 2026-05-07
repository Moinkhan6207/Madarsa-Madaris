import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, Pressable, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SetupStackParamList } from '@/navigation/types';
import { colors, radius, spacing, typography } from '@/theme';
import Button from '@/components/ui/Button';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getBranding, updateBranding, updateOnboardingStep, getOnboardingStatus, uploadBrandingImage } from '@/services/onboardingService';
import { TenantBranding } from '@/types/onboarding';
import SetupStepProgress from '@/components/onboarding/SetupStepProgress';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

type Props = NativeStackScreenProps<SetupStackParamList, 'BrandingSetup'>;

const STEP_NAV: Record<string, keyof SetupStackParamList> = {
  profile: 'ProfileSetup',
  branding: 'BrandingSetup',
  branches: 'BranchesSetup',
  session: 'SessionSetup',
  review: 'ReviewSetup',
};

export default function BrandingSetupScreen({ navigation }: Props) {
  const handleStepPress = (stepId: string) => {
    const target = STEP_NAV[stepId];
    if (target && target !== 'BrandingSetup') {
      navigation.replace(target);
    }
  };
  const { data: existing, isLoading } = useQuery({
    queryKey: ['branding'],
    queryFn: getBranding,
  });

  const [logoUrl, setLogoUrl] = useState(existing?.logoUrl ?? '');
  const [coverImageUrl, setCoverImageUrl] = useState(existing?.coverImageUrl ?? '');
  const [faviconUrl, setFaviconUrl] = useState(existing?.faviconUrl ?? '');
  const [primaryColor, setPrimaryColor] = useState(existing?.primaryColor ?? '#10b981');
  const [secondaryColor, setSecondaryColor] = useState(existing?.secondaryColor ?? '');
  const [accentColor, setAccentColor] = useState(existing?.accentColor ?? '');
  const [tagline, setTagline] = useState(existing?.tagline ?? '');
  const [publicContactEmail, setPublicContactEmail] = useState(existing?.publicContactEmail ?? '');
  const [publicContactPhone, setPublicContactPhone] = useState(existing?.publicContactPhone ?? '');
  const [facebookUrl, setFacebookUrl] = useState(existing?.facebookUrl ?? '');
  const [instagramUrl, setInstagramUrl] = useState(existing?.instagramUrl ?? '');
  const [youtubeUrl, setYoutubeUrl] = useState(existing?.youtubeUrl ?? '');
  const [whatsappNumber, setWhatsappNumber] = useState(existing?.whatsappNumber ?? '');

  useEffect(() => {
    if (!existing) return;
    setLogoUrl(existing.logoUrl ?? '');
    setCoverImageUrl(existing.coverImageUrl ?? '');
    setFaviconUrl(existing.faviconUrl ?? '');
    setPrimaryColor(existing.primaryColor ?? '#10b981');
    setSecondaryColor(existing.secondaryColor ?? '');
    setAccentColor(existing.accentColor ?? '');
    setTagline(existing.tagline ?? '');
    setPublicContactEmail(existing.publicContactEmail ?? '');
    setPublicContactPhone(existing.publicContactPhone ?? '');
    setFacebookUrl(existing.facebookUrl ?? '');
    setInstagramUrl(existing.instagramUrl ?? '');
    setYoutubeUrl(existing.youtubeUrl ?? '');
    setWhatsappNumber(existing.whatsappNumber ?? '');
  }, [existing]);

  const logout = useAuthStore((state) => state.logout);

  const { data: onboarding } = useQuery({
    queryKey: ['onboarding'],
    queryFn: getOnboardingStatus,
  });

  const [uploadingType, setUploadingType] = useState<'logo' | 'cover' | 'favicon' | null>(null);

  const uploadMutation = useMutation({
    mutationFn: ({ type, uri }: { type: 'logo' | 'cover' | 'favicon'; uri: string }) => uploadBrandingImage(type, uri),
  });

  const mutation = useMutation({
    mutationFn: async (payload: Partial<TenantBranding>) => {
      await updateBranding(payload);
      await updateOnboardingStep('brandingStep', 'COMPLETED');
    },
    onSuccess: () => {
      navigation.navigate('BranchesSetup');
    },
  });

  const pickImage = useCallback(async (type: 'logo' | 'cover' | 'favicon') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your photo library to select an image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: type === 'cover' ? [16, 9] : type === 'favicon' ? [1, 1] : [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]?.uri) return;

    const uri = result.assets[0].uri;
    setUploadingType(type);
    try {
      const { url } = await uploadMutation.mutateAsync({ type, uri });
      if (type === 'logo') setLogoUrl(url);
      else if (type === 'cover') setCoverImageUrl(url);
      else if (type === 'favicon') setFaviconUrl(url);
    } catch (e) {
      Alert.alert('Upload failed', 'Could not upload image. Please try again.');
    } finally {
      setUploadingType(null);
    }
  }, [uploadMutation]);

  const submit = () => {
    mutation.mutate({
      logoUrl: logoUrl.trim() || undefined,
      coverImageUrl: coverImageUrl.trim() || undefined,
      faviconUrl: faviconUrl.trim() || undefined,
      primaryColor: primaryColor.trim() || undefined,
      secondaryColor: secondaryColor.trim() || undefined,
      accentColor: accentColor.trim() || undefined,
      tagline: tagline.trim() || undefined,
      publicContactEmail: publicContactEmail.trim() || undefined,
      publicContactPhone: publicContactPhone.trim() || undefined,
      facebookUrl: facebookUrl.trim() || undefined,
      instagramUrl: instagramUrl.trim() || undefined,
      youtubeUrl: youtubeUrl.trim() || undefined,
      whatsappNumber: whatsappNumber.trim() || undefined,
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Pressable onPress={logout} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={16} color={colors.slate500} />
          <Text style={styles.backText}>Back to login</Text>
        </Pressable>

        <Text style={styles.headerTitle}>Setup your Institution</Text>
        <Text style={styles.headerSubtitle}>Complete these steps to activate your platform.</Text>

        {onboarding && (
          <SetupStepProgress
            currentStep="branding"
            onStepPress={handleStepPress}
            statusMap={{
              profileStep: onboarding.profileStep,
              brandingStep: onboarding.brandingStep,
              branchStep: onboarding.branchStep,
              sessionStep: onboarding.sessionStep,
              finalizationStep: onboarding.finalizationStep,
            }}
          />
        )}

        <Text style={styles.title}>Branding</Text>
        <Text style={styles.subtitle}>Customize your institution's visual identity.</Text>

        <ImageField label="Institution Logo" type="logo" url={logoUrl} onPick={() => pickImage('logo')} loading={uploadingType === 'logo'} />
        <ImageField label="Cover / Banner" type="cover" url={coverImageUrl} onPick={() => pickImage('cover')} loading={uploadingType === 'cover'} />
        <ImageField label="Favicon" type="favicon" url={faviconUrl} onPick={() => pickImage('favicon')} loading={uploadingType === 'favicon'} />

        <Text style={styles.label}>Tagline</Text>
        <TextInput value={tagline} onChangeText={setTagline} placeholder="Spreading knowledge since 1985" style={styles.input} placeholderTextColor={colors.slate400} />

        <Text style={styles.section}>Color Palette</Text>
        <Text style={styles.label}>Primary Color</Text>
        <TextInput value={primaryColor} onChangeText={setPrimaryColor} placeholder="#10b981" style={styles.input} placeholderTextColor={colors.slate400} autoCapitalize="none" />

        <Text style={styles.label}>Secondary Color</Text>
        <TextInput value={secondaryColor} onChangeText={setSecondaryColor} placeholder="#065f46" style={styles.input} placeholderTextColor={colors.slate400} autoCapitalize="none" />

        <Text style={styles.label}>Accent Color</Text>
        <TextInput value={accentColor} onChangeText={setAccentColor} placeholder="#f59e0b" style={styles.input} placeholderTextColor={colors.slate400} autoCapitalize="none" />

        <Text style={styles.section}>Public Contact Details</Text>
        <Text style={styles.label}>Public Email</Text>
        <TextInput value={publicContactEmail} onChangeText={setPublicContactEmail} placeholder="contact@madarsa.org" keyboardType="email-address" autoCapitalize="none" style={styles.input} placeholderTextColor={colors.slate400} />

        <Text style={styles.label}>Public Phone</Text>
        <TextInput value={publicContactPhone} onChangeText={setPublicContactPhone} placeholder="+91 9876543210" style={styles.input} placeholderTextColor={colors.slate400} />

        <Text style={styles.section}>Social Media Links</Text>
        <Text style={styles.label}>Facebook URL</Text>
        <TextInput value={facebookUrl} onChangeText={setFacebookUrl} placeholder="https://facebook.com/yourpage" style={styles.input} placeholderTextColor={colors.slate400} autoCapitalize="none" />

        <Text style={styles.label}>Instagram URL</Text>
        <TextInput value={instagramUrl} onChangeText={setInstagramUrl} placeholder="https://instagram.com/yourhandle" style={styles.input} placeholderTextColor={colors.slate400} autoCapitalize="none" />

        <Text style={styles.label}>YouTube URL</Text>
        <TextInput value={youtubeUrl} onChangeText={setYoutubeUrl} placeholder="https://youtube.com/channel/..." style={styles.input} placeholderTextColor={colors.slate400} autoCapitalize="none" />

        <Text style={styles.label}>WhatsApp Number</Text>
        <TextInput value={whatsappNumber} onChangeText={setWhatsappNumber} placeholder="+919876543210" style={styles.input} placeholderTextColor={colors.slate400} />

        <Button title="Continue to Branches" onPress={submit} loading={mutation.isPending} style={styles.submit} />
      </ScrollView>
    </SafeAreaView>
  );
}

function ImageField({ label, type, url, onPick, loading }: {
  label: string;
  type: 'logo' | 'cover' | 'favicon';
  url: string;
  onPick: () => void;
  loading: boolean;
}) {
  return (
    <View style={{ marginTop: spacing.sm }}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.imageField} onPress={onPick}>
        {url ? (
          <Image
            source={{ uri: url }}
            style={type === 'cover' ? styles.coverPreview : type === 'favicon' ? styles.faviconPreview : styles.logoPreview}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={24} color={colors.slate400} />
            <Text style={styles.imagePlaceholderText}>Tap to select image</Text>
          </View>
        )}
        {loading && (
          <View style={styles.imageOverlay}>
            <ActivityIndicator color={colors.primary600} />
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  scroll: { padding: spacing.lg, paddingBottom: spacing['3xl'] },
  title: { ...typography.h1, color: colors.slate900, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.slate500, marginBottom: spacing.lg },
  section: { ...typography.heading, color: colors.slate600, marginTop: spacing.lg, marginBottom: spacing.sm },
  label: { ...typography.small, color: colors.slate600, fontWeight: '800', marginTop: spacing.sm, marginBottom: spacing.xs },
  input: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.slate100,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 52,
    color: colors.slate900,
    ...typography.small,
    fontWeight: '700',
  },
  imageField: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.slate200,
    borderRadius: radius.xl,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholder: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    ...typography.small,
    color: colors.slate400,
    marginTop: spacing.xs,
  },
  logoPreview: {
    width: 120,
    height: 120,
    borderRadius: radius.lg,
    margin: spacing.md,
  },
  coverPreview: {
    width: '100%',
    height: 160,
    borderRadius: radius.lg,
    margin: spacing.md,
  },
  faviconPreview: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    margin: spacing.md,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.slate200,
    backgroundColor: colors.white,
    marginBottom: spacing.md,
  },
  backText: { ...typography.small, color: colors.slate500, fontWeight: '800' },
  headerTitle: { ...typography.h2, color: colors.slate900, marginBottom: spacing.xs },
  headerSubtitle: { ...typography.body, color: colors.slate500, marginBottom: spacing.lg },
  submit: { marginTop: spacing.lg },
});
