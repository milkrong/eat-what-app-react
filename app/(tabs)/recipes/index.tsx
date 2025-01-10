import React, { useState, useCallback } from 'react';
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
const CARD_MARGIN = theme.spacing.sm;
const CARD_WIDTH = (width - theme.spacing.md * 2 - CARD_MARGIN) / 2;

export default function RecipesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { session } = useAuthStore();

  const fetchRecipes = async (pageNum: number, refresh = false) => {
    if (!session?.access_token) return;

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/recipes?page=${pageNum}&category=${selectedCategory}&search=${searchQuery}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) throw new Error('获取食谱失败');

      const data = await response.json();
      console.log('data', data);
      const newRecipes = data;
      setHasMore(data.has_more);
      console.log('newRecipes', newRecipes);
      if (refresh) {
        setRecipes(newRecipes);
      } else {
        setRecipes((prev) => [...prev, ...newRecipes]);
      }
    } catch (error) {
      console.error('获取食谱失败:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await fetchRecipes(1, true);
    setRefreshing(false);
  }, [selectedCategory, searchQuery]);

  const onEndReached = async () => {
    if (!loading && hasMore) {
      setLoading(true);
      const nextPage = page + 1;
      await fetchRecipes(nextPage);
      setPage(nextPage);
      setLoading(false);
    }
  };

  React.useEffect(() => {
    onRefresh();
  }, [selectedCategory, searchQuery]);

  const renderRecipeCard = ({ item }: { item: Recipe }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/recipes/${item.id}`)}
    >
      <View style={styles.imageContainer}>
        {item.images && item.images.length > 0 ? (
          <Image source={{ uri: item.images[0] }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder} />
        )}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => {
            // TODO: 实现收藏功能
          }}
        >
          <FontAwesome name="heart-o" size={20} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.cardMetrics}>
          <Text style={styles.metricText}>{item.cooking_time}分钟</Text>
          <Text style={styles.metricText}>{item.calories}千卡</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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
});
