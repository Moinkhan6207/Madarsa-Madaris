import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SetupStackParamList } from '@/navigation/types';
import { getOnboardingStatus } from '@/services/onboardingService';
import { colors, spacing, typography } from '@/theme';

type Props = NativeStackScreenProps<SetupStackParamList, 'SetupLanding'>;

export default function SetupLandingScreen({ navigation }: Props) {
  const { data: status, isLoading } = useQuery({
    queryKey: ['onboarding'],
    queryFn: getOnboardingStatus,
  });

  useEffect(() => {
    if (isLoading || !status) return;

    const id = requestAnimationFrame(() => {
      if (status.profileStep === 'NOT_STARTED' || status.profileStep === 'IN_PROGRESS') {
        navigation.replace('ProfileSetup');
      } else if (status.brandingStep === 'NOT_STARTED' || status.brandingStep === 'IN_PROGRESS') {
        navigation.replace('BrandingSetup');
      } else if (status.branchStep === 'NOT_STARTED' || status.branchStep === 'IN_PROGRESS') {
        navigation.replace('BranchesSetup');
      } else if (status.sessionStep === 'NOT_STARTED' || status.sessionStep === 'IN_PROGRESS') {
        navigation.replace('SessionSetup');
      } else {
        navigation.replace('ReviewSetup');
      }
    });

    return () => cancelAnimationFrame(id);
  }, [status, isLoading, navigation]);

  if (isLoading || !status) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary600} />
        <Text style={styles.text}>Loading setup...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary600} />
      <Text style={styles.text}>Redirecting...</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.gray50, gap: spacing.md },
  text: { ...typography.body, color: colors.slate500 },
});
