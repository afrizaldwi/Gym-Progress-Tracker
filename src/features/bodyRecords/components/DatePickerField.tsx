import DateTimePicker from '@react-native-community/datetimepicker';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { theme } from '../../../shared/theme';
import {
  dateOnlyToLocalDate,
  formatDateOnly,
} from '../utils/dateFormatting';

type DatePickerFieldProps = {
  error?: string;
  isPickerVisible: boolean;
  onChange(recordDate: string): void;
  onOpen(): void;
  onPickerVisibilityChange(isVisible: boolean): void;
  value: string;
};

export function DatePickerField({
  error,
  isPickerVisible,
  onChange,
  onOpen,
  onPickerVisibilityChange,
  value,
}: DatePickerFieldProps) {
  const handlePickerChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    onPickerVisibilityChange(false);

    if (event.type !== 'set' || !selectedDate) {
      return;
    }

    onChange(formatDateOnly(selectedDate));
  };

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>Date</Text>
      <Pressable
        onPress={onOpen}
        style={[styles.dateField, error ? styles.inputError : null]}
      >
        <Text style={styles.dateFieldText}>{value}</Text>
        <Text style={styles.dateFieldAction}>Pick date</Text>
      </Pressable>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {isPickerVisible ? (
        <DateTimePicker
          mode="date"
          onChange={handlePickerChange}
          value={dateOnlyToLocalDate(value)}
        />
      ) : null}
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
  dateField: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'space-between',
    minHeight: 44,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  inputError: {
    borderColor: theme.colors.danger,
  },
  dateFieldText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  dateFieldAction: {
    color: theme.colors.primary,
    fontSize: theme.typography.caption,
    fontWeight: '700',
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.typography.caption,
  },
});
