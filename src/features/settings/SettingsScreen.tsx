import { Link } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { theme } from '../../shared/theme';
import { AppScreen } from '../../shared/components/AppScreen';

export function SettingsScreen() {
  return (
    <AppScreen>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.body}>Settings placeholder.</Text>

      <Link href="/backup" style={styles.link}>
        <Text style={styles.linkText}>Backup</Text>
      </Link>
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
  link: {
    alignSelf: 'flex-start',
    marginTop: theme.spacing.lg,
    minHeight: 48,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  linkText: {
    color: theme.colors.primary,
    fontSize: theme.typography.body,
    fontWeight: '600',
  },
});
