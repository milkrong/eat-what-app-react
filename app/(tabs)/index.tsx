import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { FontAwesome } from '@expo/vector-icons';
import { useRecommendationStore } from '@/stores/useRecommendationStore';
import { theme } from '@/theme';
import { Recipe as DBRecipe } from '@/types/recipe';
import {
  Recipe as RecommendationRecipe,
  DietaryPreferences,
} from '@/types/recommendation';
import { useRecipeStore } from '../../src/stores/useRecipeStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/useAuthStore';

const SkeletonLoader = ({
  width,
  height,
  style,
}: {
  width: number | string;
  height: number | string;
  style?: any;
}) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
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
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor: theme.colors.surface,
          opacity: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 0.7],
          }),
          borderRadius: 8,
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

export default function RecommendationScreen() {
  const [preferences, setPreferences] =
    React.useState<DietaryPreferences | null>(null);
  const {
    currentRecommendation,
    dailyRecommendation,
    singleLoading,
    dailyLoading,
    error,
    fetchRecommendation,
    fetchDailyRecommendation,
  } = useRecommendationStore();
  const { session } = useAuthStore();
  const { saveRecipe } = useRecipeStore();

  // 获取用户偏好设置
  React.useEffect(() => {
    const fetchPreferences = async () => {
      if (!session?.access_token) return;

      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/users/preferences`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );
        if (!response.ok) throw new Error('获取偏好设置失败');
        const data = await response.json();
        console.log(data, 'preferences');
        setPreferences(data);
        // 获取到偏好设置后再请求推荐
        fetchRecommendation(data);
        fetchDailyRecommendation(data);
      } catch (error) {
        console.error('获取偏好设置失败:', error);
      }
    };

    fetchPreferences();
  }, [session?.access_token]); // 当 access_token 变化时重新获取

  const handleSkipRecommendation = () => {
    if (!preferences) return;
    fetchRecommendation(
      preferences,
      currentRecommendation ? [currentRecommendation.name] : undefined
    );
  };

  const handleAddToRecipe = async () => {
    if (!currentRecommendation || !preferences) return;

    try {
      const recipeData: Partial<DBRecipe> = {
        name: currentRecommendation.name,
        description: `${currentRecommendation.cuisine_type.join(
          '/'
        )} - ${currentRecommendation.diet_type.join('/')}`,
        difficulty: 'medium',
        cooking_time: currentRecommendation.cooking_time,
        calories: currentRecommendation.calories,
        servings: 2,
        nutrition_facts: {
          ...currentRecommendation.nutrition_facts,
          fiber: currentRecommendation.nutrition_facts.fiber || 0,
        },
        ingredients: currentRecommendation.ingredients.map((ing) => ({
          ...ing,
          category: '主料',
        })),
        steps: currentRecommendation.steps.map((step, index) => ({
          order: index + 1,
          description: step,
          image_url: undefined,
        })),
        images: [],
      };

      await saveRecipe(recipeData, {
        diet_type: preferences.diet_type,
        cuisine_type: preferences.cuisine_type,
        allergies: preferences.allergies,
        target_calories: preferences.target_calories,
        max_cooking_time: preferences.max_cooking_time,
        meals_per_day: preferences.meals_per_day,
      });
      Alert.alert('成功', '已添加到我的食谱');
    } catch (error) {
      console.error('保存食谱失败:', error);
      Alert.alert('错误', '保存食谱失败');
    }
  };

  const handleReplace = async (mealType: 'breakfast' | 'lunch' | 'dinner') => {
    if (!preferences) return;
    // 刷新单个推荐
    await fetchRecommendation(
      {
        ...preferences,
        meals_per_day: 1, // 只需要一餐
      },
      currentRecommendation ? [currentRecommendation.name] : undefined
    );
  };

  const handleApplyDailyRecommendation = async () => {
    if (!dailyRecommendation || !preferences) return;

    try {
      await Promise.all(
        dailyRecommendation.map((recipe) => {
          const recipeData: Partial<DBRecipe> = {
            name: recipe.name,
            description: `${recipe.cuisine_type.join(
              '/'
            )} - ${recipe.diet_type.join('/')}`,
            difficulty: 'medium',
            cooking_time: recipe.cooking_time,
            calories: recipe.calories,
            servings: 2,
            nutrition_facts: {
              ...recipe.nutrition_facts,
              fiber: recipe.nutrition_facts.fiber || 0,
            },
            ingredients: recipe.ingredients.map((ing) => ({
              ...ing,
              category: '主料',
            })),
            steps: recipe.steps.map((step, index) => ({
              order: index + 1,
              description: step,
              image_url: undefined,
            })),
            images: [],
          };

          return saveRecipe(recipeData, {
            diet_type: preferences.diet_type,
            cuisine_type: preferences.cuisine_type,
            allergies: preferences.allergies,
            target_calories: preferences.target_calories,
            max_cooking_time: preferences.max_cooking_time,
            meals_per_day: preferences.meals_per_day,
          });
        })
      );
      Alert.alert('成功', '已应用今日推荐');
    } catch (error) {
      console.error('应用今日推荐失败:', error);
      Alert.alert('错误', '应用今日推荐失败');
    }
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              if (!preferences) return;
              fetchRecommendation(preferences);
              fetchDailyRecommendation(preferences);
            }}
          >
            <Text style={styles.retryButtonText}>重试</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const renderSingleRecommendation = () => {
    if (singleLoading) {
      return <SingleRecommendationSkeleton />;
    }

    if (!currentRecommendation) return null;

    return (
      <View style={styles.singleRecommendation}>
        <LinearGradient
          colors={['rgba(0,0,0,0.6)', 'transparent']}
          style={styles.recommendationGradient}
        >
          <View style={styles.recommendationHeader}>
            <View style={styles.matchScore}>
              <Text style={styles.matchScoreText}>
                {currentRecommendation.calories}
              </Text>
              <Text style={styles.matchScoreLabel}>卡路里</Text>
            </View>
            <View style={styles.recommendationTags}>
              {[
                ...currentRecommendation.cuisine_type,
                ...currentRecommendation.diet_type,
              ].map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        </LinearGradient>
        <Image
          source={{
            uri: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
          }}
          style={styles.recommendationImage}
        />
        <View
          style={[
            styles.recommendationInfo,
            { backgroundColor: 'rgba(0,0,0,0.6)' },
          ]}
        >
          <View style={styles.recommendationContent}>
            <Text style={styles.recommendationTitle}>
              {currentRecommendation.name}
            </Text>
            <View style={styles.recipeMetrics}>
              <View style={styles.metricItem}>
                <FontAwesome
                  name="clock-o"
                  size={16}
                  color={theme.colors.background}
                />
                <Text style={styles.metricText}>
                  {currentRecommendation.cooking_time}分钟
                </Text>
              </View>
              <View style={styles.metricItem}>
                <FontAwesome
                  name="cutlery"
                  size={16}
                  color={theme.colors.background}
                />
                <Text style={styles.metricText}>
                  {currentRecommendation.ingredients.length}种食材
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.recommendationActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.skipButton]}
              onPress={handleSkipRecommendation}
            >
              <FontAwesome name="refresh" size={20} color={theme.colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.addButton]}
              onPress={handleAddToRecipe}
            >
              <FontAwesome
                name="plus"
                size={20}
                color={theme.colors.background}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderDailyRecommendation = () => {
    if (dailyLoading) {
      return <DailyRecommendationSkeleton />;
    }

    if (!dailyRecommendation) return null;

    const totalCalories = dailyRecommendation.reduce(
      (sum, meal) => sum + meal.calories,
      0
    );
    const totalProtein = dailyRecommendation.reduce(
      (sum, meal) => sum + meal.nutrition_facts.protein,
      0
    );
    const totalCarbs = dailyRecommendation.reduce(
      (sum, meal) => sum + meal.nutrition_facts.carbs,
      0
    );
    const totalFat = dailyRecommendation.reduce(
      (sum, meal) => sum + meal.nutrition_facts.fat,
      0
    );

    return (
      <View style={styles.dailyRecommendation}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>今日推荐</Text>
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

        <View style={styles.mealsContainer}>
          {dailyRecommendation.map((meal, index) => (
            <View key={`${meal.name}-${index}`} style={styles.mealCard}>
              <Image
                source={{
                  uri: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
                }}
                style={styles.mealImage}
              />
              <View style={styles.mealInfo}>
                <Text style={styles.mealType}>
                  {index === 0 ? '早餐' : index === 1 ? '午餐' : '晚餐'}
                </Text>
                <Text style={styles.mealName}>{meal.name}</Text>
                <Text style={styles.mealCalories}>{meal.calories} 千卡</Text>
              </View>
              <TouchableOpacity
                style={styles.replaceMealButton}
                onPress={() =>
                  handleReplace(
                    index === 0 ? 'breakfast' : index === 1 ? 'lunch' : 'dinner'
                  )
                }
              >
                <FontAwesome
                  name="refresh"
                  size={16}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.applyDailyButton}
          onPress={handleApplyDailyRecommendation}
        >
          <Text style={styles.applyButtonText}>应用今日推荐</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {renderSingleRecommendation()}
        {renderDailyRecommendation()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: theme.spacing.md,
  },
  retryButtonText: {
    ...theme.typography.body,
    color: theme.colors.background,
    fontWeight: 'bold',
  },
  singleRecommendation: {
    margin: theme.spacing.md,
    borderRadius: 16,
    overflow: 'hidden',
    height: 400,
  },
  recommendationGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    padding: theme.spacing.md,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  matchScore: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: theme.spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  matchScoreText: {
    ...theme.typography.h2,
    color: theme.colors.primary,
  },
  matchScoreLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  recommendationTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    maxWidth: '70%',
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: 12,
    marginLeft: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  tagText: {
    ...theme.typography.caption,
    color: theme.colors.text,
  },
  recommendationImage: {
    width: '100%',
    height: '100%',
  },
  recommendationInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  recommendationContent: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  recommendationTitle: {
    ...theme.typography.h1,
    color: theme.colors.background,
    marginBottom: theme.spacing.xs,
  },
  recipeMetrics: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.xs,
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
  recommendationActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  addButton: {
    backgroundColor: theme.colors.primary,
  },
  dailyRecommendation: {
    margin: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
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
  nutritionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: 12,
  },
  nutritionScore: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    marginLeft: theme.spacing.xs,
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
    color: theme.colors.text,
  },
  nutritionLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  mealsContainer: {
    gap: theme.spacing.sm,
  },
  mealCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mealImage: {
    width: 80,
    height: 80,
  },
  mealInfo: {
    flex: 1,
    padding: theme.spacing.md,
  },
  mealType: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  mealName: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginVertical: 2,
  },
  mealCalories: {
    ...theme.typography.caption,
    color: theme.colors.primary,
  },
  replaceMealButton: {
    padding: theme.spacing.sm,
    justifyContent: 'center',
  },
  applyDailyButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  applyButtonText: {
    ...theme.typography.body,
    color: theme.colors.background,
    fontWeight: 'bold',
  },
});
