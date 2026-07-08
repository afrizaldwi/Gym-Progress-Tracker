import {
  Alert,
  Pressable,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useMemo, useState } from 'react';

import { theme } from '../../shared/theme';
import { AppScreen } from '../../shared/components/AppScreen';
import { EmptyExerciseList } from './components/EmptyExerciseList';
import { ExerciseListHeader } from './components/ExerciseListHeader';
import { useExercises } from './hooks/useExercises';
import type { Exercise } from './types';
import {
  filterExercises,
  type MuscleGroupFilter,
} from './utils/exerciseListFilters';

type ExerciseSection = {
  data: Exercise[];
  title: string;
};

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
