import { create } from 'zustand';
import { Recipe } from '../types/recipe';
import { useAuthStore } from './useAuthStore';
import { DietaryPreferences } from '../types/recommendation';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3002/api';

interface RecipeState {
  recipes: Recipe[];
  loading: boolean;
  error: string | null;
  saveRecipe: (
    recipe: Partial<Recipe>,
    preferences: Partial<DietaryPreferences>
  ) => Promise<Recipe>;
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
  loading: false,
  error: null,

  saveRecipe: async (recipe, preferences) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/recipes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...recipe,
          cuisine_type: preferences.cuisine_type,
          diet_type: preferences.diet_type,
        }),
      });
      if (!response.ok) throw new Error('保存食谱失败');
      const data: Recipe = await response.json();
      return data;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));

export { useRecipeStore };
