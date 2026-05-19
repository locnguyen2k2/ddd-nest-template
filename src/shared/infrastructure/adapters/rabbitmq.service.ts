import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { AmqpConnectionManager, ChannelWrapper } from 'amqp-connection-manager';
import { CACHE_PORT, CachePort } from '../../application/ports/cache.port';

export const RABBITMQ_CONNECTION = 'RABBITMQ_CONNECTION';

import { ConfirmChannel } from 'amqplib';
import { ConfigService } from '@nestjs/config';
import { ConfigKeyPaths, IRabbitMQConfig, rabbitmqConfigKey } from '@/config';
import { BusinessException } from '@/common/http/business-exception';
import { LogExecutionTime } from '@/common/decorators/log-execution.decorator';
import { RABBITMQ_EXCHANGE, RABBITMQ_QUEUE } from '@/common/constant';
import { Cron } from '@nestjs/schedule';
import { env } from '@/utils/env';

@Injectable()
export class RabbitMQAdapter implements OnModuleInit, OnModuleDestroy {
  private channelWrapper: ChannelWrapper;
  private configs: IRabbitMQConfig;
  private activeChannel: ConfirmChannel | null = null;
  private readonly setupRegistry = new Map<string, (channel: ConfirmChannel) => Promise<void>>();
  private consumerTags: Map<string, {
    tag: string, queue: string, callback: (message: any) => Promise<void>, channel: ChannelWrapper;
    isActive: boolean;
    lastHeartbeatAt?: number;
  }> = new Map();
  private readonly exchangeNames: { exchange: string; queue: string }[] = [
    {
      exchange: RABBITMQ_EXCHANGE.NOTIFICATIONS,
      queue: RABBITMQ_QUEUE.NOTIFICATIONS,
    },
    {
      exchange: RABBITMQ_EXCHANGE.IAM,
      queue: RABBITMQ_QUEUE.IAM,
    },
  ];

  constructor(
    @Inject(RABBITMQ_CONNECTION)
    private readonly connection: AmqpConnectionManager,
    @Inject(CACHE_PORT) private readonly cache: CachePort,
    private readonly configService: ConfigService<ConfigKeyPaths>,
  ) {
    const rbmqConfigs = this.configService.get<IRabbitMQConfig>(rabbitmqConfigKey);
    if (!rbmqConfigs) {
      throw new BusinessException('400|RabbitMQ config not found');
    }
    this.configs = rbmqConfigs;
    this.connection.on('connect', () => console.log('RabbitMQ Connected'));
    this.connection.on('disconnect', (err) =>
      console.error('RabbitMQ Disconnected:', err),
    );

    this.channelWrapper = this.connection.createChannel({
      setup: async (channel: ConfirmChannel) => {
        this.activeChannel = channel;
        for (const setupFn of this.setupRegistry.values()) {
          await setupFn(channel);
        }
      }
    });
    this.channelWrapper.on('error', (err) =>
      console.error('RabbitMQ Channel Error:', err),
    );

    this.channelWrapper.on('close', () => {
      console.log('RabbitMQ Channel Closed');
      this.activeChannel = null;
      this.consumerTags.clear();
    });
  }

  @LogExecutionTime()
  async initialize() {
    console.log(env.str('NODE_ENV'), 'NODE_ENV');
    for (const { exchange, queue } of this.exchangeNames) {
      const [queueName, queuePriority] = queue.split(':');
      const limitQueue = queuePriority ? parseInt(queuePriority) : 1;
      const tagQueues: Promise<boolean>[] = [];

      for (let i = 0; i < limitQueue; i++) {
        const tagQueueName = queuePriority ? `${queueName}_${i}` : queueName;
        tagQueues.push(this.setConsumer(exchange.trim(), tagQueueName.trim()));
      }
      await Promise.all(tagQueues);
    }
  }

  async onModuleInit() {
    if (!this.connection.isConnected()) {
      await new Promise((resolve) => this.connection.once('connect', resolve));
    }
    await this.clearQueueBeforeInitialize()
    await this.initialize();
  }

  async onModuleDestroy() {
    await this.connection.close();
  }

