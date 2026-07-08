import { useMemo, useState } from 'react';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { theme } from '../../shared/theme';
import { AppScreen } from '../../shared/components/AppScreen';
import { useBodyRecords } from './hooks/useBodyRecords';
import type { BodyRecord, BodyRecordInput } from './types';
import {
  type BodyRecordFormValues,
  validateBodyRecordForm,
} from './validators';

type FormErrors = Partial<Record<keyof BodyRecordFormValues, string>>;

function createDefaultFormValues(): BodyRecordFormValues {
  return {
    bodyWeightText: '',
    notesText: '',
    recordDate: formatDateOnly(new Date()),
  };
}

export function BodyRecordsScreen() {
  const {
    add,
    deleteRecord,
    error,
    findByDate,
    isLoading,
    isSaving,
    records,
    refresh,
    replaceExistingByDate,
    update,
    updateWithDateReplacement,
  } = useBodyRecords();
  const [editingRecord, setEditingRecord] = useState<BodyRecord | null>(null);
  const [formValues, setFormValues] =
    useState<BodyRecordFormValues>(createDefaultFormValues);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const isEditing = editingRecord !== null;

  const formTitle = isEditing ? 'Edit body record' : 'Add body record';
  const primaryActionLabel = isEditing ? 'Save changes' : 'Add record';

  const handleSubmit = async () => {
    const validation = validateBodyRecordForm(formValues);

    if (!validation.ok) {
      setFormErrors(validation.errors);
      return;
    }

    setFormErrors({});

    if (isEditing) {
      await submitEdit(editingRecord, validation.input);
      return;
    }

    await submitAdd(validation.input);
  };

  const submitAdd = async (input: BodyRecordInput) => {
    const existingRecord = await findByDate(input.recordDate);

    if (!existingRecord) {
      await add(input);
      resetForm();
      return;
    }

    Alert.alert(
      'Replace body record?',
      `A body record already exists for ${input.recordDate}. Replace it with these values?`,
      [
        {
          style: 'cancel',
          text: 'Cancel',
        },
        {
          onPress: () => {
            void replaceExistingByDate(input).then(resetForm).catch(() => undefined);
          },
          text: 'Replace',
        },
      ]
    );
  };

  const submitEdit = async (
    sourceRecord: BodyRecord,
    input: BodyRecordInput
  ) => {
    if (input.recordDate === sourceRecord.recordDate) {
      await update(sourceRecord.id, input);
      resetForm();
      return;
    }

    const targetDateRecord = await findByDate(input.recordDate);

    if (!targetDateRecord) {
      await update(sourceRecord.id, input);
      resetForm();
      return;
    }

    if (targetDateRecord.id === sourceRecord.id) {
      await update(sourceRecord.id, input);
      resetForm();
      return;
    }

    Alert.alert(
      'Replace body record?',
      'A bodyweight record already exists for this date. Replace it with this edited record?',
      [
        {
          style: 'cancel',
          text: 'Cancel',
        },
        {
          onPress: () => {
            void updateWithDateReplacement(
              sourceRecord.id,
              targetDateRecord.id,
              input
            )
              .then(resetForm)
              .catch(() => undefined);
          },
          text: 'Replace',
        },
      ]
    );
  };

  const startEditing = (record: BodyRecord) => {
    setEditingRecord(record);
    setFormErrors({});
    setFormValues({
      bodyWeightText: String(record.bodyWeight),
      notesText: record.notes ?? '',
      recordDate: record.recordDate,
    });
  };

  const resetForm = () => {
    setEditingRecord(null);
    setFormErrors({});
    setFormValues(createDefaultFormValues());
  };

  const confirmDelete = (record: BodyRecord) => {
    Alert.alert(
      'Delete body record?',
      `Delete the ${record.recordDate} body record? This cannot be undone.`,
      [
        {
          style: 'cancel',
          text: 'Cancel',
        },
        {
          onPress: () => {
            void deleteRecord(record.id)
              .then(() => {
                if (editingRecord?.id === record.id) {
                  resetForm();
                }
              })
              .catch(() => undefined);
          },
          style: 'destructive',
          text: 'Delete',
        },
      ]
    );
  };

  return (
    <AppScreen contentStyle={styles.screenContent}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isLoading && records.length > 0}
            onRefresh={() => void refresh()}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        <Text style={styles.title}>Body records</Text>
        <BodyRecordForm
          errors={formErrors}
          isEditing={isEditing}
          isSaving={isSaving}
          isDatePickerVisible={isDatePickerVisible}
          onCancel={resetForm}
          onChange={setFormValues}
          onDatePickerChange={(event, selectedDate) => {
            setIsDatePickerVisible(false);

            if (event.type !== 'set' || !selectedDate) {
              return;
            }

            setFormValues((currentValues) => ({
              ...currentValues,
              recordDate: formatDateOnly(selectedDate),
            }));
          }}
          onOpenDatePicker={() => setIsDatePickerVisible(true)}
          onSubmit={() => {
            void handleSubmit().catch(() => undefined);
          }}
          primaryActionLabel={primaryActionLabel}
          title={formTitle}
          values={formValues}
        />

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Something went wrong</Text>
            <Text style={styles.errorText}>
              Could not save or load body records. Please try again.
            </Text>
          </View>
        ) : null}

        <View style={styles.historyHeader}>
          <Text style={styles.sectionTitle}>History</Text>
          {isLoading && records.length === 0 ? (
            <Text style={styles.metaText}>Loading...</Text>
          ) : null}
        </View>

        {records.length === 0 && !isLoading ? <EmptyState /> : null}

        {records.map((record) => (
          <BodyRecordRow
            key={record.id}
            isActive={editingRecord?.id === record.id}
            onDelete={confirmDelete}
            onEdit={startEditing}
            record={record}
          />
        ))}
      </ScrollView>
    </AppScreen>
  );
}

