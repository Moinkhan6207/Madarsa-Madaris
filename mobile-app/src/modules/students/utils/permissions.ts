import { useAuthStore } from '@/store/authStore';

export function useHasPermission(permission: string) {
  const permissions = useAuthStore((state) => state.user?.permissions ?? []);
  return permissions.includes(permission);
}
