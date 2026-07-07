import type { PropsWithChildren, ReactNode } from 'react';
import { Component, Suspense } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SQLiteProvider } from 'expo-sqlite';

import { theme } from '../theme';
import { databaseName, initializeDatabase } from './database';

type DatabaseErrorBoundaryState = {
  error: Error | null;
};

class DatabaseErrorBoundary extends Component<
  PropsWithChildren,
  DatabaseErrorBoundaryState
> {
  state: DatabaseErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): DatabaseErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('Database initialization failed', error);
  }

  render(): ReactNode {
    if (this.state.error) {
      return <DatabaseErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

export function DatabaseProvider({ children }: PropsWithChildren) {
  return (
    <DatabaseErrorBoundary>
      <Suspense fallback={<DatabaseLoadingFallback />}>
        <SQLiteProvider
          databaseName={databaseName}
          onInit={initializeDatabase}
          useSuspense
        >
          {children}
        </SQLiteProvider>
      </Suspense>
    </DatabaseErrorBoundary>
  );
}

function DatabaseLoadingFallback() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Preparing local data</Text>
      <Text style={styles.body}>Opening database...</Text>
    </View>
  );
}

function DatabaseErrorFallback({ error }: { error: Error }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Database startup failed</Text>
      <Text style={styles.body}>{error.message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
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
