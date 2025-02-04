import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { theme } from '../../src/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.active,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.surface,
          height: 64 + insets.bottom,
          paddingBottom: insets.bottom + theme.spacing.xs,
          paddingTop: theme.spacing.xs,
        },
        tabBarIconStyle: {
          marginBottom: -4,
        },
        tabBarLabelStyle: {
          ...theme.typography.caption,
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '推荐',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="recipes/index"
        options={{
          title: '食谱',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="book" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="meal-plan"
        options={{
          title: '计划',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="calendar" size={size} color={color} />
          ),
        }}
      />
      {/* <Tabs.Screen
        name="ai"
        options={{
          title: 'AI助手',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="magic" size={size} color={color} />
          ),
        }}
      /> */}
      <Tabs.Screen
        name="profile"
        options={{
          title: '我的',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="user" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
