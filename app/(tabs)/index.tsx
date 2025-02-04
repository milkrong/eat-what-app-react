import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  TextInput,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import { useRecommendationStore } from '@/stores/useRecommendationStore';
import { theme } from '@/theme';
import { Recipe as DBRecipe } from '@/types/recipe';
import {
  Recipe,
  DietaryPreferences,
  DietType,
} from '@/types/recommendation';
import { useRecipeStore } from '../../src/stores/useRecipeStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/useAuthStore';
import { usePreferencesStore } from '@/stores/usePreferencesStore';
import {
  ALLERGY_OPTIONS,
  CUISINE_TYPE_OPTIONS,
  DIET_TYPE_OPTIONS,
} from '@/constants/preferences';
import Toast, { useToastStore } from '@/components/Toast';
import Slider from '@react-native-community/slider';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number | string;
  style?: any;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = 200,
  height = 200,
  style,
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
          width: typeof width === 'string' ? '100%' : width,
          height: Number(height),
          backgroundColor: theme.colors.surface,
          borderRadius: theme.spacing.sm,
          opacity,
        },
        style,
      ]}
    />
  );
};

const SingleRecommendationSkeleton = () => (
  <View style={styles.singleRecommendation}>
    <SkeletonLoader width="100%" height={400} />
    <View
      style={[styles.recommendationInfo, { position: 'absolute', bottom: 0 }]}
    >
      <View style={{ flex: 1, gap: theme.spacing.sm }}>
        <SkeletonLoader width={200} height={24} />
        <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
          <SkeletonLoader width={80} height={16} />
          <SkeletonLoader width={80} height={16} />
        </View>
      </View>
      <View style={styles.recommendationActions}>
        <SkeletonLoader width={44} height={44} style={{ borderRadius: 22 }} />
        <SkeletonLoader width={44} height={44} style={{ borderRadius: 22 }} />
      </View>
    </View>
  </View>
);

const DailyRecommendationSkeleton = () => (
  <View style={styles.dailyRecommendation}>
    <View style={styles.sectionHeader}>
      <SkeletonLoader width={100} height={24} />
      <SkeletonLoader width={120} height={24} />
    </View>
    <View style={styles.nutritionStats}>
      <View style={styles.nutritionGrid}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.nutritionItem}>
            <SkeletonLoader width={60} height={24} />
            <SkeletonLoader
              width={40}
              height={16}
              style={{ marginTop: theme.spacing.xs }}
            />
          </View>
        ))}
      </View>
    </View>
    <View style={styles.mealsContainer}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.mealCard}>
          <SkeletonLoader width={80} height={80} />
          <View style={styles.mealInfo}>
            <SkeletonLoader width={60} height={16} />
            <SkeletonLoader
              width={120}
              height={20}
              style={{ marginVertical: theme.spacing.xs }}
            />
            <SkeletonLoader width={80} height={16} />
          </View>
          <View style={styles.replaceMealButton}>
            <SkeletonLoader
              width={32}
              height={32}
              style={{ borderRadius: 16 }}
            />
          </View>
        </View>
      ))}
    </View>
    <SkeletonLoader
      width="100%"
      height={48}
      style={{ borderRadius: 12, marginTop: theme.spacing.md }}
    />
  </View>
);

