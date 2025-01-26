import { create } from 'zustand';
import {
  Recipe,
  DailyRecommendation,
  RecommendationState,
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

const useRecommendationStore = create<RecommendationState>((set) => ({
  currentRecommendation: null,
  dailyRecommendation: null,
  singleLoading: false,
  dailyLoading: false,
  error: null,

  fetchRecommendation: async (
    preferences: Partial<DietaryPreferences>,
    excludeRecipes?: string[]
  ) => {
    set({ singleLoading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/recommendations/single`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          preferences,
          excludeRecipes,
          provider: 'deepseek',
        }),
      });
      if (!response.ok) throw new Error('获取推荐失败');
      const data: Recipe = await response.json();
      set({ currentRecommendation: data });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ singleLoading: false });
    }
  },

  fetchDailyRecommendation: async (
    preferences: Partial<DietaryPreferences>
  ) => {
    set({ dailyLoading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/recommendations/daily`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          preferences,
          provider: 'deepseek',
        }),
      });
      if (!response.ok) throw new Error('获取每日推荐失败');
      const data: DailyRecommendation = await response.json();
      set({ dailyRecommendation: data });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ dailyLoading: false });
    }
  },
}));

export { useRecommendationStore };
