import type { SQLiteDatabase } from 'expo-sqlite';

import { migrateDatabase } from './migrate';
import { seedDefaultExercises } from './seedDefaultExercises';

export const databaseName = 'gym_progress_tracker.db';

export async function initializeDatabase(db: SQLiteDatabase): Promise<void> {
  await enableForeignKeys(db);
  await migrateDatabase(db);
  await seedDefaultExercises(db);
}

export async function enableForeignKeys(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA foreign_keys = ON;');
}

export async function runInTransaction(
  db: SQLiteDatabase,
  task: (tx: SQLiteDatabase) => Promise<void>
): Promise<void> {
  await db.withExclusiveTransactionAsync(task);
}
