import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { theme } from '@/theme';
import { useGlobalStore } from '@/stores/useGlobalStore';

const ACTIVE_COLOR = '#FF9500';

interface PreferenceSectionProps {
  title: string;
  options: string[];
  selectedValues: string[];
  onValueChange: (values: string[]) => void;
  allowCustom?: boolean;
}

export const PreferenceSection: React.FC<PreferenceSectionProps> = ({
  title,
  options,
  selectedValues,
  onValueChange,
  allowCustom = true,
}) => {
  const { themeColor } = useGlobalStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const [customValue, setCustomValue] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleAddCustomValue = () => {
    if (customValue.trim()) {
      onValueChange([...selectedValues, customValue.trim()]);
      setCustomValue('');
      setShowCustomInput(false);
    }
  };

  const handleRemoveValue = (value: string) => {
    onValueChange(selectedValues.filter((v) => v !== value));
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
    sectionContent: {
      padding: 8,
    },
    selectedChips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
      marginBottom: theme.spacing.sm,
    },
    selectedChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: `${themeColor}20`,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.spacing.sm,
      gap: theme.spacing.xs,
    },
    selectedChipText: {
      ...theme.typography.caption,
      color: themeColor,
    },
    removeChip: {
      padding: 2,
    },
    optionsScroll: {
      marginHorizontal: -theme.spacing.md,
    },
    optionsContent: {
      padding: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    optionChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.spacing.sm,
      gap: theme.spacing.xs,
      borderWidth: 1,
      borderColor: theme.colors.surface,
    },
    optionChipSelected: {
      backgroundColor: `${themeColor}20`,
      borderColor: themeColor,
    },
    optionChipText: {
      ...theme.typography.caption,
      color: theme.colors.text,
    },
    optionChipTextSelected: {
      color: themeColor,
    },
    addCustomChip: {
      borderStyle: 'dashed',
      borderColor: themeColor,
    },
    customInputContainer: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },
    customInput: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.spacing.sm,
      color: theme.colors.text,
      ...theme.typography.body,
    },
    customInputButton: {
      backgroundColor: themeColor,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.spacing.sm,
      justifyContent: 'center',
    },
    customInputButtonText: {
      color: theme.colors.background,
      ...theme.typography.body,
      fontWeight: 'bold',
    },
  });

  return (
    <View style={styles.preferenceSection}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Text style={styles.sectionTitle}>{title}</Text>
        <FontAwesome
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={theme.colors.text}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.sectionContent}>
          <View style={styles.selectedChips}>
            {selectedValues.map((value) => (
              <View key={value} style={styles.selectedChip}>
                <Text style={styles.selectedChipText}>{value}</Text>
                <TouchableOpacity
                  onPress={() => handleRemoveValue(value)}
                  style={styles.removeChip}
                >
                  <FontAwesome
                    name="times"
                    size={12}
                    color={theme.colors.text}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.optionsScroll}
            contentContainerStyle={styles.optionsContent}
          >
            {options.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionChip,
                  selectedValues.includes(option) && styles.optionChipSelected,
                ]}
                onPress={() => {
                  if (selectedValues.includes(option)) {
                    handleRemoveValue(option);
                  } else {
                    onValueChange([...selectedValues, option]);
                  }
                }}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    selectedValues.includes(option) &&
                      styles.optionChipTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
            {allowCustom && (
              <TouchableOpacity
                style={[styles.optionChip, styles.addCustomChip]}
                onPress={() => setShowCustomInput(true)}
              >
                <FontAwesome
                  name="plus"
                  size={14}
                  color={theme.colors.primary}
                />
                <Text
                  style={[
                    styles.optionChipText,
                    { color: theme.colors.primary },
                  ]}
                >
                  自定义
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          {showCustomInput && (
            <View style={styles.customInputContainer}>
              <TextInput
                style={styles.customInput}
                value={customValue}
                onChangeText={setCustomValue}
                placeholder="输入自定义选项"
                placeholderTextColor={theme.colors.textSecondary}
                returnKeyType="done"
                onSubmitEditing={handleAddCustomValue}
              />
              <TouchableOpacity
                style={styles.customInputButton}
                onPress={handleAddCustomValue}
              >
                <Text style={styles.customInputButtonText}>添加</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
};
