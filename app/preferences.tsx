import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../src/theme';
import { useGlobalStore } from '@/stores/useGlobalStore';
import { DietType } from '@/types/recommendation';
import {
  DIET_TYPE_OPTIONS,
  CUISINE_TYPE_OPTIONS,
  ALLERGY_OPTIONS,
  LIMIT_OPTIONS,
} from '@/constants/preferences';
import {
  PreferenceSection,
  CaloriesRangeSection,
  CookingTimeSection,
} from '@/components/preferences';
import Toast, { useToastStore } from '@/components/Toast';
import { router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

const PreferencesScreen = () => {
  const { showToast } = useToastStore();
  const {
    setPreferences,
    preferences,
    loading: preferencesLoading,
    updatePreferences,
  } = useGlobalStore();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!preferences || saving) return;

    try {
      setSaving(true);
      await updatePreferences(preferences);
      showToast('保存成功', 'success');
      router.back();
    } catch (error) {
      console.error('保存偏好设置失败:', error);
      showToast('保存失败', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (preferencesLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <FontAwesome
              name="angle-left"
              size={24}
              color={theme.colors.text}
            />
          </TouchableOpacity>
          <Text style={styles.title}>偏好设置</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.scrollView}>
          <PreferenceSection
            title="饮食类型"
            options={DIET_TYPE_OPTIONS}
            selectedValues={preferences?.diet_type || []}
            onValueChange={(values) =>
              setPreferences({
                ...preferences!,
                diet_type: values as DietType[],
              })
            }
          />

          <PreferenceSection
            title="菜系偏好"
            options={CUISINE_TYPE_OPTIONS}
            selectedValues={preferences?.cuisine_type || []}
            onValueChange={(values) =>
              setPreferences({
                ...preferences!,
                cuisine_type: values,
              })
            }
          />

          <PreferenceSection
            title="过敏原"
            options={ALLERGY_OPTIONS}
            selectedValues={preferences?.allergies || []}
            onValueChange={(values) =>
              setPreferences({
                ...preferences!,
                allergies: values,
              })
            }
          />

          <PreferenceSection
            title="限制"
            options={LIMIT_OPTIONS}
            selectedValues={preferences?.restrictions || []}
            onValueChange={(values) =>
              setPreferences({
                ...preferences!,
                restrictions: values,
              })
            }
          />

          <CaloriesRangeSection
            value={{
              min: preferences?.calories_min || 300,
              max: preferences?.calories_max || 600,
            }}
            onChange={({ min, max }) =>
              setPreferences({
                ...preferences!,
                calories_min: min,
                calories_max: max,
              })
            }
          />

          <CookingTimeSection
            value={preferences?.max_cooking_time || 45}
            onChange={(value) =>
              setPreferences({
                ...preferences!,
                max_cooking_time: value,
              })
            }
          />

          <View style={styles.bottomPadding} />
        </ScrollView>

        <View style={styles.fixedBottomContainer}>
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.disabledButton]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <ActivityIndicator color={theme.colors.background} />
                <Text
                  style={[
                    styles.saveButtonText,
                    { marginLeft: theme.spacing.sm },
                  ]}
                >
                  保存中...
                </Text>
              </>
            ) : (
              <Text style={styles.saveButtonText}>更新设置</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface,
  },
  backButton: {
    padding: theme.spacing.sm,
    marginLeft: -theme.spacing.sm,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text,
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
  bottomPadding: {
    height: 120,
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
    backgroundColor: theme.colors.primary,
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
});

export default PreferencesScreen;
