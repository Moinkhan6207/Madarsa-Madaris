import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '@/theme';
import { HISTORY_EVENT_LABELS, type StudentHistory } from '../types';

interface HistoryItemProps {
  item: StudentHistory;
  isLast?: boolean;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const EVENT_COLORS: Record<string, string> = {
  CREATED: colors.primary500,
  STATUS_CHANGED: colors.blue500,
  PROFILE_UPDATED: colors.slate400,
  BRANCH_CHANGED: colors.purple500,
  PROGRAM_CHANGED: colors.primary500,
  CLASS_CHANGED: colors.blue500,
  GUARDIAN_ADDED: colors.primary500,
  GUARDIAN_UPDATED: colors.primary400,
  GUARDIAN_REMOVED: colors.red500,
  SPONSOR_LINKED: colors.amber500,
  SPONSOR_UNLINKED: colors.amber600,
  SOFT_DELETED: colors.red500,
};

export const HistoryItem: React.FC<HistoryItemProps> = ({ item, isLast }) => {
  return (
    <View style={styles.container}>
      {!isLast && <View style={styles.line} />}
      <View style={[styles.dot, { backgroundColor: EVENT_COLORS[item.event] || colors.slate400 }]} />
      <View style={styles.content}>
        <Text style={styles.event}>{HISTORY_EVENT_LABELS[item.event] || item.event}</Text>
        {item.fieldName && (
          <Text style={styles.field}>{item.fieldName}</Text>
        )}
        {item.oldValue !== undefined && item.newValue !== undefined && (
          <View style={styles.changeRow}>
            <Text style={styles.oldValue}>{String(item.oldValue ?? '-')}</Text>
            <Text style={styles.arrow}>→</Text>
            <Text style={styles.newValue}>{String(item.newValue ?? '-')}</Text>
          </View>
        )}
        <Text style={styles.timestamp}>{formatDate(item.changedAt)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingBottom: spacing['5'],
    position: 'relative',
  },
  line: {
    position: 'absolute',
    left: 19,
    top: 28,
    bottom: 0,
    width: 1,
    backgroundColor: colors.slate200,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 6,
    marginRight: spacing['3'],
    backgroundColor: colors.slate400,
  },
  content: {
    flex: 1,
  },
  event: {
    ...typography.smallBold,
    color: colors.slate800,
  },
  field: {
    ...typography.xs,
    color: colors.slate400,
    marginTop: spacing['0.5'],
    backgroundColor: colors.slate100,
    paddingHorizontal: spacing['2'],
    paddingVertical: spacing['0.5'],
    borderRadius: radius.md,
    alignSelf: 'flex-start',
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    marginTop: spacing['1.5'],
  },
  oldValue: {
    ...typography.xs,
    color: colors.slate400,
    textDecorationLine: 'line-through',
  },
  arrow: {
    ...typography.xs,
    color: colors.slate300,
  },
  newValue: {
    ...typography.xsBold,
    color: colors.primary600,
  },
  timestamp: {
    ...typography.xs,
    color: colors.slate400,
    marginTop: spacing['1.5'],
  },
});

export default HistoryItem;
