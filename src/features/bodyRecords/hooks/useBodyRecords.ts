import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import { createBodyRecordRepository } from '../data/bodyRecordRepository';
import type { BodyRecord, BodyRecordInput } from '../types';

type UseBodyRecordsResult = {
  add(input: BodyRecordInput): Promise<BodyRecord>;
  deleteRecord(bodyRecordId: string): Promise<void>;
  error: Error | null;
  findByDate(recordDate: string): Promise<BodyRecord | null>;
  isLoading: boolean;
  isSaving: boolean;
  records: BodyRecord[];
  refresh(): Promise<void>;
  replaceExistingByDate(input: BodyRecordInput): Promise<BodyRecord>;
  update(bodyRecordId: string, input: BodyRecordInput): Promise<BodyRecord>;
  updateWithDateReplacement(
    sourceBodyRecordId: string,
    targetBodyRecordId: string,
    input: BodyRecordInput
  ): Promise<BodyRecord>;
};

export function useBodyRecords(): UseBodyRecordsResult {
  const db = useSQLiteContext();
  const isMountedRef = useRef(true);
  const repository = useMemo(() => createBodyRecordRepository(db), [db]);
  const [records, setRecords] = useState<BodyRecord[]>([]);
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
      const bodyRecords = await repository.findHistory();

      if (!isMountedRef.current) {
        return;
      }

      setRecords(bodyRecords);
    } catch (caughtError) {
      console.error('Failed to load body records', caughtError);

      if (!isMountedRef.current) {
        return;
      }

      setError(
        caughtError instanceof Error
          ? caughtError
          : new Error('Failed to load body records.')
      );
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [repository]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const runMutation = useCallback(
    async <T,>(task: () => Promise<T>): Promise<T> => {
      setIsSaving(true);
      setError(null);

      try {
        const result = await task();
        await refresh();
        return result;
      } catch (caughtError) {
        console.error('Failed to save body record change', caughtError);

        const nextError =
          caughtError instanceof Error
            ? caughtError
            : new Error('Could not save body record.');

        if (isMountedRef.current) {
          setError(nextError);
        }

        throw nextError;
      } finally {
        if (isMountedRef.current) {
          setIsSaving(false);
        }
      }
    },
    [refresh]
  );

  const add = useCallback(
    (input: BodyRecordInput) => runMutation(() => repository.create(input)),
    [repository, runMutation]
  );

  const replaceExistingByDate = useCallback(
    (input: BodyRecordInput) =>
      runMutation(() => repository.replaceExistingByDate(input)),
    [repository, runMutation]
  );

  const update = useCallback(
    (bodyRecordId: string, input: BodyRecordInput) =>
      runMutation(() => repository.update(bodyRecordId, input)),
    [repository, runMutation]
  );

  const updateWithDateReplacement = useCallback(
    (
      sourceBodyRecordId: string,
      targetBodyRecordId: string,
      input: BodyRecordInput
    ) =>
      runMutation(() =>
        repository.updateWithDateReplacement(
          sourceBodyRecordId,
          targetBodyRecordId,
          input
        )
      ),
    [repository, runMutation]
  );

  const deleteRecord = useCallback(
    (bodyRecordId: string) => runMutation(() => repository.delete(bodyRecordId)),
    [repository, runMutation]
  );

  return {
    add,
    deleteRecord,
    error,
    findByDate: repository.findByDate,
    isLoading,
    isSaving,
    records,
    refresh,
    replaceExistingByDate,
    update,
    updateWithDateReplacement,
  };
}
