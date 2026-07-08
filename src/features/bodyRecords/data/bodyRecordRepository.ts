import type { AppDatabase } from '../../../shared/database/types';
import { runInTransaction } from '../../../shared/database/database';
import type { BodyRecord, BodyRecordInput } from '../types';

type BodyRecordRow = {
  body_weight: number;
  created_at: string;
  id: string;
  notes: string | null;
  record_date: string;
  updated_at: string;
};

export type BodyRecordRepository = {
  create(input: BodyRecordInput): Promise<BodyRecord>;
  delete(bodyRecordId: string): Promise<void>;
  findByDate(recordDate: string): Promise<BodyRecord | null>;
  findHistory(): Promise<BodyRecord[]>;
  replaceExistingByDate(input: BodyRecordInput): Promise<BodyRecord>;
  update(bodyRecordId: string, input: BodyRecordInput): Promise<BodyRecord>;
  updateWithDateReplacement(
    sourceBodyRecordId: string,
    targetBodyRecordId: string,
    input: BodyRecordInput
  ): Promise<BodyRecord>;
};

export function createBodyRecordRepository(db: AppDatabase): BodyRecordRepository {
  return {
    async create(input) {
      const now = new Date().toISOString();
      const id = createLocalBodyRecordId();

      await db.runAsync(
        `
INSERT INTO body_records (
  id,
  record_date,
  body_weight,
  notes,
  created_at,
  updated_at
) VALUES (?, ?, ?, ?, ?, ?);
`,
        id,
        input.recordDate,
        input.bodyWeight,
        input.notes,
        now,
        now
      );

      const createdRecord = await findById(db, id);

      if (!createdRecord) {
        throw new Error('Body record was not found after saving.');
      }

      return createdRecord;
    },

    async delete(bodyRecordId) {
      await db.runAsync('DELETE FROM body_records WHERE id = ?;', bodyRecordId);
    },

    async findByDate(recordDate) {
      const row = await db.getFirstAsync<BodyRecordRow>(
        `
SELECT
  id,
  record_date,
  body_weight,
  notes,
  created_at,
  updated_at
FROM body_records
WHERE record_date = ?
LIMIT 1;
`,
        recordDate
      );

      return row ? mapBodyRecordRow(row) : null;
    },

    async findHistory() {
      const rows = await db.getAllAsync<BodyRecordRow>(`
SELECT
  id,
  record_date,
  body_weight,
  notes,
  created_at,
  updated_at
FROM body_records
ORDER BY record_date DESC, created_at DESC;
`);

      return rows.map(mapBodyRecordRow);
    },

    async replaceExistingByDate(input) {
      const existingRecord = await this.findByDate(input.recordDate);

      if (!existingRecord) {
        return this.create(input);
      }

      return this.update(existingRecord.id, input);
    },

    async update(bodyRecordId, input) {
      const now = new Date().toISOString();

      await db.runAsync(
        `
UPDATE body_records
SET
  record_date = ?,
  body_weight = ?,
  notes = ?,
  updated_at = ?
WHERE id = ?;
`,
        input.recordDate,
        input.bodyWeight,
        input.notes,
        now,
        bodyRecordId
      );

      const updatedRecord = await findById(db, bodyRecordId);

      if (!updatedRecord) {
        throw new Error('Body record was not found after updating.');
      }

      return updatedRecord;
    },

    async updateWithDateReplacement(sourceBodyRecordId, targetBodyRecordId, input) {
      const now = new Date().toISOString();

      await runInTransaction(db, async (tx) => {
        await tx.runAsync('DELETE FROM body_records WHERE id = ?;', targetBodyRecordId);
        await tx.runAsync(
          `
UPDATE body_records
SET
  record_date = ?,
  body_weight = ?,
  notes = ?,
  updated_at = ?
WHERE id = ?;
`,
          input.recordDate,
          input.bodyWeight,
          input.notes,
          now,
          sourceBodyRecordId
        );
      });

      const updatedRecord = await findById(db, sourceBodyRecordId);

      if (!updatedRecord) {
        throw new Error('Body record was not found after replacing date.');
      }

      return updatedRecord;
    },
  };
}

async function findById(db: AppDatabase, id: string): Promise<BodyRecord | null> {
  const row = await db.getFirstAsync<BodyRecordRow>(
    `
SELECT
  id,
  record_date,
  body_weight,
  notes,
  created_at,
  updated_at
FROM body_records
WHERE id = ?
LIMIT 1;
`,
    id
  );

  return row ? mapBodyRecordRow(row) : null;
}

function mapBodyRecordRow(row: BodyRecordRow): BodyRecord {
  return {
    bodyWeight: row.body_weight,
    createdAt: row.created_at,
    id: row.id,
    notes: row.notes,
    recordDate: row.record_date,
    updatedAt: row.updated_at,
  };
}

function createLocalBodyRecordId(): string {
  const randomPart = Math.random().toString(36).slice(2, 10);
  const timePart = Date.now().toString(36);

  return `br_${timePart}_${randomPart}`;
}
