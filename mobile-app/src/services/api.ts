import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from '@/constants/config';
import { storage } from '@/utils/storage';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

api.interceptors.request.use(async (config) => {
  const token = await storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ error?: { code?: string } }>) => {
    if (error.response?.status === 401) {
      await storage.clearToken();
      await storage.clearUser();
    }
    return Promise.reject(error);
  }
);
