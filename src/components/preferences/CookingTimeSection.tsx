import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { theme } from '@/theme';

const ACTIVE_COLOR = '#FF9500';

const COOKING_TIME_PRESETS = [
  { label: '快速料理', time: 15 },
  { label: '一般料理', time: 30 },
  { label: '精致料理', time: 45 },
  { label: '大餐', time: 60 },
];

interface CookingTimeSectionProps {
  value: number;
  onChange: (value: number) => void;
}

export const CookingTimeSection: React.FC<CookingTimeSectionProps> = ({
  value,
  onChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customTime, setCustomTime] = useState(value.toString());

  const handleCustomSubmit = () => {
    const time = parseInt(customTime);
    if (!isNaN(time) && time > 0) {
      onChange(time);
      setShowCustomInput(false);
    }
  };

  const isPresetActive = (preset: (typeof COOKING_TIME_PRESETS)[0]) => {
    return value === preset.time;
  };

  return (
    <View style={styles.preferenceSection}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Text style={styles.sectionTitle}>最大烹饪时间</Text>
        <View style={styles.headerRight}>
          <Text style={styles.cookingTimeText}>{value} 分钟</Text>
          <FontAwesome
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={theme.colors.text}
            style={{ marginLeft: 8 }}
          />
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.sectionContent}>
          <View style={styles.cookingTimePresets}>
            {COOKING_TIME_PRESETS.map((preset) => (
              <TouchableOpacity
                key={preset.label}
                style={[
                  styles.cookingTimePresetButton,
                  isPresetActive(preset) &&
                    styles.cookingTimePresetButtonActive,
                ]}
                onPress={() => onChange(preset.time)}
              >
                <Text
                  style={[
                    styles.cookingTimePresetText,
                    isPresetActive(preset) &&
                      styles.cookingTimePresetTextActive,
                  ]}
                >
                  {preset.label}
                </Text>
                <Text
                  style={[
                    styles.cookingTimePresetValue,
                    isPresetActive(preset) &&
                      styles.cookingTimePresetValueActive,
                  ]}
                >
                  {preset.time}分钟
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {!showCustomInput ? (
            <TouchableOpacity
              style={styles.customTimeButton}
              onPress={() => setShowCustomInput(true)}
            >
              <FontAwesome name="plus" size={14} color={ACTIVE_COLOR} />
              <Text style={styles.customTimeButtonText}>自定义时间</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.customTimeInputContainer}>
              <View style={styles.customTimeInputWrapper}>
                <TextInput
                  style={styles.customTimeInput}
                  value={customTime}
                  onChangeText={setCustomTime}
                  placeholder="输入时间"
                  keyboardType="numeric"
                  returnKeyType="done"
                  maxLength={3}
                />
                <Text style={styles.customTimeUnit}>分钟</Text>
              </View>
              <View style={styles.customTimeActions}>
                <TouchableOpacity
                  style={[styles.customTimeAction, styles.customTimeCancel]}
                  onPress={() => setShowCustomInput(false)}
                >
                  <Text style={styles.customTimeCancelText}>取消</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.customTimeAction, styles.customTimeConfirm]}
                  onPress={handleCustomSubmit}
                >
                  <Text style={styles.customTimeConfirmText}>确定</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  preferenceSection: {
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.sm,
    overflow: 'hidden',
  },
  sectionHeader: {
    padding: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cookingTimeText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  sectionContent: {
    padding: 8,
  },
  cookingTimePresets: {
    gap: theme.spacing.sm,
  },
  cookingTimePresetButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.sm,
    borderRadius: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.surface,
  },
  cookingTimePresetButtonActive: {
    backgroundColor: `${ACTIVE_COLOR}20`,
    borderColor: ACTIVE_COLOR,
  },
  cookingTimePresetText: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  cookingTimePresetTextActive: {
    color: ACTIVE_COLOR,
  },
  cookingTimePresetValue: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  cookingTimePresetValueActive: {
    color: ACTIVE_COLOR,
  },
  customTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
    padding: theme.spacing.sm,
    borderRadius: theme.spacing.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: ACTIVE_COLOR,
  },
  customTimeButtonText: {
    ...theme.typography.body,
    color: ACTIVE_COLOR,
  },
  customTimeInputContainer: {
    marginTop: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  customTimeInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  customTimeInput: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.spacing.sm,
    color: theme.colors.text,
    ...theme.typography.body,
    textAlign: 'center',
  },
  customTimeUnit: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  customTimeActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  customTimeAction: {
    flex: 1,
    padding: theme.spacing.sm,
    borderRadius: theme.spacing.sm,
    alignItems: 'center',
  },
  customTimeCancel: {
    backgroundColor: theme.colors.surface,
  },
  customTimeConfirm: {
    backgroundColor: ACTIVE_COLOR,
  },
  customTimeCancelText: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  customTimeConfirmText: {
    ...theme.typography.body,
    color: theme.colors.background,
    fontWeight: 'bold',
  },
});
