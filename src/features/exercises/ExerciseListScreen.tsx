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
import { CustomExerciseForm } from './components/CustomExerciseForm';
import { EmptyExerciseList } from './components/EmptyExerciseList';
import { ExerciseListHeader } from './components/ExerciseListHeader';
import { ExerciseListItem } from './components/ExerciseListItem';
import { useExerciseRemoval } from './hooks/useExerciseRemoval';
import { useExercises } from './hooks/useExercises';
import type { CustomExerciseInput, Exercise } from './types';
import {
  filterExercises,
  type MuscleGroupFilter,
} from './utils/exerciseListFilters';

type ExerciseSection = {
  data: Exercise[];
  title: string;
};

type FormState =
  | { mode: 'create'; exercise: null }
  | { mode: 'edit'; exercise: Exercise };

export function ExerciseListScreen() {
  const {
    archiveUsedExercise,
    createCustomExercise,
    deleteUnusedCustomExercise,
    error,
    exercises,
    hasWorkoutHistory,
    isLoading,
    isSaving,
    refresh,
    updateCustomExercise,
  } = useExercises();
  const [searchText, setSearchText] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] =
    useState<MuscleGroupFilter>('All');
  const [formState, setFormState] = useState<FormState | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const { confirmRemoveExercise } = useExerciseRemoval({
    archiveUsedExercise,
    deleteUnusedCustomExercise,
    hasWorkoutHistory,
  });
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
      <CustomExerciseForm
        errorMessage={formError}
        exercise={formState?.exercise ?? null}
        isSaving={isSaving}
        mode={formState?.mode ?? 'create'}
        visible={formState !== null}
        onCancel={closeForm}
        onSubmit={handleSaveExercise}
      />
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
            searchText={searchText}
            selectedMuscleGroup={selectedMuscleGroup}
            onAddCustomExercise={openCreateForm}
            onSearchTextChange={setSearchText}
            onSelectMuscleGroup={setSelectedMuscleGroup}
          />
        }
        ItemSeparatorComponent={ItemSeparator}
        SectionSeparatorComponent={SectionSeparator}
        renderItem={({ item }) => (
          <ExerciseListItem
            disabled={isSaving}
            exercise={item}
            onEdit={openEditForm}
            onRemove={(exercise) => void confirmRemoveExercise(exercise)}
          />
        )}
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

  function openCreateForm() {
    setFormError(null);
    setFormState({ mode: 'create', exercise: null });
  }

  function openEditForm(exercise: Exercise) {
    if (!exercise.isCustom) {
      Alert.alert(
        'Default exercise',
        'Default exercises cannot be edited in version 1. You can create a custom exercise instead.'
      );
      return;
    }

    setFormError(null);
    setFormState({ mode: 'edit', exercise });
  }

  function closeForm() {
    if (isSaving) {
      return;
    }

    setFormError(null);
    setFormState(null);
  }

  async function handleSaveExercise(input: CustomExerciseInput) {
    if (!formState) {
      return;
    }

    setFormError(null);

    try {
      if (formState.mode === 'create') {
        await createCustomExercise(input);
        Alert.alert('Exercise saved', 'Custom exercise added.');
      } else {
        await updateCustomExercise(formState.exercise.id, input);
        Alert.alert('Exercise saved', 'Custom exercise updated.');
      }

      setFormState(null);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : 'This exercise could not be saved. Please try again.';
      setFormError(message);
    }
  }
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
  separator: {
    height: theme.spacing.sm,
  },
  sectionSeparator: {
    height: theme.spacing.sm,
  },
});
