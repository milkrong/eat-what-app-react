import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';
import type { DailyMealPlan, MealPlan, MealType } from '../types/meal-plan';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3002/api';

interface MealPlanState {
  dailyPlan: DailyMealPlan | null;
  loading: boolean;
  error: string | null;
  fetchDailyPlan: (date: string) => Promise<void>;
  addMeal: (
    date: string,
    mealType: MealType,
    recipeId: string
  ) => Promise<void>;
  deleteMeal: (mealId: string, selectedDate: string) => Promise<void>;
  updateMeal: (
    mealId: string,
    portions: number,
    selectedDate: string
  ) => Promise<void>;
}

const getAuthHeaders = () => {
  const session = useAuthStore.getState().session;
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session?.access_token}`,
  };
};

export const useMealPlanStore = create<MealPlanState>((set, get) => ({
  dailyPlan: null,
  loading: false,
  error: null,

  fetchDailyPlan: async (date: string) => {
    if (!useAuthStore.getState().session?.access_token) return;

    try {
      set({ loading: true, error: null });
      const response = await fetch(
        `${API_URL}/meal-plans?startDate=${date}T00:00:00.000Z&endDate=${date}T23:59:59.999Z`,
        {
          headers: getAuthHeaders(),
        }
      );
      if (!response.ok) {
        if (response.status === 404) {
          // 如果没有找到餐单，创建一个空的餐单结构
          set({
            dailyPlan: null,
            loading: false,
          });
          return;
        }
        throw new Error('获取餐单失败');
      }

      const mealPlans = await response.json();

      // 按餐点类型分组
      const groupedMealPlans: DailyMealPlan = {
        breakfast: mealPlans.filter(
          (meal: MealPlan) => meal.meal_type === 'breakfast'
        ),
        lunch: mealPlans.filter((meal: MealPlan) => meal.meal_type === 'lunch'),
        dinner: mealPlans.filter(
          (meal: MealPlan) => meal.meal_type === 'dinner'
        ),
        snack: mealPlans.filter((meal: MealPlan) => meal.meal_type === 'snack'),
      };

      set({ dailyPlan: groupedMealPlans, loading: false });
    } catch (error) {
      console.error('获取餐单失败:', error);
      set({ error: '获取餐单失败', loading: false });
    }
  },

  addMeal: async (date: string, mealType: MealType, recipeId: string) => {
    try {
      set({ loading: true, error: null });
      const response = await fetch(`${API_URL}/meal-plans`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          date: `${date}T12:00:00Z`,
          meal_type: mealType,
          recipe_id: recipeId,
        }),
      });

      if (!response.ok) throw new Error('添加餐点失败');

      // 重新获取当天餐单
      await get().fetchDailyPlan(date);
    } catch (error) {
      console.error('添加餐点失败:', error);
      set({ error: '添加餐点失败', loading: false });
      throw error;
    }
  },

  deleteMeal: async (mealId: string, selectedDate: string) => {
    try {
      set({ loading: true, error: null });
      const response = await fetch(`${API_URL}/meal-plans/${mealId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error('删除餐点失败');

      // 如果当前有餐单数据，重新获取
      const currentPlan = get().dailyPlan;
      if (currentPlan) {
        await get().fetchDailyPlan(selectedDate);
      }
    } catch (error) {
      console.error('删除餐点失败:', error);
      set({ error: '删除餐点失败', loading: false });
      throw error;
    }
  },

  updateMeal: async (
    mealId: string,
    portions: number,
    selectedDate: string
  ) => {
    try {
      set({ loading: true, error: null });
      const response = await fetch(`${API_URL}/meal-plans/meals/${mealId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ portions }),
      });

      if (!response.ok) throw new Error('更新餐点失败');

      // 如果当前有餐单数据，重新获取
      const currentPlan = get().dailyPlan;
      if (currentPlan) {
        await get().fetchDailyPlan(selectedDate);
      }
    } catch (error) {
      console.error('更新餐点失败:', error);
      set({ error: '更新餐点失败', loading: false });
      throw error;
    }
  },
}));
