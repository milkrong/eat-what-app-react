import { create } from 'zustand';
import { DietaryPreferences } from '../types/recommendation';
import { useAuthStore } from './useAuthStore';

const API_URL =
  process.env.EXPO_PUBLIC_API_URL || 'https://eatwhatapi.cattenbox.com/api';

interface PreferencesState {
  preferences: DietaryPreferences | null;
  loading: boolean;
  error: string | null;
  fetchPreferences: () => Promise<void>;
  updatePreferences: (preferences: DietaryPreferences) => Promise<void>;
  setPreferences: (preferences: DietaryPreferences | null) => void;
}

// 获取认证头
const getAuthHeaders = () => {
  const { session } = useAuthStore.getState();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session?.access_token}`,
  };
};

const usePreferencesStore = create<PreferencesState>((set) => ({
  preferences: null,
  loading: false,
  error: null,

  fetchPreferences: async () => {
    const { session } = useAuthStore.getState();
    if (!session?.access_token) return;

    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/users/preferences`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      if (!response.ok) throw new Error('获取偏好设置失败');
      const data = await response.json();
      set({ preferences: data });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '获取偏好设置失败',
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updatePreferences: async (preferences: DietaryPreferences) => {
    const { session } = useAuthStore.getState();
    if (!session?.access_token) return;

    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/users/preferences`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(preferences),
      });
      if (!response.ok) throw new Error('保存偏好设置失败');
      set({ preferences });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '保存偏好设置失败',
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  setPreferences: (preferences: DietaryPreferences | null) => {
    set({ preferences });
  },
}));

export { usePreferencesStore };
