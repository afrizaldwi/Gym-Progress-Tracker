import type { AppDatabase } from '../../../shared/database/types';
import type { Exercise } from '../types';

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
  listActiveExercises(): Promise<Exercise[]>;
};

export function createExerciseRepository(db: AppDatabase): ExerciseRepository {
  return {
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
