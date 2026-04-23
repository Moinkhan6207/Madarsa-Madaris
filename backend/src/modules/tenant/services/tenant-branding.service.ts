import { PrismaClient } from '@prisma/client';
import { IFileStorage } from '../../../common/storage/file-storage.interface';

export interface UpdateBrandingDto {
  logoUrl?: string;
  coverImageUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  tagline?: string;
  publicContactEmail?: string;
  publicContactPhone?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  whatsappNumber?: string;
}

export class TenantBrandingService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly storage: IFileStorage
  ) {}

  async getBranding(tenantId: string) {
    const branding = await this.prisma.tenantBranding.upsert({
      where: { tenantId },
      update: {},
      create: { tenantId },
    });

    return {
      ...branding,
      logoUrl: branding.logoUrl ? this.storage.getUrl(branding.logoUrl) : null,
      coverImageUrl: branding.coverImageUrl ? this.storage.getUrl(branding.coverImageUrl) : null,
      faviconUrl: branding.faviconUrl ? this.storage.getUrl(branding.faviconUrl) : null,
    };
  }

  async updateBranding(tenantId: string, data: UpdateBrandingDto) {
    return this.prisma.tenantBranding.upsert({
      where: { tenantId },
      update: data,
      create: { tenantId, ...data },
    });
  }

  async uploadBrandingImage(tenantId: string, file: Express.Multer.File, type: 'logo' | 'cover' | 'favicon') {
    const fieldMap = {
      logo: 'logoUrl',
      cover: 'coverImageUrl',
      favicon: 'faviconUrl'
    };

    const field = fieldMap[type];
    const path = `${tenantId}/branding/${type}`;
    
    // 1. Upload new file
    const filePath = await this.storage.upload(file, path);

    // 2. Get old file path to delete it
    const current = await this.prisma.tenantBranding.findUnique({
      where: { tenantId }
    });

    const oldPath = current ? (current as any)[field] : null;

    // 3. Update database
    await this.prisma.tenantBranding.upsert({
      where: { tenantId },
      update: { [field]: filePath },
      create: { tenantId, [field]: filePath },
    });

    // 4. Delete old file if exists
    if (oldPath) {
      await this.storage.delete(oldPath).catch(() => {}); // Ignore error if file doesn't exist
    }

    return {
      url: this.storage.getUrl(filePath)
    };
  }
}
