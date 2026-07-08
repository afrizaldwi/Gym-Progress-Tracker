import { useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { theme } from '../../shared/theme';
import { AppScreen } from '../../shared/components/AppScreen';
import { BodyRecordForm } from './components/BodyRecordForm';
import { BodyRecordRow } from './components/BodyRecordRow';
import { EmptyState } from './components/EmptyState';
import { useBodyRecords } from './hooks/useBodyRecords';
import type { BodyRecord, BodyRecordInput } from './types';
import { formatDateOnly } from './utils/dateFormatting';
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
          onDateChange={(recordDate) => {
            setFormValues((currentValues) => ({
              ...currentValues,
              recordDate,
            }));
          }}
          onDatePickerVisibilityChange={setIsDatePickerVisible}
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
  metaText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
  },
});
