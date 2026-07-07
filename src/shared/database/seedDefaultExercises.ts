import type { AppDatabase, DefaultExerciseSeed } from './types';

export const defaultExercises: DefaultExerciseSeed[] = [
  {
    id: 'ex_chest_press_machine',
    name: 'Chest Press Machine',
    muscleGroup: 'Chest',
    equipment: 'Machine',
  },
  {
    id: 'ex_lat_pulldown',
    name: 'Lat Pulldown',
    muscleGroup: 'Back',
    equipment: 'Cable Machine',
  },
  {
    id: 'ex_seated_row',
    name: 'Seated Row',
    muscleGroup: 'Back',
    equipment: 'Cable Machine',
  },
  {
    id: 'ex_leg_press',
    name: 'Leg Press',
    muscleGroup: 'Legs',
    equipment: 'Machine',
  },
  {
    id: 'ex_shoulder_press_machine',
    name: 'Shoulder Press Machine',
    muscleGroup: 'Shoulder',
    equipment: 'Machine',
  },
  {
    id: 'ex_lateral_raise',
    name: 'Lateral Raise',
    muscleGroup: 'Shoulder',
    equipment: 'Dumbbell',
  },
  {
    id: 'ex_bicep_curl',
    name: 'Bicep Curl',
    muscleGroup: 'Biceps',
    equipment: 'Dumbbell',
  },
  {
    id: 'ex_tricep_pushdown',
    name: 'Tricep Pushdown',
    muscleGroup: 'Triceps',
    equipment: 'Cable Machine',
  },
  {
    id: 'ex_leg_extension',
    name: 'Leg Extension',
    muscleGroup: 'Legs',
    equipment: 'Machine',
  },
  {
    id: 'ex_leg_curl',
    name: 'Leg Curl',
    muscleGroup: 'Legs',
    equipment: 'Machine',
  },
];

export async function seedDefaultExercises(db: AppDatabase): Promise<void> {
  const seededAt = new Date().toISOString();

  await db.withExclusiveTransactionAsync(async (tx) => {
    for (const exercise of defaultExercises) {
      await tx.runAsync(
        `
INSERT OR IGNORE INTO exercises (
  id,
  name,
  muscle_group,
  equipment,
  is_custom,
  is_archived,
  archived_at,
  created_at,
  updated_at
) VALUES (?, ?, ?, ?, 0, 0, NULL, ?, ?);
`,
        exercise.id,
        exercise.name,
        exercise.muscleGroup,
        exercise.equipment,
        seededAt,
        seededAt
      );
    }

    await tx.runAsync(
      `
INSERT OR IGNORE INTO app_meta (key, value)
VALUES ('default_exercises_seeded_at', ?);
`,
      seededAt
    );
  });
}
