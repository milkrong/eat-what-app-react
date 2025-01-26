import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  TextInput,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { theme } from '../../src/theme';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { usePreferencesStore } from '@/stores/usePreferencesStore';
import { DietaryPreferences, DietType } from '@/types/recommendation';
import {
  DIET_TYPE_OPTIONS,
  CUISINE_TYPE_OPTIONS,
  ALLERGY_OPTIONS,
  DEFAULT_PREFERENCES,
} from '@/constants/preferences';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar_url: string;
  created_at: string;
}

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number | string;
  style?: any;
  borderRadius?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = 200,
  height = 200,
  style,
  borderRadius = theme.spacing.sm,
}) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height: typeof height === 'number' ? height : Number(height),
          backgroundColor: theme.colors.surface,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

const ProfileSkeleton = () => (
  <ScrollView>
    <View style={styles.header}>
      <SkeletonLoader width={100} height={100} borderRadius={50} />
      <SkeletonLoader
        width={150}
        height={24}
        style={{ marginTop: theme.spacing.md }}
      />
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>个人信息</Text>
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.infoItem}>
          <SkeletonLoader width={20} height={20} />
          <View style={styles.infoContent}>
            <SkeletonLoader width={80} height={16} />
            <SkeletonLoader
              width={120}
              height={20}
              style={{ marginTop: theme.spacing.xs }}
            />
          </View>
        </View>
      ))}
    </View>

    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>偏好设置</Text>
        <SkeletonLoader width={60} height={32} />
      </View>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <View key={i} style={styles.preferenceItem}>
          <View style={styles.preferenceHeader}>
            <SkeletonLoader width={20} height={20} />
            <SkeletonLoader
              width={80}
              height={16}
              style={{ marginLeft: theme.spacing.sm }}
            />
          </View>
          <SkeletonLoader
            width="100%"
            height={24}
            style={{ marginTop: theme.spacing.sm }}
          />
        </View>
      ))}
    </View>

    <SkeletonLoader
      width="90%"
      height={48}
      style={{
        alignSelf: 'center',
        marginVertical: theme.spacing.lg,
      }}
    />
  </ScrollView>
);

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { session, logout } = useAuthStore();
  const { preferences, error, fetchPreferences, updatePreferences } =
    usePreferencesStore();

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
        await fetchPreferences();
      } catch (error) {
        console.error('获取用户数据失败:', error);
        Alert.alert('错误', '获取用户数据失败');
      } finally {
        setInitialLoading(false);
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

  const handleSavePreferences = async () => {
    if (!preferences) return;

    try {
      setIsSaving(true);
      await updatePreferences(preferences);
      Alert.alert('成功', '偏好设置已保存');
      setIsEditing(false);
    } catch (error) {
      Alert.alert('错误', '保存偏好设置失败');
    } finally {
      setIsSaving(false);
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
    value: string | string[] | number,
    field: keyof DietaryPreferences
  ) => (
    <View style={styles.preferenceItem}>
      <View style={styles.preferenceHeader}>
        <FontAwesome name={icon} size={20} color={theme.colors.primary} />
        <Text style={styles.preferenceLabel}>{label}</Text>
      </View>
      {isEditing ? (
        field === 'diet_type' ||
        field === 'cuisine_type' ||
        field === 'allergies' ? (
          <View style={styles.chipContainer}>
            {(field === 'diet_type'
              ? DIET_TYPE_OPTIONS
              : field === 'cuisine_type'
              ? CUISINE_TYPE_OPTIONS
              : ALLERGY_OPTIONS
            ).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.chip,
                  preferences?.[field].includes(type as DietType) &&
                    styles.chipActive,
                ]}
                onPress={() => {
                  if (!preferences) return;
                  const currentValue = preferences[field] as string[];
                  usePreferencesStore.setState({
                    preferences: {
                      ...preferences,
                      [field]: currentValue.includes(type as DietType)
                        ? currentValue.filter((t) => t !== type)
                        : [...currentValue, type as DietType],
                    },
                  });
                }}
              >
                <Text
                  style={[
                    styles.chipText,
                    preferences?.[field].includes(type as DietType) &&
                      styles.chipTextActive,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <TextInput
            style={styles.input}
            value={String(value)}
            onChangeText={(newValue) => {
              if (!preferences) return;
              usePreferencesStore.setState({
                preferences: {
                  ...preferences,
                  [field]:
                    field === 'max_cooking_time' || field.includes('calories')
                      ? parseInt(newValue) || 0
                      : newValue,
                },
              });
            }}
            keyboardType="numeric"
            placeholder={`输入${label}`}
          />
        )
      ) : (
        <Text style={styles.preferenceValue}>
          {Array.isArray(value) ? value.join('、') : value}
          {typeof value === 'number' &&
            (label.includes('时间') ? ' 分钟' : ' 千卡')}
        </Text>
      )}
    </View>
  );

  if (initialLoading || !profile || !preferences) {
    return (
      <SafeAreaView style={styles.container}>
        <ProfileSkeleton />
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
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>偏好设置</Text>
            {!isEditing ? (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setIsEditing(true)}
              >
                <FontAwesome
                  name="edit"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text style={styles.editButtonText}>编辑</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  isSaving && styles.saveButtonDisabled,
                ]}
                onPress={handleSavePreferences}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator
                    size="small"
                    color={theme.colors.background}
                  />
                ) : (
                  <>
                    <FontAwesome
                      name="check"
                      size={20}
                      color={theme.colors.background}
                    />
                    <Text style={styles.saveButtonText}>保存</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
          {renderPreferenceItem(
            'cutlery',
            '饮食类型',
            preferences.diet_type || [],
            'diet_type'
          )}
          {renderPreferenceItem(
            'globe',
            '菜系偏好',
            preferences.cuisine_type || [],
            'cuisine_type'
          )}
          {renderPreferenceItem(
            'exclamation-triangle',
            '过敏原',
            preferences.allergies || [],
            'allergies'
          )}
          {renderPreferenceItem(
            'fire',
            '最低卡路里限制',
            preferences.calories_min || DEFAULT_PREFERENCES.calories_min,
            'calories_min'
          )}
          {renderPreferenceItem(
            'fire',
            '最高卡路里限制',
            preferences.calories_max || DEFAULT_PREFERENCES.calories_max,
            'calories_max'
          )}
          {renderPreferenceItem(
            'clock-o',
            '最大烹饪时间',
            preferences.max_cooking_time ||
              DEFAULT_PREFERENCES.max_cooking_time,
            'max_cooking_time'
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    borderRadius: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  editButtonText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    marginLeft: theme.spacing.xs,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    borderRadius: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    minWidth: 80,
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    ...theme.typography.body,
    color: theme.colors.background,
    marginLeft: theme.spacing.xs,
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
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  chip: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surface,
  },
  chipActive: {
    backgroundColor: theme.colors.primary + '20',
    borderColor: theme.colors.primary,
  },
  chipText: {
    ...theme.typography.caption,
    color: theme.colors.text,
  },
  chipTextActive: {
    color: theme.colors.primary,
  },
  input: {
    ...theme.typography.body,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.sm,
    borderRadius: theme.spacing.sm,
    marginTop: theme.spacing.sm,
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
