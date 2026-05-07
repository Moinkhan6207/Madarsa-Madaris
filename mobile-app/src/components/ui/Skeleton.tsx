import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius } from '@/theme';

// Web: Skeleton from Skeleton.tsx
// animate-pulse rounded-md bg-slate-100
interface SkeletonProps {
  width?: number | string;
  height?: number;
  circle?: boolean;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 16, circle = false, borderRadius, style }: SkeletonProps) {
  const size = circle && typeof width === 'number' ? width : (height as number);
  const computedBorderRadius = borderRadius ?? (circle ? (typeof width === 'number' ? width / 2 : 9999) : radius.md);
  return (
    <View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height: size,
          borderRadius: computedBorderRadius,
        },
        style,
      ]}
    />
  );
}

// Web: SkeletonLoader from FormElements.tsx
interface SkeletonLoaderProps {
  rows?: number;
}

export function SkeletonLoader({ rows = 4 }: SkeletonLoaderProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: rows }).map((_, i) => (
        <View key={i} style={styles.row}>
          <Skeleton width={96} height={12} style={styles.label} />
          <Skeleton height={40} style={styles.input} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.slate100,
  },
  container: {
    gap: 16,
  },
  row: {
    gap: 8,
  },
  label: {
    marginBottom: 4,
  },
  input: {
    borderRadius: radius.lg,
  },
});

export default Skeleton;
