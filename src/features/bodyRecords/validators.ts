import type { BodyRecordInput } from './types';

export type BodyRecordFormValues = {
  bodyWeightText: string;
  notesText: string;
  recordDate: string;
};

export type BodyRecordValidationResult =
  | {
      ok: true;
      input: BodyRecordInput;
    }
  | {
      errors: Partial<Record<keyof BodyRecordFormValues, string>>;
      ok: false;
    };

const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;
const bodyWeightPattern = /^\d+(?:[.,]\d+)?$/;
const invalidBodyWeightMessage = 'Use a valid number, e.g. 72.5 or 72,5.';

export function validateBodyRecordForm(
  values: BodyRecordFormValues
): BodyRecordValidationResult {
  const errors: Partial<Record<keyof BodyRecordFormValues, string>> = {};
  const recordDate = values.recordDate.trim();
  const bodyWeightText = values.bodyWeightText.trim();
  const notes = normalizeNotes(values.notesText);

  if (!recordDate) {
    errors.recordDate = 'Enter a date.';
  } else if (!isValidDateOnly(recordDate)) {
    errors.recordDate = 'Use YYYY-MM-DD.';
  }

  if (!bodyWeightText) {
    errors.bodyWeightText = 'Enter body weight.';
  }

  const normalizedBodyWeightText = bodyWeightText.replace(',', '.');
  const bodyWeight = Number(normalizedBodyWeightText);

  if (bodyWeightText && !bodyWeightPattern.test(bodyWeightText)) {
    errors.bodyWeightText = invalidBodyWeightMessage;
  } else if (bodyWeightText && !Number.isFinite(bodyWeight)) {
    errors.bodyWeightText = invalidBodyWeightMessage;
  } else if (bodyWeightText && bodyWeight <= 0) {
    errors.bodyWeightText = 'Body weight must be greater than 0.';
  }

  if (Object.keys(errors).length > 0) {
    return {
      errors,
      ok: false,
    };
  }

  return {
    input: {
      bodyWeight,
      notes,
      recordDate,
    },
    ok: true,
  };
}

export function isValidDateOnly(value: string): boolean {
  if (!dateOnlyPattern.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);

  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function normalizeNotes(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
