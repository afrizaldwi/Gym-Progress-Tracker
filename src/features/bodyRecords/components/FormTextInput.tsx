import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { ComponentProps } from 'react';

import { theme } from '../../../shared/theme';

type FormTextInputProps = {
  error?: string;
  label: string;
} & ComponentProps<typeof TextInput>;

export function FormTextInput({
  error,
  label,
  ...textInputProps
}: FormTextInputProps) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        {...textInputProps}
        placeholderTextColor={theme.colors.textMuted}
        style={[styles.input, error ? styles.inputError : null, textInputProps.style]}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  inputGroup: {
    gap: theme.spacing.xs,
  },
  inputLabel: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.caption,
    fontWeight: '700',
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    minHeight: 44,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  inputError: {
    borderColor: theme.colors.danger,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.typography.caption,
  },
});
