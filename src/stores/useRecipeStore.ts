import { create } from 'zustand';
import { Recipe } from '../types/recipe';
import { DietaryPreferences } from '../types/recommendation';
import { useAuthStore } from './useAuthStore';

const API_URL =
  process.env.EXPO_PUBLIC_API_URL || 'https://eatwhatapi.cattenbox.com/api';

interface RecipeState {
  recipes: Recipe[];
  currentRecipe: Recipe | null;
  favorites: Recipe[];
  loading: boolean;
  error: string | null;
  fetchRecipes: (
    page: number,
    category?: string,
    search?: string
  ) => Promise<Recipe[]>;
  fetchRecipeById: (id: string) => Promise<void>;
  fetchFavorites: () => Promise<void>;
  saveRecipe: (
    recipe: Partial<Recipe>,
    preferences: DietaryPreferences
  ) => Promise<void>;
  setCurrentRecipe: (recipe: Recipe | null) => void;
  toggleFavorite: (recipeId: string) => Promise<void>;
}

// 获取认证头
const getAuthHeaders = () => {
  const { session } = useAuthStore.getState();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session?.access_token}`,
  };
};

const useRecipeStore = create<RecipeState>((set) => ({
  recipes: [],
  currentRecipe: null,
  favorites: [],
  loading: false,
  error: null,

  fetchRecipes: async (page: number, category?: string, search?: string) => {
    const { session } = useAuthStore.getState();
    if (!session?.access_token) return;

    set({ loading: true, error: null });
    try {
      const response = await fetch(
        `${API_URL}/recipes?page=${page}&category=${category || ''}&search=${
          search || ''
        }`,
        {
          headers: getAuthHeaders(),
        }
      );
      if (!response.ok) throw new Error('获取食谱失败');
      const data = await response.json();
      set({ recipes: data });
      return data;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '获取食谱失败',
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchRecipeById: async (id: string) => {
    const { session } = useAuthStore.getState();
    if (!session?.access_token) return;

    set({ loading: true, error: null });
    try {
      const [recipeResponse, favoritesResponse] = await Promise.all([
        fetch(`${API_URL}/recipes/${id}`, {
          headers: getAuthHeaders(),
        }),
        fetch(`${API_URL}/users/favorites`, {
          headers: getAuthHeaders(),
        }),
      ]);

      if (!recipeResponse.ok) throw new Error('获取食谱失败');
      if (!favoritesResponse.ok) throw new Error('获取收藏失败');

      const [recipeData, favoritesData] = await Promise.all([
        recipeResponse.json(),
        favoritesResponse.json(),
      ]);

      const isFavorite = favoritesData.some((fav: Recipe) => fav.id === id);
      set({
        currentRecipe: { ...recipeData, is_favorite: isFavorite },
        favorites: favoritesData,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '获取食谱失败',
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  saveRecipe: async (
    recipe: Partial<Recipe>,
    preferences: DietaryPreferences
  ) => {
    const { session } = useAuthStore.getState();
    if (!session?.access_token) return;

    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/recipes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...recipe,
          preferences,
        }),
      });
      if (!response.ok) throw new Error('保存食谱失败');
      const data = await response.json();
      set((state) => ({
        recipes: [...state.recipes, data],
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '保存食谱失败',
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  setCurrentRecipe: (recipe: Recipe | null) => {
    set({ currentRecipe: recipe });
  },

  fetchFavorites: async () => {
    const { session } = useAuthStore.getState();
    if (!session?.access_token) return;

    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/users/favorites`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('获取收藏失败');
      const data = await response.json();
      set({ favorites: data });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '获取收藏失败',
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  toggleFavorite: async (recipeId: string) => {
    const { session } = useAuthStore.getState();
    if (!session?.access_token) return;

    try {
      const response = await fetch(`${API_URL}/users/favorites/${recipeId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('收藏失败');

      set((state) => ({
        currentRecipe: state.currentRecipe && {
          ...state.currentRecipe,
          is_favorite: !state.currentRecipe.is_favorite,
        },
        favorites: state.currentRecipe?.is_favorite
          ? state.favorites.filter((recipe) => recipe.id !== recipeId)
          : [...state.favorites, state.currentRecipe!],
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '收藏失败',
      });
      throw error;
    }
  },
}));

export { useRecipeStore };
