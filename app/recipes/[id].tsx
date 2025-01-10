import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { theme } from '../../src/theme';
import type { Recipe } from '../../src/types/recipe';
import { useAuthStore } from '@/stores/useAuthStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = SCREEN_WIDTH * 0.75;

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const scrollY = new Animated.Value(0);
  const { session } = useAuthStore();

  React.useEffect(() => {
    const fetchRecipe = async () => {
      if (!session?.access_token) return;

      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/recipes/${id}`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );
        if (!response.ok) throw new Error('获取食谱失败');
        const data = await response.json();
        setRecipe(data);
        setIsFavorite(data.is_favorite || false);
      } catch (error) {
        console.error('获取食谱失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id, session?.access_token]);

  const imageTranslateY = scrollY.interpolate({
    inputRange: [-IMAGE_HEIGHT, 0, IMAGE_HEIGHT],
    outputRange: [IMAGE_HEIGHT / 2, 0, -IMAGE_HEIGHT / 3],
    extrapolate: 'clamp',
  });

  const renderIngredientGroup = (category: string) => {
    if (!recipe) return null;
    const ingredients = recipe.ingredients.filter(
      (i) => i.category === category
    );
    if (ingredients.length === 0) return null;

    return (
      <View key={category} style={styles.ingredientGroup}>
        <Text style={styles.ingredientGroupTitle}>{category}</Text>
        {ingredients.map((ingredient, index) => (
          <View key={index} style={styles.ingredientItem}>
            <Text style={styles.ingredientName}>{ingredient.name}</Text>
            <Text style={styles.ingredientAmount}>
              {ingredient.amount}
              {ingredient.unit}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderStep = ({ item }: { item: Recipe['steps'][0] }) => (
    <View style={styles.stepItem}>
      <View style={styles.stepHeader}>
        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>{item.order}</Text>
        </View>
        <Text style={styles.stepDescription}>{item.description}</Text>
      </View>
      {item.image_url && (
        <Image source={{ uri: item.image_url }} style={styles.stepImage} />
      )}
    </View>
  );

  if (loading || !recipe) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerTransparent: true,
          headerTitle: '',
          headerLeft: () => (
            <TouchableOpacity
              style={[styles.headerButton, styles.backButton]}
              onPress={() => router.back()}
            >
              <FontAwesome
                name="arrow-left"
                size={24}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => setIsFavorite(!isFavorite)}
              >
                <FontAwesome
                  name={isFavorite ? 'heart' : 'heart-o'}
                  size={20}
                  color={theme.colors.background}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton}>
                <FontAwesome
                  name="share"
                  size={20}
                  color={theme.colors.background}
                />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* 图片区域 */}
        <View style={styles.imageContainer}>
          <Animated.View
            style={[
              styles.imageWrapper,
              { transform: [{ translateY: imageTranslateY }] },
            ]}
          >
            {recipe.images?.[0] ? (
              <Image source={{ uri: recipe.images[0] }} style={styles.image} />
            ) : (
              <View style={styles.imagePlaceholder} />
            )}
          </Animated.View>
        </View>

        <View style={styles.content}>
          {/* 基本信息 */}
          <View style={styles.header}>
            <Text style={styles.title}>{recipe.name}</Text>
            <Text style={styles.description}>{recipe.description}</Text>
            <View style={styles.metrics}>
              <View style={styles.metricItem}>
                <FontAwesome
                  name="clock-o"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text style={styles.metricValue}>
                  {recipe.cooking_time}分钟
                </Text>
              </View>
              <View style={styles.metricItem}>
                <FontAwesome
                  name="signal"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text style={styles.metricValue}>{recipe.difficulty}</Text>
              </View>
              <View style={styles.metricItem}>
                <FontAwesome
                  name="users"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text style={styles.metricValue}>{recipe.servings}人份</Text>
              </View>
            </View>
          </View>

          {/* 营养成分 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>营养成分</Text>
            <View style={styles.nutritionGrid}>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{recipe.calories}</Text>
                <Text style={styles.nutritionLabel}>卡路里</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>
                  {recipe.nutrition_facts.protein}g
                </Text>
                <Text style={styles.nutritionLabel}>蛋白质</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>
                  {recipe.nutrition_facts.carbs}g
                </Text>
                <Text style={styles.nutritionLabel}>碳水</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>
                  {recipe.nutrition_facts.fat}g
                </Text>
                <Text style={styles.nutritionLabel}>脂肪</Text>
              </View>
            </View>
          </View>

          {/* 材料清单 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>材料清单</Text>
            {['主料', '辅料', '调味料'].map((category) =>
              renderIngredientGroup(category)
            )}
          </View>

          {/* 步骤说明 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>步骤说明</Text>
            {recipe.steps.map((step) => (
              <View key={step.order}>{renderStep({ item: step })}</View>
            ))}
          </View>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

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
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
    marginHorizontal: 8,
  },
  backButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    marginLeft: 16,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  imageContainer: {
    height: IMAGE_HEIGHT,
    overflow: 'hidden',
  },
  imageWrapper: {
    height: IMAGE_HEIGHT,
    width: '100%',
  },
  image: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
  },
  imagePlaceholder: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
    backgroundColor: theme.colors.surface,
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.spacing.lg,
    borderTopRightRadius: theme.spacing.lg,
    marginTop: -theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  header: {
    padding: theme.spacing.md,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  description: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  metrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.surface,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  metricValue: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  section: {
    padding: theme.spacing.md,
    borderTopWidth: 8,
    borderTopColor: theme.colors.surface,
  },
  sectionTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  nutritionItem: {
    alignItems: 'center',
    minWidth: '25%',
  },
  nutritionValue: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  nutritionLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  ingredientGroup: {
    marginBottom: theme.spacing.md,
  },
  ingredientGroupTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  ingredientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  ingredientName: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  ingredientAmount: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  stepItem: {
    marginBottom: theme.spacing.md,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
    marginTop: 2,
  },
  stepNumberText: {
    ...theme.typography.caption,
    color: theme.colors.background,
    fontWeight: 'bold',
  },
  stepDescription: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.text,
  },
  stepImage: {
    width: '100%',
    height: 200,
    borderRadius: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
});
