import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../../shared/theme';
import { exerciseMuscleGroupOptions } from '../utils/exerciseListFilters';

type ExerciseMuscleGroupPickerProps = {
  disabled: boolean;
  selectedMuscleGroup: string;
  onSelectMuscleGroup(muscleGroup: string): void;
};

export function ExerciseMuscleGroupPicker({
  disabled,
  selectedMuscleGroup,
  onSelectMuscleGroup,
}: ExerciseMuscleGroupPickerProps) {
  return (
    <View style={styles.optionGrid}>
      {exerciseMuscleGroupOptions.map((option) => {
        const isSelected = selectedMuscleGroup === option;

        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            disabled={disabled}
            key={option}
            style={[
              styles.optionChip,
              isSelected ? styles.optionChipSelected : null,
              disabled ? styles.disabled : null,
            ]}
            onPress={() => onSelectMuscleGroup(option)}
          >
            <Text
              style={[
                styles.optionChipText,
                isSelected ? styles.optionChipTextSelected : null,
              ]}
            >
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  optionChip: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: theme.spacing.md,
  },
  optionChipSelected: {
    backgroundColor: theme.colors.surfaceMuted,
    borderColor: theme.colors.primary,
  },
  optionChipText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption,
    fontWeight: '700',
  },
  optionChipTextSelected: {
    color: theme.colors.primary,
  },
  disabled: {
    opacity: 0.6,
  },
});
