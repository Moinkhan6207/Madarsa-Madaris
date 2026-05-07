import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, Switch, Alert, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SetupStackParamList } from '@/navigation/types';
import { colors, radius, spacing, typography } from '@/theme';
import Button from '@/components/ui/Button';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getSessions, createSession, deleteSession, updateOnboardingStep, getOnboardingStatus } from '@/services/onboardingService';
import SetupStepProgress from '@/components/onboarding/SetupStepProgress';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<SetupStackParamList, 'SessionSetup'>;

const STEP_NAV: Record<string, keyof SetupStackParamList> = {
  profile: 'ProfileSetup',
  branding: 'BrandingSetup',
  branches: 'BranchesSetup',
  session: 'SessionSetup',
  review: 'ReviewSetup',
};

export default function SessionSetupScreen({ navigation }: Props) {
  const handleStepPress = (stepId: string) => {
    const target = STEP_NAV[stepId];
    if (target && target !== 'SessionSetup') {
      navigation.replace(target);
    }
  };
  const { data: sessionsData, isLoading, refetch } = useQuery({
    queryKey: ['sessions'],
    queryFn: getSessions,
  });

  const sessions = sessionsData ?? [];
  const hasActive = sessions.some((s) => s.isCurrent);

  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(!hasActive);

  useEffect(() => {
    setIsCurrent(!hasActive);
  }, [hasActive]);

  const logout = useAuthStore((state) => state.logout);

  const { data: onboarding } = useQuery({
    queryKey: ['onboarding'],
    queryFn: getOnboardingStatus,
  });

  const createMutation = useMutation({
    mutationFn: (payload: any) => createSession(payload),
    onSuccess: () => {
      refetch();
      setName('');
      setStartDate('');
      setEndDate('');
      setIsCurrent(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSession(id),
    onSuccess: () => refetch(),
  });

  const saveAndContinueMutation = useMutation({
    mutationFn: async (payload: any) => {
      await createSession(payload);
      await updateOnboardingStep('sessionStep', 'COMPLETED');
    },
    onSuccess: () => {
      refetch();
      navigation.navigate('ReviewSetup');
    },
  });

  const addSession = (andContinue = false) => {
    if (!name.trim() || name.trim().length < 2) {
      Alert.alert('Validation', 'Session name is required');
      return;
    }
    if (!startDate.trim()) {
      Alert.alert('Validation', 'Start date is required');
      return;
    }
    if (!endDate.trim()) {
      Alert.alert('Validation', 'End date is required');
      return;
    }
    if (new Date(startDate) >= new Date(endDate)) {
      Alert.alert('Validation', 'Start date must be before end date');
      return;
    }

    const payload = {
      name: name.trim(),
      startDate,
      endDate,
      isCurrent: hasActive ? false : (isCurrent || sessions.length === 0),
    };

    if (andContinue) {
      saveAndContinueMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const skip = () => {
    updateOnboardingStep('sessionStep', 'COMPLETED').then(() => {
      navigation.navigate('ReviewSetup');
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
            currentStep="session"
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

        <Text style={styles.title}>Academic Session</Text>
        <Text style={styles.subtitle}>Define the academic year(s) for your institution.</Text>

        {sessions.length > 0 && (
          <View style={styles.list}>
            <Text style={styles.section}>Configured Sessions ({sessions.length})</Text>
            {sessions.map((s) => (
              <View key={s.id} style={[styles.sessionCard, s.isCurrent && styles.sessionCardActive]}>
                <View>
                  <Text style={styles.sessionName}>{s.name} {s.isCurrent ? '(Active)' : ''}</Text>
                  <Text style={styles.sessionMeta}>
                    {new Date(s.startDate).toLocaleDateString()} – {new Date(s.endDate).toLocaleDateString()}
                  </Text>
                </View>
                {!s.isCurrent && (
                  <Pressable onPress={() => deleteMutation.mutate(s.id)} style={styles.deleteBtn}>
                    <Text style={styles.deleteText}>Delete</Text>
                  </Pressable>
                )}
              </View>
            ))}
          </View>
        )}

        <Text style={styles.section}>Add Academic Session</Text>
        <Text style={styles.label}>Session Name *</Text>
        <TextInput value={name} onChangeText={setName} placeholder="2024-25 Academic Year" style={styles.input} placeholderTextColor={colors.slate400} />

        <Text style={styles.label}>Start Date *</Text>
        <TextInput value={startDate} onChangeText={setStartDate} placeholder="YYYY-MM-DD" style={styles.input} placeholderTextColor={colors.slate400} />

        <Text style={styles.label}>End Date *</Text>
        <TextInput value={endDate} onChangeText={setEndDate} placeholder="YYYY-MM-DD" style={styles.input} placeholderTextColor={colors.slate400} />

        <View style={[styles.switchRow, hasActive && { opacity: 0.5 }]}>
          <Text style={styles.switchLabel}>Mark as Active Session</Text>
          <Switch value={isCurrent} onValueChange={setIsCurrent} disabled={hasActive} trackColor={{ false: colors.slate200, true: colors.primary200 }} thumbColor={isCurrent ? colors.primary600 : colors.slate400} />
        </View>
        {hasActive && <Text style={styles.hint}>An active session already exists</Text>}

        <Button title="Add Session" variant="outline" onPress={() => addSession(false)} loading={createMutation.isPending} style={styles.submit} />
        <Button title="Save & Continue" onPress={() => addSession(true)} loading={saveAndContinueMutation.isPending} style={styles.submit} />
        {sessions.length > 0 && <Button title="Skip & Continue" variant="ghost" onPress={skip} style={styles.submit} />}
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
  sessionCard: {
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
  sessionCardActive: {
    borderColor: colors.primary400,
    backgroundColor: colors.primary50,
  },
  sessionName: { ...typography.small, color: colors.slate900, fontWeight: '800' },
  sessionMeta: { ...typography.small, color: colors.slate500, marginTop: 2 },
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
