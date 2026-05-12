import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/components/ui/Card';
import { colors, radius, spacing, typography } from '@/theme';
import { RELATION_LABELS, type StudentGuardian } from '../types';

interface GuardianCardProps {
  guardian: StudentGuardian;
}

export const GuardianCard: React.FC<GuardianCardProps> = React.memo(({ guardian }) => {
  return (
    <Card padding="md" style={[styles.card, guardian.isPrimary && styles.primaryCard]}>
      <View style={styles.row}>
        <View style={[styles.avatar, guardian.isPrimary && styles.primaryAvatar]}>
          <Text style={[styles.avatarText, guardian.isPrimary && styles.primaryAvatarText]}>
            {guardian.fullName?.[0]?.toUpperCase() || '?'}
          </Text>
        </View>
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{guardian.fullName}</Text>
            <View style={[styles.relationBadge, guardian.isPrimary && styles.primaryBadge]}>
              <Text style={[styles.relationText, guardian.isPrimary && styles.primaryBadgeText]}>
                {RELATION_LABELS[guardian.relation]}
              </Text>
            </View>
          </View>
          {guardian.isPrimary && (
            <View style={styles.primaryTag}>
              <Ionicons name="star" size={10} color={colors.primary600} />
              <Text style={styles.primaryTagText}>Primary</Text>
            </View>
          )}
          <View style={styles.contactRow}>
            {guardian.phone && (
              <View style={styles.contactItem}>
                <Ionicons name="call-outline" size={12} color={colors.slate400} />
                <Text style={styles.contactText}>{guardian.phone}</Text>
              </View>
            )}
            {guardian.email && (
              <View style={styles.contactItem}>
                <Ionicons name="mail-outline" size={12} color={colors.slate400} />
                <Text style={styles.contactText}>{guardian.email}</Text>
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
  primaryCard: {
    borderColor: colors.primary200,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.xl,
    backgroundColor: colors.slate100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryAvatar: {
    backgroundColor: colors.primary50,
  },
  avatarText: {
    ...typography.smallBold,
    color: colors.slate600,
    fontSize: 16,
  },
  primaryAvatarText: {
    color: colors.primary600,
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
  relationBadge: {
    paddingHorizontal: spacing['2'],
    paddingVertical: spacing['0.5'],
    borderRadius: radius.md,
    backgroundColor: colors.slate100,
  },
  relationText: {
    ...typography.xsBold,
    color: colors.slate500,
  },
  primaryBadge: {
    backgroundColor: colors.primary50,
  },
  primaryBadgeText: {
    color: colors.primary600,
  },
  primaryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['1'],
    marginTop: spacing['1'],
    alignSelf: 'flex-start',
  },
  primaryTagText: {
    ...typography.xsBold,
    color: colors.primary600,
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

export default GuardianCard;
