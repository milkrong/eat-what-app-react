import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Alert,
  TextInput,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import { useRecommendationStore } from '@/stores/useRecommendationStore';
import { theme } from '@/theme';
import { Recipe as DBRecipe } from '@/types/recipe';
import {
  Recipe as RecommendationRecipe,
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

export default function RecommendationScreen() {
  const [showPreferences, setShowPreferences] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuthStore();
  const {
    currentRecommendation,
    dailyRecommendation,
    singleLoading,
    dailyLoading,
    fetchRecommendation,
    fetchDailyRecommendation,
  } = useRecommendationStore();
  const {
    preferences,
    loading: preferencesLoading,
    fetchPreferences,
    updatePreferences,
  } = usePreferencesStore();
  const { saveRecipe } = useRecipeStore();

  useEffect(() => {
    const loadPreferences = async () => {
      if (!session?.access_token) return;

      try {
        await fetchPreferences();
      } catch (error) {
        console.error('获取偏好设置失败:', error);
        Alert.alert('错误', '获取偏好设置失败');
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
      setShowPreferences(false);
      await Promise.all([
        fetchRecommendation(preferences),
        fetchDailyRecommendation(preferences),
      ]);
    } catch (err) {
      console.error('获取推荐失败:', err);
      Alert.alert('错误', '获取推荐失败');
    }
  };

  const renderPreferencesForm = () => (
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
                preferences?.cuisine_type.includes(type) && styles.chipActive,
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
                preferences?.allergies.includes(type) && styles.chipActive,
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

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>卡路里范围</Text>
        <View style={styles.caloriesInputContainer}>
          <View style={styles.caloriesInput}>
            <Text style={styles.caloriesLabel}>最小值</Text>
            <TextInput
              style={styles.input}
              value={String(preferences?.calories_min || 1500)}
              onChangeText={(value) =>
                usePreferencesStore.setState({
                  preferences: {
                    ...preferences!,
                    calories_min: parseInt(value) || 0,
                  },
                })
              }
              keyboardType="numeric"
              placeholder="最小卡路里"
            />
          </View>
          <View style={styles.caloriesInput}>
            <Text style={styles.caloriesLabel}>最大值</Text>
            <TextInput
              style={styles.input}
              value={String(preferences?.calories_max || 2500)}
              onChangeText={(value) =>
                usePreferencesStore.setState({
                  preferences: {
                    ...preferences!,
                    calories_max: parseInt(value) || 0,
                  },
                })
              }
              keyboardType="numeric"
              placeholder="最大卡路里"
            />
          </View>
        </View>
      </View>

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

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartRecommendation}
        >
          <Text style={styles.startButtonText}>开始推荐</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

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
        cooking_time: currentRecommendation.cooking_time,
        calories: currentRecommendation.calories,
        nutrition_facts: {
          ...currentRecommendation.nutrition_facts,
          fiber: currentRecommendation.nutrition_facts.fiber || 0,
        },
        ingredients: currentRecommendation.ingredients.map((ing) => ({
          ...ing,
        })),
        steps: currentRecommendation.steps.map((step, index) => ({
          order: index + 1,
          description: step,
          image_url: undefined,
        })),
        cuisine_type: currentRecommendation.cuisine_type,
        diet_type: currentRecommendation.diet_type,
      };

      await saveRecipe(recipeData, preferences);
      Alert.alert('成功', '已添加到我的食谱');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '保存食谱失败';
      console.error('保存食谱失败:', errorMessage);
      Alert.alert('错误', errorMessage);
    }
  };

  const handleReplace = async () => {
    if (!currentRecommendation || !preferences) return;

    try {
      await fetchRecommendation(preferences, [currentRecommendation.name]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取推荐失败';
      console.error('获取推荐失败:', errorMessage);
      Alert.alert('错误', errorMessage);
    }
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
            cooking_time: recipe.cooking_time,
            calories: recipe.calories,
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
          };
          return saveRecipe(recipeData, preferences);
        })
      );
      Alert.alert('成功', '已添加所有推荐到我的食谱');
    } catch (err) {
      console.error('保存食谱失败:', err);
      Alert.alert('错误', '保存食谱失败');
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

    if (!currentRecommendation) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>获取推荐失败</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              if (!preferences) return;
              fetchRecommendation(preferences);
            }}
          >
            <Text style={styles.retryButtonText}>重试</Text>
          </TouchableOpacity>
        </View>
      );
    }

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

    if (!dailyRecommendation) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>获取每日推荐失败</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              if (!preferences) return;
              fetchDailyRecommendation(preferences);
            }}
          >
            <Text style={styles.retryButtonText}>重试</Text>
          </TouchableOpacity>
        </View>
      );
    }

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
                onPress={handleReplace}
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

        <View style={styles.applyDailyButton}>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={handleApplyDailyRecommendation}
          >
            <Text style={styles.applyButtonText}>应用今日推荐</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modifyPreferencesButton}
            onPress={() => setShowPreferences(true)}
          >
            <Text style={styles.modifyPreferencesText}>修改偏好设置</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {showPreferences ? (
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

              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>卡路里范围</Text>
                <View style={styles.caloriesInputContainer}>
                  <View style={styles.caloriesInput}>
                    <Text style={styles.caloriesLabel}>最小值</Text>
                    <TextInput
                      style={styles.input}
                      value={String(preferences?.calories_min || 1500)}
                      onChangeText={(value) =>
                        usePreferencesStore.setState({
                          preferences: {
                            ...preferences!,
                            calories_min: parseInt(value) || 0,
                          },
                        })
                      }
                      keyboardType="numeric"
                      placeholder="最小卡路里"
                    />
                  </View>
                  <View style={styles.caloriesInput}>
                    <Text style={styles.caloriesLabel}>最大值</Text>
                    <TextInput
                      style={styles.input}
                      value={String(preferences?.calories_max || 2500)}
                      onChangeText={(value) =>
                        usePreferencesStore.setState({
                          preferences: {
                            ...preferences!,
                            calories_max: parseInt(value) || 0,
                          },
                        })
                      }
                      keyboardType="numeric"
                      placeholder="最大卡路里"
                    />
                  </View>
                </View>
              </View>

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
          >
            {renderSingleRecommendation()}
            {renderDailyRecommendation()}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

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
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  nutritionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.primary + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.spacing.sm,
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
  mealsContainer: {
    gap: theme.spacing.sm,
  },
  mealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderRadius: theme.spacing.sm,
  },
  mealImage: {
    width: 80,
    height: 80,
    borderRadius: theme.spacing.sm,
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
    borderRadius: 16,
    backgroundColor: theme.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyDailyButton: {
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  applyButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.spacing.sm,
    alignItems: 'center',
    width: '100%',
  },
  applyButtonText: {
    ...theme.typography.body,
    color: theme.colors.background,
    fontWeight: 'bold',
  },
  caloriesInputContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  caloriesInput: {
    flex: 1,
  },
  caloriesLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  recommendationsContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
  bottomContainer: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surface,
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
  modifyPreferencesButton: {
    backgroundColor: 'transparent',
    padding: theme.spacing.md,
    borderRadius: theme.spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primary,
    width: '100%',
  },
  modifyPreferencesText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
});
