import { PrismaClient } from '@prisma/client';
import NodeCache from 'node-cache';
import { AppError } from '../../../common/errors/AppError';

// Cache for leads data - 1 minute TTL
const leadsCache = new NodeCache({ stdTTL: 60, checkperiod: 30 });

export class LeadService {
  constructor(private readonly prisma: PrismaClient) {}

  async createLead(tenantId: string, data: any) {
    const result = await this.prisma.lead.create({
      data: {
        tenantId,
        type: data.type,
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
        formData: data.formData || {},
        status: data.status || 'NEW'
      }
    });
    
    // Clear cache after creation
    this.clearLeadsCache(tenantId);
    return result;
  }

  async listLeads(tenantId: string, params: { status?: string; type?: string; page?: number; limit?: number }) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const skip = (page - 1) * limit;

    // Check cache first
    const cacheKey = `leads:${tenantId}:${page}:${limit}:${params.status || ''}:${params.type || ''}`;
    const cached = leadsCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const where: any = { tenantId };
    if (params.status) where.status = params.status;
    if (params.type) where.type = params.type;

    const [leads, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          type: true,
          name: true,
          email: true,
          phone: true,
          message: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          formData: true
        }
      }),
      this.prisma.lead.count({ where })
    ]);

    const result = { leads, total, page, limit };
    
    // Cache the result
    leadsCache.set(cacheKey, result);
    return result;
  }

  // Clear cache when leads are modified
  clearLeadsCache(tenantId: string) {
    const keys = leadsCache.keys().filter(key => key.startsWith(`leads:${tenantId}`));
    leadsCache.del(keys);
  }

  async getLead(tenantId: string, id: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, tenantId }
    });
    if (!lead) {
      throw new AppError('Lead not found', 404, 'LEAD_NOT_FOUND');
    }
    return lead;
  }

  async updateLeadStatus(tenantId: string, id: string, status: string) {
    const result = await this.prisma.lead.update({
      where: { id, tenantId },
      data: { status, updatedAt: new Date() }
    });
    
    // Clear cache after update
    this.clearLeadsCache(tenantId);
    return result;
  }
}
