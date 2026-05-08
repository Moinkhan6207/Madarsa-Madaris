import { PrismaClient } from '@prisma/client';
import { cacheService } from '../../../common/cache/cache.service';

export class TenantStatsService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Get pre-computed stats for a tenant (cached)
   */
  async getStats(tenantId: string) {
    const cacheKey = `dashboard:${tenantId}`;

    // Try cache first
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Get or create stats
    let stats = await this.prisma.tenantStats.findUnique({
      where: { tenantId }
    });

    if (!stats) {
      // Initialize stats if not exists
      stats = await this.computeAndSaveStats(tenantId);
    }

    // Cache for 5 minutes
    await cacheService.set(cacheKey, stats, 300);

    return stats;
  }

  /**
   * Compute and save stats (called when stats don't exist or need refresh)
   */
  async computeAndSaveStats(tenantId: string) {
    const [totalStudents, totalTeachers, totalLeads, totalPages, totalBranches] = await Promise.all([
      this.prisma.student.count({
        where: { tenantId, deletedAt: null }
      }),
      // Count users with teacher role (simplified)
      this.prisma.user.count({
        where: { tenantId, isActive: true, deletedAt: null }
      }),
      // Count leads
      this.prisma.lead.count({
        where: { tenantId }
      }),
      // Count published pages
      this.prisma.page.count({
        where: { tenantId, isPublished: true, deletedAt: null }
      }),
      // Count branches
      this.prisma.branch.count({
        where: { tenantId, deletedAt: null }
      })
    ]);

    const stats = await this.prisma.tenantStats.upsert({
      where: { tenantId },
      create: {
        tenantId,
        totalStudents,
        totalTeachers,
        totalLeads,
        totalPages,
        totalBranches,
        lastUpdatedAt: new Date()
      },
      update: {
        totalStudents,
        totalTeachers,
        totalLeads,
        totalPages,
        totalBranches,
        lastUpdatedAt: new Date()
      }
    });

    // Clear cache after update
    await cacheService.del(`dashboard:${tenantId}`);

    return stats;
  }

  /**
   * Increment a specific stat (call when data changes)
   */
  async incrementStat(tenantId: string, stat: 'totalStudents' | 'totalTeachers' | 'totalLeads' | 'totalPages' | 'totalBranches') {
    const stats = await this.prisma.tenantStats.upsert({
      where: { tenantId },
      create: {
        tenantId,
        [stat]: 1,
        lastUpdatedAt: new Date()
      },
      update: {
        [stat]: { increment: 1 },
        lastUpdatedAt: new Date()
      }
    });

    // Clear cache after update
    await cacheService.del(`dashboard:${tenantId}`);

    return stats;
  }

  /**
   * Decrement a specific stat (call when data is deleted)
   */
  async decrementStat(tenantId: string, stat: 'totalStudents' | 'totalTeachers' | 'totalLeads' | 'totalPages' | 'totalBranches') {
    const stats = await this.prisma.tenantStats.upsert({
      where: { tenantId },
      create: {
        tenantId,
        [stat]: 0,
        lastUpdatedAt: new Date()
      },
      update: {
        [stat]: { decrement: 1 },
        lastUpdatedAt: new Date()
      }
    });

    // Clear cache after update
    await cacheService.del(`dashboard:${tenantId}`);

    return stats;
  }

  /**
   * Refresh all stats for a tenant (use after bulk operations)
   */
  async refreshStats(tenantId: string) {
    return this.computeAndSaveStats(tenantId);
  }

  /**
   * Clear stats cache for a tenant
   */
  async clearCache(tenantId: string) {
    await cacheService.del(`dashboard:${tenantId}`);
  }
}
