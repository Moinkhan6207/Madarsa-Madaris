import fs from 'fs';
import path from 'path';
import { env } from '../../config/env';
import { IFileStorage } from './file-storage.interface';

export class LocalStorageService implements IFileStorage {
  private readonly uploadDir = 'uploads';

  constructor() {
    this.ensureUploadDir();
  }

  private ensureUploadDir() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(file: Express.Multer.File, subPath: string): Promise<string> {
    const fullPath = path.join(this.uploadDir, subPath);
    const directory = path.dirname(fullPath);

    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    // Generate unique name to prevent collisions/overwrites
    const extension = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
    const filePath = path.join(directory, uniqueName);

    fs.writeFileSync(filePath, file.buffer);

    // Return the relative path for database storage
    return filePath.replace(/\\/g, '/');
  }

  async delete(filePath: string): Promise<void> {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  getUrl(filePath: string): string {
    if (!filePath) return '';
    
    // If it's already a full URL, return it as is
    if (filePath.startsWith('http')) return filePath;
    
    // In production, this would be an S3 URL. Locally, we point to our static server.
    const baseUrl = env.APP_URL || `http://localhost:${env.PORT || 5001}`;
    
    // Defensive check to avoid double-prefixing if the path accidentally includes 'uploads' twice or the baseUrl
    const cleanedPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    
    return `${baseUrl}/${cleanedPath}`;
  }
}
