import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import { useRecommendationStore } from '@/stores/useRecommendationStore';
import { theme } from '@/theme';
import { DBRecipe } from '@/types/recipe';
import { Recipe, DietType } from '@/types/recommendation';
import { useRecipeStore } from '../../src/stores/useRecipeStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGlobalStore } from '@/stores/useGlobalStore';
import {
  ALLERGY_OPTIONS,
  CUISINE_TYPE_OPTIONS,
  DIET_TYPE_OPTIONS,
  LIMIT_OPTIONS,
} from '@/constants/preferences';
import Toast, { useToastStore } from '@/components/Toast';

import {
  PreferenceSection,
  CaloriesRangeSection,
  CookingTimeSection,
} from '@/components/preferences';

const ACTIVE_COLOR = '#FF9500';

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

const RecommendationScreen = () => {
  const { showToast } = useToastStore();
  const {
    recommendations,
    loading: recommendationsLoading,
    fetchRecommendations,
    appendRecommendations,
    clearRecommendations,
  } = useRecommendationStore();
  const {
    preferences,
    loading: preferencesLoading,
    updatePreferences,
    setPreferences,
    themeColor,
  } = useGlobalStore();
  const { saveRecipe } = useRecipeStore();

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
    startButton: {
      backgroundColor: themeColor,
      padding: theme.spacing.md,
      borderRadius: theme.spacing.sm,
      alignItems: 'center',
    },
    startButtonText: {
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
    recommendationsContainer: {
      flex: 1,
      padding: theme.spacing.md,
    },
    recommendationsContent: {
      flexGrow: 1,
    },
    cardsContainer: {
      flexDirection: 'row',
      height: '100%',
    },
    singleRecommendation: {
      width: Dimensions.get('window').width - theme.spacing.md * 2,
      height: '100%',
      borderRadius: theme.spacing.sm,
      overflow: 'hidden',
      backgroundColor: theme.colors.surface,
    },
    recipeImageContainer: {
      height: '50%',
      borderRadius: theme.spacing.sm,
      overflow: 'hidden',
    },
    recipeDetailsContainer: {
      flex: 1,
      padding: theme.spacing.md,
    },
    recipeDetailSection: {
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      ...theme.typography.h3,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    nutritionGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.md,
      justifyContent: 'space-between',
    },
    nutritionItem: {
      alignItems: 'center',
      width: '45%',
      backgroundColor: `${themeColor}10`,
      padding: theme.spacing.md,
      borderRadius: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    nutritionValue: {
      ...theme.typography.h3,
      color: themeColor,
      marginBottom: theme.spacing.xs,
    },
    nutritionLabel: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
    },
    ingredientsList: {
      gap: theme.spacing.xs,
    },
    ingredientItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      justifyContent: 'space-between',
    },
    ingredientText: {
      ...theme.typography.body,
      color: theme.colors.text,
    },
    ingredientAmount: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
    },
    generateMoreCard: {
      width: Dimensions.get('window').width - theme.spacing.md * 2,
      height: '100%',
      backgroundColor: `${themeColor}10`,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: theme.spacing.sm,
    },
    generateMoreButton: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: themeColor,
      justifyContent: 'center',
      alignItems: 'center',
    },
    generateMoreIcon: {
      color: theme.colors.background,
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
      backgroundColor: themeColor,
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
      backgroundColor: `${themeColor}20`,
      justifyContent: 'center',
      alignItems: 'center',
    },
    nutritionBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      backgroundColor: `${themeColor}20`,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.spacing.xs,
    },
    nutritionScore: {
      ...theme.typography.caption,
      color: themeColor,
    },
    nutritionStats: {
      marginBottom: theme.spacing.md,
    },
    bottomActions: {
      gap: theme.spacing.md,
      marginTop: 'auto',
      paddingVertical: theme.spacing.lg,
    },
    buttonIcon: {
      marginRight: theme.spacing.sm,
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.xl,
    },
    emptyStateText: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.md,
    },
    retryButton: {
      backgroundColor: themeColor,
      padding: theme.spacing.md,
      borderRadius: theme.spacing.sm,
      alignItems: 'center',
      minWidth: 120,
    },
    retryButtonText: {
      color: theme.colors.background,
      ...theme.typography.body,
      fontWeight: 'bold',
    },
    loadMoreButton: {
      backgroundColor: themeColor,
      padding: theme.spacing.md,
      borderRadius: theme.spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: theme.spacing.lg,
    },
    loadMoreButtonText: {
      color: theme.colors.background,
      ...theme.typography.body,
      fontWeight: 'bold',
    },
    modifyPreferencesButton: {
      backgroundColor: `${themeColor}20`,
      padding: theme.spacing.md,
      borderRadius: theme.spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    modifyPreferencesText: {
      color: themeColor,
      ...theme.typography.body,
      fontWeight: 'bold',
    },
    bottomPadding: {
      height: 120,
    },
    preferencesHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingVertical: theme.spacing.sm,
      gap: theme.spacing.xs,
    },
  });

  const RecommendationSkeleton = () => {
    return (
      <View style={styles.singleRecommendation}>
        <SkeletonLoader
          width="100%"
          height={400}
          style={styles.recommendationImage}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'transparent']}
          style={styles.recommendationGradient}
        >
          <View style={styles.recommendationHeader}>
            <View style={styles.recommendationTags}>
              <SkeletonLoader width={60} height={24} style={styles.tag} />
              <SkeletonLoader width={60} height={24} style={styles.tag} />
            </View>
          </View>
        </LinearGradient>
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.9)']}
          style={[styles.recommendationGradient, { bottom: 0, top: undefined }]}
        >
          <View style={styles.recommendationInfo}>
            <View style={styles.recommendationContent}>
              <SkeletonLoader
                width={200}
                height={28}
                style={{ marginBottom: theme.spacing.xs }}
              />
              <View style={styles.recipeMetrics}>
                <View style={styles.metricItem}>
                  <SkeletonLoader width={80} height={20} />
                </View>
                <View style={styles.metricItem}>
                  <SkeletonLoader width={80} height={20} />
                </View>
              </View>
            </View>
            <View style={styles.recommendationActions}>
              <SkeletonLoader
                width={44}
                height={44}
                style={{ borderRadius: 22 }}
              />
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  // 检查是否有推荐数据或正在生成
  const hasRecommendations = recommendations.length > 0;
  const isGenerating = recommendationsLoading;
  const shouldShowForm = !hasRecommendations && !isGenerating;

  const handleStartRecommendation = async () => {
    if (!preferences) return;

    try {
      // 保存偏好设置
      await updatePreferences(preferences);

      // 获取推荐，第一次只获取1个
      await fetchRecommendations(preferences, 1);
    } catch (err) {
      console.error('获取推荐失败:', err);
      showToast('获取推荐失败', 'error');
    }
  };

  const handleLoadMore = async () => {
    if (!preferences) return;

    try {
      // 加载更多时获取2个
      await appendRecommendations(
        preferences,
        2,
        recommendations.map((r) => r.name)
      );
    } catch (err) {
      console.error('获取更多推荐失败:', err);
      showToast('获取更多推荐失败', 'error');
    }
  };

  const handleSaveRecipe = async (recipe: Recipe) => {
    if (!preferences) return;

    try {
      const recipeData: Partial<DBRecipe> = {
        name: recipe.name,
        description: `${recipe.cuisineType.join('/')} - ${recipe.dietType.join(
          '/'
        )}`,
        cooking_time: recipe.cookingTime,
        calories: recipe.calories,
        cuisine_type: recipe.cuisineType,
        diet_type: recipe.dietType,
        nutrition_facts: {
          ...recipe.nutritionFacts,
          fiber: recipe.nutritionFacts.fiber || 0,
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
      await saveRecipe(recipeData, preferences);
      showToast('已添加到我的食谱', 'success');
    } catch (err) {
      console.error('保存食谱失败:', err);
      showToast('保存食谱失败', 'error');
    }
  };

  const handleModifyPreferences = () => {
    clearRecommendations();
  };

  const renderRecommendationCard = (recipe: Recipe) => {
    return (
      <View key={recipe.name} style={styles.singleRecommendation}>
        <View style={styles.recipeImageContainer}>
          <Image
            source={{ uri: recipe.img }}
            style={styles.recommendationImage}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.7)', 'transparent']}
            style={styles.recommendationGradient}
          >
            <View style={styles.recommendationHeader}>
              <View style={styles.recommendationTags}>
                {recipe.cuisineType.map((type) => (
                  <View key={type} style={styles.tag}>
                    <Text style={styles.tagText}>{type}</Text>
                  </View>
                ))}
                {recipe.dietType.map((type) => (
                  <View key={type} style={styles.tag}>
                    <Text style={styles.tagText}>{type}</Text>
                  </View>
                ))}
              </View>
            </View>
          </LinearGradient>
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.9)']}
            style={[
              styles.recommendationGradient,
              { bottom: 0, top: undefined },
            ]}
          >
            <View style={styles.recommendationInfo}>
              <View style={styles.recommendationContent}>
                <Text style={styles.recommendationTitle}>{recipe.name}</Text>
                <View style={styles.recipeMetrics}>
                  <View style={styles.metricItem}>
                    <FontAwesome
                      name="clock-o"
                      size={14}
                      color={theme.colors.background}
                    />
                    <Text style={styles.metricText}>
                      {recipe.cookingTime}分钟
                    </Text>
                  </View>
                  <View style={styles.metricItem}>
                    <FontAwesome
                      name="fire"
                      size={14}
                      color={theme.colors.background}
                    />
                    <Text style={styles.metricText}>{recipe.calories}千卡</Text>
                  </View>
                </View>
              </View>
              <View style={styles.recommendationActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.addButton]}
                  onPress={() => handleSaveRecipe(recipe)}
                >
                  <FontAwesome
                    name="plus"
                    size={20}
                    color={theme.colors.background}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </View>

        <ScrollView style={styles.recipeDetailsContainer}>
          <View style={styles.recipeDetailSection}>
            <Text style={styles.sectionTitle}>营养成分</Text>
            <View style={styles.nutritionGrid}>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>
                  {recipe.nutritionFacts.calories}千卡
                </Text>
                <Text style={styles.nutritionLabel}>热量</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>
                  {recipe.nutritionFacts.protein}g
                </Text>
                <Text style={styles.nutritionLabel}>蛋白质</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>
                  {recipe.nutritionFacts.fat}g
                </Text>
                <Text style={styles.nutritionLabel}>脂肪</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>
                  {recipe.nutritionFacts.fiber}g
                </Text>
                <Text style={styles.nutritionLabel}>膳食纤维</Text>
              </View>
            </View>
          </View>

          <View style={styles.recipeDetailSection}>
            <Text style={styles.sectionTitle}>食材</Text>
            <View style={styles.ingredientsList}>
              {recipe.ingredients.map((ingredient, index) => (
                <View key={index} style={styles.ingredientItem}>
                  <Text style={styles.ingredientText}>{ingredient.name}</Text>
                  <Text style={styles.ingredientAmount}>
                    {ingredient.amount} {ingredient.unit}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  };

  // 渲染推荐列表
  const renderRecommendations = () => {
    if (recommendations.length === 0 && !recommendationsLoading) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>暂无推荐</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => handleStartRecommendation()}
          >
            <Text style={styles.retryButtonText}>重试</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <>
        <TouchableOpacity
          style={styles.preferencesHeader}
          onPress={handleModifyPreferences}
        >
          <Text style={styles.modifyPreferencesText}>修改偏好</Text>
          <FontAwesome name="cog" size={20} color={themeColor} />
        </TouchableOpacity>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.cardsContainer}
        >
          {recommendations.map((recipe) => renderRecommendationCard(recipe))}
          {recommendationsLoading ? (
            <RecommendationSkeleton />
          ) : (
            <TouchableOpacity
              style={styles.generateMoreCard}
              onPress={handleLoadMore}
              disabled={recommendationsLoading}
            >
              <View style={styles.generateMoreButton}>
                <FontAwesome
                  name="plus"
                  size={32}
                  style={styles.generateMoreIcon}
                />
              </View>
            </TouchableOpacity>
          )}
        </ScrollView>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {shouldShowForm ? (
          <View style={styles.preferencesWrapper}>
            <ScrollView style={styles.preferencesContainer}>
              <Text style={styles.preferencesTitle}>设置偏好</Text>

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
                title="饮食限制"
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
                style={[
                  styles.startButton,
                  recommendationsLoading && styles.disabledButton,
                ]}
                onPress={handleStartRecommendation}
                disabled={recommendationsLoading}
              >
                {recommendationsLoading ? (
                  <>
                    <ActivityIndicator color={theme.colors.background} />
                    <Text
                      style={[
                        styles.startButtonText,
                        { marginLeft: theme.spacing.sm },
                      ]}
                    >
                      生成中...
                    </Text>
                  </>
                ) : (
                  <Text style={styles.startButtonText}>开始推荐</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.recommendationsContainer}>
            {renderRecommendations()}
          </View>
        )}
      </View>
      <Toast />
    </SafeAreaView>
  );
};

export default RecommendationScreen;
