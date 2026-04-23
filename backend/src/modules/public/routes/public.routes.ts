import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { PublicWebsiteController } from '../controllers/public-website.controller';
import { PublicLeadController } from '../../leads/controllers/lead.controller';

const router = Router();

// Generic rate limiter for public viewing (100 requests per minute)
const publicViewerLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' }
});

// Stricter rate limiter for lead capture (5 submissions per hour per IP)
const leadCaptureLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Submission limit reached. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Website rendering data
router.get('/website/:tenantSlug', publicViewerLimiter, PublicWebsiteController.getPage);
router.get('/website/:tenantSlug/:pageSlug', publicViewerLimiter, PublicWebsiteController.getPage);

// Lead capture
router.post('/leads', leadCaptureLimiter, PublicLeadController.create);

export { router as publicRoutes };
