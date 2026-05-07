import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { TenantStatus } from '@/types/tenant';
import { colors, radius, spacing, typography } from '@/theme';
import Button from '@/components/ui/Button';
import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/authService';

export default function PendingApprovalScreen() {
  const tenant = useAuthStore((state) => state.tenant);
  const logout = useAuthStore((state) => state.logout);
  const fetchTenant = useAuthStore((state) => state.fetchTenant);

  const { data: freshTenant, refetch, isFetching } = useQuery({
    queryKey: ['tenant-me'],
    queryFn: () => authService.getTenantMe(),
    enabled: false,
  });

  useEffect(() => {
    if (freshTenant?.status === TenantStatus.ACTIVE) {
      fetchTenant();
    }
  }, [freshTenant, fetchTenant]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.iconWrap}>
          <Ionicons name="time-outline" size={48} color={colors.amber500} />
        </View>

        <Text style={styles.title}>Account Under Review</Text>
        <Text style={styles.subtitle}>
          Thank you for completing the setup! Our team is currently reviewing your registration for{' '}
          <Text style={styles.bold}>{tenant?.displayName || 'your institution'}</Text>.
        </Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>What Happens Next?</Text>
          <Text style={styles.infoItem}>• We verify your institution details.</Text>
          <Text style={styles.infoItem}>• We check your primary branch configuration.</Text>
          <Text style={styles.infoItem}>• You will receive an email once activated.</Text>
        </View>

        <Button
          title={isFetching ? 'Checking Status...' : 'Refresh Status'}
          onPress={() => refetch()}
          loading={isFetching}
          style={styles.btn}
        />
        <Button
          title="Sign Out"
          variant="outline"
          onPress={logout}
          style={styles.btnOutline}
        />

        <Text style={styles.idText}>
          Institution ID: <Text style={styles.idCode}>{tenant?.id}</Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.gray50 },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.amber50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: { ...typography.h1, color: colors.slate900, textAlign: 'center' },
  subtitle: { ...typography.body, color: colors.slate500, textAlign: 'center', maxWidth: 320 },
  bold: { fontWeight: '800' },
  infoBox: {
    backgroundColor: colors.amber50,
    borderRadius: radius.xl,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 360,
    gap: spacing.xs,
  },
  infoTitle: { ...typography.small, color: colors.amber600, fontWeight: '800', marginBottom: spacing.xs },
  infoItem: { ...typography.small, color: colors.slate700 },
  btn: { width: '100%', maxWidth: 360 },
  btnOutline: { width: '100%', maxWidth: 360 },
  idText: { ...typography.small, color: colors.slate400, marginTop: spacing.md },
  idCode: { ...typography.small, color: colors.slate600, fontWeight: '800' },
});