function BodyRecordForm({
  errors,
  isEditing,
  isSaving,
  isDatePickerVisible,
  onCancel,
  onChange,
  onDatePickerChange,
  onOpenDatePicker,
  onSubmit,
  primaryActionLabel,
  title,
  values,
}: {
  errors: FormErrors;
  isEditing: boolean;
  isSaving: boolean;
  isDatePickerVisible: boolean;
  onCancel(): void;
  onChange(values: BodyRecordFormValues): void;
  onDatePickerChange(event: DateTimePickerEvent, selectedDate?: Date): void;
  onOpenDatePicker(): void;
  onSubmit(): void;
  primaryActionLabel: string;
  title: string;
  values: BodyRecordFormValues;
}) {
  return (
    <View style={styles.formCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <DatePickerField
        error={errors.recordDate}
        isPickerVisible={isDatePickerVisible}
        onChange={onDatePickerChange}
        onOpen={onOpenDatePicker}
        value={values.recordDate}
      />
      <AppTextInput
        error={errors.bodyWeightText}
        keyboardType="decimal-pad"
        label="Body weight (kg)"
        onChangeText={(bodyWeightText) =>
          onChange({ ...values, bodyWeightText })
        }
        placeholder="72.5"
        value={values.bodyWeightText}
      />
      <AppTextInput
        label="Notes"
        multiline
        onChangeText={(notesText) => onChange({ ...values, notesText })}
        placeholder="Optional"
        value={values.notesText}
      />
      <View style={styles.actionRow}>
        {isEditing ? (
          <AppButton
            disabled={isSaving}
            label="Cancel"
            onPress={onCancel}
            variant="secondary"
          />
        ) : null}
        <AppButton
          disabled={isSaving}
          label={isSaving ? 'Saving...' : primaryActionLabel}
          onPress={onSubmit}
          variant="primary"
        />
      </View>
    </View>
  );
}

function DatePickerField({
  error,
  isPickerVisible,
  onChange,
  onOpen,
  value,
}: {
  error?: string;
  isPickerVisible: boolean;
  onChange(event: DateTimePickerEvent, selectedDate?: Date): void;
  onOpen(): void;
  value: string;
}) {
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
          onChange={onChange}
          value={dateOnlyToLocalDate(value)}
        />
      ) : null}
    </View>
  );
}

