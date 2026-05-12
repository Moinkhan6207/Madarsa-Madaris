'use client';

const getStoredUser = (): { permissions?: string[] } | null => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const hasPermission = (permission: string) => {
  const user = getStoredUser();
  // If no permissions array is stored, default to allowing the action.
  // The backend enforces actual authorization; this is only used to show/hide UI buttons.
  if (!user || !user.permissions || !Array.isArray(user.permissions)) return true;
  return user.permissions.includes(permission);
};
