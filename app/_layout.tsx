import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import Toast, { ToastProps } from 'react-native-toast-message';
import { BaseToast } from 'react-native-toast-message/lib/src/components/BaseToast';
import { theme } from '@/theme';

const toastConfig = {
  success: (props: ToastProps) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: theme.colors.success,
        backgroundColor: theme.colors.background,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
      }}
      text2Style={{
        fontSize: 14,
        color: theme.colors.textSecondary,
      }}
    />
  ),
  error: (props: ToastProps) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: theme.colors.error,
        backgroundColor: theme.colors.background,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
      }}
      text2Style={{
        fontSize: 14,
        color: theme.colors.textSecondary,
      }}
    />
  ),
};

export default function RootLayout() {
  const { refreshToken } = useAuthStore();

  useEffect(() => {
    refreshToken();
  }, []);

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
      <Toast config={toastConfig} />
    </>
  );
}
