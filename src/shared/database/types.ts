import type { SQLiteDatabase } from 'expo-sqlite';

export type AppDatabase = SQLiteDatabase;

export type DatabaseMigration = {
  name: string;
  up: string;
  version: number;
};

export type DefaultExerciseSeed = {
  equipment: string;
  id: string;
  muscleGroup: string;
  name: string;
};
