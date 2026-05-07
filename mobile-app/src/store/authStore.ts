import { create } from 'zustand';
import { User } from '@/types/auth';
import { Tenant } from '@/types/tenant';
import { authService, RegisterPayload } from '@/services/authService';
import { storage } from '@/utils/storage';

interface AuthState {
  user: User | null;
  token: string | null;
  tenant: Tenant | null;
  hydrated: boolean;
  isLoading: boolean;
  isLoadingTenant: boolean;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  fetchTenant: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  tenant: null,
  hydrated: false,
  isLoading: false,
  isLoadingTenant: false,
  initialize: async () => {
    const token = await storage.getToken();
    const userRaw = await storage.getUser();
    const user = userRaw ? (JSON.parse(userRaw) as User) : null;
    if (token && user) {
      set({ token, user, hydrated: true, isLoadingTenant: true });
      try {
        const tenantData = await authService.getTenantMe();
        set({ tenant: tenantData, isLoadingTenant: false });
      } catch {
        set({ isLoadingTenant: false });
      }
    } else if (token && !user) {
      await storage.clearToken();
      await storage.clearUser();
      set({ token: null, user: null, tenant: null, hydrated: true });
    } else {
      set({ token, user, hydrated: true });
    }
  },
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const data = await authService.login(email, password);
      await storage.setToken(data.token);
      await storage.setUser(JSON.stringify(data.user));
      set({ token: data.token, user: data.user, isLoading: false, isLoadingTenant: true });
      try {
        const tenantData = await authService.getTenantMe();
        set({ tenant: tenantData, isLoadingTenant: false });
      } catch {
        set({ isLoadingTenant: false });
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  register: async (payload) => {
    set({ isLoading: true });
    try {
      const data = await authService.registerTenant(payload);
      await storage.setToken(data.token);
      await storage.setUser(JSON.stringify(data.user));
      set({ token: data.token, user: data.user, isLoading: false, isLoadingTenant: true });
      try {
        const tenantData = await authService.getTenantMe();
        set({ tenant: tenantData, isLoadingTenant: false });
      } catch {
        set({ isLoadingTenant: false });
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  logout: async () => {
    await storage.clearToken();
    await storage.clearUser();
    set({ token: null, user: null, tenant: null });
  },
  fetchTenant: async () => {
    set({ isLoadingTenant: true });
    try {
      const tenantData = await authService.getTenantMe();
      set({ tenant: tenantData, isLoadingTenant: false });
    } catch {
      set({ isLoadingTenant: false });
    }
  },
}));
