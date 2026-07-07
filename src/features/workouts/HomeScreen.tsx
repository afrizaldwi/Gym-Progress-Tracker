import { StyleSheet, Text } from 'react-native';

import { theme } from '../../shared/theme';
import { AppScreen } from '../../shared/components/AppScreen';

export function HomeScreen() {
  return (
    <AppScreen>
      <Text style={styles.title}>Gym Progress Tracker</Text>
      <Text style={styles.subtitle}>Home placeholder.</Text>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.title,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
  },
});
