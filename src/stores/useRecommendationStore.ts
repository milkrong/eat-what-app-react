import { create } from 'zustand';
import {
  Recipe,
  DietaryPreferences,
} from '../types/recommendation';
import { useAuthStore } from './useAuthStore';

const API_URL =
  process.env.EXPO_PUBLIC_API_URL || 'https://eatwhatapi.cattenbox.com/api';

// 获取认证头
const getAuthHeaders = () => {
  const { session } = useAuthStore.getState();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session?.access_token}`,
  };
};

interface RecommendationState {
  breakfast: Recipe | null;
  lunch: Recipe | null;
  dinner: Recipe | null;
  breakfastLoading: boolean;
  lunchLoading: boolean;
  dinnerLoading: boolean;
  error: string | null;
  fetchMealRecommendation: (
    mealType: 'breakfast' | 'lunch' | 'dinner',
    preferences: Partial<DietaryPreferences>,
    excludeRecipes?: string[]
  ) => Promise<void>;
  fetchAllMealRecommendations: (
    preferences: Partial<DietaryPreferences>
  ) => Promise<void>;
  clearRecommendations: () => void;
}

const useRecommendationStore = create<RecommendationState>((set, get) => ({
  breakfast: null,
  lunch: null,
  dinner: null,
  breakfastLoading: false,
  lunchLoading: false,
  dinnerLoading: false,
  error: null,

  clearRecommendations: () => {
    set({
      breakfast: null,
      lunch: null,
      dinner: null,
      error: null,
    });
  },

  fetchMealRecommendation: async (
    mealType: 'breakfast' | 'lunch' | 'dinner',
    preferences: Partial<DietaryPreferences>,
    excludeRecipes?: string[]
  ) => {
    const loadingKey = `${mealType}Loading` as 'breakfastLoading' | 'lunchLoading' | 'dinnerLoading';
    set({ [loadingKey]: true, error: null });
    
    try {
      const response = await fetch(`${API_URL}/recommendations/single`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          preferences: {
            ...preferences,
            meal_type: mealType,
          },
          excludeRecipes,
          provider: 'coze',
        }),
      });
      
      if (!response.ok) throw new Error(`获取${mealType}推荐失败`);
      const data: Recipe = await response.json();
      set({ [mealType]: data });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ [loadingKey]: false });
    }
  },

  fetchAllMealRecommendations: async (preferences: Partial<DietaryPreferences>) => {
    const { fetchMealRecommendation } = get();
    await Promise.all([
      fetchMealRecommendation('breakfast', preferences),
      fetchMealRecommendation('lunch', preferences),
      fetchMealRecommendation('dinner', preferences),
    ]);
  },
}));

export { useRecommendationStore };
