import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../shared/theme';
import type { Exercise } from '../types';

type ExerciseListItemProps = {
  disabled: boolean;
  exercise: Exercise;
  onEdit(exercise: Exercise): void;
  onRemove(exercise: Exercise): void;
};

export function ExerciseListItem({
  disabled,
  exercise,
  onEdit,
  onRemove,
}: ExerciseListItemProps) {
  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        {exercise.equipment ? (
          <Text style={styles.exerciseEquipment}>{exercise.equipment}</Text>
        ) : null}
      </View>
      {exercise.isCustom ? (
        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            disabled={disabled}
            style={[styles.actionButton, disabled ? styles.disabled : null]}
            onPress={() => onEdit(exercise)}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={disabled}
            style={[styles.actionButton, disabled ? styles.disabled : null]}
            onPress={() => onRemove(exercise)}
          >
            <Text style={styles.removeButtonText}>Remove</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
  },
  content: {
    flex: 1,
  },
  exerciseName: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  exerciseEquipment: {
    marginTop: theme.spacing.xs,
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
  },
  actions: {
    alignItems: 'flex-end',
  },
  actionButton: {
    alignItems: 'center',
    borderRadius: theme.radius.sm,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: theme.spacing.sm,
  },
  editButtonText: {
    color: theme.colors.primary,
    fontSize: theme.typography.caption,
    fontWeight: '700',
  },
  removeButtonText: {
    color: theme.colors.danger,
    fontSize: theme.typography.caption,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.6,
  },
});
