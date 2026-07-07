import { migrations } from './migrations';
import type { AppDatabase } from './types';

type SchemaVersionRow = {
  value: string;
};

type TableExistsRow = {
  name: string;
};

export async function migrateDatabase(db: AppDatabase): Promise<void> {
  const currentVersion = await getCurrentSchemaVersion(db);
  const pendingMigrations = migrations.filter(
    (migration) => migration.version > currentVersion
  );

  if (pendingMigrations.length === 0) {
    return;
  }

  await db.withExclusiveTransactionAsync(async (tx) => {
    for (const migration of pendingMigrations) {
      await tx.execAsync(migration.up);
      await tx.runAsync(
        'INSERT OR REPLACE INTO app_meta (key, value) VALUES (?, ?);',
        'db_schema_version',
        String(migration.version)
      );
    }
  });
}

async function getCurrentSchemaVersion(db: AppDatabase): Promise<number> {
  const appMetaTable = await db.getFirstAsync<TableExistsRow>(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'app_meta';"
  );

  if (!appMetaTable) {
    return 0;
  }

  const row = await db.getFirstAsync<SchemaVersionRow>(
    "SELECT value FROM app_meta WHERE key = 'db_schema_version' LIMIT 1;"
  );
  const version = Number(row?.value ?? 0);

  if (!Number.isInteger(version) || version < 0) {
    throw new Error(`Invalid db_schema_version value: ${row?.value ?? 'unset'}`);
  }

  return version;
}