  async publish(
    exchange: string,
    routingKey: string,
    content: any,
    options?: any,
  ) {
    return await this.channelWrapper.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify(content)),
      options,
    );
  }

  async sendToQueue(queue: string, content: any, options?: any) {
    await this.channelWrapper.sendToQueue(
      queue,
      Buffer.from(JSON.stringify(content)),
      options,
    );
  }

  async createConsumerChannel(
    setup: (channel: ConfirmChannel) => Promise<void>,
  ): Promise<any> {
    return this.connection.createChannel({
      setup,
    });
  }

  private getManagementUrl(path: string): string {
    const protocol = this.configs.host.includes('localhost') ? 'http' : 'https';
    const port = this.configs.host.includes(':') ? '' : ':15672';
    return `${protocol}://${this.configs.host}${port}/api/${path}`;
  }

  async ableToConsume(queueName: string): Promise<boolean> {
    try {
      const url = this.getManagementUrl('consumers');

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Basic ${Buffer.from(`${this.configs.user}:${this.configs.pass}`).toString('base64')}`,
        },
      });

      if (!response.ok) {
        return true;
      }

      const consumers = await response.json() as any[];

      const queue = this.consumerTags.get(queueName);
      if (!queue) return true;

      const consumerDetails = consumers.find((c) => c.queue && c.queue.name === queueName && c.consumer_tag === queue.tag);
      return !consumerDetails;
    } catch (error) {
      return true;
    }
  }

  async setConsumer(exchange: string, queue: string, forceRecreate: boolean = false) {
    if (!forceRecreate) {
      const ableToConsume = await this.ableToConsume(queue);
      if (!ableToConsume) {
        console.log(`Queue ${queue} is has consumer, skipping...`);
        return true;
      }
    }

    const setupKey = `infra:${queue}`;
    const setupFn = async (channel: ConfirmChannel) => {
      try {
        await channel.prefetch(1); // Consume one message at a time
        const deadLetterExchange = `${exchange}.dlx`;
        const deadLetterQueue = `${queue}.dlq`;

        // Add dead letter exchange and queue
        await channel.assertExchange(deadLetterExchange, 'direct', { durable: true });
        await channel.assertQueue(deadLetterQueue, { durable: true });
        await channel.bindQueue(deadLetterQueue, deadLetterExchange, 'dead');

        // Add consistent hash exchange
        await channel.assertExchange(exchange, 'x-consistent-hash', { durable: true });
        await channel.assertQueue(queue, {
          durable: true,
          arguments: {
            'x-dead-letter-exchange': deadLetterExchange,
            'x-dead-letter-routing-key': 'dead',
          },
        });
        await channel.bindQueue(queue, exchange, '1', {
          'x-bind-weight': 1,
        });
        console.log(`Successfully registered infrastructure for queue: ${queue}`);
      } catch (error) {
        console.error('Error setting up consumer infrastructure:', error);
      }
    };

    this.setupRegistry.set(setupKey, setupFn);

    if (this.activeChannel) {
      await setupFn(this.activeChannel);
    }

    return true;
  }

  async consume(
    queue: string,
    onMessage: (msg: any) => Promise<void>,
    specificTagQueueName?: string,
  ): Promise<any> {
    const [queueName, queuePriority] = queue.split(':');
    const replica = Number(this.configs.replica || 1);
    const queuePriorityNum = queuePriority
      ? Math.ceil(parseInt(queuePriority) / replica)
      : 1;
    const limitQueue = queuePriority ? parseInt(queuePriority) : 1;

    const statsKey = `queue:stats:${queueName}`;
    const pauseKey = `queue:pause:${queueName}`;
    const channel = this.channelWrapper;

    let consumerCount = 0;
    let tagQueueIndex = 0;

    while (consumerCount < queuePriorityNum && tagQueueIndex < limitQueue) {
      const tagQueueName = queuePriority
        ? `${queueName}_${tagQueueIndex}`
        : queueName;

      tagQueueIndex++;

      if (specificTagQueueName && tagQueueName !== specificTagQueueName) {
        continue;
      }

      const isAble = await this.ableToConsume(tagQueueName);

      if (isAble) {
        const mapping = this.exchangeNames.find(
          ({ queue }) => queue.split(':')[0] === queueName,
        );
        const exchange = mapping?.exchange;
        const deadLetterExchange = `${exchange}.dlx`;

        const setupKey = `consumer:${tagQueueName}`;
        const setupFn = async (channel: ConfirmChannel) => {
          await channel.assertQueue(tagQueueName, {
            durable: true,
            arguments: {
              'x-dead-letter-exchange': deadLetterExchange,
              'x-dead-letter-routing-key': 'dead',
            },
          });

          const heartbeatKey = `queue:heartbeat:${tagQueueName}`;
          const updateHeartbeat = async () => {
            await this.cache.set(heartbeatKey, Date.now().toString(), 60); // 60s TTL
          };

          const consumerResult = await channel.consume(tagQueueName, async (msg) => {
            if (msg === null) {
              console.warn(`Consumer for ${tagQueueName} was cancelled by broker`);
              this.consumerTags.delete(tagQueueName);
              this.setupRegistry.delete(`consumer:${tagQueueName}`);
              return;
            }

            const isPaused = await this.cache.exists(pauseKey);
            if (isPaused) {
              channel.nack(msg, false, true);
              return;
            }

            try {
              await updateHeartbeat();
              await this.cache.hset(
                statsKey,
                'processing',
                await this.cache.incr(`${statsKey}:processing`),
              );

              const content = JSON.parse(msg.content.toString());
              await onMessage(content);

              channel.ack(msg);
              await this.cache.hset(statsKey, 'success', await this.cache.incr(`${statsKey}:success`));
              await this.cache.hset(statsKey, 'completed', await this.cache.incr(`${statsKey}:completed`));
            } catch (error) {
              console.error(`Error processing message from queue ${tagQueueName}:`, error);
              channel.nack(msg, false, false);
              await this.cache.hset(statsKey, 'failed', await this.cache.incr(`${statsKey}:failed`));
            } finally {
              await this.cache.hset(statsKey, 'processing', await this.cache.decr(`${statsKey}:processing`));
            }
          });

          const timer = setInterval(updateHeartbeat, 10000);
          this.channelWrapper.on('close', () => clearInterval(timer));
          await updateHeartbeat();

          this.consumerTags.set(tagQueueName, {
            tag: consumerResult.consumerTag,
            queue: tagQueueName,
            callback: onMessage,
            channel: this.channelWrapper,
            isActive: true,
            lastHeartbeatAt: Date.now(),
          });
        };

        this.setupRegistry.set(setupKey, setupFn);

        if (this.activeChannel) {
          await setupFn(this.activeChannel);
        }

        consumerCount++;
      }
      channel.on('close', () => {
        const consumer = this.consumerTags.get(tagQueueName);

        if (consumer) {
          consumer.isActive = false;
        }
      });
    }
  }

  processAndGroupQueues(data: any[]): Record<string, { queue: number; messages: number }> {
    const groupedData: Record<string, { queue: number; messages: number }> = {};

    data.forEach((queue) => {
      if (queue.name.includes('dead_letter')) return;

      const parts = queue.name.split('_');
      const groupName = parts.slice(0, -1).join('_');

      if (!groupedData[groupName]) {
        groupedData[groupName] = { queue: 0, messages: 0 };
      }

      groupedData[groupName].queue += 1;
      groupedData[groupName].messages += queue.messages;
    });
    return groupedData;
  }

  async getCurrentQueueNumber(queueName?: string) {
    try {
      const url = this.getManagementUrl('queues');
      const request = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${this.configs.user}:${this.configs.pass}`,
          ).toString('base64')}`,
        },
      });
      const queues = await request.json();

      const activeQueues = queues.filter(
        (queue: { name: string }) => !queue.name.endsWith('.dlq'),
      );
      return this.processAndGroupQueues(activeQueues);
    } catch (error) {
      console.error('Failed to get current queue number.', error);
      return {};
    }
  }

  async removeQueue(queueName: string) {
    try {
      if (this.activeChannel) {
        await this.activeChannel.deleteQueue(queueName);
      } else {
        await this.channelWrapper.addSetup((channel: ConfirmChannel) => channel.deleteQueue(queueName));
      }
    } catch (error) {
      console.error('Failed to remove queue.', error);
    }
  }

  @LogExecutionTime()
  async clearQueueBeforeInitialize() {
    console.log('Clearing queues before initialize...');
    const queues = await this.getCurrentQueueNumber();
    let clearInfo: Record<string, { queue: number; limit: number }> = {};
    for (const { queue } of this.exchangeNames) {
      const [queueName, queuePriority] = queue.split(':');
      const limitQueue = queuePriority ? parseInt(queuePriority) : 1;
      if (queues[queueName] && queues[queueName].queue > limitQueue) {
        clearInfo[queueName] = {
          queue: queues[queueName].queue,
          limit: limitQueue,
        };
      }
    }
    const deletedQueueNames: string[] = [];
    for (const queueName of Object.keys(clearInfo)) {
      const { queue, limit } = clearInfo[queueName];
      for (let i = limit; i <= queue; i++) {
        deletedQueueNames.push(`${queueName}_${i}`);
        deletedQueueNames.push(`${queueName}_${i}.dlq`);
      }
    }
    console.log('Deleted queue names:', deletedQueueNames);
    await Promise.all(deletedQueueNames.map(queueName => this.removeQueue(queueName)));
  }

  @LogExecutionTime()
  async restartConsumer(queue: string) {
    const queueConsumers = this.consumerTags.get(queue);
    try {
      if (queueConsumers) {
        if (this.activeChannel) {
          try {
            await this.activeChannel.cancel(queueConsumers.tag);
          } catch (e) {
          }
        }
        this.consumerTags.delete(queue);
        this.setupRegistry.delete(`consumer:${queue}`);
      }
      const queueName = this.exchangeNames.find(exchange => exchange.queue.startsWith(queue.split('_')[0]));
      if (queueName && queueConsumers?.queue) {
        const success = await this.setConsumer(queueName.exchange, queueConsumers.queue, true);
        if (success) {
          await this.consume(queueName.queue, queueConsumers.callback, queueConsumers.queue);
          return true;
        }
      }
    } catch (error) {
      console.error('Failed to restart consumer.', error);
    }
    return false;
  }

  @Cron('*/10 * * * * *') // Every 10 seconds
  async handleCron() {
    await this.performHealthCheckAndRecover();
  }

  private async checkConsumerHealth() {
    const health: { [queueName: string]: boolean } = {};

    try {
      for (const [queueName] of this.consumerTags.entries()) {
        try {
          const heartbeatKey = `queue:heartbeat:${queueName}`;
          const lastHeartbeat = await this.cache.get(heartbeatKey);

          if (!lastHeartbeat) {
            health[queueName] = true; // No heartbeat found, unhealthy
            continue;
          }

          const diff = Date.now() - parseInt(lastHeartbeat as string);
          health[queueName] = diff > 30000; // Unhealthy if > 30s stale
        } catch (error) {
          health[queueName] = true;
        }
      }
    } catch (error) {
      console.error('Error checking consumer health:', error);
    }

    return health;
  }

  private async performHealthCheckAndRecover() {
    const health = await this.checkConsumerHealth();
    const unhealthyQueues: string[] = [];
    const staleConsumers: string[] = [];

    for (const [queueName, isHealthy] of Object.entries(health)) {
      if (!this.consumerTags.has(queueName)) {
        unhealthyQueues.push(queueName);
        continue;
      }
      const canConsume = health[queueName];
      if (canConsume === true) {
        unhealthyQueues.push(queueName);
      }
    }
    const allUnhealthyQueues = [
      ...new Set([...unhealthyQueues, ...staleConsumers]),
    ];
    if (allUnhealthyQueues.length > 0) {
      for (const queueName of allUnhealthyQueues) {
        const success = await this.restartConsumer(queueName);
        console.log(`Auto-recovery for queue ${queueName}: ${success}`);
      }
    }
  }
}
