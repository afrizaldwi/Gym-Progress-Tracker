import type { Exercise } from '../types';

export const muscleGroupFilters = [
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

export type MuscleGroupFilter = (typeof muscleGroupFilters)[number];

export const exerciseMuscleGroupOptions = [
  'Chest',
  'Back',
  'Shoulder',
  'Legs',
  'Biceps',
  'Triceps',
  'Core',
  'Other',
] as const;

export type ExerciseMuscleGroup = (typeof exerciseMuscleGroupOptions)[number];

export function filterExercises(
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
