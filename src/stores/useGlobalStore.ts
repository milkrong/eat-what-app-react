import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';
import { DietaryPreferences } from '@/types/recommendation';
import { Recipe } from '@/types/recipe';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Profile {
  id: string;
  username: string;
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  id: string;
  llmService: 'ark' | 'coze' | 'dify' | 'deepseek' | 'siliconflow' | 'custom';
  modelName?: string;
  isPaid: boolean;
  apiKey?: string;
  apiEndpoint?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserInfo {
  profile: Profile;
  preferences: DietaryPreferences;
  settings: Settings;
  favorites: Recipe[];
}

export interface UpdateProfileRequest {
  username?: string;
  avatarUrl?: string;
}

export interface UpdatePreferencesRequest extends Partial<DietaryPreferences> {}

export interface UpdateSettingsRequest extends Partial<Settings> {}

export interface GlobalState {
  preferences: DietaryPreferences | null;
  settings: Settings | null;
  profile: Profile | null;
  favorites: Recipe[] | null;
  themeColor: string;
  loading: boolean;
  error: string | null;
  fetchUserInfo: () => Promise<void>;
  updateProfile: (updates: UpdateProfileRequest) => Promise<void>;
  updatePreferences: (updates: UpdatePreferencesRequest) => Promise<void>;
  updateSettings: (updates: UpdateSettingsRequest) => Promise<void>;
  setPreferences: (preferences: DietaryPreferences) => void;
  setProfile: (profile: Profile) => void;
  setSettings: (settings: Settings) => void;
  setThemeColor: (color: string) => void;
}

export const useGlobalStore = create<GlobalState>()(
  persist(
    (set, get) => ({
      preferences: null,
      settings: null,
      profile: null,
      favorites: null,
      themeColor: '#FF9500',
      loading: false,
      error: null,
      setProfile: (profile) => set({ profile }),
      setSettings: (settings) => set({ settings }),
      setPreferences: (preferences) => set({ preferences }),
      setThemeColor: (color) => set({ themeColor: color }),
      fetchUserInfo: async () => {
        const session = useAuthStore.getState().session;
        if (!session?.access_token) return;

        try {
          set({ loading: true, error: null });
          const response = await fetch(
            `${process.env.EXPO_PUBLIC_API_URL}/users/info`,
            {
              headers: {
                Authorization: `Bearer ${session.access_token}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error('获取用户信息失败');
          }

          const data = await response.json();
          set({
            preferences: data.preferences,
            settings: data.settings,
            profile: data.profile,
            favorites: data.favorites,
            error: null,
          });
        } catch (error) {
          console.error('获取用户信息失败:', error);
          set({ error: '获取用户信息失败' });
          throw error;
        } finally {
          set({ loading: false });
        }
      },
      updateProfile: async (updates: UpdateProfileRequest) => {
        const session = useAuthStore.getState().session;
        if (!session?.access_token) return;

        try {
          set({ loading: true, error: null });
          const response = await fetch(
            `${process.env.EXPO_PUBLIC_API_URL}/users/profile`,
            {
              method: 'PUT',
              headers: {
                Authorization: `Bearer ${session.access_token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(updates),
            }
          );

          if (!response.ok) {
            throw new Error('更新用户资料失败');
          }

          const data = await response.json();
          set((state) => ({
            preferences: state.preferences
              ? { ...state.preferences, profile: data }
              : null,
            error: null,
          }));
        } catch (error) {
          console.error('更新用户资料失败:', error);
          set({ error: '更新用户资料失败' });
          throw error;
        } finally {
          set({ loading: false });
        }
      },
      updatePreferences: async (updates: UpdatePreferencesRequest) => {
        const session = useAuthStore.getState().session;
        if (!session?.access_token) return;

        if (updates.createdAt) {
          delete updates.createdAt;
        }

        if (updates.updatedAt) {
          delete updates.updatedAt;
        }

        try {
          set({ loading: true, error: null });
          const response = await fetch(
            `${process.env.EXPO_PUBLIC_API_URL}/users/preferences`,
            {
              method: 'PUT',
              headers: {
                Authorization: `Bearer ${session.access_token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(updates),
            }
          );

          if (!response.ok) {
            throw new Error('更新偏好设置失败');
          }

          const data = await response.json();
          set((state) => ({
            preferences: state.preferences
              ? { ...state.preferences, preferences: data }
              : null,
            error: null,
          }));
        } catch (error) {
          console.error('更新偏好设置失败:', error);
          set({ error: '更新偏好设置失败' });
          throw error;
        } finally {
          set({ loading: false });
        }
      },
      updateSettings: async (updates: UpdateSettingsRequest) => {
        const session = useAuthStore.getState().session;
        if (!session?.access_token) return;

        try {
          set({ loading: true, error: null });
          const response = await fetch(
            `${process.env.EXPO_PUBLIC_API_URL}/users/settings`,
            {
              method: 'PUT',
              headers: {
                Authorization: `Bearer ${session.access_token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(updates),
            }
          );

          if (!response.ok) {
            throw new Error('更新 AI 服务设置失败');
          }

          const data = await response.json();
          set(() => ({
            settings: data,
            error: null,
          }));
        } catch (error) {
          console.error('更新 AI 服务设置失败:', error);
          set({ error: '更新 AI 服务设置失败' });
          throw error;
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: 'global-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
