import { useQuery } from '@tanstack/react-query';
import { getBranches, getSessions } from '@/services/onboardingService';
import { studentService } from '../services';

export const useBranches = () =>
  useQuery({
    queryKey: ['student-branches'],
    queryFn: getBranches,
    staleTime: 5 * 60 * 1000,
  });

export const useSessions = () =>
  useQuery({
    queryKey: ['student-sessions'],
    queryFn: getSessions,
    staleTime: 5 * 60 * 1000,
  });

export const useSponsors = () =>
  useQuery({
    queryKey: ['student-sponsors'],
    queryFn: async () => {
      const res = await studentService.listSponsors();
      return res.data.sponsors;
    },
    staleTime: 5 * 60 * 1000,
  });
