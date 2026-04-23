import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { prisma } from '../../../config/prisma.service';

const authService = new AuthService(prisma);

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}
