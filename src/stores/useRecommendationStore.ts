import { create } from 'zustand';
import { Recipe, DietaryPreferences } from '../types/recommendation';
import { useAuthStore } from './useAuthStore';
import { useGlobalStore } from './useGlobalStore';

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
  recommendations: Recipe[];
  loading: boolean;
  error: string | null;
  fetchRecommendations: (
    preferences: Partial<DietaryPreferences>,
    count?: number,
    excludeRecipes?: string[]
  ) => Promise<void>;
  appendRecommendations: (
    preferences: Partial<DietaryPreferences>,
    count?: number,
    excludeRecipes?: string[]
  ) => Promise<void>;
  clearRecommendations: () => void;
}

const fetchSingleRecommendation = async (
  preferences: Partial<DietaryPreferences>,
  excludeRecipes?: string[]
): Promise<Recipe> => {
  const { settings } = useGlobalStore.getState();
  if (!settings?.llmService) {
    throw new Error('请先设置 AI 服务');
  }

  const response = await fetch(`${API_URL}/recommendations/single`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      preferences,
      excludeRecipes,
      provider: settings.llmService,
    }),
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: '获取推荐失败' }));
    throw new Error(errorData.message || '获取推荐失败');
  }
  return await response.json();
};

const useRecommendationStore = create<RecommendationState>((set, get) => ({
  recommendations: [],
  loading: false,
  error: null,

  clearRecommendations: () => {
    set({
      recommendations: [],
      error: null,
    });
  },

  fetchRecommendations: async (
    preferences: Partial<DietaryPreferences>,
    count: number = 2,
    excludeRecipes?: string[]
  ) => {
    set({ loading: true, error: null, recommendations: [] });

    try {
      const promises = Array(count)
        .fill(null)
        .map(() => fetchSingleRecommendation(preferences, excludeRecipes));

      const results = await Promise.all(promises);
      set({ recommendations: results, error: null });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  appendRecommendations: async (
    preferences: Partial<DietaryPreferences>,
    count: number = 2,
    excludeRecipes?: string[]
  ) => {
    set({ loading: true, error: null });

    try {
      const currentRecipes = get().recommendations;
      const updatedExcludeRecipes = [
        ...(excludeRecipes || []),
        ...currentRecipes.map((r) => r.name),
      ];

      const promises = Array(count)
        .fill(null)
        .map(() =>
          fetchSingleRecommendation(preferences, updatedExcludeRecipes)
        );

      const results = await Promise.all(promises);
      set((state) => ({
        recommendations: [...state.recommendations, ...results],
        error: null,
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));

export { useRecommendationStore };
