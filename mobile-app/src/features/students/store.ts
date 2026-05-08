import { create } from 'zustand';
import type { Student, StudentListFilters, PaginatedStudentsResponse } from './types';

interface StudentsState {
  listCache: Record<string, PaginatedStudentsResponse>;
  detailCache: Record<string, Student>;
  pendingMutations: Array<{ type: string; payload: any; retryCount: number }>;
  isOffline: boolean;
  setListCache: (key: string, data: PaginatedStudentsResponse) => void;
  setDetailCache: (id: string, student: Student) => void;
  addPendingMutation: (mutation: { type: string; payload: any }) => void;
  removePendingMutation: (index: number) => void;
  clearPendingMutations: () => void;
  setOffline: (offline: boolean) => void;
}

export const useStudentsStore = create<StudentsState>((set) => ({
  listCache: {},
  detailCache: {},
  pendingMutations: [],
  isOffline: false,
  setListCache: (key, data) =>
    set((state) => ({ listCache: { ...state.listCache, [key]: data } })),
  setDetailCache: (id, student) =>
    set((state) => ({ detailCache: { ...state.detailCache, [id]: student } })),
  addPendingMutation: (mutation) =>
    set((state) => ({ pendingMutations: [...state.pendingMutations, { ...mutation, retryCount: 0 }] })),
  removePendingMutation: (index) =>
    set((state) => ({
      pendingMutations: state.pendingMutations.filter((_, i) => i !== index),
    })),
  clearPendingMutations: () => set({ pendingMutations: [] }),
  setOffline: (offline) => set({ isOffline: offline }),
}));
