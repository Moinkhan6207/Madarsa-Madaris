import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { LeadService } from '../services/lead.service';
import { prisma } from '../../../config/prisma.service';
import { CmsValidationService } from '../../cms/services/cms-validation.service';

const leadService = new LeadService(prisma);

const PublicLeadSchema = z.object({
  tenantId: z.string().uuid(),
  type: z.enum(['ADMISSION', 'CONTACT', 'INQUIRY', 'VOLUNTEER']),
  formData: z.object({
    name: z.string().min(2).max(100),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().min(10).max(20).optional().or(z.literal('')),
    message: z.string().max(2000).optional().or(z.literal('')),
  }).passthrough()
});

export class LeadController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.context!.tenantId!;
      const { status, type, page, limit } = req.query;
      const data = await leadService.listLeads(tenantId, {
        status: status as string,
        type: type as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });
      res.json({ success: true, data });
    } catch (e) { next(e); }
  }

  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.context!.tenantId!;
      const { id } = req.params;
      const data = await leadService.getLead(tenantId, id as string);
      res.json({ success: true, data });
    } catch (e) { next(e); }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.context!.tenantId!;
      const { id } = req.params;
      const { status } = req.body;
      const data = await leadService.updateLeadStatus(tenantId, id as string, status);
      res.json({ success: true, data });
    } catch (e) { next(e); }
  }
}

export class PublicLeadController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      // 1. Validate Schema
      const validated = PublicLeadSchema.parse(req.body);
      
      // 2. Sanitize Data
      const { tenantId, type, formData } = validated;
      const sanitizedFormData = CmsValidationService.sanitizeContent(formData);

      // 3. Extract top-level fields for CRM
      const leadData = {
        type,
        name: sanitizedFormData.name,
        email: sanitizedFormData.email,
        phone: sanitizedFormData.phone,
        message: sanitizedFormData.message,
        formData: sanitizedFormData
      };
      
      const data = await leadService.createLead(tenantId, leadData);
      res.status(201).json({ success: true, data });
    } catch (e) { next(e); }
  }
}
