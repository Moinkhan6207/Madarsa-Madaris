import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '@/theme';

const STEPS = [
  { id: 'profile', label: 'Profile', stepKey: 'profileStep' },
  { id: 'branding', label: 'Branding', stepKey: 'brandingStep' },
  { id: 'branches', label: 'Branches', stepKey: 'branchStep' },
  { id: 'session', label: 'Session', stepKey: 'sessionStep' },
  { id: 'review', label: 'Review', stepKey: 'finalizationStep' },
] as const;

type StepStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';

interface SetupStepProgressProps {
  currentStep: string;
  statusMap: Record<string, StepStatus>;
  onStepPress?: (stepId: string) => void;
}

export default function SetupStepProgress({ currentStep, statusMap, onStepPress }: SetupStepProgressProps) {
  return (
    <View style={styles.container}>
      <View style={styles.stepsRow}>
        {STEPS.map((step, idx) => {
          const status = statusMap[step.stepKey] ?? 'NOT_STARTED';
          const isCurrent = step.id === currentStep;
          const isCompleted = status === 'COMPLETED' || status === 'SKIPPED';
          const isLast = idx === STEPS.length - 1;
          const isAccessible = isCompleted || isCurrent;

          return (
            <React.Fragment key={step.id}>
              <Pressable
                style={styles.stepItem}
                onPress={() => onStepPress?.(step.id)}
                disabled={!isAccessible || !onStepPress}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <View
                  style={[
                    styles.circle,
                    isCompleted && styles.circleCompleted,
                    isCurrent && styles.circleCurrent,
                    !isAccessible && styles.circleDisabled,
                  ]}
                >
                  {isCompleted ? (
                    <Ionicons name="checkmark" size={14} color={colors.white} />
                  ) : (
                    <Text
                      style={[
                        styles.circleText,
                        isCurrent && styles.circleTextCurrent,
                        isCompleted && styles.circleTextCompleted,
                        !isAccessible && styles.circleTextDisabled,
                      ]}
                    >
                      {idx + 1}
                    </Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.label,
                    isCurrent && styles.labelCurrent,
                    isCompleted && styles.labelCompleted,
                    !isAccessible && styles.labelDisabled,
                  ]}
                  numberOfLines={1}
                >
                  {step.label}
                </Text>
              </Pressable>
              {!isLast && (
                <View
                  style={[
                    styles.connector,
                    isCompleted && styles.connectorCompleted,
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.slate300,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleCompleted: {
    backgroundColor: colors.primary600,
    borderColor: colors.primary600,
  },
  circleCurrent: {
    borderColor: colors.primary600,
    backgroundColor: colors.white,
    shadowColor: colors.primary600,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  circleText: {
    ...typography.small,
    color: colors.slate400,
    fontWeight: '800',
  },
  circleTextCurrent: {
    color: colors.primary600,
  },
  circleTextCompleted: {
    color: colors.white,
  },
  label: {
    ...typography.small,
    color: colors.slate400,
    marginTop: spacing.xs,
    fontWeight: '600',
    fontSize: 10,
  },
  labelCurrent: {
    color: colors.primary700,
    fontWeight: '800',
  },
  labelCompleted: {
    color: colors.primary600,
    fontWeight: '700',
  },
  connector: {
    flex: 1,
    height: 2,
    backgroundColor: colors.slate200,
    marginTop: 15,
    marginHorizontal: 4,
  },
  connectorCompleted: {
    backgroundColor: colors.primary500,
  },
  circleDisabled: {
    borderColor: colors.slate200,
    backgroundColor: colors.slate100,
    opacity: 0.6,
  },
  circleTextDisabled: {
    color: colors.slate300,
  },
  labelDisabled: {
    color: colors.slate300,
  },
});
