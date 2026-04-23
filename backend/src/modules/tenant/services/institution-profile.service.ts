import { PrismaClient } from '@prisma/client';
import { AppError } from '../../../common/errors/AppError';

export interface UpdateProfileDto {
  shortName?: string;
  trustName?: string;
  registrationNumber?: string;
  email?: string;
  phone?: string;
  alternatePhone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  websiteUrl?: string;
  establishedYear?: number;
  principalName?: string;
  description?: string;
  divisionType?: 'MALE' | 'FEMALE' | 'BOTH';
  hasHostel?: boolean;
  hasTransport?: boolean;
  hasMasjidLinkedOps?: boolean;
  hasMultiBranch?: boolean;
}

export class InstitutionProfileService {
  constructor(private readonly prisma: PrismaClient) {}

  async getProfile(tenantId: string) {
    const profile = await this.prisma.institutionProfile.findUnique({
      where: { tenantId },
    });
    if (!profile) {
      throw new AppError('Institution profile not found', 404, 'PROFILE_NOT_FOUND');
    }
    return profile;
  }

  async updateProfile(tenantId: string, data: UpdateProfileDto) {
    const profile = await this.prisma.institutionProfile.upsert({
      where: { tenantId },
      update: data,
      create: { tenantId, ...data },
    });
    return profile;
  }
}