function AppTextInput({
  error,
  label,
  ...textInputProps
}: {
  error?: string;
  label: string;
} & React.ComponentProps<typeof TextInput>) {
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

function AppButton({
  disabled,
  label,
  onPress,
  variant,
}: {
  disabled?: boolean;
  label: string;
  onPress(): void;
  variant: 'danger' | 'primary' | 'secondary';
}) {
  const buttonStyle = useMemo(() => {
    if (variant === 'primary') {
      return styles.primaryButton;
    }

    if (variant === 'danger') {
      return styles.dangerButton;
    }

    return styles.secondaryButton;
  }, [variant]);

  const textStyle = variant === 'secondary' ? styles.secondaryButtonText : styles.filledButtonText;

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

function EmptyState() {
  return (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyTitle}>No body records yet</Text>
      <Text style={styles.emptyBody}>
        Add your first body weight entry to start tracking changes.
      </Text>
    </View>
  );
}

function BodyRecordRow({
  isActive,
  onDelete,
  onEdit,
  record,
}: {
  isActive: boolean;
  onDelete(record: BodyRecord): void;
  onEdit(record: BodyRecord): void;
  record: BodyRecord;
}) {
  return (
    <View style={[styles.recordCard, isActive ? styles.activeRecordCard : null]}>
      <View style={styles.recordHeader}>
        <View>
          <Text style={styles.recordDate}>{record.recordDate}</Text>
          <Text style={styles.metaText}>
            Updated {formatLocalDateTime(record.updatedAt)}
          </Text>
        </View>
        <Text style={styles.recordWeight}>{formatBodyWeight(record.bodyWeight)} kg</Text>
      </View>
      {record.notes ? <Text style={styles.notes}>{record.notes}</Text> : null}
      <View style={styles.rowActions}>
        <Pressable
          disabled={isActive}
          onPress={() => onEdit(record)}
          style={styles.textAction}
        >
          <Text style={[styles.textActionText, isActive ? styles.disabledText : null]}>
            Edit
          </Text>
        </Pressable>
        <Pressable onPress={() => onDelete(record)} style={styles.textAction}>
          <Text style={styles.deleteActionText}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

function formatBodyWeight(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function formatDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function dateOnlyToLocalDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);

  if (!year || !month || !day) {
    return new Date();
  }

  return new Date(year, month - 1, day);
}

function formatLocalDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

const styles = StyleSheet.create({
  screenContent: {
    padding: 0,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.title,
    fontWeight: '700',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    gap: theme.spacing.md,
    padding: theme.spacing.md,
  },
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
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    justifyContent: 'flex-end',
  },
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
  errorCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.danger,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
  },
  errorTitle: {
    color: theme.colors.danger,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.typography.caption,
  },
  historyHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  emptyCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    padding: theme.spacing.md,
  },
  emptyTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  emptyBody: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption,
    marginTop: theme.spacing.xs,
  },
  recordCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    marginTop: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  activeRecordCard: {
    borderColor: theme.colors.primary,
  },
  recordHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'space-between',
  },
  recordDate: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  recordWeight: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  metaText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
  },
  notes: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
    marginTop: theme.spacing.sm,
  },
  rowActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'flex-end',
    marginTop: theme.spacing.sm,
  },
  textAction: {
    minHeight: 44,
    justifyContent: 'center',
  },
  textActionText: {
    color: theme.colors.primary,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  deleteActionText: {
    color: theme.colors.danger,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  disabledText: {
    color: theme.colors.textMuted,
  },
});
