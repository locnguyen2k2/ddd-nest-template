import { Inject, Injectable } from '@nestjs/common';
import {
  IQueueManager,
  QueueMetadata,
  QueueStats,
} from '../../application/ports/queue-manager.port';
import { CACHE_PORT, CachePort } from '../../application/ports/cache.port';
import { AmqpConnectionManager } from 'amqp-connection-manager';
import { RABBITMQ_CONNECTION } from '../adapters/rabbitmq.service';
import { ConfirmChannel } from 'amqplib';

export const RABBITMQ_STATS = {
  KEY_PREFIX: 'queue:stats:',
  PAUSE_PREFIX: 'queue:pause:',
}
@Injectable()
export class RabbitMQManagementService implements IQueueManager {
  constructor(
    @Inject(CACHE_PORT) private readonly cache: CachePort,
    @Inject(RABBITMQ_CONNECTION) private readonly connection: AmqpConnectionManager,
  ) { }

  private getStatsKey(queueName: string) {
    return `${RABBITMQ_STATS.KEY_PREFIX}${queueName}`;
  }

  async getQueueStats(queueName: string): Promise<QueueStats> {
    const key = this.getStatsKey(queueName);
    const stats = (await this.cache.hgetall<any>(key)) || {};

    return {
      name: queueName,
      running: Number(stats.running || 0),
      completed: Number(stats.completed || 0),
      success: Number(stats.success || 0),
      failed: Number(stats.failed || 0),
      processing: Number(stats.processing || 0),
      total: Number(stats.total || 0),
    };
  }

  async getAllQueuesStats(): Promise<QueueStats[]> {
    const pattern = `${RABBITMQ_STATS.KEY_PREFIX}*`;
    const keys = await this.cache.getKeys(pattern);

    const statsPromises = keys.map((key) => {
      const queueName = key.replace(RABBITMQ_STATS.KEY_PREFIX, '');
      return this.getQueueStats(queueName);
    });

    return Promise.all(statsPromises);
  }

  async getQueueMetadata(queueName: string): Promise<QueueMetadata> {
    return new Promise((resolve, reject) => {
      this.connection.createChannel({
        setup: async (channel: ConfirmChannel) => {
          try {
            const info = await channel.checkQueue(queueName);
            resolve({
              name: queueName,
              durable: true,
              autoDelete: false,
              arguments: info,
            });
          } catch (e) {
            reject(e);
          }
        },
      });
    });
  }

  async pauseQueue(queueName: string): Promise<void> {
    await this.cache.set(`${RABBITMQ_STATS.PAUSE_PREFIX}${queueName}`, true);
  }

  async resumeQueue(queueName: string): Promise<void> {
    await this.cache.delete(`${RABBITMQ_STATS.PAUSE_PREFIX}${queueName}`);
  }

  async cancelQueue(queueName: string): Promise<void> {
    await this.pauseQueue(queueName);
    this.connection.createChannel({
      setup: async (channel: ConfirmChannel) => {
        await channel.purgeQueue(queueName);
      },
    });
  }
}
