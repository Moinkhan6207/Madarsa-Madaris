import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadows, spacing, typography } from '@/theme';

interface DashboardStatsProps {
  total: number | string;
  active: number | string;
  pages: number | string;
  currentPage: number | string;
}

export function DashboardStats({ total, active, pages, currentPage }: DashboardStatsProps) {
  const stats = [
    { label: 'Total', value: total, icon: 'people-outline' as const },
    { label: 'Active', value: active, icon: 'checkmark-circle-outline' as const },
    { label: 'Pages', value: pages, icon: 'document-text-outline' as const },
    { label: 'Current', value: currentPage, icon: 'albums-outline' as const },
  ];

  return (
    <View style={styles.container}>
      {stats.map((stat, i) => (
        <View key={i} style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons name={stat.icon} size={20} color={colors.primary600} />
          </View>
          <View style={styles.info}>
            <Text style={styles.label}>{stat.label}</Text>
            <Text style={styles.value}>{stat.value}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['3'],
    paddingHorizontal: spacing['4'],
    marginBottom: spacing['3'],
  },
  card: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.white,
    borderRadius: radius['2xl'],
    padding: spacing['4'],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    borderWidth: 1,
    borderColor: colors.slate100,
    ...shadows.xs,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.xl,
    backgroundColor: colors.primary50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  label: {
    ...typography.xs,
    color: colors.slate400,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  value: {
    ...typography.h3,
    color: colors.slate900,
    marginTop: 2,
    fontSize: 20,
  },
});

export default DashboardStats;
