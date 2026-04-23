import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();

// /api/v1/auth/login
router.post('/login', AuthController.login);

// /api/v1/auth/register
router.post('/register', AuthController.register);

export { router as authRoutes };
