import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {
  User,
  Session,
  LoginInput,
  RegisterInput,
  AuthResponse,
} from '../types/auth';

// 默认用户账号（仅开发环境使用）
export const DEFAULT_USER = {
  email: 'milkrong121@outlook.com',
  password: 'Milkkai5315!?!',
};

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  login: (data: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const API_URL =
  process.env.EXPO_PUBLIC_API_URL || 'https://eatwhatapi.cattenbox.com/api';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: false,
  error: null,

  login: async (data: LoginInput) => {
    try {
      set({ loading: true, error: null });
      const response = await axios.post<AuthResponse>(
        `${API_URL}/auth/login`,
        data
      );
      const { session } = response.data;

      await AsyncStorage.setItem('session', JSON.stringify(session));
      set({
        user: session.user,
        session,
        loading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '登录失败',
        loading: false,
      });
      throw error;
    }
  },

  register: async (data: RegisterInput) => {
    try {
      set({ loading: true, error: null });
      const response = await axios.post<AuthResponse>(
        `${API_URL}/auth/register`,
        data
      );
      const { session } = response.data;

      await AsyncStorage.setItem('session', JSON.stringify(session));
      set({
        user: session.user,
        session,
        loading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '注册失败',
        loading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      set({ loading: true, error: null });
      await axios.post(`${API_URL}/auth/logout`);
      await AsyncStorage.removeItem('session');
      set({
        user: null,
        session: null,
        loading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '退出失败',
        loading: false,
      });
      throw error;
    }
  },

  refreshToken: async () => {
    try {
      const sessionStr = await AsyncStorage.getItem('session');
      if (!sessionStr) {
        return;
      }

      const currentSession: Session = JSON.parse(sessionStr);
      const response = await axios.post<AuthResponse>(
        `${API_URL}/auth/refresh`,
        {
          refresh_token: currentSession.refresh_token,
        }
      );
      const { session } = response.data;
      await AsyncStorage.setItem('session', JSON.stringify(session));
      set({
        session,
        user: session.user,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Token刷新失败',
        user: null,
        session: null,
      });
      await AsyncStorage.removeItem('session');
    }
  },
}));
