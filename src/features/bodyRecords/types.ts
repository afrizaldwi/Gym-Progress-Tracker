export type BodyRecord = {
  bodyWeight: number;
  createdAt: string;
  id: string;
  notes: string | null;
  recordDate: string;
  updatedAt: string;
};

export type BodyRecordInput = {
  bodyWeight: number;
  notes: string | null;
  recordDate: string;
};
