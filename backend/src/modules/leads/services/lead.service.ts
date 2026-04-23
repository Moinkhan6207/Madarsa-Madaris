import { PrismaClient } from '@prisma/client';
import { AppError } from '../../../common/errors/AppError';

export class LeadService {
  constructor(private readonly prisma: PrismaClient) {}

  async createLead(tenantId: string, data: any) {
    return this.prisma.lead.create({
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
  }

  async listLeads(tenantId: string, params: { status?: string; type?: string; page?: number; limit?: number }) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };
    if (params.status) where.status = params.status;
    if (params.type) where.type = params.type;

    const [leads, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.lead.count({ where })
    ]);

    return { leads, total, page, limit };
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
    return this.prisma.lead.update({
      where: { id, tenantId },
      data: { status, updatedAt: new Date() }
    });
  }
}
