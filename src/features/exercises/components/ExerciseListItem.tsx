import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../shared/theme';
import type { Exercise } from '../types';

type ExerciseListItemProps = {
  exercise: Exercise;
  onEdit(exercise: Exercise): void;
};

export function ExerciseListItem({ exercise, onEdit }: ExerciseListItemProps) {
  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        {exercise.equipment ? (
          <Text style={styles.exerciseEquipment}>{exercise.equipment}</Text>
        ) : null}
      </View>
      {exercise.isCustom ? (
        <Pressable
          accessibilityRole="button"
          style={styles.editButton}
          onPress={() => onEdit(exercise)}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </Pressable>
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
  editButton: {
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
});
