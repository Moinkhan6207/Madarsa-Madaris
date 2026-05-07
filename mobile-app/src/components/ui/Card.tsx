import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { colors, radius, shadows, spacing } from '@/theme';

export interface CardProps extends ViewProps {
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export function Card({ style, padding = 'lg', ...props }: CardProps) {
  return (
    <View
      {...props}
      style={[
        styles.card,
        padding !== 'none' && { padding: spacing[padding] },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  // Web: bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100
  card: {
    backgroundColor: colors.white,
    borderRadius: radius['3xl'], // rounded-3xl = 24px
    borderWidth: 1,
    borderColor: colors.slate100,
    ...shadows.xs, // shadow-[0_8px_30px_rgb(0,0,0,0.02)]
  },
});

export default Card;
