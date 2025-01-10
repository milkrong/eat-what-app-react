import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { theme } from '../../src/theme';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { DietaryPreferences } from '@/types/recommendation';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar_url: string;
  created_at: string;
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<DietaryPreferences | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const { session, logout } = useAuthStore();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.access_token) return;

      try {
        // 获取用户资料
        const profileResponse = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/users/profile`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );
        if (!profileResponse.ok) throw new Error('获取用户资料失败');
        const profileData = await profileResponse.json();
        setProfile(profileData);

        // 获取用户偏好设置
        const preferencesResponse = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/users/preferences`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );
        if (!preferencesResponse.ok) throw new Error('获取偏好设置失败');
        const preferencesData = await preferencesResponse.json();
        setPreferences(preferencesData);
      } catch (error) {
        console.error('获取用户数据失败:', error);
        Alert.alert('错误', '获取用户数据失败');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [session?.access_token]);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(auth)/login' as any);
    } catch (error) {
      Alert.alert('错误', '退出登录失败');
    }
  };

  const renderInfoItem = (
    icon: keyof typeof FontAwesome.glyphMap,
    label: string,
    value: string
  ) => (
    <View style={styles.infoItem}>
      <FontAwesome name={icon} size={20} color={theme.colors.primary} />
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );

  const renderPreferenceItem = (
    icon: keyof typeof FontAwesome.glyphMap,
    label: string,
    value: string | string[] | number
  ) => (
    <View style={styles.preferenceItem}>
      <View style={styles.preferenceHeader}>
        <FontAwesome name={icon} size={20} color={theme.colors.primary} />
        <Text style={styles.preferenceLabel}>{label}</Text>
      </View>
      <Text style={styles.preferenceValue}>
        {Array.isArray(value) ? value.join('、') : value}
        {typeof value === 'number' &&
          (label.includes('时间') ? ' 分钟' : ' 千卡')}
      </Text>
    </View>
  );

  if (loading || !profile || !preferences) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* 头像和用户名区域 */}
        <View style={styles.header}>
          <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
          <Text style={styles.username}>{profile.username}</Text>
        </View>

        {/* 个人信息区域 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>个人信息</Text>
          {renderInfoItem('envelope', '邮箱', profile.email)}
          {renderInfoItem('user', '用户名', profile.username)}
          {renderInfoItem(
            'calendar',
            '注册时间',
            new Date(profile.created_at).toLocaleDateString()
          )}
        </View>

        {/* 偏好设置区域 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>偏好设置</Text>
          {renderPreferenceItem(
            'cutlery',
            '饮食类型',
            preferences.diet_type || []
          )}
          {renderPreferenceItem(
            'exclamation-triangle',
            '过敏原',
            preferences.allergies || []
          )}
          {renderPreferenceItem(
            'fire',
            '卡路里限制',
            preferences.target_calories || 2000
          )}
          {renderPreferenceItem(
            'clock-o',
            '最大烹饪时间',
            preferences.max_cooking_time || 45
          )}
        </View>

        {/* 退出登录按钮 */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <FontAwesome name="sign-out" size={20} color={theme.colors.error} />
          <Text style={styles.logoutText}>退出登录</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  header: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: theme.spacing.md,
  },
  username: {
    ...theme.typography.h1,
    color: theme.colors.text,
  },
  section: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface,
  },
  infoContent: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  infoLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  infoValue: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginTop: 2,
  },
  preferenceItem: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: 12,
    marginBottom: theme.spacing.sm,
  },
  preferenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  preferenceLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
  },
  preferenceValue: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginLeft: theme.spacing.xl + theme.spacing.xs,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    margin: theme.spacing.lg,
    padding: theme.spacing.md,
    borderRadius: 12,
  },
  logoutText: {
    ...theme.typography.body,
    color: theme.colors.error,
    marginLeft: theme.spacing.sm,
  },
});
