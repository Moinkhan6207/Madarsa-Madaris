import { api } from '@/services/api';

export interface DashboardStats {
  totalStudents?: number;
  totalLeads?: number;
  totalPages?: number;
  activeBranches?: number;
}

export const dashboardService = {
  async getOverview(): Promise<DashboardStats> {
    const [me, pages, leads] = await Promise.allSettled([
      api.get('/tenant/me'),
      api.get('/tenant/cms/pages'),
      api.get('/tenant/leads?limit=1&page=1'),
    ]);

    return {
      totalPages: pages.status === 'fulfilled' ? pages.value.data?.data?.total ?? 0 : 0,
      totalLeads: leads.status === 'fulfilled' ? leads.value.data?.data?.total ?? 0 : 0,
      activeBranches: me.status === 'fulfilled' ? me.value.data?.data?.branchCount ?? 0 : 0,
      totalStudents: me.status === 'fulfilled' ? me.value.data?.data?.studentCount ?? 0 : 0,
    };
  },
};
