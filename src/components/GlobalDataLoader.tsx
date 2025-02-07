import React, { useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useGlobalStore } from '@/stores/useGlobalStore';

interface GlobalDataLoaderProps {
  children: React.ReactNode;
}

export const GlobalDataLoader: React.FC<GlobalDataLoaderProps> = ({ children }) => {
  const { session } = useAuthStore();
  const { fetchUserInfo } = useGlobalStore();

  useEffect(() => {
    if (session?.access_token) {
      fetchUserInfo();
    }
  }, [session?.access_token]);

  return <>{children}</>;
}; 