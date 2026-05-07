import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, Switch, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SetupStackParamList } from '@/navigation/types';
import { colors, radius, spacing, typography } from '@/theme';
import Button from '@/components/ui/Button';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getBranches, createBranch, deleteBranch, updateOnboardingStep, getOnboardingStatus } from '@/services/onboardingService';
import SetupStepProgress from '@/components/onboarding/SetupStepProgress';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<SetupStackParamList, 'BranchesSetup'>;

const STEP_NAV: Record<string, keyof SetupStackParamList> = {
  profile: 'ProfileSetup',
  branding: 'BrandingSetup',
  branches: 'BranchesSetup',
  session: 'SessionSetup',
  review: 'ReviewSetup',
};

export default function BranchesSetupScreen({ navigation }: Props) {
  const handleStepPress = (stepId: string) => {
    const target = STEP_NAV[stepId];
    if (target && target !== 'BranchesSetup') {
      navigation.replace(target);
    }
  };
  const { data: branchesData, isLoading, refetch } = useQuery({
    queryKey: ['branches'],
    queryFn: getBranches,
  });

  const branches = branchesData ?? [];
  const hasPrimary = branches.some((b) => b.isPrimary);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [headName, setHeadName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [city, setCity] = useState('');
  const [state, setStateValue] = useState('');
  const [isPrimary, setIsPrimary] = useState(!hasPrimary);

  useEffect(() => {
    setIsPrimary(!hasPrimary);
  }, [hasPrimary]);

  const logout = useAuthStore((state) => state.logout);

  const { data: onboarding } = useQuery({
    queryKey: ['onboarding'],
    queryFn: getOnboardingStatus,
  });

  const createMutation = useMutation({
    mutationFn: (payload: any) => createBranch(payload),
    onSuccess: () => {
      refetch();
      setName('');
      setCode('');
      setHeadName('');
      setPhone('');
      setEmail('');
      setAddressLine1('');
      setCity('');
      setStateValue('');
      setIsPrimary(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBranch(id),
    onSuccess: () => refetch(),
  });

  const saveAndContinueMutation = useMutation({
    mutationFn: async (payload: any) => {
      await createBranch(payload);
      await updateOnboardingStep('branchStep', 'COMPLETED');
    },
    onSuccess: () => {
      refetch();
      navigation.navigate('SessionSetup');
    },
  });

  const addBranch = (andContinue = false) => {
    if (!name.trim() || name.trim().length < 2) {
      Alert.alert('Validation', 'Branch name is required');
      return;
    }

    const normalizedName = name.trim();
    const normalizedCode = code.trim() || undefined;

    const duplicateByName = branches.some((b) => (b.name || '').trim().toLowerCase() === normalizedName.toLowerCase());
    const duplicateByCode = normalizedCode
      ? branches.some((b) => (b.code || '').trim().toLowerCase() === normalizedCode.toLowerCase())
      : false;

    if (duplicateByName || duplicateByCode) {
      Alert.alert('Validation', 'A branch with this name or code already exists.');
      return;
    }

    const effectiveIsPrimary = hasPrimary ? false : (isPrimary || branches.length === 0);

    const payload = {
      name: normalizedName,
      code: normalizedCode,
      headName: headName.trim() || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      addressLine1: addressLine1.trim() || undefined,
      city: city.trim() || undefined,
      state: state.trim() || undefined,
      isPrimary: effectiveIsPrimary,
    };

    if (andContinue) {
      saveAndContinueMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const skip = () => {
    updateOnboardingStep('branchStep', 'COMPLETED').then(() => {
      navigation.navigate('SessionSetup');
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
            currentStep="branches"
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

        <Text style={styles.title}>Branch Setup</Text>
        <Text style={styles.subtitle}>Add your institution branches. Only one can be primary.</Text>

        {branches.length > 0 && (
          <View style={styles.list}>
            <Text style={styles.section}>Current Branches ({branches.length})</Text>
            {branches.map((b) => (
              <View key={b.id} style={[styles.branchCard, b.isPrimary && styles.branchCardPrimary]}>
                <View style={styles.branchInfo}>
                  <Text style={styles.branchName}>{b.name} {b.isPrimary ? '(Primary)' : ''}</Text>
                  {b.city ? <Text style={styles.branchMeta}>{[b.addressLine1, b.city, b.state].filter(Boolean).join(', ')}</Text> : null}
                  {b.headName ? <Text style={styles.branchMeta}>Head: {b.headName}</Text> : null}
                </View>
                {!b.isPrimary && (
                  <Pressable onPress={() => deleteMutation.mutate(b.id)} style={styles.deleteBtn}>
                    <Text style={styles.deleteText}>Delete</Text>
                  </Pressable>
                )}
              </View>
            ))}
          </View>
        )}

        <Text style={styles.section}>Add New Branch</Text>
        <Text style={styles.label}>Branch Name *</Text>
        <TextInput value={name} onChangeText={setName} placeholder="Main Campus" style={styles.input} placeholderTextColor={colors.slate400} />

        <Text style={styles.label}>Branch Code</Text>
        <TextInput value={code} onChangeText={setCode} placeholder="MAIN-01" style={styles.input} placeholderTextColor={colors.slate400} />

        <Text style={styles.label}>Branch Head / In-charge</Text>
        <TextInput value={headName} onChangeText={setHeadName} placeholder="Maulana Ahmed" style={styles.input} placeholderTextColor={colors.slate400} />

        <Text style={styles.label}>Branch Phone</Text>
        <TextInput value={phone} onChangeText={setPhone} placeholder="+91 9876543210" style={styles.input} placeholderTextColor={colors.slate400} />

        <Text style={styles.label}>Branch Email</Text>
        <TextInput value={email} onChangeText={setEmail} placeholder="branch@madarsa.org" keyboardType="email-address" autoCapitalize="none" style={styles.input} placeholderTextColor={colors.slate400} />

        <Text style={styles.label}>Address</Text>
        <TextInput value={addressLine1} onChangeText={setAddressLine1} placeholder="Street address" style={styles.input} placeholderTextColor={colors.slate400} />

        <Text style={styles.label}>City</Text>
        <TextInput value={city} onChangeText={setCity} placeholder="City" style={styles.input} placeholderTextColor={colors.slate400} />

        <Text style={styles.label}>State</Text>
        <TextInput value={state} onChangeText={setStateValue} placeholder="State" style={styles.input} placeholderTextColor={colors.slate400} />

        <View style={[styles.switchRow, hasPrimary && { opacity: 0.5 }]}>
          <Text style={styles.switchLabel}>Set as Primary Branch</Text>
          <Switch value={isPrimary} onValueChange={setIsPrimary} disabled={hasPrimary} trackColor={{ false: colors.slate200, true: colors.primary200 }} thumbColor={isPrimary ? colors.primary600 : colors.slate400} />
        </View>
        {hasPrimary && <Text style={styles.hint}>A primary branch already exists</Text>}

        <Button title="Add More Branch" variant="outline" onPress={() => addBranch(false)} loading={createMutation.isPending} style={styles.submit} />
        <Button title="Save & Continue" onPress={() => addBranch(true)} loading={saveAndContinueMutation.isPending} style={styles.submit} />
        {branches.length > 0 && <Button title="Skip & Continue" variant="ghost" onPress={skip} style={styles.submit} />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  scroll: { padding: spacing.lg, paddingBottom: spacing['3xl'] },
  title: { ...typography.h1, color: colors.slate900, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.slate500, marginBottom: spacing.lg },
  list: { marginBottom: spacing.lg },
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
  branchCard: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.slate200,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  branchCardPrimary: {
    borderColor: colors.primary400,
    backgroundColor: colors.primary50,
  },
  branchInfo: { flex: 1 },
  branchName: { ...typography.small, color: colors.slate900, fontWeight: '800' },
  branchMeta: { ...typography.small, color: colors.slate500, marginTop: 2 },
  deleteBtn: { padding: spacing.sm },
  deleteText: { color: colors.red500, fontWeight: '800' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm },
  switchLabel: { ...typography.small, color: colors.slate700, fontWeight: '700' },
  hint: { ...typography.small, color: colors.slate400, marginTop: -spacing.sm, marginBottom: spacing.sm },
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
  submit: { marginTop: spacing.md },
});
