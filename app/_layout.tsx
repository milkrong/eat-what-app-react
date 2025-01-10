import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '../src/stores/useAuthStore';

// 检查用户是否在认证组中
function useProtectedRoute() {
  const segments = useSegments();
  const router = useRouter();
  const { user, session } = useAuthStore();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    const isLoggedIn = user && session;

    if (!isLoggedIn && !inAuthGroup) {
      // 如果未登录且不在认证页面，重定向到登录页
      router.replace('/(auth)/login');
    } else if (isLoggedIn) {
      if (inAuthGroup) {
        // 如果已登录，且在认证页面或根路径，重定向到首页
        router.replace('/(tabs)');
      }
    }
  }, [user, session, segments]);
}

// 初始化路由
function useInitialRoute() {
  const router = useRouter();
  const { user, session } = useAuthStore();

  useEffect(() => {
    // 如果是开发模式或已登录，直接进入首页
    if (process.env.EXPO_PUBLIC_DEV_MODE === 'true' || (user && session)) {
      router.replace('/(tabs)');
    }
  }, []);
}

export default function RootLayout() {
  useProtectedRoute();
  useInitialRoute();

  return <Slot />;
}
