import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { theme } from '../src/theme';
import { router } from 'expo-router';
import Toast, { useToastStore } from '@/components/Toast';
import { useGlobalStore, Settings } from '@/stores/useGlobalStore';

type IconName = keyof typeof FontAwesome.glyphMap;

interface LLMService {
  value: Settings['llmService'];
  label: string;
  icon: IconName;
}

const LLMSettingsScreen = () => {
  const { showToast } = useToastStore();
  const { settings, loading, error, updateSettings } = useGlobalStore();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<Settings>>({
    llmService: 'coze',
    modelName: '',
    isPaid: true,
    apiKey: '',
    apiEndpoint: '',
  });

  useEffect(() => {
    if (settings) {
      setForm({
        llmService: settings.llmService,
        modelName: settings.modelName,
        isPaid: settings.isPaid,
        apiKey: settings.apiKey,
        apiEndpoint: settings.apiEndpoint,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateSettings(form);
      showToast('设置已保存', 'success');
      router.back();
    } catch (error) {
      showToast('保存设置失败', 'error');
    } finally {
      setSaving(false);
    }
  };

  const llmServices: LLMService[] = [
    { value: 'coze', label: 'Coze', icon: 'comments' },
    { value: 'dify', label: 'Dify', icon: 'magic' },
    { value: 'deepseek', label: 'DeepSeek', icon: 'lightbulb-o' },
    { value: 'siliconflow', label: 'SiliconFlow', icon: 'rocket' },
    { value: 'ark', label: 'Ark', icon: 'magic' },
    { value: 'custom', label: '自定义', icon: 'gear' },
  ];

  if (loading && !settings) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <FontAwesome name="angle-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>AI 服务设置</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>服务提供商</Text>
          <View style={styles.serviceOptions}>
            {llmServices.map((service) => (
              <TouchableOpacity
                key={service.value}
                style={[
                  styles.serviceOption,
                  form.llmService === service.value &&
                    styles.serviceOptionActive,
                ]}
                onPress={() =>
                  setForm((prev) => ({
                    ...prev,
                    llmService: service.value as Settings['llmService'],
                  }))
                }
              >
                <View style={styles.serviceIconContainer}>
                  <FontAwesome
                    name={service.icon}
                    size={20}
                    color={
                      form.llmService === service.value
                        ? theme.colors.primary
                        : theme.colors.textSecondary
                    }
                  />
                </View>
                <Text
                  style={[
                    styles.serviceOptionText,
                    form.llmService === service.value &&
                      styles.serviceOptionTextActive,
                  ]}
                >
                  {service.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {form.llmService === 'custom' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>自定义设置</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>API Key</Text>
              <TextInput
                style={styles.input}
                value={form.apiKey}
                onChangeText={(text) =>
                  setForm((prev) => ({ ...prev, apiKey: text }))
                }
                placeholder="请输入 API Key"
                placeholderTextColor={theme.colors.textSecondary}
                secureTextEntry
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>API Endpoint</Text>
              <TextInput
                style={styles.input}
                value={form.apiEndpoint}
                onChangeText={(text) =>
                  setForm((prev) => ({ ...prev, apiEndpoint: text }))
                }
                placeholder="请输入 API Endpoint"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>模型名称</Text>
              <TextInput
                style={styles.input}
                value={form.modelName}
                onChangeText={(text) =>
                  setForm((prev) => ({ ...prev, modelName: text }))
                }
                placeholder="请输入模型名称"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={theme.colors.background} />
          ) : (
            <Text style={styles.saveButtonText}>保存</Text>
          )}
        </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface,
  },
  backButton: {
    padding: theme.spacing.sm,
    marginRight: theme.spacing.sm,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  serviceOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  serviceOption: {
    width: 100,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surface,
    padding: theme.spacing.sm,
  },
  serviceOptionActive: {
    backgroundColor: theme.colors.primary + '10',
    borderColor: theme.colors.primary,
  },
  serviceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  serviceOptionText: {
    ...theme.typography.caption,
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  serviceOptionTextActive: {
    color: theme.colors.primary,
  },
  inputContainer: {
    marginBottom: theme.spacing.md,
  },
  label: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  input: {
    ...theme.typography.body,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.surface,
  },
  footer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surface,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.spacing.sm,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    ...theme.typography.body,
    color: theme.colors.background,
    fontWeight: 'bold',
  },
});

export default LLMSettingsScreen;
