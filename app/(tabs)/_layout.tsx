import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { theme } from '../../src/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { useGlobalStore } from '@/stores/useGlobalStore';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { themeColor } = useGlobalStore();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: themeColor,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.surface,
          height: 64 + insets.bottom,
          paddingBottom: insets.bottom + theme.spacing.xs,
          paddingTop: theme.spacing.xs,
        },
        tabBarItemStyle: {
          opacity: 1,
        },
        tabBarLabel: () => null,
        tabBarButton: (props) => (
          <Pressable
            {...props}
            style={({ pressed }) => [
              props.style,
              { opacity: 1 },
              pressed && { opacity: 0.7 },
            ]}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '推荐',
          tabBarIcon: ({ focused, color }) => (
            <View
              style={[
                styles.iconContainer,
                focused && { backgroundColor: `${themeColor}20` },
              ]}
            >
              <FontAwesome name="home" size={18} color={themeColor} />
              <Text style={[styles.label, { color: themeColor }]}>推荐</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="recipes/index"
        options={{
          title: '食谱',
          tabBarIcon: ({ focused, color }) => (
            <View
              style={[
                styles.iconContainer,
                focused && { backgroundColor: `${themeColor}20` },
              ]}
            >
              <FontAwesome name="book" size={18} color={themeColor} />
              <Text style={[styles.label, { color: themeColor }]}>食谱</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="meal-plan"
        options={{
          title: '计划',
          tabBarIcon: ({ focused, color }) => (
            <View
              style={[
                styles.iconContainer,
                focused && { backgroundColor: `${themeColor}20` },
              ]}
            >
              <FontAwesome name="calendar" size={18} color={themeColor} />
              <Text style={[styles.label, { color: themeColor }]}>计划</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '我的',
          tabBarIcon: ({ focused, color }) => (
            <View
              style={[
                styles.iconContainer,
                focused && { backgroundColor: `${themeColor}20` },
              ]}
            >
              <FontAwesome name="user" size={18} color={themeColor} />
              <Text style={[styles.label, { color: themeColor }]}>我的</Text>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    gap: 8,
    minWidth: 90,
    height: 36,
  },
  label: {
    ...theme.typography.caption,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 18,
    marginTop: 1,
  },
});