const RecommendationScreen = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuthStore();
  const { showToast } = useToastStore();
  const {
    breakfast,
    lunch,
    dinner,
    breakfastLoading,
    lunchLoading,
    dinnerLoading,
    fetchMealRecommendation,
    fetchAllMealRecommendations,
    clearRecommendations,
  } = useRecommendationStore();
  const {
    preferences,
    loading: preferencesLoading,
    fetchPreferences,
    updatePreferences,
  } = usePreferencesStore();
  const { saveRecipe } = useRecipeStore();

  // 检查是否有推荐数据或正在生成
  const hasRecommendations = breakfast || lunch || dinner;
  const isGenerating = breakfastLoading || lunchLoading || dinnerLoading;
  const shouldShowForm = !hasRecommendations && !isGenerating;

  useEffect(() => {
    const loadPreferences = async () => {
      if (!session?.access_token) return;

      try {
        await fetchPreferences();
      } catch (error) {
        console.error('获取偏好设置失败:', error);
        showToast('获取偏好设置失败', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [session?.access_token]);

  const handleStartRecommendation = async () => {
    if (!preferences) return;

    try {
      // 保存偏好设置
      await updatePreferences(preferences);

      // 获取推荐
      await fetchAllMealRecommendations(preferences);
    } catch (err) {
      console.error('获取推荐失败:', err);
      showToast('获取推荐失败', 'error');
    }
  };

  const handleRefreshMeal = async (mealType: 'breakfast' | 'lunch' | 'dinner') => {
    if (!preferences) return;
    
    const currentMeal = useRecommendationStore.getState()[mealType];
    await fetchMealRecommendation(
      mealType,
      preferences,
      currentMeal ? [currentMeal.name] : undefined
    );
  };

  const handleApplyDailyRecommendation = async () => {
    if (!preferences || !breakfast || !lunch || !dinner) return;

    try {
      const meals = [breakfast, lunch, dinner];
      await Promise.all(
        meals.map((recipe) => {
          const recipeData: Partial<DBRecipe> = {
            name: recipe.name,
            description: `${recipe.cuisine_type.join(
              '/'
            )} - ${recipe.diet_type.join('/')}`,
            cooking_time: recipe.cooking_time,
            calories: recipe.calories,
            cuisine_type: recipe.cuisine_type,
            diet_type: recipe.diet_type,
            nutrition_facts: {
              ...recipe.nutrition_facts,
              fiber: recipe.nutrition_facts.fiber || 0,
            },
            ingredients: recipe.ingredients.map((ing) => ({
              ...ing,
            })),
            steps: recipe.steps.map((step, index) => ({
              order: index + 1,
              description: step,
              image_url: undefined,
            })),
            img: recipe.img,
          };
          return saveRecipe(recipeData, preferences);
        })
      );
      showToast('已添加所有推荐到我的食谱', 'success');
    } catch (err) {
      console.error('保存食谱失败:', err);
      showToast('保存食谱失败', 'error');
    }
  };

  const handleModifyPreferences = () => {
    clearRecommendations();
  };

  const renderMealCard = (
    meal: Recipe | null,
    mealType: 'breakfast' | 'lunch' | 'dinner',
    isLoading: boolean
  ) => {
    if (isLoading) {
      return (
        <View style={styles.mealCard}>
          <SkeletonLoader width={80} height={80} />
          <View style={styles.mealInfo}>
            <SkeletonLoader width={60} height={16} />
            <SkeletonLoader
              width={120}
              height={20}
              style={{ marginVertical: theme.spacing.xs }}
            />
            <SkeletonLoader width={80} height={16} />
          </View>
          <View style={styles.replaceMealButton}>
            <SkeletonLoader
              width={32}
              height={32}
              style={{ borderRadius: 16 }}
            />
          </View>
        </View>
      );
    }

    if (!meal) {
      return (
        <View style={styles.mealCard}>
          <View style={[styles.mealImage, styles.errorContainer]}>
            <FontAwesome name="exclamation-circle" size={24} color={theme.colors.error} />
          </View>
          <View style={styles.mealInfo}>
            <Text style={styles.mealType}>
              {mealType === 'breakfast' ? '早餐' : mealType === 'lunch' ? '午餐' : '晚餐'}
            </Text>
            <Text style={[styles.mealName, { color: theme.colors.error }]}>获取推荐失败</Text>
          </View>
          <TouchableOpacity
            style={styles.replaceMealButton}
            onPress={() => handleRefreshMeal(mealType)}
          >
            <FontAwesome name="refresh" size={16} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.mealCard}>
        <Image
          source={{
            uri: meal.img,
          }}
          style={styles.mealImage}
        />
        <View style={styles.mealInfo}>
          <Text style={styles.mealType}>
            {mealType === 'breakfast' ? '早餐' : mealType === 'lunch' ? '午餐' : '晚餐'}
          </Text>
          <Text style={styles.mealName}>{meal.name}</Text>
          <Text style={styles.mealCalories}>{meal.calories} 千卡</Text>
        </View>
        <TouchableOpacity
          style={styles.replaceMealButton}
          onPress={() => handleRefreshMeal(mealType)}
        >
          <FontAwesome name="refresh" size={16} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderDailyRecommendation = () => {
    const totalCalories = [breakfast, lunch, dinner].reduce(
      (sum, meal) => sum + (meal?.calories || 0),
      0
    );
    const totalProtein = [breakfast, lunch, dinner].reduce(
      (sum, meal) => sum + (meal?.nutrition_facts.protein || 0),
      0
    );
    const totalCarbs = [breakfast, lunch, dinner].reduce(
      (sum, meal) => sum + (meal?.nutrition_facts.carbs || 0),
      0
    );
    const totalFat = [breakfast, lunch, dinner].reduce(
      (sum, meal) => sum + (meal?.nutrition_facts.fat || 0),
      0
    );

    return (
      <View style={styles.dailyRecommendation}>
        {/* 顶部卡片：营养摘要 */}
        <View style={styles.nutritionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>今日营养摘要</Text>
            <View style={styles.nutritionBadge}>
              <FontAwesome
                name="check-circle"
                size={14}
                color={theme.colors.primary}
              />
              <Text style={styles.nutritionScore}>
                总热量 {totalCalories} 千卡
              </Text>
            </View>
          </View>

          <View style={styles.nutritionStats}>
            <View style={styles.nutritionGrid}>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{totalProtein}g</Text>
                <Text style={styles.nutritionLabel}>蛋白质</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{totalCarbs}g</Text>
                <Text style={styles.nutritionLabel}>碳水</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{totalFat}g</Text>
                <Text style={styles.nutritionLabel}>脂肪</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 今日菜单部分 */}
        <View style={styles.menuSection}>
          <Text style={styles.menuTitle}>今日菜单</Text>
          <View style={styles.mealsContainer}>
            {renderMealCard(breakfast, 'breakfast', breakfastLoading)}
            {renderMealCard(lunch, 'lunch', lunchLoading)}
            {renderMealCard(dinner, 'dinner', dinnerLoading)}
          </View>
        </View>

        {/* 底部操作按钮 */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={[
              styles.applyButton,
              (!breakfast || !lunch || !dinner) && styles.disabledButton,
            ]}
            onPress={handleApplyDailyRecommendation}
            disabled={!breakfast || !lunch || !dinner}
          >
            <FontAwesome name="save" size={20} color={theme.colors.background} style={styles.buttonIcon} />
            <Text style={styles.applyButtonText}>保存到我的食谱</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modifyPreferencesButton}
            onPress={handleModifyPreferences}
          >
            <FontAwesome name="sliders" size={20} color={theme.colors.primary} style={styles.buttonIcon} />
            <Text style={styles.modifyPreferencesText}>修改偏好设置</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderCaloriesRange = () => {
    const minCalories = preferences?.calories_min || 300;
    const maxCalories = preferences?.calories_max || 600;

    return (
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>卡路里范围</Text>
        <View style={styles.caloriesRangeContainer}>
          <View style={styles.caloriesSliderContainer}>
            <Text style={styles.caloriesValue}>{minCalories} - {maxCalories} 千卡</Text>
            <View style={styles.sliderRow}>
              <Slider
                style={styles.slider}
                minimumValue={50}
                maximumValue={1000}
                step={25}
                value={minCalories}
                onValueChange={(value) =>
                  usePreferencesStore.setState({
                    preferences: {
                      ...preferences!,
                      calories_min: value,
                      calories_max: Math.max(value, maxCalories),
                    },
                  })
                }
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor={theme.colors.surface}
                thumbTintColor={theme.colors.primary}
              />
            </View>
            <View style={styles.sliderRow}>
              <Slider
                style={styles.slider}
                minimumValue={50}
                maximumValue={1000}
                step={25}
                value={maxCalories}
                onValueChange={(value) =>
                  usePreferencesStore.setState({
                    preferences: {
                      ...preferences!,
                      calories_max: value,
                      calories_min: Math.min(value, minCalories),
                    },
                  })
                }
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor={theme.colors.surface}
                thumbTintColor={theme.colors.primary}
              />
            </View>
            <View style={styles.caloriesLabels}>
              <Text style={styles.caloriesLabel}>50</Text>
              <Text style={styles.caloriesLabel}>500</Text>
              <Text style={styles.caloriesLabel}>1000</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {shouldShowForm ? (
          <View style={styles.preferencesWrapper}>
            <ScrollView style={styles.preferencesContainer}>
              <Text style={styles.preferencesTitle}>设置偏好</Text>

              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>饮食类型</Text>
                <View style={styles.chipContainer}>
                  {DIET_TYPE_OPTIONS.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.chip,
                        preferences?.diet_type.includes(type as DietType) &&
                          styles.chipActive,
                      ]}
                      onPress={() => {
                        if (!preferences) return;
                        const currentValue = preferences.diet_type;
                        usePreferencesStore.setState({
                          preferences: {
                            ...preferences,
                            diet_type: currentValue.includes(type as DietType)
                              ? currentValue.filter((t) => t !== type)
                              : [...currentValue, type as DietType],
                          },
                        });
                      }}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          preferences?.diet_type.includes(type as DietType) &&
                            styles.chipTextActive,
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>菜系偏好</Text>
                <View style={styles.chipContainer}>
                  {CUISINE_TYPE_OPTIONS.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.chip,
                        preferences?.cuisine_type.includes(type) &&
                          styles.chipActive,
                      ]}
                      onPress={() => {
                        if (!preferences) return;
                        const currentValue = preferences.cuisine_type;
                        usePreferencesStore.setState({
                          preferences: {
                            ...preferences,
                            cuisine_type: currentValue.includes(type)
                              ? currentValue.filter((t) => t !== type)
                              : [...currentValue, type],
                          },
                        });
                      }}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          preferences?.cuisine_type.includes(type) &&
                            styles.chipTextActive,
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>过敏原</Text>
                <View style={styles.chipContainer}>
                  {ALLERGY_OPTIONS.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.chip,
                        preferences?.allergies.includes(type) &&
                          styles.chipActive,
                      ]}
                      onPress={() => {
                        if (!preferences) return;
                        const currentValue = preferences.allergies;
                        usePreferencesStore.setState({
                          preferences: {
                            ...preferences,
                            allergies: currentValue.includes(type)
                              ? currentValue.filter((t) => t !== type)
                              : [...currentValue, type],
                          },
                        });
                      }}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          preferences?.allergies.includes(type) &&
                            styles.chipTextActive,
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {renderCaloriesRange()}

              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>最大烹饪时间（分钟）</Text>
                <TextInput
                  style={styles.input}
                  value={String(preferences?.max_cooking_time || 45)}
                  onChangeText={(value) =>
                    usePreferencesStore.setState({
                      preferences: {
                        ...preferences!,
                        max_cooking_time: parseInt(value) || 0,
                      },
                    })
                  }
                  keyboardType="numeric"
                  placeholder="最大烹饪时间"
                />
              </View>

              <View style={{ height: 80 }} />
            </ScrollView>

            <View style={styles.fixedBottomContainer}>
              <TouchableOpacity
                style={styles.startButton}
                onPress={handleStartRecommendation}
              >
                <Text style={styles.startButtonText}>开始推荐</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <ScrollView
            style={styles.recommendationsContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.recommendationsContent}
          >
            {renderDailyRecommendation()}
          </ScrollView>
        )}
      </View>
      <Toast />
    </SafeAreaView>
  );
};

const baseTypography = {
  body: {
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  h1: {
    fontSize: theme.typography.h1.fontSize,
    lineHeight: theme.typography.h1.lineHeight,
    fontWeight: theme.typography.h1.fontWeight,
  },
  h2: {
    fontSize: theme.typography.h2.fontSize,
    lineHeight: theme.typography.h2.lineHeight,
    fontWeight: theme.typography.h2.fontWeight,
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  preferencesWrapper: {
    flex: 1,
  },
  preferencesContainer: {
    flex: 1,
    padding: theme.spacing.md,
  },
  preferencesTitle: {
    ...baseTypography.h1,
    color: theme.colors.text,
    marginBottom: theme.spacing.xl,
  },
  formSection: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...baseTypography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
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
    ...baseTypography.body,
    color: theme.colors.text,
  },
  chipTextActive: {
    color: theme.colors.primary,
  },
  input: {
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.spacing.sm,
    color: theme.colors.text,
    fontSize: 16,
    height: 48,
  },
  startButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.spacing.sm,
    alignItems: 'center',
  },
  startButtonText: {
    color: theme.colors.background,
    ...baseTypography.body,
    fontWeight: 'bold',
  },
  errorContainer: {
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  errorText: {
    color: theme.colors.error,
    ...baseTypography.body,
    marginBottom: theme.spacing.md,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.spacing.sm,
    alignItems: 'center',
    minWidth: 120,
  },
  retryButtonText: {
    color: theme.colors.background,
    ...baseTypography.body,
    fontWeight: 'bold',
  },
  singleRecommendation: {
    width: '100%',
    height: 400,
    borderRadius: theme.spacing.sm,
    overflow: 'hidden',
    marginVertical: theme.spacing.md,
  },
  recommendationInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  recommendationActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  recommendationGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    zIndex: 1,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: theme.spacing.md,
  },
  matchScore: {
    alignItems: 'center',
  },
  matchScoreText: {
    ...theme.typography.h1,
    color: theme.colors.background,
  },
  matchScoreLabel: {
    ...theme.typography.caption,
    color: theme.colors.background,
  },
  recommendationTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.spacing.sm,
  },
  tagText: {
    ...theme.typography.caption,
    color: theme.colors.background,
  },
  recommendationImage: {
    width: '100%',
    height: '100%',
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    ...theme.typography.h2,
    color: theme.colors.background,
    marginBottom: theme.spacing.xs,
  },
  recipeMetrics: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  metricText: {
    ...theme.typography.caption,
    color: theme.colors.background,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButton: {
    backgroundColor: theme.colors.background,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
  },
  dailyRecommendation: {
    flex: 1,
    minHeight: '100%',
  },
  nutritionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2.84,
    elevation: 3,
  },
  menuSection: {
    flex: 1,
    marginBottom: theme.spacing.xl,
  },
  menuTitle: {
    ...baseTypography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  mealsContainer: {
    gap: theme.spacing.md,
  },
  mealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2.84,
    elevation: 3,
  },
  mealImage: {
    width: 80,
    height: 80,
    borderRadius: theme.spacing.xs,
  },
  mealInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  mealType: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  mealName: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginVertical: theme.spacing.xs,
  },
  mealCalories: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  replaceMealButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: theme.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nutritionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.primary + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.spacing.xs,
  },
  nutritionScore: {
    ...theme.typography.caption,
    color: theme.colors.primary,
  },
  nutritionStats: {
    marginBottom: theme.spacing.md,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    ...theme.typography.h2,
    color: theme.colors.primary,
  },
  nutritionLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  bottomActions: {
    gap: theme.spacing.md,
    marginTop: 'auto',
    paddingVertical: theme.spacing.lg,
  },
  buttonIcon: {
    marginRight: theme.spacing.sm,
  },
  recommendationsContainer: {
    flex: 1,
  },
  recommendationsContent: {
    flexGrow: 1,
    padding: theme.spacing.md,
  },
  applyButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    color: theme.colors.background,
    ...baseTypography.body,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  caloriesRangeContainer: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  caloriesSliderContainer: {
    alignItems: 'center',
  },
  caloriesValue: {
    ...baseTypography.h2,
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  sliderRow: {
    width: '100%',
    marginBottom: theme.spacing.xs,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  caloriesLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: theme.spacing.xs,
  },
  caloriesLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  modifyPreferencesButton: {
    backgroundColor: 'transparent',
    padding: theme.spacing.md,
    borderRadius: theme.spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  modifyPreferencesText: {
    ...baseTypography.body,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
});

export default RecommendationScreen;
