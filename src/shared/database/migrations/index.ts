import { initialSchemaMigration } from './001_initial_schema';

export const migrations = [initialSchemaMigration] as const;

export const latestSchemaVersion =
  migrations.length > 0 ? migrations[migrations.length - 1].version : 0;
