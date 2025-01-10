import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { Link, router } from 'expo-router';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { theme } from '../../src/theme';
import type { RegisterInput } from '../../src/types/auth';

export default function RegisterScreen() {
  const { register, loading, error } = useAuthStore();
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput & { confirmPassword: string }>();
  const password = watch('password');

  const onSubmit = async (
    data: RegisterInput & { confirmPassword: string }
  ) => {
    try {
      const { confirmPassword, ...registerData } = data;
      await register(registerData);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>注册</Text>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Controller
          control={control}
          name="email"
          rules={{
            required: '请输入邮箱',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: '请输入有效的邮箱地址',
            },
          }}
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="邮箱"
                keyboardType="email-address"
                autoCapitalize="none"
                value={value}
                onChangeText={onChange}
                editable={!loading}
                placeholderTextColor={theme.colors.textSecondary}
              />
              {errors.email && (
                <Text style={styles.fieldError}>{errors.email.message}</Text>
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          name="username"
          rules={{
            required: '请输入用户名',
            minLength: {
              value: 3,
              message: '用户名至少3位',
            },
          }}
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="用户名"
                value={value}
                onChangeText={onChange}
                editable={!loading}
                placeholderTextColor={theme.colors.textSecondary}
              />
              {errors.username && (
                <Text style={styles.fieldError}>{errors.username.message}</Text>
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          name="password"
          rules={{
            required: '请输入密码',
            minLength: {
              value: 6,
              message: '密码至少6位',
            },
          }}
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="密码"
                secureTextEntry
                value={value}
                onChangeText={onChange}
                editable={!loading}
                placeholderTextColor={theme.colors.textSecondary}
              />
              {errors.password && (
                <Text style={styles.fieldError}>{errors.password.message}</Text>
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          rules={{
            required: '请确认密码',
            validate: (value) => value === password || '两次输入的密码不一致',
          }}
          render={({ field: { onChange, value } }) => (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="确认密码"
                secureTextEntry
                value={value}
                onChangeText={onChange}
                editable={!loading}
                placeholderTextColor={theme.colors.textSecondary}
              />
              {errors.confirmPassword && (
                <Text style={styles.fieldError}>
                  {errors.confirmPassword.message}
                </Text>
              )}
            </View>
          )}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? '注册中...' : '注册'}
          </Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>已有账号？</Text>
          <Link href="/login" style={styles.link}>
            立即登录
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    justifyContent: 'center',
  },
  content: {
    gap: theme.spacing.md,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  inputContainer: {
    marginBottom: theme.spacing.md,
  },
  input: {
    ...theme.typography.body,
    borderWidth: 1,
    borderColor: theme.colors.textSecondary,
    borderRadius: theme.spacing.xs,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
  },
  fieldError: {
    ...theme.typography.caption,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.spacing.xs,
    padding: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    ...theme.typography.body,
    color: theme.colors.background,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
  },
  footerText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  link: {
    ...theme.typography.body,
    color: theme.colors.primary,
    marginLeft: theme.spacing.xs,
  },
});
