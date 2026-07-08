import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { theme } from '../../../shared/theme';
import {
  muscleGroupFilters,
  type MuscleGroupFilter,
} from '../utils/exerciseListFilters';

type ExerciseListHeaderProps = {
  placeholderMessage: string | null;
  searchText: string;
  selectedMuscleGroup: MuscleGroupFilter;
  onAddCustomExercise(): void;
  onSearchTextChange(value: string): void;
  onSelectMuscleGroup(value: MuscleGroupFilter): void;
};

export function ExerciseListHeader({
  placeholderMessage,
  searchText,
  selectedMuscleGroup,
  onAddCustomExercise,
  onSearchTextChange,
  onSelectMuscleGroup,
}: ExerciseListHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerTitleRow}>
        <View style={styles.headerTitleText}>
          <Text style={styles.title}>Exercises</Text>
          <Text style={styles.headerSubtitle}>
            Browse active exercises by name or muscle group.
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          style={styles.addButton}
          onPress={onAddCustomExercise}
        >
          <Text style={styles.addButtonText}>Add Custom Exercise</Text>
        </Pressable>
      </View>

      {placeholderMessage ? (
        <View style={styles.placeholderBanner}>
          <Text style={styles.placeholderText}>{placeholderMessage}</Text>
        </View>
      ) : null}

      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
        inputMode="search"
        placeholder="Search exercises"
        placeholderTextColor={theme.colors.textMuted}
        returnKeyType="search"
        style={styles.searchInput}
        value={searchText}
        onChangeText={onSearchTextChange}
      />

      <ScrollView
        horizontal
        keyboardShouldPersistTaps="handled"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterList}
      >
        {muscleGroupFilters.map((filter) => {
          const isSelected = selectedMuscleGroup === filter;

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              key={filter}
              style={[
                styles.filterChip,
                isSelected ? styles.filterChipSelected : null,
              ]}
              onPress={() => onSelectMuscleGroup(filter)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  isSelected ? styles.filterChipTextSelected : null,
                ]}
              >
                {filter}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  headerTitleRow: {
    gap: theme.spacing.md,
  },
  headerTitleText: {
    gap: theme.spacing.xs,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.title,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  addButtonText: {
    color: theme.colors.surface,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  placeholderBanner: {
    backgroundColor: theme.colors.surfaceMuted,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    padding: theme.spacing.md,
  },
  placeholderText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption,
  },
  searchInput: {
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
  filterList: {
    gap: theme.spacing.sm,
    paddingRight: theme.spacing.lg,
  },
  filterChip: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  filterChipSelected: {
    backgroundColor: theme.colors.surfaceMuted,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption,
    fontWeight: '700',
  },
  filterChipTextSelected: {
    color: theme.colors.primary,
  },
});
