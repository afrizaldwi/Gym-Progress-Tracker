import { useCallback } from 'react';
import { Alert } from 'react-native';

import type { Exercise } from '../types';

type UseExerciseRemovalParams = {
  archiveUsedExercise(exerciseId: string): Promise<void>;
  deleteUnusedCustomExercise(exerciseId: string): Promise<void>;
  hasWorkoutHistory(exerciseId: string): Promise<boolean>;
};

type UseExerciseRemovalResult = {
  confirmRemoveExercise(exercise: Exercise): Promise<void>;
};

export function useExerciseRemoval({
  archiveUsedExercise,
  deleteUnusedCustomExercise,
  hasWorkoutHistory,
}: UseExerciseRemovalParams): UseExerciseRemovalResult {
  const showRemoveError = useCallback((caughtError: unknown) => {
    const message =
      caughtError instanceof Error
        ? caughtError.message
        : 'This exercise could not be removed. Please try again.';

    Alert.alert('Remove failed', message);
  }, []);

  const removeExercise = useCallback(
    async (exercise: Exercise, action: 'archive' | 'delete') => {
      try {
        if (action === 'archive') {
          await archiveUsedExercise(exercise.id);
          Alert.alert('Exercise archived', 'Custom exercise archived.');
        } else {
          await deleteUnusedCustomExercise(exercise.id);
          Alert.alert('Exercise deleted', 'Custom exercise deleted.');
        }
      } catch (caughtError) {
        showRemoveError(caughtError);
      }
    },
    [archiveUsedExercise, deleteUnusedCustomExercise, showRemoveError]
  );

  const confirmRemoveExercise = useCallback(
    async (exercise: Exercise) => {
      if (!exercise.isCustom) {
        Alert.alert(
          'Default exercise',
          'Default exercises cannot be removed in version 1.'
        );
        return;
      }

      try {
        const hasHistory = await hasWorkoutHistory(exercise.id);

        if (hasHistory) {
          Alert.alert(
            'Archive exercise?',
            'This custom exercise is used in workout history. Archive it so old history stays intact?',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Archive',
                style: 'destructive',
                onPress: () => void removeExercise(exercise, 'archive'),
              },
            ]
          );
          return;
        }

        Alert.alert(
          'Delete exercise?',
          'This custom exercise has no workout history. Delete it permanently?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => void removeExercise(exercise, 'delete'),
            },
          ]
        );
      } catch (caughtError) {
        showRemoveError(caughtError);
      }
    },
    [hasWorkoutHistory, removeExercise, showRemoveError]
  );

  return {
    confirmRemoveExercise,
  };
}
