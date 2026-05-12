'use client';

import { useQuery } from '@tanstack/react-query';
import { referenceService } from '../services/referenceService';
import type { Branch, AcademicSession, Sponsor } from '../types/student';

const BRANCHES_KEY = 'branches';
const SESSIONS_KEY = 'sessions';
const SPONSORS_KEY = 'sponsors';

export function useBranches() {
  return useQuery<Branch[]>({
    queryKey: [BRANCHES_KEY],
    queryFn: async () => referenceService.getBranches(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSessions() {
  return useQuery<AcademicSession[]>({
    queryKey: [SESSIONS_KEY],
    queryFn: async () => referenceService.getSessions(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSponsors() {
  return useQuery<Sponsor[]>({
    queryKey: [SPONSORS_KEY],
    queryFn: async () => referenceService.getSponsors(),
    staleTime: 5 * 60 * 1000,
  });
}
