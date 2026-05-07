import { Queue, Worker, Job } from 'bullmq';
import { env } from '../../config/env';
import { logger } from '../logger/logger';
import { emailService } from '../email/email.service';

// Queue types
export enum QueueType {
  EMAIL = 'email',
  ANALYTICS = 'analytics',
  LOGS = 'logs',
}

// Email job data
interface EmailJobData {
  type: 'tenant-approved' | 'onboarding-completed' | 'welcome';
  to: string;
  data: any;
}

// Analytics job data
interface AnalyticsJobData {
  tenantId: string;
  event: string;
  properties: any;
}

// Log job data
interface LogJobData {
  level: 'info' | 'warn' | 'error';
  message: string;
  meta: any;
}

class QueueService {
  private queues: Map<QueueType, Queue> = new Map();
  private workers: Map<QueueType, Worker> = new Map();
  private redisConnection: any = null;

  constructor() {
    this.initializeQueues();
  }

  private initializeQueues() {
    // Initialize Redis connection if REDIS_URL is available
    if (env.REDIS_URL) {
      const Redis = require('ioredis');
      this.redisConnection = new Redis(env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times: number) => {
          if (times > 3) {
            logger.error('Redis connection failed for queues, jobs will be processed synchronously');
            return null;
          }
          return Math.min(times * 50, 2000);
        },
      });

      this.redisConnection.on('error', (err: Error) => {
        logger.warn({ error: err.message }, 'Redis queue error, falling back to sync processing');
      });

      this.redisConnection.on('connect', () => {
        logger.info('Redis connected for queues');
      });
    } else {
      logger.info('Redis not configured, jobs will be processed synchronously');
    }
  }

  /**
   * Get or create a queue
   */
  private getQueue(type: QueueType): Queue | null {
    if (!this.redisConnection) return null;

    if (!this.queues.has(type)) {
      const queue = new Queue(type, {
        connection: this.redisConnection,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: 100,
          removeOnFail: 50,
        },
      });
      this.queues.set(type, queue);
    }

    return this.queues.get(type)!;
  }

  /**
   * Add email job to queue
   */
  async addEmailJob(data: EmailJobData) {
    if (!this.redisConnection) {
      // Fallback to synchronous processing
      return this.processEmailJob(data);
    }

    const queue = this.getQueue(QueueType.EMAIL);
    if (!queue) return this.processEmailJob(data);

    await queue.add('send-email', data, {
      priority: 1, // High priority for emails
    });
  }

  /**
   * Add analytics job to queue
   */
  async addAnalyticsJob(data: AnalyticsJobData) {
    if (!this.redisConnection) {
      // Analytics can be skipped if queue not available
      return;
    }

    const queue = this.getQueue(QueueType.ANALYTICS);
    if (!queue) return;

    await queue.add('track-event', data, {
      priority: 5, // Lower priority for analytics
    });
  }

  /**
   * Add log job to queue
   */
  async addLogJob(data: LogJobData) {
    if (!this.redisConnection) {
      // Logs already handled by pino, skip queue
      return;
    }

    const queue = this.getQueue(QueueType.LOGS);
    if (!queue) return;

    await queue.add('process-log', data, {
      priority: 10, // Lowest priority for logs
    });
  }

  /**
   * Process email job (actual implementation)
   */
  private async processEmailJob(data: EmailJobData) {
    try {
      switch (data.type) {
        case 'tenant-approved':
          await emailService.sendTenantApprovedEmail(data.to, data.data.displayName);
          break;
        case 'onboarding-completed':
          await emailService.sendOnboardingCompletedEmail(data.to, data.data.displayName);
          break;
        case 'welcome':
          // Welcome email implementation
          break;
        default:
          logger.warn({ type: data.type }, 'Unknown email job type');
      }
    } catch (error) {
      logger.error({ error, data }, 'Email job failed');
      throw error;
    }
  }

  /**
   * Start workers (call this in a separate process or worker thread)
   */
  async startWorkers() {
    if (!this.redisConnection) {
      logger.info('Redis not available, workers not started');
      return;
    }

    // Email worker
    const emailWorker = new Worker(
      QueueType.EMAIL,
      async (job: Job<EmailJobData>) => {
        await this.processEmailJob(job.data);
      },
      { connection: this.redisConnection, concurrency: 5 }
    );
    this.workers.set(QueueType.EMAIL, emailWorker);

    emailWorker.on('completed', (job) => {
      logger.info({ jobId: job.id }, 'Email job completed');
    });

    emailWorker.on('failed', (job, err) => {
      logger.error({ jobId: job?.id, error: err }, 'Email job failed');
    });

    // Analytics worker
    const analyticsWorker = new Worker(
      QueueType.ANALYTICS,
      async (job: Job<AnalyticsJobData>) => {
        // Process analytics (e.g., send to analytics service)
        logger.info({ data: job.data }, 'Analytics event tracked');
      },
      { connection: this.redisConnection, concurrency: 10 }
    );
    this.workers.set(QueueType.ANALYTICS, analyticsWorker);

    // Log worker
    const logWorker = new Worker(
      QueueType.LOGS,
      async (job: Job<LogJobData>) => {
        // Process logs (e.g., send to log aggregation service)
        logger.info({ data: job.data }, 'Log processed');
      },
      { connection: this.redisConnection, concurrency: 20 }
    );
    this.workers.set(QueueType.LOGS, logWorker);

    logger.info('All queue workers started');
  }

  /**
   * Stop all workers
   */
  async stopWorkers() {
    for (const [type, worker] of this.workers) {
      await worker.close();
      logger.info({ type }, 'Worker stopped');
    }
    this.workers.clear();
  }

  /**
   * Close all queues
   */
  async closeQueues() {
    for (const [type, queue] of this.queues) {
      await queue.close();
      logger.info({ type }, 'Queue closed');
    }
    this.queues.clear();

    if (this.redisConnection) {
      await this.redisConnection.quit();
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats() {
    const stats: any = {
      redisConnected: !!this.redisConnection,
      queues: {},
    };

    for (const [type, queue] of this.queues) {
      const [waiting, active, completed, failed] = await Promise.all([
        queue.getWaitingCount(),
        queue.getActiveCount(),
        queue.getCompletedCount(),
        queue.getFailedCount(),
      ]);

      stats.queues[type] = {
        waiting,
        active,
        completed,
        failed,
      };
    }

    return stats;
  }
}

// Export singleton instance
export const queueService = new QueueService();
