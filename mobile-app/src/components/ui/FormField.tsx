import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '@/theme';

// Web: FormField from FormElements.tsx
interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}

export function FormField({ label, error, required, children, hint }: FormFieldProps) {
  return (
    <View style={styles.formField}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      {children}
      {hint && !error && <Text style={styles.hint}>{hint}</Text>}
      {error && (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={14} color={colors.red600} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

// Web: input base style from FormElements.tsx
// w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm
interface InputProps extends React.ComponentProps<typeof TextInput> {
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
}

export function Input({ error, leftIcon, style, ...props }: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.inputContainer, error && styles.inputError, isFocused && styles.inputFocused]}>
      {leftIcon && (
        <Ionicons name={leftIcon} size={20} color={isFocused ? colors.primary600 : colors.slate400} style={styles.leftIcon} />
      )}
      <TextInput
        {...props}
        style={[styles.input, leftIcon && styles.inputWithLeftIcon, style]}
        placeholderTextColor={colors.slate400}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
      />
    </View>
  );
}

// Web: PasswordInput from FormElements.tsx
interface PasswordInputProps extends React.ComponentProps<typeof TextInput> {
  error?: string;
}

export function PasswordInput({ error, ...props }: PasswordInputProps) {
  const [show, setShow] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.inputContainer, error && styles.inputError, isFocused && styles.inputFocused]}>
      <Ionicons name="lock-closed" size={20} color={isFocused ? colors.primary600 : colors.slate400} style={styles.leftIcon} />
      <TextInput
        {...props}
        secureTextEntry={!show}
        style={[styles.input, styles.inputWithLeftIcon, styles.inputWithRightIcon]}
        placeholderTextColor={colors.slate400}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
      />
      <TouchableOpacity onPress={() => setShow(!show)} style={styles.rightButton}>
        <Ionicons name={show ? 'eye-off' : 'eye'} size={20} color={colors.slate400} />
      </TouchableOpacity>
    </View>
  );
}

// Web: Alert from FormElements.tsx
interface AlertProps {
  type: 'error' | 'success' | 'info';
  message: string;
}

export function Alert({ type, message }: AlertProps) {
  const stylesAlert = {
    error: { backgroundColor: colors.red50, borderColor: colors.red100, color: colors.red700 },
    success: { backgroundColor: colors.primary50, borderColor: colors.primary200, color: colors.primary700 },
    info: { backgroundColor: colors.blue50, borderColor: colors.blue100, color: colors.blue700 },
  };

  const style = stylesAlert[type];

  return (
    <View style={[styles.alert, { backgroundColor: style.backgroundColor, borderColor: style.borderColor }]}>
      <Ionicons name="alert-circle" size={16} color={style.color} />
      <Text style={[styles.alertText, { color: style.color }]}>{message}</Text>
    </View>
  );
}

// Web: SectionCard from FormElements.tsx
interface SectionCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function SectionCard({ title, description, children }: SectionCardProps) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionCardHeader}>
        <Text style={styles.sectionCardTitle}>{title}</Text>
        {description && <Text style={styles.sectionCardDescription}>{description}</Text>}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  formField: {
    gap: spacing[1.5],
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: colors.slate700,
  },
  required: {
    color: colors.red600,
  },
  hint: {
    fontSize: 12,
    lineHeight: 16,
    color: colors.slate500,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
  },
  errorText: {
    fontSize: 12,
    lineHeight: 16,
    color: colors.red600,
  },
  // Input styles matching web
  // Web: w-full rounded-lg border border-gray-300 px-3 py-2.5
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.gray300,
    backgroundColor: colors.white,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2.5],
  },
  input: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.slate900,
    padding: 0,
  },
  inputWithLeftIcon: {
    paddingLeft: spacing[2],
  },
  inputWithRightIcon: {
    paddingRight: spacing[8],
  },
  leftIcon: {
    marginRight: spacing[2],
  },
  rightButton: {
    position: 'absolute',
    right: spacing[3],
    padding: spacing[1],
  },
  inputError: {
    borderColor: colors.red400,
    backgroundColor: colors.red50,
  },
  inputFocused: {
    borderColor: colors.primary500,
    // Web: focus:ring-2 focus:ring-primary-100
    shadowColor: colors.primary500,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
  // Alert styles
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  alertText: {
    fontSize: 14,
    lineHeight: 20,
  },
  // SectionCard styles
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.slate100,
    padding: spacing[6],
    ...shadows.xs,
  },
  sectionCardHeader: {
    marginBottom: spacing[6],
  },
  sectionCardTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
    color: colors.slate900,
  },
  sectionCardDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.slate500,
    marginTop: spacing[1],
  },
});

import { shadows } from '@/theme';

export default FormField;  
