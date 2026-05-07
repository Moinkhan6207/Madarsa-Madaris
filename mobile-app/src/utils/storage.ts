import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const storage = {
  async getToken() {
    if (Platform.OS === 'web') return AsyncStorage.getItem(TOKEN_KEY);
    return SecureStore.getItemAsync(TOKEN_KEY);
  },
  async setToken(token: string) {
    if (Platform.OS === 'web') return AsyncStorage.setItem(TOKEN_KEY, token);
    return SecureStore.setItemAsync(TOKEN_KEY, token);
  },
  async clearToken() {
    if (Platform.OS === 'web') return AsyncStorage.removeItem(TOKEN_KEY);
    return SecureStore.deleteItemAsync(TOKEN_KEY);
  },
  async getUser() {
    return AsyncStorage.getItem(USER_KEY);
  },
  async setUser(user: string) {
    return AsyncStorage.setItem(USER_KEY, user);
  },
  async clearUser() {
    return AsyncStorage.removeItem(USER_KEY);
  },
};
