import { api } from './api';

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'lost' | 'enrolled';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: LeadStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeadData {
  name: string;
  email: string;
  phone: string;
  source: string;
  notes?: string;
}

export interface UpdateLeadData {
  name?: string;
  email?: string;
  phone?: string;
  source?: string;
  status?: LeadStatus;
  notes?: string;
}

export interface LeadsResponse {
  leads: Lead[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const leadService = {
  list: (params?: { page?: number; limit?: number; status?: LeadStatus; search?: string }) =>
    api.get<LeadsResponse>('/tenant/leads', { params }),

  get: (id: string) =>
    api.get<{ lead: Lead }>(`/tenant/leads/${id}`),

  create: (data: CreateLeadData) =>
    api.post<{ lead: Lead }>('/tenant/leads', data),

  update: (id: string, data: UpdateLeadData) =>
    api.put<{ lead: Lead }>(`/tenant/leads/${id}`, data),

  delete: (id: string) =>
    api.delete<{ message: string }>(`/tenant/leads/${id}`),

  updateStatus: (id: string, status: LeadStatus) =>
    api.patch<{ lead: Lead }>(`/tenant/leads/${id}/status`, { status }),

  getStats: () =>
    api.get<{
      total: number;
      new: number;
      contacted: number;
      qualified: number;
      enrolled: number;
      lost: number;
    }>('/tenant/leads/stats'),
};
