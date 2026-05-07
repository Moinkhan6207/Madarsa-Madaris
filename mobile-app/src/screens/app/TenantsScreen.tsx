import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Card from '@/components/ui/Card';
import StatusBadge from '@/components/ui/StatusBadge';
import { platformService } from '@/services/platformService';
import { useAuthStore } from '@/store/authStore';
import { Tenant, TenantStatus } from '@/types/tenant';
import { colors, radius, shadows, spacing, typography } from '@/theme';
import { API_BASE_URL } from '@/constants/config';

const getApiOrigin = () => {
  return API_BASE_URL.replace('/api/v1', '');
};

interface TenantDetailsModalProps {
  tenant: Tenant | null;
  onClose: () => void;
}

function TenantDetailsModal({ tenant, onClose }: TenantDetailsModalProps) {
  if (!tenant) return null;

  const backendUrl = getApiOrigin();
  let rawLogo = tenant.branding?.logoUrl;
  if (rawLogo && !rawLogo.startsWith('http') && !rawLogo.startsWith('/')) {
    rawLogo = '/' + rawLogo;
  }
  const logoSrc = rawLogo?.startsWith('http')
    ? rawLogo
    : rawLogo
      ? `${backendUrl}${rawLogo}`
      : null;

  return (
    <Modal
      animationType="fade"
      transparent
      visible={!!tenant}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleContainer}>
              <Text style={styles.modalTitle}>{tenant.displayName}</Text>
              <Text style={styles.modalSubtitle}>{tenant.slug}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <Ionicons name="close" size={24} color={colors.slate400} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <View style={styles.detailsSection}>
              <Text style={styles.detailsSectionTitle}>Institution Data</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Legal Name:</Text>
                <Text style={styles.detailValue}>{tenant.legalName || tenant.profile?.trustName || 'N/A'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Type:</Text>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>{tenant.institutionType}</Text>
                </View>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Email:</Text>
                <Text style={styles.detailValue}>{tenant.profile?.email || tenant.primaryEmail || 'N/A'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Phone:</Text>
                <Text style={styles.detailValue}>{tenant.profile?.phone || tenant.primaryPhone || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.detailsSection}>
              <Text style={styles.detailsSectionTitle}>Profile & Location</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>City / State:</Text>
                <Text style={styles.detailValue}>
                  {tenant.profile?.city || 'N/A'}, {tenant.profile?.state || ''}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Country:</Text>
                <Text style={styles.detailValue}>{tenant.profile?.country || 'N/A'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Division:</Text>
                <Text style={styles.detailValue}>{tenant.profile?.divisionType || 'BOTH'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Facilities:</Text>
                <Text style={styles.detailValue}>
                  {tenant.profile?.hasHostel ? 'Hostel | ' : ''}
                  {tenant.profile?.hasTransport ? 'Transport | ' : ''}
                  {tenant.profile?.hasMasjidLinkedOps ? 'Masjid' : ''}
                  {!tenant.profile?.hasHostel && !tenant.profile?.hasTransport && !tenant.profile?.hasMasjidLinkedOps && 'None'}
                </Text>
              </View>
            </View>

            <View style={styles.detailsSection}>
              <Text style={styles.detailsSectionTitle}>Branding Look & Feel</Text>
              <View style={styles.brandingRow}>
                <View style={styles.logoContainer}>
                  {logoSrc ? (
                    <Image source={{ uri: logoSrc }} style={styles.logo} resizeMode="cover" />
                  ) : (
                    <Text style={styles.noLogoText}>No Logo</Text>
                  )}
                </View>
                <View style={styles.brandingInfo}>
                  <View style={styles.colorRow}>
                    <Text style={styles.detailLabel}>Primary Color:</Text>
                    <View
                      style={[
                        styles.colorSwatch,
                        { backgroundColor: tenant.branding?.primaryColor || '#059669' },
                      ]}
                    />
                    <Text style={styles.colorValue}>{tenant.branding?.primaryColor || 'Default'}</Text>
                  </View>
                  <Text style={styles.detailLabel}>
                    Public Contact: {tenant.branding?.publicContactPhone || 'N/A'}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function TenantsScreen() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['tenants', page],
    queryFn: () => platformService.getTenants({ page, limit: 10 }),
  });

  const mutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'approve' | 'suspend' | 'activate' }) => {
      if (action === 'approve') return platformService.approveTenant(id);
      if (action === 'suspend') return platformService.suspendTenant(id);
      return platformService.activateTenant(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
    onError: (err: any) => {
      Alert.alert(
        'Action Failed',
        err.message || 'Unknown error occurred. (Draft tenants cannot be directly approved without completing profile setup)'
      );
    },
  });

  const handleAction = async (id: string, name: string, action: 'approve' | 'suspend' | 'activate') => {
    Alert.alert(
      `Confirm ${action}`,
      `Are you sure you want to ${action} "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: action === 'suspend' ? 'destructive' : 'default',
          onPress: () => mutation.mutate({ id, action }),
        },
      ]
    );
  };

  const tenants = data?.tenants || [];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => void refetch()} />}
      >
        {/* Super Admin Branding Header */}
        <View style={styles.superAdminHeader}>
          <View style={styles.brandingContainer}>
            <View style={styles.logoContainer}>
              <View style={styles.logoBox}>
                <Ionicons name="shield-checkmark" size={28} color={colors.white} />
              </View>
            </View>
            <View>
              <Text style={styles.brandingTitle}>Super Admin</Text>
              <Text style={styles.brandingSubtitle}>PLATFORM CONTROL</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => void useAuthStore.getState().logout()} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={20} color={colors.red600} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Navigation Strip */}
        <View style={styles.navStrip}>
          <TouchableOpacity style={styles.navItemActive}>
            <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary600} />
            <Text style={styles.navItemTextActive}>Institutions</Text>
          </TouchableOpacity>
        </View>

        {/* Page Header */}
        <View style={styles.pageHeader}>
          <View>
            <Text style={styles.pageTitle}>Institutions Control</Text>
            <Text style={styles.pageSubtitle}>Review onboarding profiles and manage activations</Text>
          </View>
          <TouchableOpacity onPress={() => void refetch()} style={styles.refreshButton}>
            <Ionicons name="refresh" size={20} color={colors.slate500} />
          </TouchableOpacity>
        </View>

        {isError && (
          <Card style={styles.errorCard}>
            <Text style={styles.errorText}>Failed to load tenants. Pull down to retry.</Text>
          </Card>
        )}

        <View style={styles.tenantList}>
          {tenants.map((tenant) => (
            <Card key={tenant.id} style={styles.tenantCard}>
              <View style={styles.tenantHeader}>
                <View style={styles.tenantInfo}>
                  <Text style={styles.tenantName}>{tenant.displayName}</Text>
                  <Text style={styles.tenantSlug}>{tenant.slug}</Text>
                </View>
                <StatusBadge status={tenant.status} />
              </View>

              <View style={styles.tenantMeta}>
                <Text style={styles.tenantDate}>
                  Created: {new Date(tenant.createdAt).toLocaleDateString()}
                </Text>
              </View>

              <View style={styles.tenantActions}>
                <TouchableOpacity
                  onPress={() => setSelectedTenant(tenant)}
                  style={[styles.actionButton, styles.viewButton]}
                >
                  <Ionicons name="eye-outline" size={14} color={colors.primary600} />
                  <Text style={styles.viewButtonText}>View</Text>
                </TouchableOpacity>

                {tenant.status === TenantStatus.PENDING_ACTIVATION && (
                  <TouchableOpacity
                    onPress={() => handleAction(tenant.id, tenant.displayName, 'approve')}
                    style={[styles.actionButton, styles.approveButton]}
                  >
                    <Ionicons name="shield-checkmark-outline" size={14} color={colors.emerald600} />
                    <Text style={styles.approveButtonText}>Approve</Text>
                  </TouchableOpacity>
                )}

                {tenant.status === TenantStatus.ACTIVE && (
                  <TouchableOpacity
                    onPress={() => handleAction(tenant.id, tenant.displayName, 'suspend')}
                    style={[styles.actionButton, styles.suspendButton]}
                  >
                    <Ionicons name="ban-outline" size={14} color={colors.red600} />
                    <Text style={styles.suspendButtonText}>Suspend</Text>
                  </TouchableOpacity>
                )}

                {tenant.status === TenantStatus.SUSPENDED && (
                  <TouchableOpacity
                    onPress={() => handleAction(tenant.id, tenant.displayName, 'activate')}
                    style={[styles.actionButton, styles.activateButton]}
                  >
                    <Ionicons name="shield-outline" size={14} color={colors.amber500} />
                    <Text style={styles.activateButtonText}>Activate</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Card>
          ))}

          {tenants.length === 0 && !isLoading && (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="business-outline" size={40} color={colors.slate300} />
              </View>
              <Text style={styles.emptyTitle}>No institutions found</Text>
              <Text style={styles.emptySubtitle}>Institutions will appear here once they register</Text>
            </Card>
          )}
        </View>

        <TenantDetailsModal
          tenant={selectedTenant}
          onClose={() => setSelectedTenant(null)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.slate50 },
  screen: { flex: 1, backgroundColor: colors.slate50 },
  container: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing['3xl'] },
  headerActions: { flexDirection: 'row', justifyContent: 'flex-end' },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: radius.xl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.slate200,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  errorCard: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
  errorText: { color: colors.red600, ...typography.small, fontWeight: '600' },
  tenantList: { gap: spacing.sm },
  tenantCard: { borderRadius: radius['2xl'], padding: spacing.md },
  tenantHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  tenantInfo: { flex: 1, marginRight: spacing.sm },
  tenantName: { ...typography.body, fontWeight: '700', color: colors.slate900 },
  tenantSlug: { ...typography.small, color: colors.slate400, marginTop: 2 },
  tenantMeta: { marginBottom: spacing.sm },
  tenantDate: { ...typography.small, color: colors.slate500 },
  tenantActions: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.lg,
  },
  viewButton: { backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#dbeafe' },
  viewButtonText: { ...typography.small, fontWeight: '700', color: '#2563eb' },
  approveButton: { backgroundColor: colors.emerald50, borderWidth: 1, borderColor: '#d1fae5' },
  approveButtonText: { ...typography.small, fontWeight: '700', color: colors.emerald600 },
  suspendButton: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca' },
  suspendButtonText: { ...typography.small, fontWeight: '700', color: colors.red600 },
  activateButton: { backgroundColor: '#fffbeb', borderWidth: 1, borderColor: '#fde68a' },
  activateButtonText: { ...typography.small, fontWeight: '700', color: colors.amber500 },
  emptyCard: { alignItems: 'center', paddingVertical: spacing['2xl'], borderRadius: radius['2xl'] },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.slate100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: { ...typography.body, fontWeight: '700', color: colors.slate700, marginBottom: spacing.xs },
  emptySubtitle: { ...typography.small, color: colors.slate400 },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: radius['3xl'],
    width: '100%',
    maxHeight: '85%',
    ...shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate100,
    backgroundColor: colors.slate50,
  },
  modalTitleContainer: { flex: 1 },
  modalTitle: { ...typography.heading, color: colors.slate900 },
  modalSubtitle: { ...typography.small, color: colors.slate400, marginTop: 2 },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: radius.xl,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: { padding: spacing.lg, maxHeight: 400 },
  modalFooter: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.slate100,
    backgroundColor: colors.slate50,
    alignItems: 'flex-end',
  },
  closeButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.slate200,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.xl,
  },
  closeButtonText: { ...typography.body, fontWeight: '700', color: colors.slate600 },

  // Details styles
  detailsSection: { marginBottom: spacing.lg },
  detailsSectionTitle: {
    ...typography.small,
    fontWeight: '700',
    color: colors.slate900,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate100,
    paddingBottom: spacing.xs,
    marginBottom: spacing.sm,
  },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs, flexWrap: 'wrap' },
  detailLabel: { ...typography.small, fontWeight: '600', color: colors.slate500, marginRight: spacing.xs },
  detailValue: { ...typography.small, color: colors.slate700, flex: 1 },
  typeBadge: {
    backgroundColor: colors.slate100,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.lg,
  },
  typeBadgeText: { ...typography.small, fontWeight: '600', color: colors.slate600, fontSize: 12 },

  // Branding styles
  brandingRow: { flexDirection: 'row', gap: spacing.md },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.slate200,
    backgroundColor: colors.slate50,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logo: { width: 64, height: 64 },
  noLogoText: { ...typography.small, color: colors.slate400, fontSize: 12 },
  brandingInfo: { flex: 1, justifyContent: 'center', gap: spacing.xs },
  colorRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  colorSwatch: { width: 16, height: 16, borderRadius: 4, borderWidth: 1, borderColor: colors.slate200 },
  colorValue: { ...typography.small, color: colors.slate600 },

  // Super Admin Header styles
  superAdminHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.slate200,
    padding: spacing.md,
    ...shadows.sm,
  },
  brandingContainer: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  logoBox: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.primary600,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  brandingTitle: { ...typography.body, fontWeight: '700', color: colors.slate900 },
  brandingSubtitle: { ...typography.xsCaps, color: colors.slate400, letterSpacing: 0.5 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.xl,
    backgroundColor: '#fef2f2',
  },
  logoutText: { ...typography.small, fontWeight: '700', color: colors.red600 },

  // Nav Strip styles
  navStrip: {
    backgroundColor: colors.white,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.slate200,
    padding: spacing.xs,
  },
  navItemActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.xl,
    backgroundColor: colors.primary50,
  },
  navItemTextActive: { ...typography.small, fontWeight: '700', color: colors.primary700 },

  // Page Header styles
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  pageTitle: { ...typography.h3, color: colors.slate900 },
  pageSubtitle: { ...typography.small, color: colors.slate500, marginTop: spacing.xxs },
});
