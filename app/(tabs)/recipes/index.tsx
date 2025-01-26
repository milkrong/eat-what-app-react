import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  RefreshControl,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { theme } from '../../../src/theme';
import type { Recipe } from '../../../src/types/recipe';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRecipeStore } from '@/stores/useRecipeStore';

// 分类数据
const categories = [
  { id: 'all', name: '全部' },
  { id: 'chinese', name: '中餐' },
  { id: 'western', name: '西餐' },
  { id: 'japanese', name: '日料' },
  { id: 'korean', name: '韩餐' },
  { id: 'dessert', name: '甜点' },
];

const { width } = Dimensions.get('window');
const CARD_MARGIN = theme.spacing.md;
const CARD_WIDTH = (width - theme.spacing.md * 2 - CARD_MARGIN) / 2;

export default function RecipeListScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { recipes, loading, error, fetchRecipes, favorites, fetchFavorites } =
    useRecipeStore();
  const { session } = useAuthStore();

  useEffect(() => {
    if (!session?.access_token) return;
    setPage(1);
    setHasMore(true);
    fetchRecipes(1, selectedCategory, searchQuery);
  }, [session?.access_token, selectedCategory, searchQuery]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      setPage(1);
      setHasMore(true);
      await Promise.all([
        fetchRecipes(1, selectedCategory, searchQuery),
        fetchFavorites(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [selectedCategory, searchQuery]);

  const onEndReached = async () => {
    if (!loading && hasMore && recipes.length >= 10) {
      const nextPage = page + 1;
      const newRecipes = await fetchRecipes(
        nextPage,
        selectedCategory,
        searchQuery
      );
      if (newRecipes?.length < 10) {
        setHasMore(false);
      }
      setPage(nextPage);
    }
  };

  const renderRecipeCard = ({ item }: { item: Recipe }) => {
    const isFavorite = favorites.some((fav) => fav.id === item.id);

    return (
      <TouchableOpacity
        style={styles.recipeCard}
        onPress={() => router.navigate(`/recipes/${item.id}` as any)}
      >
        <Image
          source={{ uri: item.image_url || 'https://via.placeholder.com/300' }}
          style={styles.recipeImage}
        />
        <View style={styles.recipeInfo}>
          <Text style={styles.recipeName}>{item.name}</Text>
          <View style={styles.recipeMetrics}>
            <View style={styles.metricItem}>
              <FontAwesome
                name="clock-o"
                size={16}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.metricText}>{item.cooking_time}分钟</Text>
            </View>
            {isFavorite && (
              <FontAwesome
                name="heart"
                size={16}
                color={theme.colors.primary}
              />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 搜索栏 */}
      <View style={styles.searchContainer}>
        <FontAwesome
          name="search"
          size={20}
          color={theme.colors.textSecondary}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="搜索食谱"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>

      {/* 分类标签 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 食谱列表 */}
      <FlatList
        data={recipes}
        renderItem={renderRecipeCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.1}
        ListFooterComponent={
          loading ? (
            <ActivityIndicator
              size="large"
              color={theme.colors.primary}
              style={styles.loader}
            />
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    borderRadius: theme.spacing.sm,
  },
  searchInput: {
    ...theme.typography.body,
    flex: 1,
    marginLeft: theme.spacing.sm,
    color: theme.colors.text,
  },
  categoriesContainer: {
    maxHeight: 48,
    marginBottom: theme.spacing.sm,
  },
  categoriesContent: {
    paddingHorizontal: theme.spacing.md,
  },
  categoryButton: {
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 7,
    borderRadius: theme.spacing.md,
    marginRight: theme.spacing.sm,
    backgroundColor: theme.colors.background,
  },
  categoryButtonActive: {
    backgroundColor: theme.colors.surface,
  },
  categoryText: {
    ...theme.typography.caption,
    color: theme.colors.text,
  },
  categoryTextActive: {
    color: theme.colors.active,
    fontWeight: 'bold',
  },
  listContent: {
    padding: theme.spacing.md,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: theme.colors.background,
    borderRadius: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    marginRight: CARD_MARGIN,
    shadowColor: theme.colors.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: CARD_WIDTH * 0.5625, // 16:9 ratio
    borderTopLeftRadius: theme.spacing.sm,
    borderTopRightRadius: theme.spacing.sm,
  },
  imagePlaceholder: {
    width: '100%',
    height: CARD_WIDTH * 0.5625, // 16:9 ratio
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.spacing.sm,
    borderTopRightRadius: theme.spacing.sm,
  },
  favoriteButton: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderRadius: theme.spacing.xl,
    padding: theme.spacing.xs,
  },
  cardContent: {
    padding: theme.spacing.sm,
  },
  cardTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  cardDescription: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  cardMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  loader: {
    marginVertical: theme.spacing.md,
  },
  recipeCard: {
    width: CARD_WIDTH,
    backgroundColor: theme.colors.background,
    borderRadius: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    marginRight: CARD_MARGIN,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recipeImage: {
    width: '100%',
    height: CARD_WIDTH,
  },
  recipeInfo: {
    padding: theme.spacing.sm,
  },
  recipeName: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  recipeMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
});
