import NodeCache from 'node-cache';
import { env } from '../../config/env';
import { logger } from '../logger/logger';

// Multi-layer cache service with Redis support (optional) and memory fallback
class CacheService {
  private memoryCache: NodeCache;
  private redisClient: any = null;
  private useRedis: boolean = false;

  constructor() {
    // Memory cache with default 10-minute TTL
    this.memoryCache = new NodeCache({
      stdTTL: 600,
      checkperiod: 120,
      useClones: false, // Performance optimization
    });

    // Initialize Redis if REDIS_URL is available
    if (env.REDIS_URL) {
      try {
        // Dynamic import to avoid requiring Redis if not used
        const Redis = require('ioredis');
        this.redisClient = new Redis(env.REDIS_URL, {
          maxRetriesPerRequest: 3,
          retryStrategy: (times: number) => {
            if (times > 3) {
              logger.error('Redis connection failed, falling back to memory cache');
              return null;
            }
            return Math.min(times * 50, 2000);
          },
        });

        this.redisClient.on('error', (err: Error) => {
          logger.warn({ error: err.message }, 'Redis error, falling back to memory cache');
          this.useRedis = false;
        });

        this.redisClient.on('connect', () => {
          logger.info('Redis connected successfully');
          this.useRedis = true;
        });

        this.useRedis = true;
      } catch (error) {
        logger.warn({ error }, 'Redis not available, using memory cache only');
        this.useRedis = false;
      }
    } else {
      logger.info('Redis not configured, using memory cache only');
    }
  }

  /**
   * Get value from cache (Redis first, then memory fallback)
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      if (this.useRedis && this.redisClient) {
        const value = await this.redisClient.get(key);
        if (value) {
          return JSON.parse(value) as T;
        }
      }

      // Fallback to memory cache
      const memoryValue = this.memoryCache.get<T>(key);
      return memoryValue || null;
    } catch (error) {
      logger.error({ error, key }, 'Cache get error');
      return null;
    }
  }

  /**
   * Set value in cache (both Redis and memory)
   */
  async set<T>(key: string, value: T, ttl: number = 600): Promise<void> {
    try {
      const serialized = JSON.stringify(value);

      // Set in Redis if available
      if (this.useRedis && this.redisClient) {
        await this.redisClient.setex(key, ttl, serialized);
      }

      // Always set in memory cache as backup
      this.memoryCache.set(key, value, ttl);
    } catch (error) {
      logger.error({ error, key }, 'Cache set error');
      // Fallback to memory only
      this.memoryCache.set(key, value, ttl);
    }
  }

  /**
   * Delete value from cache (both Redis and memory)
   */
  async del(key: string): Promise<void> {
    try {
      if (this.useRedis && this.redisClient) {
        await this.redisClient.del(key);
      }
      this.memoryCache.del(key);
    } catch (error) {
      logger.error({ error, key }, 'Cache delete error');
      this.memoryCache.del(key);
    }
  }

  /**
   * Delete multiple keys by pattern (Redis pattern or memory prefix)
   */
  async delPattern(pattern: string): Promise<void> {
    try {
      if (this.useRedis && this.redisClient) {
        const keys = await this.redisClient.keys(pattern);
        if (keys.length > 0) {
          await this.redisClient.del(...keys);
        }
      }

      // Memory cache pattern deletion
      const memoryKeys = this.memoryCache.keys();
      const keysToDelete = memoryKeys.filter(key => key.includes(pattern.replace('*', '')));
      if (keysToDelete.length > 0) {
        this.memoryCache.del(keysToDelete);
      }
    } catch (error) {
      logger.error({ error, pattern }, 'Cache delete pattern error');
    }
  }

  /**
   * Clear all cache
   */
  async flush(): Promise<void> {
    try {
      if (this.useRedis && this.redisClient) {
        await this.redisClient.flushdb();
      }
      this.memoryCache.flushAll();
    } catch (error) {
      logger.error({ error }, 'Cache flush error');
      this.memoryCache.flushAll();
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const memoryStats = this.memoryCache.getStats();
    return {
      memory: memoryStats,
      redisEnabled: this.useRedis,
      redisConnected: this.redisClient?.status === 'ready',
    };
  }

  /**
   * Close Redis connection
   */
  async disconnect(): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.quit();
    }
  }
}

// Export singleton instance
export const cacheService = new CacheService();
