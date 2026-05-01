import { Request, Response, NextFunction } from 'express';
import { InstitutionProfileService } from '../services/institution-profile.service';
import { TenantBrandingService } from '../services/tenant-branding.service';
import { BranchService } from '../services/branch.service';
import { AcademicSessionService } from '../services/academic-session.service';
import { prisma } from '../../../config/prisma.service';
import { LocalStorageService } from '../../../common/storage/local-storage.service';
import { AppError } from '../../../common/errors/AppError';

const profileService = new InstitutionProfileService(prisma);
const storageService = new LocalStorageService();
const brandingService = new TenantBrandingService(prisma, storageService);
const branchService = new BranchService(prisma);
const sessionService = new AcademicSessionService(prisma);

// ─── Profile ─────────────────────────────────────────────────────────────────

export class ProfileController {
  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.context!.tenantId!;
      console.log(`[DEBUG] Fetching profile for tenant: ${tenantId}`);
      const data = await profileService.getProfile(tenantId);
      console.log(`[DEBUG] Profile data found:`, !!data);
      res.json({ success: true, data });
    } catch (e) { 
      console.error(`[DEBUG] Profile fetch error:`, (e as any).message);
      next(e); 
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.context!.tenantId!;
      const data = await profileService.updateProfile(tenantId, req.body);
      res.json({ success: true, data });
    } catch (e) { next(e); }
  }
}

// ─── Branding ────────────────────────────────────────────────────────────────

export class BrandingController {
  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.context!.tenantId!;
      console.log(`[DEBUG] Fetching branding for tenant: ${tenantId}`);
      const data = await brandingService.getBranding(tenantId);
      console.log(`[DEBUG] Branding data found:`, !!data);
      res.json({ success: true, data });
    } catch (e) { 
      console.error(`[DEBUG] Branding fetch error:`, (e as any).message);
      next(e); 
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.context!.tenantId!;
      const data = await brandingService.updateBranding(tenantId, req.body);
      res.json({ success: true, data });
    } catch (e) { next(e); }
  }

  static async uploadImage(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.context!.tenantId!;
      const file = req.file;
      const type = req.params.type as 'logo' | 'cover' | 'favicon';

      if (!file) {
        throw new AppError('No file uploaded', 400, 'UPLOAD_REQUIRED');
      }

      if (!['logo', 'cover', 'favicon'].includes(type)) {
        throw new AppError('Invalid upload type', 400, 'INVALID_UPLOAD_TYPE');
      }

      const data = await brandingService.uploadBrandingImage(tenantId, file, type);
      res.json({ success: true, data });
    } catch (e) { next(e); }
  }
}

// ─── Branches ────────────────────────────────────────────────────────────────

export class BranchController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.context!.tenantId!;
      const { page, limit } = req.query;
      console.log(`[DEBUG] Fetching branches for tenant: ${tenantId}`);
      const data = await branchService.listBranches(tenantId, {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });
      console.log(`[DEBUG] Branches found:`, data.data.length);
      res.json({ success: true, data });
    } catch (e) {
      console.error(`[DEBUG] Branch fetch error:`, (e as any).message);
      next(e);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.context!.tenantId!;
      const data = await branchService.createBranch(tenantId, req.body);
      res.status(201).json({ success: true, data });
    } catch (e) { next(e); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.context!.tenantId!;
      const { branchId } = req.params;
      const data = await branchService.updateBranch(tenantId, branchId as string, req.body);
      res.json({ success: true, data });
    } catch (e) { next(e); }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.context!.tenantId!;
      const { branchId } = req.params;
      await branchService.deleteBranch(tenantId, branchId as string);
      res.json({ success: true, message: 'Branch deleted' });
    } catch (e) { next(e); }
  }
}

// ─── Academic Sessions ────────────────────────────────────────────────────────

export class SessionController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.context!.tenantId!;
      const { page, limit } = req.query;
      console.log(`[DEBUG] Fetching sessions for tenant: ${tenantId}`);
      const data = await sessionService.listSessions(tenantId, {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });
      console.log(`[DEBUG] Sessions found:`, data.data.length);
      res.json({ success: true, data });
    } catch (e) {
      console.error(`[DEBUG] Session fetch error:`, (e as any).message);
      next(e);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.context!.tenantId!;
      const data = await sessionService.createSession(tenantId, req.body);
      res.status(201).json({ success: true, data });
    } catch (e) { next(e); }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.context!.tenantId!;
      const { sessionId } = req.params;
      await sessionService.deleteSession(tenantId, sessionId as string);
      res.json({ success: true, message: 'Session deleted' });
    } catch (e) { next(e); }
  }
}
