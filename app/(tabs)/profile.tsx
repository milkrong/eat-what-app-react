import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { theme } from '../../src/theme';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/useAuthStore';
import Toast, { useToastStore } from '@/components/Toast';
import { useGlobalStore } from '@/stores/useGlobalStore';

const ACTIVE_COLOR = '#FF9500';

interface Settings {
  id: string;
  llmService: 'coze' | 'dify' | 'deepseek' | 'siliconflow' | 'custom';
  modelName?: string;
  isPaid: boolean;
  apiKey?: string;
  apiEndpoint?: string;
  createdAt: string;
  updatedAt: string;
}

type IconName = keyof typeof FontAwesome.glyphMap;

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

const THEME_COLORS = [
  { label: '橙色', value: '#FF9500' },
  { label: '蓝色', value: '#007AFF' },
  { label: '绿色', value: '#34C759' },
  { label: '紫色', value: '#AF52DE' },
  { label: '粉色', value: '#FF2D55' },
  { label: '红色', value: '#FF3B30' },
];

const ProfileScreen = () => {
  const {
    profile,
    loading: globalLoading,
    preferences,
    settings,
    themeColor,
    setThemeColor,
  } = useGlobalStore();
  const { logout } = useAuthStore();
  const { showToast } = useToastStore();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(auth)/login' as any);
    } catch (error) {
      showToast('退出登录失败', 'error');
    }
  };

  const renderInfoItem = (icon: IconName, label: string, value: string) => (
    <View style={styles.infoItem}>
      <FontAwesome name={icon} size={20} color={themeColor} />
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );

  const llmServiceLabels: Record<Settings['llmService'], string> = {
    coze: 'Coze',
    dify: 'Dify',
    deepseek: 'DeepSeek',
    siliconflow: 'SiliconFlow',
    custom: '自定义',
  };

  if (globalLoading || !profile) {
    return (
      <SafeAreaView style={styles.container}>
        <ProfileSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <ScrollView style={styles.scrollView}>
          {/* 头像和用户名区域 */}
          <View style={styles.header}>
            <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
            <Text style={styles.username}>{profile.username}</Text>
          </View>

          {/* 个人信息区域 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>个人信息</Text>
            {renderInfoItem('user', '用户名', profile.username)}
            {renderInfoItem(
              'calendar',
              '注册时间',
              new Date(profile.createdAt).toLocaleDateString()
            )}
          </View>

          {/* 设置区域 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>设置</Text>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push('/preferences' as any)}
            >
              <View style={styles.settingItemLeft}>
                <FontAwesome name="sliders" size={20} color={themeColor} />
                <Text style={styles.settingItemText}>偏好设置</Text>
              </View>
              <View style={styles.settingItemRight}>
                <Text style={styles.settingItemValue}>
                  {preferences?.diet_type?.length || 0} 项已设置
                </Text>
                <FontAwesome
                  name="angle-right"
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push('/llm-settings' as any)}
            >
              <View style={styles.settingItemLeft}>
                <FontAwesome name="cog" size={20} color={themeColor} />
                <Text style={styles.settingItemText}>AI 服务设置</Text>
              </View>
              <View style={styles.settingItemRight}>
                <Text style={styles.settingItemValue}>
                  {settings?.llmService
                    ? llmServiceLabels[
                        settings.llmService as keyof typeof llmServiceLabels
                      ]
                    : '未设置'}
                </Text>
                <FontAwesome
                  name="angle-right"
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* 主题设置区域 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>主题设置</Text>
            {THEME_COLORS.map((color) => (
              <TouchableOpacity
                key={color.value}
                style={styles.settingItem}
                onPress={() => setThemeColor(color.value)}
              >
                <View style={styles.settingItemLeft}>
                  <View
                    style={[
                      styles.colorPreview,
                      { backgroundColor: color.value },
                    ]}
                  />
                  <Text style={styles.settingItemText}>{color.label}</Text>
                </View>
                <View style={styles.settingItemRight}>
                  {themeColor === color.value && (
                    <FontAwesome name="check" size={20} color={themeColor} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* 退出登录按钮 */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <FontAwesome name="sign-out" size={20} color={theme.colors.error} />
            <Text style={styles.logoutText}>退出登录</Text>
          </TouchableOpacity>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>
      <Toast />
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    padding: theme.spacing.md,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    marginBottom: theme.spacing.xl,
  },
  bottomPadding: {
    height: 12,
  },
  fixedBottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surface,
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  saveButton: {
    backgroundColor: ACTIVE_COLOR,
    padding: theme.spacing.md,
    borderRadius: theme.spacing.sm,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: theme.colors.background,
    ...theme.typography.body,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
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
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    marginBottom: theme.spacing.sm,
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
    backgroundColor: `${ACTIVE_COLOR}20`,
    borderColor: ACTIVE_COLOR,
  },
  chipText: {
    ...theme.typography.caption,
    color: theme.colors.text,
  },
  chipTextActive: {
    color: ACTIVE_COLOR,
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
    margin: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: 12,
  },
  logoutText: {
    ...theme.typography.body,
    color: theme.colors.error,
    marginLeft: theme.spacing.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingItemText: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
  },
  settingItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  settingItemValue: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: theme.spacing.md,
  },
});
