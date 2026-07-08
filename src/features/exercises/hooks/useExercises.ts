import { useCallback, useEffect, useRef, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import { createExerciseRepository } from '../data/exerciseRepository';
import type { CustomExerciseInput, Exercise } from '../types';

type UseExercisesResult = {
  archiveUsedExercise(exerciseId: string): Promise<void>;
  createCustomExercise(input: CustomExerciseInput): Promise<Exercise>;
  deleteUnusedCustomExercise(exerciseId: string): Promise<void>;
  error: Error | null;
  exercises: Exercise[];
  hasWorkoutHistory(exerciseId: string): Promise<boolean>;
  isLoading: boolean;
  isSaving: boolean;
  refresh(): Promise<void>;
  updateCustomExercise(
    exerciseId: string,
    input: CustomExerciseInput
  ): Promise<Exercise>;
};

export function useExercises(): UseExercisesResult {
  const db = useSQLiteContext();
  const isMountedRef = useRef(true);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const repository = createExerciseRepository(db);
      const activeExercises = await repository.listActiveExercises();

      if (!isMountedRef.current) {
        return;
      }

      setExercises(activeExercises);
    } catch (caughtError) {
      console.error('Failed to load exercises', caughtError);

      if (!isMountedRef.current) {
        return;
      }

      setError(
        caughtError instanceof Error
          ? caughtError
          : new Error('Failed to load exercises.')
      );
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [db]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const archiveUsedExercise = useCallback(
    async (exerciseId: string) => {
      setIsSaving(true);

      try {
        const repository = createExerciseRepository(db);
        await repository.archiveUsedExercise(exerciseId);
        await refresh();
      } finally {
        if (isMountedRef.current) {
          setIsSaving(false);
        }
      }
    },
    [db, refresh]
  );

  const createCustomExercise = useCallback(
    async (input: CustomExerciseInput) => {
      setIsSaving(true);

      try {
        const repository = createExerciseRepository(db);
        const createdExercise = await repository.createCustomExercise(input);
        await refresh();

        return createdExercise;
      } finally {
        if (isMountedRef.current) {
          setIsSaving(false);
        }
      }
    },
    [db, refresh]
  );

  const deleteUnusedCustomExercise = useCallback(
    async (exerciseId: string) => {
      setIsSaving(true);

      try {
        const repository = createExerciseRepository(db);
        await repository.deleteUnusedCustomExercise(exerciseId);
        await refresh();
      } finally {
        if (isMountedRef.current) {
          setIsSaving(false);
        }
      }
    },
    [db, refresh]
  );

  const hasWorkoutHistory = useCallback(
    async (exerciseId: string) => {
      const repository = createExerciseRepository(db);

      return repository.hasWorkoutHistory(exerciseId);
    },
    [db]
  );

  const updateCustomExercise = useCallback(
    async (exerciseId: string, input: CustomExerciseInput) => {
      setIsSaving(true);

      try {
        const repository = createExerciseRepository(db);
        const updatedExercise = await repository.updateCustomExercise(
          exerciseId,
          input
        );
        await refresh();

        return updatedExercise;
      } finally {
        if (isMountedRef.current) {
          setIsSaving(false);
        }
      }
    },
    [db, refresh]
  );

  return {
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
  };
}
