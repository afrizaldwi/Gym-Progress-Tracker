import type { DatabaseMigration } from "../types";

export const initialSchemaMigration: DatabaseMigration = {
  name: "001_initial_schema",
  version: 1,
  up: `
CREATE TABLE IF NOT EXISTS exercises (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  equipment TEXT,
  is_custom INTEGER NOT NULL DEFAULT 0,
  is_archived INTEGER NOT NULL DEFAULT 0,
  archived_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK (is_custom IN (0, 1)),
  CHECK (is_archived IN (0, 1)),
  CHECK (
    (is_archived = 1 AND archived_at IS NOT NULL)
    OR
    (is_archived = 0 AND archived_at IS NULL)
  )
);

CREATE TABLE IF NOT EXISTS workouts (
  id TEXT PRIMARY KEY,
  workout_date TEXT NOT NULL,
  title TEXT,
  notes TEXT,
  status TEXT NOT NULL,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK (status IN ('in_progress', 'completed')),
  CHECK (
    (status = 'completed' AND completed_at IS NOT NULL)
    OR
    (status = 'in_progress' AND completed_at IS NULL)
  )
);

CREATE TABLE IF NOT EXISTS workout_exercises (
  id TEXT PRIMARY KEY,
  workout_id TEXT NOT NULL,
  exercise_id TEXT NOT NULL,
  exercise_order INTEGER NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
  FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE RESTRICT,
  CHECK (exercise_order > 0),
  UNIQUE (workout_id, exercise_order)
);

CREATE TABLE IF NOT EXISTS workout_sets (
  id TEXT PRIMARY KEY,
  workout_exercise_id TEXT NOT NULL,
  set_number INTEGER NOT NULL,
  weight REAL NOT NULL,
  reps INTEGER NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (workout_exercise_id) REFERENCES workout_exercises(id) ON DELETE CASCADE,
  CHECK (set_number > 0),
  CHECK (weight >= 0),
  CHECK (reps > 0),
  UNIQUE (workout_exercise_id, set_number)
);

CREATE TABLE IF NOT EXISTS body_records (
  id TEXT PRIMARY KEY,
  record_date TEXT NOT NULL,
  body_weight REAL NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK (body_weight > 0),
  UNIQUE (record_date)
);

CREATE TABLE IF NOT EXISTS app_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_exercises_muscle_group
ON exercises(muscle_group);

CREATE INDEX IF NOT EXISTS idx_exercises_archived
ON exercises(is_archived);

CREATE INDEX IF NOT EXISTS idx_workouts_date
ON workouts(workout_date DESC);

CREATE UNIQUE INDEX IF NOT EXISTS ux_workouts_single_in_progress
ON workouts(status)
WHERE status = 'in_progress';

CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout_order
ON workout_exercises(workout_id, exercise_order);

CREATE INDEX IF NOT EXISTS idx_workout_exercises_exercise
ON workout_exercises(exercise_id);

CREATE INDEX IF NOT EXISTS idx_workout_sets_workout_exercise
ON workout_sets(workout_exercise_id, set_number);

CREATE INDEX IF NOT EXISTS idx_body_records_date
ON body_records(record_date DESC);
`,
};
