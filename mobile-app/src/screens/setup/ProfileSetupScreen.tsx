import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, Switch, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SetupStackParamList } from '@/navigation/types';
import { colors, radius, spacing, typography } from '@/theme';
import Button from '@/components/ui/Button';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getProfile, updateProfile, updateOnboardingStep, getOnboardingStatus } from '@/services/onboardingService';
import { InstitutionProfile } from '@/types/onboarding';
import SetupStepProgress from '@/components/onboarding/SetupStepProgress';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<SetupStackParamList, 'ProfileSetup'>;

const STEP_NAV: Record<string, keyof SetupStackParamList> = {
  profile: 'ProfileSetup',
  branding: 'BrandingSetup',
  branches: 'BranchesSetup',
  session: 'SessionSetup',
  review: 'ReviewSetup',
};

export default function ProfileSetupScreen({ navigation }: Props) {
  const handleStepPress = (stepId: string) => {
    const target = STEP_NAV[stepId];
    if (target && target !== 'ProfileSetup') {
      navigation.replace(target);
    }
  };
  const { data: existing, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  const [shortName, setShortName] = useState(existing?.shortName ?? '');
  const [principalName, setPrincipalName] = useState(existing?.principalName ?? '');
  const [email, setEmail] = useState(existing?.email ?? '');
  const [phone, setPhone] = useState(existing?.phone ?? '');
  const [addressLine1, setAddressLine1] = useState(existing?.addressLine1 ?? '');
  const [city, setCity] = useState(existing?.city ?? '');
  const [state, setState] = useState(existing?.state ?? '');
  const [country, setCountry] = useState(existing?.country ?? '');
  const [postalCode, setPostalCode] = useState(existing?.postalCode ?? '');
  const [trustName, setTrustName] = useState(existing?.trustName ?? '');
  const [registrationNumber, setRegistrationNumber] = useState(existing?.registrationNumber ?? '');
  const [websiteUrl, setWebsiteUrl] = useState(existing?.websiteUrl ?? '');
  const [establishedYear, setEstablishedYear] = useState(existing?.establishedYear?.toString() ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [divisionType, setDivisionType] = useState<'MALE' | 'FEMALE' | 'BOTH'>((existing?.divisionType as any) ?? 'BOTH');
  const [hasHostel, setHasHostel] = useState(existing?.hasHostel ?? false);
  const [hasTransport, setHasTransport] = useState(existing?.hasTransport ?? false);
  const [hasMasjidLinkedOps, setHasMasjidLinkedOps] = useState(existing?.hasMasjidLinkedOps ?? false);
  const [hasMultiBranch, setHasMultiBranch] = useState(existing?.hasMultiBranch ?? false);

  useEffect(() => {
    if (!existing) return;
    setShortName(existing.shortName ?? '');
    setPrincipalName(existing.principalName ?? '');
    setEmail(existing.email ?? '');
    setPhone(existing.phone ?? '');
    setAddressLine1(existing.addressLine1 ?? '');
    setCity(existing.city ?? '');
    setState(existing.state ?? '');
    setCountry(existing.country ?? '');
    setPostalCode(existing.postalCode ?? '');
    setTrustName(existing.trustName ?? '');
    setRegistrationNumber(existing.registrationNumber ?? '');
    setWebsiteUrl(existing.websiteUrl ?? '');
    setEstablishedYear(existing.establishedYear?.toString() ?? '');
    setDescription(existing.description ?? '');
    setDivisionType((existing.divisionType as any) ?? 'BOTH');
    setHasHostel(existing.hasHostel ?? false);
    setHasTransport(existing.hasTransport ?? false);
    setHasMasjidLinkedOps(existing.hasMasjidLinkedOps ?? false);
    setHasMultiBranch(existing.hasMultiBranch ?? false);
  }, [existing]);

  const logout = useAuthStore((state) => state.logout);

  const { data: onboarding } = useQuery({
    queryKey: ['onboarding'],
    queryFn: getOnboardingStatus,
  });

  const mutation = useMutation({
    mutationFn: async (payload: Partial<InstitutionProfile>) => {
      await updateProfile(payload);
      await updateOnboardingStep('profileStep', 'COMPLETED');
    },
    onSuccess: () => {
      navigation.navigate('BrandingSetup');
    },
  });

  const submit = () => {
    if (!shortName.trim() || shortName.trim().length < 2) {
      Alert.alert('Validation', 'Short name must be at least 2 characters');
      return;
    }
    if (!principalName.trim() || principalName.trim().length < 2) {
      Alert.alert('Validation', 'Principal name is required');
      return;
    }
    if (!addressLine1.trim() || addressLine1.trim().length < 5) {
      Alert.alert('Validation', 'Address is required');
      return;
    }
    if (!city.trim() || city.trim().length < 2) {
      Alert.alert('Validation', 'City is required');
      return;
    }

    mutation.mutate({
      shortName: shortName.trim(),
      principalName: principalName.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      addressLine1: addressLine1.trim(),
      addressLine2: undefined,
      city: city.trim(),
      state: state.trim() || undefined,
      country: country.trim() || undefined,
      postalCode: postalCode.trim() || undefined,
      trustName: trustName.trim() || undefined,
      registrationNumber: registrationNumber.trim() || undefined,
      websiteUrl: websiteUrl.trim() || undefined,
      establishedYear: establishedYear ? parseInt(establishedYear, 10) : undefined,
      description: description.trim() || undefined,
      divisionType,
      hasHostel,
      hasTransport,
      hasMasjidLinkedOps,
      hasMultiBranch,
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
            currentStep="profile"
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

        <Text style={styles.title}>Institution Profile</Text>
        <Text style={styles.subtitle}>Tell us about your Madarsa or Islamic institution.</Text>

        <Text style={styles.label}>Short Name / Popular Name *</Text>
        <TextInput value={shortName} onChangeText={setShortName} placeholder="e.g. Darul Uloom" style={styles.input} placeholderTextColor={colors.slate400} />

        <Text style={styles.label}>Principal / Nazim Name *</Text>
        <TextInput value={principalName} onChangeText={setPrincipalName} placeholder="Mufti Abdullah" style={styles.input} placeholderTextColor={colors.slate400} />

        <Text style={styles.label}>Trust / Society Name</Text>
        <TextInput value={trustName} onChangeText={setTrustName} placeholder="Al-Rashid Trust" style={styles.input} placeholderTextColor={colors.slate400} />

        <Text style={styles.label}>Registration Number</Text>
        <TextInput value={registrationNumber} onChangeText={setRegistrationNumber} placeholder="Reg. No." style={styles.input} placeholderTextColor={colors.slate400} />

        <Text style={styles.label}>Year Established</Text>
        <TextInput value={establishedYear} onChangeText={setEstablishedYear} placeholder="e.g. 1985" keyboardType="numeric" style={styles.input} placeholderTextColor={colors.slate400} />

        <Text style={styles.label}>Division Type *</Text>
        <View style={styles.row}>
          {(['BOTH', 'MALE', 'FEMALE'] as const).map((d) => (
            <Pressable key={d} onPress={() => setDivisionType(d)} style={[styles.chip, divisionType === d && styles.chipActive]}>
              <Text style={[styles.chipText, divisionType === d && styles.chipTextActive]}>{d === 'BOTH' ? 'Boys & Girls' : d === 'MALE' ? 'Boys Only' : 'Girls Only'}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.section}>Contact Information</Text>
        <Text style={styles.label}>Email Address</Text>
        <TextInput value={email} onChangeText={setEmail} placeholder="info@madarsa.org" keyboardType="email-address" autoCapitalize="none" style={styles.input} placeholderTextColor={colors.slate400} />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput value={phone} onChangeText={setPhone} placeholder="+91 9876543210" style={styles.input} placeholderTextColor={colors.slate400} />

        <Text style={styles.section}>Address</Text>
        <Text style={styles.label}>Address Line 1 *</Text>
        <TextInput value={addressLine1} onChangeText={setAddressLine1} placeholder="Street address" style={styles.input} placeholderTextColor={colors.slate400} />

        <Text style={styles.label}>City *</Text>
        <TextInput value={city} onChangeText={setCity} placeholder="City" style={styles.input} placeholderTextColor={colors.slate400} />

        <Text style={styles.label}>State</Text>
        <TextInput value={state} onChangeText={setState} placeholder="State" style={styles.input} placeholderTextColor={colors.slate400} />

        <Text style={styles.label}>Country</Text>
        <TextInput value={country} onChangeText={setCountry} placeholder="India" style={styles.input} placeholderTextColor={colors.slate400} />

        <Text style={styles.label}>Postal Code</Text>
        <TextInput value={postalCode} onChangeText={setPostalCode} placeholder="110001" style={styles.input} placeholderTextColor={colors.slate400} />

        <Text style={styles.section}>Facilities & Features</Text>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Has Hostel Facility</Text>
          <Switch value={hasHostel} onValueChange={setHasHostel} trackColor={{ false: colors.slate200, true: colors.primary200 }} thumbColor={hasHostel ? colors.primary600 : colors.slate400} />
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Has Transport Facility</Text>
          <Switch value={hasTransport} onValueChange={setHasTransport} trackColor={{ false: colors.slate200, true: colors.primary200 }} thumbColor={hasTransport ? colors.primary600 : colors.slate400} />
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Masjid-Linked Operations</Text>
          <Switch value={hasMasjidLinkedOps} onValueChange={setHasMasjidLinkedOps} trackColor={{ false: colors.slate200, true: colors.primary200 }} thumbColor={hasMasjidLinkedOps ? colors.primary600 : colors.slate400} />
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Multi-Branch Institution</Text>
          <Switch value={hasMultiBranch} onValueChange={setHasMultiBranch} trackColor={{ false: colors.slate200, true: colors.primary200 }} thumbColor={hasMultiBranch ? colors.primary600 : colors.slate400} />
        </View>

        <Text style={styles.section}>Description</Text>
        <TextInput value={description} onChangeText={setDescription} placeholder="Brief description..." multiline numberOfLines={3} style={[styles.input, { minHeight: 80 }]} placeholderTextColor={colors.slate400} />

        <Button title="Continue to Branding" onPress={submit} loading={mutation.isPending} style={styles.submit} />
      </ScrollView>
    </SafeAreaView>
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
  row: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.slate200,
    backgroundColor: colors.white,
  },
  chipActive: { backgroundColor: colors.primary50, borderColor: colors.primary200 },
  chipText: { ...typography.small, color: colors.slate500, fontWeight: '700' },
  chipTextActive: { color: colors.primary700 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm },
  switchLabel: { ...typography.small, color: colors.slate700, fontWeight: '700' },
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
