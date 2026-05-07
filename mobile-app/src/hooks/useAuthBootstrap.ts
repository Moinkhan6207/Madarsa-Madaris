import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export const useAuthBootstrap = () => {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    void initialize();
  }, [initialize]);
};
