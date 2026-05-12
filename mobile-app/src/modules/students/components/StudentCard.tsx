import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StatusBadge from './StatusBadge';
import Card from '@/components/ui/Card';
import { colors, radius, spacing, typography } from '@/theme';
import type { Student } from '../types';

interface StudentCardProps {
  student: Student;
  onPress?: (student: Student) => void;
}

export const StudentCard: React.FC<StudentCardProps> = React.memo(({ student, onPress }) => {
  const primaryGuardian = student.guardians?.find((g) => g.isPrimary) || student.guardians?.[0];

  return (
    <TouchableOpacity onPress={() => onPress?.(student)} activeOpacity={0.7}>
      <Card padding="lg" style={styles.card}>
        <View style={styles.row}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{student.fullName?.[0]?.toUpperCase() || '?'}</Text>
          </View>
          <View style={styles.info}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>{student.fullName}</Text>
              <StatusBadge status={student.status} size="sm" />
            </View>
            <Text style={styles.meta}>{student.admissionNumber}{student.rollNumber ? ` · Roll #${student.rollNumber}` : ''}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          {student.branch?.name && (
            <View style={styles.tag}>
              <Ionicons name="location-outline" size={12} color={colors.slate500} />
              <Text style={styles.tagText}>{student.branch.name}</Text>
            </View>
          )}
          {primaryGuardian?.phone && (
            <View style={styles.tag}>
              <Ionicons name="call-outline" size={12} color={colors.slate500} />
              <Text style={styles.tagText}>{primaryGuardian.phone}</Text>
            </View>
          )}
          {student.isOrphan && (
            <View style={[styles.tag, styles.orphanTag]}>
              <Text style={styles.orphanText}>Orphan</Text>
            </View>
          )}
          {student.isSponsored && (
            <View style={[styles.tag, styles.sponsoredTag]}>
              <Text style={styles.sponsoredText}>Sponsored</Text>
            </View>
          )}
          {student.isNeedy && (
            <View style={[styles.tag, styles.needyTag]}>
              <Text style={styles.needyText}>Needy</Text>
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
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
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.xl,
    backgroundColor: colors.primary50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.h3,
    color: colors.primary600,
    fontSize: 20,
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
  meta: {
    ...typography.xs,
    color: colors.slate400,
    marginTop: spacing['1'],
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['2'],
    marginTop: spacing['3'],
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['1'],
    backgroundColor: colors.slate100,
    paddingHorizontal: spacing['2.5'],
    paddingVertical: spacing['1'],
    borderRadius: radius.pill,
  },
  tagText: {
    ...typography.xs,
    color: colors.slate500,
  },
  orphanTag: {
    backgroundColor: colors.amber50,
  },
  orphanText: {
    ...typography.xs,
    color: colors.amber600,
    fontWeight: '700',
  },
  sponsoredTag: {
    backgroundColor: colors.emerald50,
  },
  sponsoredText: {
    ...typography.xs,
    color: colors.emerald600,
    fontWeight: '700',
  },
  needyTag: {
    backgroundColor: colors.purple50,
  },
  needyText: {
    ...typography.xs,
    color: colors.purple600,
    fontWeight: '700',
  },
});

export default StudentCard;
