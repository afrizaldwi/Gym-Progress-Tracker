import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useMemo, useState } from 'react';

import { theme } from '../../shared/theme';
import { AppScreen } from '../../shared/components/AppScreen';
import { useExercises } from './hooks/useExercises';
import type { Exercise } from './types';

type ExerciseSection = {
  data: Exercise[];
  title: string;
};

const muscleGroupFilters = [
  'All',
  'Chest',
  'Back',
  'Shoulder',
  'Legs',
  'Biceps',
  'Triceps',
  'Core',
  'Other',
] as const;

type MuscleGroupFilter = (typeof muscleGroupFilters)[number];

export function ExerciseListScreen() {
  const { error, exercises, isLoading, refresh } = useExercises();
  const [searchText, setSearchText] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] =
    useState<MuscleGroupFilter>('All');
  const [placeholderMessage, setPlaceholderMessage] = useState<string | null>(
    null
  );
  const filteredExercises = useMemo(
    () => filterExercises(exercises, searchText, selectedMuscleGroup),
    [exercises, searchText, selectedMuscleGroup]
  );
  const sections = useMemo(
    () => groupExercisesByMuscleGroup(filteredExercises),
    [filteredExercises]
  );

  if (isLoading && exercises.length === 0) {
    return (
      <AppScreen>
        <Text style={styles.title}>Exercises</Text>
        <Text style={styles.body}>Loading exercises...</Text>
      </AppScreen>
    );
  }

  if (error && exercises.length === 0) {
    return (
      <AppScreen>
        <Text style={styles.title}>Exercises</Text>
        <Text style={styles.body}>Could not load exercises.</Text>
        <Pressable style={styles.retryButton} onPress={() => void refresh()}>
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      </AppScreen>
    );
  }

  return (
    <AppScreen contentStyle={styles.screenContent}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <EmptyExerciseList
            hasExercises={exercises.length > 0}
            searchText={searchText}
            selectedMuscleGroup={selectedMuscleGroup}
          />
        }
        ListHeaderComponent={
          <ExerciseListHeader
            placeholderMessage={placeholderMessage}
            searchText={searchText}
            selectedMuscleGroup={selectedMuscleGroup}
            onAddCustomExercise={() => {
              const message = 'Custom exercise form will be added next.';
              setPlaceholderMessage(message);
              Alert.alert('Coming soon', message);
            }}
            onSearchTextChange={setSearchText}
            onSelectMuscleGroup={setSelectedMuscleGroup}
          />
        }
        ItemSeparatorComponent={ItemSeparator}
        SectionSeparatorComponent={SectionSeparator}
        renderItem={({ item }) => <ExerciseRow exercise={item} />}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionHeader}>{section.title}</Text>
        )}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && exercises.length > 0}
            onRefresh={() => void refresh()}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        contentContainerStyle={styles.listContent}
      />
    </AppScreen>
  );
}

function filterExercises(
  exercises: Exercise[],
  searchText: string,
  selectedMuscleGroup: MuscleGroupFilter
): Exercise[] {
  const normalizedSearch = searchText.trim().toLocaleLowerCase();

  return exercises.filter((exercise) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      exercise.name.toLocaleLowerCase().includes(normalizedSearch);
    const matchesMuscleGroup =
      selectedMuscleGroup === 'All' ||
      exercise.muscleGroup.toLocaleLowerCase() ===
        selectedMuscleGroup.toLocaleLowerCase();

    return matchesSearch && matchesMuscleGroup;
  });
}

function groupExercisesByMuscleGroup(exercises: Exercise[]): ExerciseSection[] {
  const sectionsByMuscleGroup = new Map<string, Exercise[]>();

  for (const exercise of exercises) {
    const muscleGroup = exercise.muscleGroup;
    const groupExercises = sectionsByMuscleGroup.get(muscleGroup) ?? [];
    groupExercises.push(exercise);
    sectionsByMuscleGroup.set(muscleGroup, groupExercises);
  }

  return Array.from(sectionsByMuscleGroup, ([title, data]) => ({
    data,
    title,
  }));
}

type ExerciseListHeaderProps = {
  placeholderMessage: string | null;
  searchText: string;
  selectedMuscleGroup: MuscleGroupFilter;
  onAddCustomExercise(): void;
  onSearchTextChange(value: string): void;
  onSelectMuscleGroup(value: MuscleGroupFilter): void;
};

function ExerciseListHeader({
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

type EmptyExerciseListProps = {
  hasExercises: boolean;
  searchText: string;
  selectedMuscleGroup: MuscleGroupFilter;
};

function EmptyExerciseList({
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

function ExerciseRow({ exercise }: { exercise: Exercise }) {
  return (
    <View style={styles.card}>
      <Text style={styles.exerciseName}>{exercise.name}</Text>
      {exercise.equipment ? (
        <Text style={styles.exerciseEquipment}>{exercise.equipment}</Text>
      ) : null}
    </View>
  );
}

function ItemSeparator() {
  return <View style={styles.separator} />;
}

function SectionSeparator() {
  return <View style={styles.sectionSeparator} />;
}

const styles = StyleSheet.create({
  screenContent: {
    padding: 0,
  },
  listContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
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
  sectionHeader: {
    backgroundColor: theme.colors.background,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption,
    fontWeight: '700',
    paddingBottom: theme.spacing.sm,
    paddingTop: theme.spacing.md,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.title,
    fontWeight: '700',
  },
  body: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
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
  retryButton: {
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
    marginTop: theme.spacing.md,
  },
  retryText: {
    color: theme.colors.primary,
    fontSize: theme.typography.body,
    fontWeight: '700',
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
    marginTop: theme.spacing.xs,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    padding: theme.spacing.md,
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
  separator: {
    height: theme.spacing.sm,
  },
  sectionSeparator: {
    height: theme.spacing.sm,
  },
});
