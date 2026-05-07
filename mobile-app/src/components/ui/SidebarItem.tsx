import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '@/theme';

export default function SidebarItem({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.item, active ? styles.active : styles.normal, pressed && styles.pressed]}>
      <Ionicons name={icon} size={20} color={active ? colors.white : colors.slate400} />
      <Text style={[styles.text, active ? styles.activeText : styles.normalText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    borderRadius: radius.xl,
  },
  active: { backgroundColor: colors.primary600 },
  normal: { backgroundColor: 'transparent' },
  activeText: { color: colors.white },
  normalText: { color: colors.slate500 },
  text: { ...typography.small, fontWeight: '800' },
  pressed: { opacity: 0.9 },
});
