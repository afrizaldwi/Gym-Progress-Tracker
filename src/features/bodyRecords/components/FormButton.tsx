import { useMemo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { theme } from '../../../shared/theme';

type FormButtonProps = {
  disabled?: boolean;
  label: string;
  onPress(): void;
  variant: 'danger' | 'primary' | 'secondary';
};

export function FormButton({
  disabled,
  label,
  onPress,
  variant,
}: FormButtonProps) {
  const buttonStyle = useMemo(() => {
    if (variant === 'primary') {
      return styles.primaryButton;
    }

    if (variant === 'danger') {
      return styles.dangerButton;
    }

    return styles.secondaryButton;
  }, [variant]);

  const textStyle =
    variant === 'secondary' ? styles.secondaryButtonText : styles.filledButtonText;

  return (
    <Pressable
      disabled={disabled}
      onPress={disabled ? undefined : onPress}
      style={[styles.button, buttonStyle, disabled ? styles.disabledButton : null]}
    >
      <Text style={textStyle}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 112,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  dangerButton: {
    backgroundColor: theme.colors.danger,
  },
  secondaryButton: {
    backgroundColor: theme.colors.surfaceMuted,
  },
  disabledButton: {
    opacity: 0.55,
  },
  filledButtonText: {
    color: theme.colors.surface,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  secondaryButtonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
});
