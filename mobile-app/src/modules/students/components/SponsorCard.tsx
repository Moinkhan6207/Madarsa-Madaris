import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/components/ui/Card';
import { colors, radius, spacing, typography } from '@/theme';
import type { StudentSponsorMapping } from '../types';

interface SponsorCardProps {
  mapping: StudentSponsorMapping;
}

export const SponsorCard: React.FC<SponsorCardProps> = React.memo(({ mapping }) => {
  const sponsor = mapping.sponsor;
  return (
    <Card padding="md" style={styles.card}>
      <View style={styles.row}>
        <View style={styles.iconBox}>
          <Ionicons name="briefcase-outline" size={20} color={colors.primary600} />
        </View>
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{sponsor?.name}</Text>
            {mapping.supportLabel && (
              <View style={styles.labelBadge}>
                <Text style={styles.labelText}>{mapping.supportLabel}</Text>
              </View>
            )}
          </View>
          {mapping.amount && (
            <Text style={styles.amount}>
              {mapping.currencyCode || 'INR'} {mapping.amount}
            </Text>
          )}
          <View style={styles.contactRow}>
            {sponsor?.phone && (
              <View style={styles.contactItem}>
                <Ionicons name="call-outline" size={12} color={colors.slate400} />
                <Text style={styles.contactText}>{sponsor.phone}</Text>
              </View>
            )}
            {sponsor?.email && (
              <View style={styles.contactItem}>
                <Ionicons name="mail-outline" size={12} color={colors.slate400} />
                <Text style={styles.contactText}>{sponsor.email}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Card>
  );
});

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing['3'],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.xl,
    backgroundColor: colors.primary50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing['2'],
  },
  name: {
    ...typography.smallBold,
    color: colors.slate900,
    flex: 1,
  },
  labelBadge: {
    paddingHorizontal: spacing['2'],
    paddingVertical: spacing['0.5'],
    borderRadius: radius.md,
    backgroundColor: colors.slate100,
  },
  labelText: {
    ...typography.xsBold,
    color: colors.slate500,
  },
  amount: {
    ...typography.smallBold,
    color: colors.primary600,
    marginTop: spacing['1'],
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['3'],
    marginTop: spacing['2'],
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['1'],
  },
  contactText: {
    ...typography.xs,
    color: colors.slate500,
  },
});

export default SponsorCard;
