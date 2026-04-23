import { apiClient } from '@/lib/api';

export interface Lead {
  id: string;
  type: 'ADMISSION' | 'CONTACT' | 'INQUIRY' | 'VOLUNTEER';
  formData: any;
  status: 'NEW' | 'IN_PROGRESS' | 'CONVERTED' | 'REJECTED';
  createdAt: string;
}

export interface LeadResponse {
  leads: Lead[];
  total: number;
  page: number;
  limit: number;
}

export const leadService = {
  listLeads: (params: { status?: string; type?: string; page?: number; limit?: number }) => 
    apiClient.get<{ success: boolean; data: LeadResponse }>('/tenant/leads', params),
    
  getLead: (id: string) => 
    apiClient.get<{ success: boolean; data: Lead }>(`/tenant/leads/${id}`),
    
  updateStatus: (id: string, status: string) => 
    apiClient.patch<{ success: boolean; data: Lead }>(`/tenant/leads/${id}/status`, { status }),

  // Public lead capture
  captureLead: (data: { tenantId: string; type: string; formData: any }) => 
    apiClient.post<{ success: boolean; message: string }>('/public/leads', data),
};
