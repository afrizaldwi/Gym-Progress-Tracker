import type { AppDatabase } from '../../../shared/database/types';
import { runInTransaction } from '../../../shared/database/database';
import type { CustomExerciseInput, Exercise } from '../types';
import { exerciseMuscleGroupOptions } from '../utils/exerciseListFilters';

type ExerciseRow = {
  archived_at: string | null;
  created_at: string;
  equipment: string | null;
  id: string;
  is_archived: number;
  is_custom: number;
  muscle_group: string;
  name: string;
  updated_at: string;
};

export type ExerciseRepository = {
  createCustomExercise(input: CustomExerciseInput): Promise<Exercise>;
  listActiveExercises(): Promise<Exercise[]>;
  updateCustomExercise(
    exerciseId: string,
    input: CustomExerciseInput
  ): Promise<Exercise>;
};

export function createExerciseRepository(db: AppDatabase): ExerciseRepository {
  return {
    async createCustomExercise(input) {
      const exerciseInput = prepareExerciseInput(input);
      const now = new Date().toISOString();
      const id = createLocalExerciseId();

      await runInTransaction(db, async (tx) => {
        await assertActiveNameIsAvailable(tx, exerciseInput.name);
        await tx.runAsync(
          `
INSERT INTO exercises (
  id,
  name,
  muscle_group,
  equipment,
  is_custom,
  is_archived,
  archived_at,
  created_at,
  updated_at
) VALUES (?, ?, ?, ?, 1, 0, NULL, ?, ?);
`,
          id,
          exerciseInput.name,
          exerciseInput.muscleGroup,
          exerciseInput.equipment,
          now,
          now
        );
      });

      const createdExercise = await findById(db, id);

      if (!createdExercise) {
        throw new Error('Exercise was not found after saving.');
      }

      return createdExercise;
    },

    async listActiveExercises() {
      const rows = await db.getAllAsync<ExerciseRow>(
        `
SELECT
  id,
  name,
  muscle_group,
  equipment,
  is_custom,
  is_archived,
  archived_at,
  created_at,
  updated_at
FROM exercises
WHERE is_archived = ?
ORDER BY muscle_group COLLATE NOCASE ASC, name COLLATE NOCASE ASC;
`,
        0
      );

      return rows.map(mapExerciseRow);
    },

    async updateCustomExercise(exerciseId, input) {
      const exerciseInput = prepareExerciseInput(input);
      const now = new Date().toISOString();

      await runInTransaction(db, async (tx) => {
        const existingExercise = await findById(tx, exerciseId);

        if (!existingExercise) {
          throw new Error('Exercise was not found.');
        }

        if (!existingExercise.isCustom) {
          throw new Error(
            'Default exercises cannot be edited in version 1. You can create a custom exercise instead.'
          );
        }

        if (existingExercise.isArchived) {
          throw new Error('Archived exercises cannot be edited.');
        }

        await assertActiveNameIsAvailable(tx, exerciseInput.name, exerciseId);
        await tx.runAsync(
          `
UPDATE exercises
SET
  name = ?,
  muscle_group = ?,
  equipment = ?,
  updated_at = ?
WHERE id = ?;
`,
          exerciseInput.name,
          exerciseInput.muscleGroup,
          exerciseInput.equipment,
          now,
          exerciseId
        );
      });

      const updatedExercise = await findById(db, exerciseId);

      if (!updatedExercise) {
        throw new Error('Exercise was not found after updating.');
      }

      return updatedExercise;
    },
  };
}

async function assertActiveNameIsAvailable(
  db: AppDatabase,
  name: string,
  ignoredExerciseId?: string
): Promise<void> {
  const row = await db.getFirstAsync<{ id: string }>(
    `
SELECT id
FROM exercises
WHERE is_archived = 0
  AND lower(trim(name)) = lower(trim(?))
  AND (? IS NULL OR id <> ?)
LIMIT 1;
`,
    name,
    ignoredExerciseId ?? null,
    ignoredExerciseId ?? null
  );

  if (row) {
    throw new Error('An active exercise with this name already exists.');
  }
}

async function findById(db: AppDatabase, id: string): Promise<Exercise | null> {
  const row = await db.getFirstAsync<ExerciseRow>(
    `
SELECT
  id,
  name,
  muscle_group,
  equipment,
  is_custom,
  is_archived,
  archived_at,
  created_at,
  updated_at
FROM exercises
WHERE id = ?
LIMIT 1;
`,
    id
  );

  return row ? mapExerciseRow(row) : null;
}

function prepareExerciseInput(input: CustomExerciseInput): CustomExerciseInput {
  const name = input.name.trim();
  const muscleGroup = input.muscleGroup.trim();
  const equipment = input.equipment?.trim() ?? '';

  if (!name) {
    throw new Error('Enter exercise name.');
  }

  if (!muscleGroup) {
    throw new Error('Choose a muscle group.');
  }

  if (!exerciseMuscleGroupOptions.some((option) => option === muscleGroup)) {
    throw new Error('Choose a valid muscle group.');
  }

  return {
    equipment: equipment ? equipment : null,
    muscleGroup,
    name,
  };
}

function mapExerciseRow(row: ExerciseRow): Exercise {
  return {
    archivedAt: row.archived_at,
    createdAt: row.created_at,
    equipment: row.equipment,
    id: row.id,
    isArchived: row.is_archived === 1,
    isCustom: row.is_custom === 1,
    muscleGroup: row.muscle_group,
    name: row.name,
    updatedAt: row.updated_at,
  };
}

function createLocalExerciseId(): string {
  const randomPart = Math.random().toString(36).slice(2, 10);
  const timePart = Date.now().toString(36);

  return `ex_${timePart}_${randomPart}`;
}
