import { Tabs } from 'expo-router';

import { TabBarIcon } from '../../shared/components/TabBarIcon';
import { theme } from '../../shared/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarLabelStyle: {
          fontSize: theme.typography.caption,
          fontWeight: '600',
        },
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon color={color} name="home-outline" size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="workouts/history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon color={color} name="history" size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="exercises/index"
        options={{
          title: 'Exercises',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon color={color} name="dumbbell" size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="body-records/index"
        options={{
          title: 'Body',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon color={color} name="scale-bathroom" size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings/index"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon color={color} name="cog-outline" size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
