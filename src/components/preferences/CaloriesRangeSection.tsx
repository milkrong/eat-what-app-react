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

const CALORIES_PRESETS = [
  { label: '低卡路里', min: 200, max: 400 },
  { label: '中等卡路里', min: 400, max: 600 },
  { label: '高卡路里', min: 600, max: 800 },
];

interface CaloriesRangeSectionProps {
  value: { min: number; max: number };
  onChange: (value: { min: number; max: number }) => void;
}

export const CaloriesRangeSection: React.FC<CaloriesRangeSectionProps> = ({
  value,
  onChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customMin, setCustomMin] = useState(value.min.toString());
  const [customMax, setCustomMax] = useState(value.max.toString());

  const handleCustomSubmit = () => {
    const min = parseInt(customMin);
    const max = parseInt(customMax);
    if (!isNaN(min) && !isNaN(max) && min <= max) {
      onChange({ min, max });
      setShowCustomInput(false);
    }
  };

  const isPresetActive = (preset: (typeof CALORIES_PRESETS)[0]) => {
    return value.min === preset.min && value.max === preset.max;
  };

  return (
    <View style={styles.preferenceSection}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Text style={styles.sectionTitle}>卡路里范围</Text>
        <View style={styles.headerRight}>
          <Text style={styles.caloriesRangeText}>
            {value.min} - {value.max} 千卡
          </Text>
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
          <View style={styles.caloriesPresets}>
            {CALORIES_PRESETS.map((preset) => (
              <TouchableOpacity
                key={preset.label}
                style={[
                  styles.caloriesPresetButton,
                  isPresetActive(preset) && styles.caloriesPresetButtonActive,
                ]}
                onPress={() => onChange({ min: preset.min, max: preset.max })}
              >
                <Text
                  style={[
                    styles.caloriesPresetText,
                    isPresetActive(preset) && styles.caloriesPresetTextActive,
                  ]}
                >
                  {preset.label}
                </Text>
                <Text
                  style={[
                    styles.caloriesPresetRange,
                    isPresetActive(preset) && styles.caloriesPresetRangeActive,
                  ]}
                >
                  {preset.min}-{preset.max}千卡
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {!showCustomInput ? (
            <TouchableOpacity
              style={styles.customRangeButton}
              onPress={() => setShowCustomInput(true)}
            >
              <FontAwesome name="plus" size={14} color={theme.colors.primary} />
              <Text style={styles.customRangeButtonText}>自定义范围</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.customRangeInputContainer}>
              <View style={styles.customRangeInputs}>
                <TextInput
                  style={styles.customRangeInput}
                  value={customMin}
                  onChangeText={setCustomMin}
                  placeholder="最小值"
                  keyboardType="numeric"
                  returnKeyType="done"
                  maxLength={4}
                />
                <Text style={styles.customRangeSeparator}>-</Text>
                <TextInput
                  style={styles.customRangeInput}
                  value={customMax}
                  onChangeText={setCustomMax}
                  placeholder="最大值"
                  keyboardType="numeric"
                  returnKeyType="done"
                  maxLength={4}
                />
                <Text style={styles.customRangeUnit}>千卡</Text>
              </View>
              <View style={styles.customRangeActions}>
                <TouchableOpacity
                  style={[styles.customRangeAction, styles.customRangeCancel]}
                  onPress={() => setShowCustomInput(false)}
                >
                  <Text style={styles.customRangeCancelText}>取消</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.customRangeAction, styles.customRangeConfirm]}
                  onPress={handleCustomSubmit}
                >
                  <Text style={styles.customRangeConfirmText}>确定</Text>
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
  caloriesRangeText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  sectionContent: {
    padding: 8,
  },
  caloriesPresets: {
    gap: theme.spacing.sm,
  },
  caloriesPresetButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.sm,
    borderRadius: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.surface,
  },
  caloriesPresetButtonActive: {
    backgroundColor: theme.colors.primary + '20',
    borderColor: theme.colors.primary,
  },
  caloriesPresetText: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  caloriesPresetTextActive: {
    color: theme.colors.primary,
  },
  caloriesPresetRange: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  caloriesPresetRangeActive: {
    color: theme.colors.primary,
  },
  customRangeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
    padding: theme.spacing.sm,
    borderRadius: theme.spacing.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.primary,
  },
  customRangeButtonText: {
    ...theme.typography.body,
    color: theme.colors.primary,
  },
  customRangeInputContainer: {
    marginTop: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  customRangeInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  customRangeInput: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.spacing.sm,
    color: theme.colors.text,
    ...theme.typography.body,
    textAlign: 'center',
  },
  customRangeSeparator: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  customRangeUnit: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  customRangeActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  customRangeAction: {
    flex: 1,
    padding: theme.spacing.sm,
    borderRadius: theme.spacing.sm,
    alignItems: 'center',
  },
  customRangeCancel: {
    backgroundColor: theme.colors.surface,
  },
  customRangeConfirm: {
    backgroundColor: theme.colors.primary,
  },
  customRangeCancelText: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  customRangeConfirmText: {
    ...theme.typography.body,
    color: theme.colors.background,
    fontWeight: 'bold',
  },
});
