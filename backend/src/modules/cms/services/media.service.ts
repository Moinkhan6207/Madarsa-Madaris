import { PrismaClient } from '@prisma/client';
import { AppError } from '../../../common/errors/AppError';
import { LocalStorageService } from '../../../common/storage/local-storage.service';
import { createPaginationResult } from '../../../common/utils/pagination';

export class MediaService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly storage: LocalStorageService
  ) {}

  async uploadMedia(tenantId: string, file: Express.Multer.File, type: string) {
    const filename = `media/${tenantId}/${file.originalname}`;
    const filePath = await this.storage.upload(file, filename);

    const media = await this.prisma.media.create({
      data: {
        tenantId,
        url: filePath,
        type: type.toUpperCase(),
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype
      }
    });

    return {
      ...media,
      url: this.storage.getUrl(media.url)
    };
  }

  async listMedia(tenantId: string, params?: { page?: number; limit?: number; type?: string }) {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };
    if (params?.type) {
      where.type = params.type.toUpperCase();
    }

    const [media, total] = await Promise.all([
      this.prisma.media.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          url: true,
          type: true,
          fileName: true,
          fileSize: true,
          mimeType: true,
          altText: true,
          createdAt: true,
          updatedAt: true,
        }
      }),
      this.prisma.media.count({ where })
    ]);

    const mediaWithUrls = media.map(m => ({
      ...m,
      url: this.storage.getUrl(m.url)
    }));

    return createPaginationResult(mediaWithUrls, total, page, limit);
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
