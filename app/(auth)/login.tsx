import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { theme } from '@/theme';

export default function LoginScreen() {
  const [email, setEmail] = React.useState(
    process.env.EXPO_PUBLIC_DEV_MODE === 'true' ? process.env.EMAIL || '' : ''
  );
  const [password, setPassword] = React.useState(
    process.env.EXPO_PUBLIC_DEV_MODE === 'true'
      ? process.env.PASSWORD || ''
      : ''
  );

  const { login, loading } = useAuthStore();

  const handleLogin = async () => {
    try {
      await login({ email, password });
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('错误', '登录失败，请检查邮箱和密码是否正确');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>登录</Text>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="邮箱"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="密码"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? '登录中...' : '登录'}
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.registerLink}
        onPress={() => router.push('/register')}
      >
        <Text style={styles.registerText}>还没有账号？立即注册</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  form: {
    gap: theme.spacing.md,
  },
  input: {
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: 12,
    fontSize: 16,
    height: 48,
    color: theme.colors.text,
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  buttonText: {
    ...theme.typography.body,
    color: theme.colors.background,
    fontWeight: 'bold',
  },
  registerLink: {
    marginTop: theme.spacing.xl,
    alignItems: 'center',
  },
  registerText: {
    ...theme.typography.body,
    color: theme.colors.primary,
  },
});
