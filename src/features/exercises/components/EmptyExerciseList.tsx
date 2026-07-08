import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../shared/theme';
import type { MuscleGroupFilter } from '../utils/exerciseListFilters';

type EmptyExerciseListProps = {
  hasExercises: boolean;
  searchText: string;
  selectedMuscleGroup: MuscleGroupFilter;
};

export function EmptyExerciseList({
  hasExercises,
  searchText,
  selectedMuscleGroup,
}: EmptyExerciseListProps) {
  if (hasExercises) {
    const trimmedSearch = searchText.trim();
    const filterLabel =
      selectedMuscleGroup === 'All' ? 'all muscle groups' : selectedMuscleGroup;

    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>No matching exercises</Text>
        <Text style={styles.emptyBody}>
          {trimmedSearch.length > 0
            ? `No active exercises match "${trimmedSearch}" in ${filterLabel}.`
            : `No active exercises match the ${filterLabel} filter.`}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyTitle}>No exercises yet</Text>
      <Text style={styles.emptyBody}>
        Active exercises will appear here after setup.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
    marginTop: theme.spacing.xs,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption,
  },
});
