import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadows, spacing, typography } from '@/theme';

// Web-exact variants from Button.tsx
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'dark' | 'slate';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
}

export function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
  style,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'right',
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[size],
        styles[variant],
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'primary' || variant === 'dark' || variant === 'slate' ? colors.white : colors.primary600} />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons name={icon} size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} color={getIconColor(variant)} style={styles.iconLeft} />
          )}
          <Text style={[styles.text, styles[`${variant}Text`], styles[`${size}Text`]]}>
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons name={icon} size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} color={getIconColor(variant)} style={styles.iconRight} />
          )}
        </>
      )}
    </Pressable>
  );
}

function getIconColor(variant: ButtonVariant): string {
  switch (variant) {
    case 'primary':
    case 'dark':
    case 'slate':
      return colors.white;
    case 'secondary':
      return colors.gray600;
    case 'outline':
    case 'ghost':
    default:
      return colors.primary600;
  }
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.xl,
    // Web: transition-all
    // Web: focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
  },
  // Sizes matching web (sm, md, lg)
  sm: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    minHeight: 36,
  },
  md: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2.5],
    minHeight: 44,
  },
  lg: {
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    minHeight: 52,
  },
  // Variants matching web Button.tsx
  primary: {
    backgroundColor: colors.primary600,
    ...shadows.primary,
  },
  secondary: {
    backgroundColor: colors.gray600,
  },
  outline: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.primary600,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  dark: {
    backgroundColor: colors.slate900,
    ...shadows.slate,
  },
  slate: {
    backgroundColor: colors.slate900,
    ...shadows.slate,
  },
  // Text styles
  text: {
    fontWeight: '700',
  },
  smText: { fontSize: 14, lineHeight: 20 },
  mdText: { fontSize: 16, lineHeight: 24 },
  lgText: { fontSize: 18, lineHeight: 28 },
  // Text colors per variant
  primaryText: { color: colors.white },
  secondaryText: { color: colors.white },
  outlineText: { color: colors.primary600 },
  ghostText: { color: colors.primary600 },
  darkText: { color: colors.white },
  slateText: { color: colors.white },
  // States
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.5,
  },
  iconLeft: {
    marginRight: spacing[2],
  },
  iconRight: {
    marginLeft: spacing[2],
  },
});

export default Button;
