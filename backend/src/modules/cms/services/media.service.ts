import { PrismaClient } from '@prisma/client';
import { AppError } from '../../../common/errors/AppError';
import { LocalStorageService } from '../../../common/storage/local-storage.service';

export class MediaService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly storage: LocalStorageService
  ) {}

  async uploadMedia(tenantId: string, file: Express.Multer.File, type: string) {
    const filename = `media/${tenantId}/${file.originalname}`;
    const filePath = await this.storage.upload(file, filename);

    return this.prisma.media.create({
      data: {
        tenantId,
        url: filePath,
        type: type.toUpperCase(),
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype
      }
    });
  }

  async listMedia(tenantId: string) {
    const media = await this.prisma.media.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' }
    });

    return media.map(m => ({
      ...m,
      url: this.storage.getUrl(m.url)
    }));
  }

  async deleteMedia(tenantId: string, id: string) {
    const media = await this.prisma.media.findFirst({
      where: { id, tenantId }
    });

    if (!media) {
      throw new AppError('Media not found', 404, 'MEDIA_NOT_FOUND');
    }

    try {
      await this.storage.delete(media.url);
    } catch (e) {
      console.error('Failed to delete physical file:', e);
    }

    return this.prisma.media.delete({
      where: { id }
    });
  }
}
