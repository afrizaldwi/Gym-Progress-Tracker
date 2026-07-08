import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { theme } from '../../../shared/theme';
import type { CustomExerciseInput, Exercise } from '../types';
import { ExerciseMuscleGroupPicker } from './ExerciseMuscleGroupPicker';

type CustomExerciseFormProps = {
  errorMessage: string | null;
  exercise: Exercise | null;
  isSaving: boolean;
  mode: 'create' | 'edit';
  visible: boolean;
  onCancel(): void;
  onSubmit(input: CustomExerciseInput): Promise<void>;
};

type ValidationErrors = {
  muscleGroup?: string;
  name?: string;
};

export function CustomExerciseForm({
  errorMessage,
  exercise,
  isSaving,
  mode,
  visible,
  onCancel,
  onSubmit,
}: CustomExerciseFormProps) {
  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('');
  const [equipment, setEquipment] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    if (!visible) {
      return;
    }

    setName(exercise?.name ?? '');
    setMuscleGroup(exercise?.muscleGroup ?? '');
    setEquipment(exercise?.equipment ?? '');
    setValidationErrors({});
  }, [exercise, visible]);

  const title = mode === 'create' ? 'Add Custom Exercise' : 'Edit Exercise';
  const saveLabel = mode === 'create' ? 'Save Exercise' : 'Save Changes';

  return (
    <Modal
      animationType="slide"
      onRequestClose={onCancel}
      transparent
      visible={visible}
    >
      <View style={styles.overlay}>
        <View style={styles.panel}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.title}>{title}</Text>

            {errorMessage ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            <View style={styles.field}>
              <Text style={styles.label}>Exercise name</Text>
              <TextInput
                autoCapitalize="words"
                editable={!isSaving}
                placeholder="Example: Incline Dumbbell Press"
                placeholderTextColor={theme.colors.textMuted}
                style={[
                  styles.input,
                  validationErrors.name ? styles.inputError : null,
                ]}
                value={name}
                onChangeText={setName}
              />
              {validationErrors.name ? (
                <Text style={styles.validationText}>{validationErrors.name}</Text>
              ) : null}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Muscle group</Text>
              <ExerciseMuscleGroupPicker
                disabled={isSaving}
                selectedMuscleGroup={muscleGroup}
                onSelectMuscleGroup={setMuscleGroup}
              />
              {validationErrors.muscleGroup ? (
                <Text style={styles.validationText}>
                  {validationErrors.muscleGroup}
                </Text>
              ) : null}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Equipment type</Text>
              <TextInput
                autoCapitalize="words"
                editable={!isSaving}
                placeholder="Optional"
                placeholderTextColor={theme.colors.textMuted}
                style={styles.input}
                value={equipment}
                onChangeText={setEquipment}
              />
            </View>

            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                disabled={isSaving}
                style={[styles.cancelButton, isSaving ? styles.disabled : null]}
                onPress={onCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={isSaving}
                style={[styles.saveButton, isSaving ? styles.disabled : null]}
                onPress={() => void handleSubmit()}
              >
                <Text style={styles.saveButtonText}>
                  {isSaving ? 'Saving...' : saveLabel}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  async function handleSubmit() {
    const trimmedName = name.trim();
    const trimmedMuscleGroup = muscleGroup.trim();
    const trimmedEquipment = equipment.trim();
    const nextErrors: ValidationErrors = {};

    if (!trimmedName) {
      nextErrors.name = 'Enter exercise name.';
    }

    if (!trimmedMuscleGroup) {
      nextErrors.muscleGroup = 'Choose a muscle group.';
    }

    setValidationErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await onSubmit({
      equipment: trimmedEquipment ? trimmedEquipment : null,
      muscleGroup: trimmedMuscleGroup,
      name: trimmedName,
    });
  }
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: `${theme.colors.textPrimary}47`,
  },
  panel: {
    maxHeight: '92%',
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    padding: theme.spacing.lg,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.title,
    fontWeight: '700',
    marginBottom: theme.spacing.md,
  },
  errorBanner: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.danger,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.typography.caption,
  },
  field: {
    marginBottom: theme.spacing.md,
  },
  label: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    fontWeight: '700',
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    minHeight: 48,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  inputError: {
    borderColor: theme.colors.danger,
  },
  validationText: {
    color: theme.colors.danger,
    fontSize: theme.typography.caption,
    marginTop: theme.spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
  },
  cancelButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.md,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: theme.spacing.md,
  },
  cancelButtonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: theme.spacing.md,
  },
  saveButtonText: {
    color: theme.colors.surface,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.6,
  },
});
