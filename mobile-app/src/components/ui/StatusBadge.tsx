import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TenantStatus } from '@/types/tenant';
import { colors, radius, spacing, typography } from '@/theme';

interface StatusBadgeProps {
  status: TenantStatus;
}

const statusConfig: Record<TenantStatus, { label: string; bg: string; text: string; border: string }> = {
  [TenantStatus.DRAFT]: {
    label: 'Draft',
    bg: colors.slate100,
    text: colors.slate600,
    border: colors.slate200,
  },
  [TenantStatus.PENDING_ACTIVATION]: {
    label: 'Pending',
    bg: colors.emerald50,
    text: colors.emerald600,
    border: '#d1fae5',
  },
  [TenantStatus.ACTIVE]: {
    label: 'Active',
    bg: '#dcfce7',
    text: '#16a34a',
    border: '#bbf7d0',
  },
  [TenantStatus.SUSPENDED]: {
    label: 'Suspended',
    bg: '#fef3c7',
    text: colors.amber500,
    border: '#fde68a',
  },
  [TenantStatus.ARCHIVED]: {
    label: 'Archived',
    bg: colors.gray100,
    text: colors.slate500,
    border: colors.gray300,
  },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig[TenantStatus.DRAFT];

  return (
    <View style={[styles.badge, { backgroundColor: config.bg, borderColor: config.border }]}>
      <Text style={[styles.text, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  text: {
    ...typography.small,
    fontWeight: '700',
    fontSize: 12,
  },
});
