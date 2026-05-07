import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, ScrollView, StyleSheet, Alert, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SetupStackParamList } from '@/navigation/types';
import { colors, radius, spacing, typography } from '@/theme';
import Button from '@/components/ui/Button';
import SetupStepProgress from '@/components/onboarding/SetupStepProgress';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  getOnboardingStatus,
  getProfile,
  getBranding,
  getBranches,
  getSessions,
  finalizeOnboarding,
} from '@/services/onboardingService';
import { useAuthStore } from '@/store/authStore';

type Props = NativeStackScreenProps<SetupStackParamList, 'ReviewSetup'>;

const STEP_NAV: Record<string, keyof SetupStackParamList> = {
  profile: 'ProfileSetup',
  branding: 'BrandingSetup',
  branches: 'BranchesSetup',
  session: 'SessionSetup',
  review: 'ReviewSetup',
};

export default function ReviewSetupScreen({ navigation }: Props) {
  const handleStepPress = (stepId: string) => {
    const target = STEP_NAV[stepId];
    if (target && target !== 'ReviewSetup') {
      navigation.replace(target);
    }
  };
  const fetchTenant = useAuthStore((state) => state.fetchTenant);
  const logout = useAuthStore((state) => state.logout);

  const { data: status } = useQuery({ queryKey: ['onboarding'], queryFn: getOnboardingStatus });
  const { data: profile } = useQuery({ queryKey: ['profile'], queryFn: getProfile });
  const { data: branding } = useQuery({ queryKey: ['branding'], queryFn: getBranding });
  const { data: branchesData } = useQuery({ queryKey: ['branches'], queryFn: getBranches });
  const { data: sessionsData } = useQuery({ queryKey: ['sessions'], queryFn: getSessions });

  const branches = branchesData ?? [];
  const sessions = sessionsData ?? [];

  const isReady =
    status?.profileStep === 'COMPLETED' &&
    status?.brandingStep === 'COMPLETED' &&
    status?.branchStep === 'COMPLETED' &&
    status?.sessionStep === 'COMPLETED';

  const finalizeMutation = useMutation({
    mutationFn: finalizeOnboarding,
    onSuccess: () => {
      fetchTenant();
    },
  });

  const handleFinalize = () => {
    if (!isReady) {
      Alert.alert('Incomplete', 'Please complete all steps before finalizing.');
      return;
    }
    finalizeMutation.mutate();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Pressable onPress={logout} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={16} color={colors.slate500} />
          <Text style={styles.backText}>Back to login</Text>
        </Pressable>

        <Text style={styles.headerTitle}>Setup your Institution</Text>
        <Text style={styles.headerSubtitle}>Complete these steps to activate your platform.</Text>

        {status && (
          <SetupStepProgress
            currentStep="review"
            onStepPress={handleStepPress}
            statusMap={{
              profileStep: status.profileStep,
              brandingStep: status.brandingStep,
              branchStep: status.branchStep,
              sessionStep: status.sessionStep,
              finalizationStep: status.finalizationStep,
            }}
          />
        )}

        <Text style={styles.title}>Review Your Setup</Text>
        <Text style={styles.subtitle}>Check all information before finalizing.</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Institution Profile</Text>
          <Text style={styles.rowText}>Name: {profile?.shortName || '-'}</Text>
          <Text style={styles.rowText}>Principal: {profile?.principalName || '-'}</Text>
          <Text style={styles.rowText}>City: {profile?.city || '-'}</Text>
          <Text style={styles.rowText}>Phone: {profile?.phone || '-'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Branding</Text>
          <Text style={styles.rowText}>Primary Color: {branding?.primaryColor || '-'}</Text>
          <Text style={styles.rowText}>Tagline: {branding?.tagline || '-'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Branches ({branches.length})</Text>
          {branches.map((b) => (
            <Text key={b.id} style={styles.rowText}>
              {b.name} {b.isPrimary ? '(Primary)' : ''}
            </Text>
          ))}
          {branches.length === 0 && <Text style={styles.rowText}>-</Text>}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Academic Sessions ({sessions.length})</Text>
          {sessions.map((s) => (
            <Text key={s.id} style={styles.rowText}>
              {s.name} {s.isCurrent ? '(Active)' : ''}
            </Text>
          ))}
          {sessions.length === 0 && <Text style={styles.rowText}>-</Text>}
        </View>

        {!isReady && <Text style={styles.warning}>Please complete all steps before finalizing.</Text>}
        {finalizeMutation.isError && <Text style={styles.error}>{(finalizeMutation.error as Error).message}</Text>}

        <Button
          title={finalizeMutation.isPending ? 'Activating...' : 'Finalize & Activate'}
          onPress={handleFinalize}
          loading={finalizeMutation.isPending}
          style={styles.submit}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  scroll: { padding: spacing.lg, paddingBottom: spacing['3xl'] },
  title: { ...typography.h1, color: colors.slate900, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.slate500, marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  cardTitle: { ...typography.heading, color: colors.slate800, marginBottom: spacing.xs },
  rowText: { ...typography.small, color: colors.slate600 },
  warning: { ...typography.small, color: colors.amber600, marginBottom: spacing.md, textAlign: 'center' },
  error: { ...typography.small, color: colors.red600, marginBottom: spacing.md, textAlign: 'center' },
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
