import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { View, ActivityIndicator } from 'react-native';
import { theme } from '@/theme';

export default function Index() {
  const { session } = useAuthStore();

  // 如果已登录，重定向到主页面
  // 如果未登录，重定向到登录页面
  if (session?.access_token) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
