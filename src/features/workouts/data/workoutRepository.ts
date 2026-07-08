import type { AppDatabase } from "../../../shared/database/types";
import type { Workout, WorkoutStatus } from "../types";

type WorkoutRow = {
  completed_at: string | null;
  created_at: string;
  id: string;
  notes: string | null;
  started_at: string;
  status: WorkoutStatus;
  title: string | null;
  updated_at: string;
  workout_date: string;
};

export type WorkoutRepository = {
  discardWorkout(workoutId: string): Promise<void>;
  getActiveWorkout(): Promise<Workout | null>;
  getOrCreateActiveWorkout(): Promise<Workout>;
};

export function createWorkoutRepository(db: AppDatabase): WorkoutRepository {
  return {
    async discardWorkout(workoutId) {
      const result = await db.runAsync(
        `
DELETE FROM workouts
WHERE id = ?
  AND status = 'in_progress';
`,
        workoutId,
      );

      if (result.changes === 0) {
        throw new Error(
          "Active workout was not found or is already completed.",
        );
      }
    },

    async getActiveWorkout() {
      return findActiveWorkout(db);
    },

    async getOrCreateActiveWorkout() {
      const activeWorkout = await findActiveWorkout(db);

      if (activeWorkout) {
        return activeWorkout;
      }

      const now = new Date();
      const nowIso = now.toISOString();
      const id = createLocalWorkoutId();

      try {
        await db.runAsync(
          `
INSERT INTO workouts (
  id,
  workout_date,
  title,
  notes,
  status,
  started_at,
  completed_at,
  created_at,
  updated_at
) VALUES (?, ?, NULL, NULL, 'in_progress', ?, NULL, ?, ?);
`,
          id,
          formatLocalDateOnly(now),
          nowIso,
          nowIso,
          nowIso,
        );
      } catch (error) {
        if (isSingleActiveWorkoutConstraintError(error)) {
          const existingWorkout = await findActiveWorkout(db);

          if (!existingWorkout) {
            throw new Error(
              "Active workout already exists, but it could not be loaded.",
            );
          }

          return existingWorkout;
        }

        throw new Error(
          `Failed to create active workout: ${getErrorMessage(error)}`,
        );
      }

      const createdWorkout = await findById(db, id);

      if (!createdWorkout) {
        throw new Error("Active workout was not found after creating.");
      }

      return createdWorkout;
    },
  };
}

async function findActiveWorkout(db: AppDatabase): Promise<Workout | null> {
  const row = await db.getFirstAsync<WorkoutRow>(
    `
SELECT
  id,
  workout_date,
  title,
  notes,
  status,
  started_at,
  completed_at,
  created_at,
  updated_at
FROM workouts
WHERE status = 'in_progress'
LIMIT 1;
`,
  );

  return row ? mapWorkoutRow(row) : null;
}

async function findById(db: AppDatabase, id: string): Promise<Workout | null> {
  const row = await db.getFirstAsync<WorkoutRow>(
    `
SELECT
  id,
  workout_date,
  title,
  notes,
  status,
  started_at,
  completed_at,
  created_at,
  updated_at
FROM workouts
WHERE id = ?
LIMIT 1;
`,
    id,
  );

  return row ? mapWorkoutRow(row) : null;
}

function mapWorkoutRow(row: WorkoutRow): Workout {
  return {
    completedAt: row.completed_at,
    createdAt: row.created_at,
    id: row.id,
    notes: row.notes,
    startedAt: row.started_at,
    status: row.status,
    title: row.title,
    updatedAt: row.updated_at,
    workoutDate: row.workout_date,
  };
}

function createLocalWorkoutId(): string {
  const randomPart = Math.random().toString(36).slice(2, 10);
  const timePart = Date.now().toString(36);

  return `wo_${timePart}_${randomPart}`;
}

function formatLocalDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isSingleActiveWorkoutConstraintError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase();

  return (
    message.includes("constraint") &&
    message.includes("unique") &&
    message.includes("workouts") &&
    message.includes("status")
  );
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
