import { useCallback, useEffect, useRef, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import { createExerciseRepository } from '../data/exerciseRepository';
import type { CustomExerciseInput, Exercise } from '../types';

type UseExercisesResult = {
  createCustomExercise(input: CustomExerciseInput): Promise<Exercise>;
  error: Error | null;
  exercises: Exercise[];
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
    createCustomExercise,
    error,
    exercises,
    isLoading,
    isSaving,
    refresh,
    updateCustomExercise,
  };
}
