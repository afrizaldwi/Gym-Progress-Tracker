import { StyleSheet, Text } from 'react-native';

import { theme } from '../../shared/theme';
import { AppScreen } from '../../shared/components/AppScreen';

export function WorkoutHistoryScreen() {
  return (
    <AppScreen>
      <Text style={styles.title}>Workout history</Text>
      <Text style={styles.body}>Workout history placeholder.</Text>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.title,
    fontWeight: '700',
  },
  body: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
  },
});
