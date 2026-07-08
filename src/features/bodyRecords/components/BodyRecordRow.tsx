import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../shared/theme';
import type { BodyRecord } from '../types';
import { formatBodyWeight } from '../utils/bodyRecordFormatting';
import { formatLocalDateTime } from '../utils/dateFormatting';

type BodyRecordRowProps = {
  isActive: boolean;
  onDelete(record: BodyRecord): void;
  onEdit(record: BodyRecord): void;
  record: BodyRecord;
};

export function BodyRecordRow({
  isActive,
  onDelete,
  onEdit,
  record,
}: BodyRecordRowProps) {
  return (
    <View style={[styles.recordCard, isActive ? styles.activeRecordCard : null]}>
      <View style={styles.recordHeader}>
        <View>
          <Text style={styles.recordDate}>{record.recordDate}</Text>
          <Text style={styles.metaText}>
            Updated {formatLocalDateTime(record.updatedAt)}
          </Text>
        </View>
        <Text style={styles.recordWeight}>
          {formatBodyWeight(record.bodyWeight)} kg
        </Text>
      </View>
      {record.notes ? <Text style={styles.notes}>{record.notes}</Text> : null}
      <View style={styles.rowActions}>
        <Pressable
          disabled={isActive}
          onPress={() => onEdit(record)}
          style={styles.textAction}
        >
          <Text
            style={[styles.textActionText, isActive ? styles.disabledText : null]}
          >
            Edit
          </Text>
        </Pressable>
        <Pressable onPress={() => onDelete(record)} style={styles.textAction}>
          <Text style={styles.deleteActionText}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  recordCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    marginTop: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  activeRecordCard: {
    borderColor: theme.colors.primary,
  },
  recordHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'space-between',
  },
  recordDate: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  recordWeight: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  metaText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
  },
  notes: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
    marginTop: theme.spacing.sm,
  },
  rowActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'flex-end',
    marginTop: theme.spacing.sm,
  },
  textAction: {
    minHeight: 44,
    justifyContent: 'center',
  },
  textActionText: {
    color: theme.colors.primary,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  deleteActionText: {
    color: theme.colors.danger,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  disabledText: {
    color: theme.colors.textMuted,
  },
});
