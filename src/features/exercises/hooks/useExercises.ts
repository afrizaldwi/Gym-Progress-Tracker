import { useCallback, useEffect, useRef, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import { createExerciseRepository } from '../data/exerciseRepository';
import type { Exercise } from '../types';

type UseExercisesResult = {
  error: Error | null;
  exercises: Exercise[];
  isLoading: boolean;
  refresh(): Promise<void>;
};

export function useExercises(): UseExercisesResult {
  const db = useSQLiteContext();
  const isMountedRef = useRef(true);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  return {
    error,
    exercises,
    isLoading,
    refresh,
  };
}
