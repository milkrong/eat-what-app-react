import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/theme';
import { useAuthStore } from '@/stores/useAuthStore';
import { router } from 'expo-router';
import Toast, { useToastStore } from '@/components/Toast';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useAuthStore();
  const { showToast } = useToastStore();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFFFFF',
    },
    content: {
      flex: 1,
      padding: 24,
      justifyContent: 'center',
    },
    header: {
      alignItems: 'center',
      marginBottom: 48,
    },
    logo: {
      width: 80,
      height: 80,
      marginBottom: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: '600',
      color: '#1A1A1A',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: '#666666',
      textAlign: 'center',
      marginBottom: 32,
    },
    inputContainer: {
      marginBottom: 24,
    },
    label: {
      fontSize: 14,
      color: '#1A1A1A',
      marginBottom: 8,
    },
    input: {
      backgroundColor: '#F5F5F5',
      borderRadius: 8,
      padding: 16,
      fontSize: 16,
      color: '#1A1A1A',
      borderWidth: 1,
      borderColor: '#E0E0E0',
    },
    inputFocused: {
      borderColor: '#666666',
    },
    loginButton: {
      backgroundColor: '#1A1A1A',
      borderRadius: 8,
      padding: 16,
      alignItems: 'center',
      marginTop: 16,
    },
    loginButtonDisabled: {
      backgroundColor: '#E0E0E0',
    },
    loginButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    forgotPassword: {
      alignItems: 'center',
      marginTop: 16,
    },
    forgotPasswordText: {
      color: '#666666',
      fontSize: 14,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 32,
    },
    footerText: {
      color: '#666666',
      fontSize: 14,
    },
    signupButton: {
      marginLeft: 4,
    },
    signupButtonText: {
      color: '#1A1A1A',
      fontSize: 14,
      fontWeight: '600',
    },
  });

  const handleLogin = async () => {
    if (!email || !password) {
      showToast('请输入邮箱和密码', 'error');
      return;
    }

    try {
      await login({ email, password });
      router.replace('/(tabs)' as any);
    } catch (error) {
      showToast('登录失败', 'error');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Image
            source={require('../../assets/images/icon.png')}
            style={styles.logo}
          />
          <Text style={styles.title}>欢迎回来</Text>
          <Text style={styles.subtitle}>登录你的账号以继续使用</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>邮箱</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="请输入邮箱"
            placeholderTextColor="#999999"
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>密码</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="请输入密码"
            placeholderTextColor="#999999"
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.loginButtonText}>登录</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>忘记密码？</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>还没有账号？</Text>
          <TouchableOpacity style={styles.signupButton}>
            <Text style={styles.signupButtonText}>立即注册</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Toast />
    </SafeAreaView>
  );
};

export default LoginScreen;
