import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../shared/theme';
import type { BodyRecordFormValues } from '../validators';
import { DatePickerField } from './DatePickerField';
import { FormButton } from './FormButton';
import { FormTextInput } from './FormTextInput';

type FormErrors = Partial<Record<keyof BodyRecordFormValues, string>>;

type BodyRecordFormProps = {
  errors: FormErrors;
  isDatePickerVisible: boolean;
  isEditing: boolean;
  isSaving: boolean;
  onCancel(): void;
  onChange(values: BodyRecordFormValues): void;
  onDateChange(recordDate: string): void;
  onDatePickerVisibilityChange(isVisible: boolean): void;
  onOpenDatePicker(): void;
  onSubmit(): void;
  primaryActionLabel: string;
  title: string;
  values: BodyRecordFormValues;
};

export function BodyRecordForm({
  errors,
  isDatePickerVisible,
  isEditing,
  isSaving,
  onCancel,
  onChange,
  onDateChange,
  onDatePickerVisibilityChange,
  onOpenDatePicker,
  onSubmit,
  primaryActionLabel,
  title,
  values,
}: BodyRecordFormProps) {
  return (
    <View style={styles.formCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <DatePickerField
        error={errors.recordDate}
        isPickerVisible={isDatePickerVisible}
        onChange={onDateChange}
        onOpen={onOpenDatePicker}
        onPickerVisibilityChange={onDatePickerVisibilityChange}
        value={values.recordDate}
      />
      <FormTextInput
        error={errors.bodyWeightText}
        keyboardType="decimal-pad"
        label="Body weight (kg)"
        onChangeText={(bodyWeightText) =>
          onChange({ ...values, bodyWeightText })
        }
        placeholder="72.5"
        value={values.bodyWeightText}
      />
      <FormTextInput
        label="Notes"
        multiline
        onChangeText={(notesText) => onChange({ ...values, notesText })}
        placeholder="Optional"
        value={values.notesText}
      />
      <View style={styles.actionRow}>
        {isEditing ? (
          <FormButton
            disabled={isSaving}
            label="Cancel"
            onPress={onCancel}
            variant="secondary"
          />
        ) : null}
        <FormButton
          disabled={isSaving}
          label={isSaving ? 'Saving...' : primaryActionLabel}
          onPress={onSubmit}
          variant="primary"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  formCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    gap: theme.spacing.md,
    padding: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    justifyContent: 'flex-end',
  },
});
