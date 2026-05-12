import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { STATUS_DISPLAY, type StudentStatus } from '../types';

interface StatusBadgeProps {
  status: StudentStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = React.memo(({ status, size = 'md' }) => {
  const config = STATUS_DISPLAY[status];
  return (
    <View style={[styles.badge, { backgroundColor: config.bg, borderColor: config.borderColor }, size === 'sm' && styles.badgeSm]}>
      <Text style={[styles.text, { color: config.color }, size === 'sm' && styles.textSm]}>
        {config.label}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeSm: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  text: {
    fontSize: 13,
    fontWeight: '700',
  },
  textSm: {
    fontSize: 11,
  },
});

export default StatusBadge;
