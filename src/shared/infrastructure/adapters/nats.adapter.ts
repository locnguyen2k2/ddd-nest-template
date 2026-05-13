import { ConfigKeyPaths, INatsConfig, natsConfigKey } from '@/config';
import { connect, NatsConnection } from '@nats-io/transport-node';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnModuleInit } from '@nestjs/common';

@Injectable()
export class NatsAdapter implements OnModuleInit {
  private readonly logger = new Logger(NatsAdapter.name);
  private readonly configs: INatsConfig;
  private nats: NatsConnection | null = null;

  constructor(readonly configService: ConfigService<ConfigKeyPaths>) {
    this.configs = configService.get<INatsConfig>(natsConfigKey)!;
  }

  async onModuleInit() {
    console.log('🚀 ~ NatsAdapter ~ onModuleInit ~ this.configs:', this.configs);
    this.nats = await connect({
      servers: this.configs.url,
      timeout: 60000,
    });
    console.log('🚀 ~ NatsAdapter ~ onModuleInit ~ this.nats:', this.nats);
  }

  getClient(): NatsConnection {
    return this.nats!;
  }

  async publish(channel: string, event: string, data: any) {
    // console.log('🚀 ~ AblyService ~ publish ~ data:', data);
    const message: any = {
      name: event,
      data: { ...data },
    };

    this.logger.fatal(
      `Notification ${event} [channel:${channel}] [from:${data?.from_address}] [to:${data?.to_address}] ${data?.transaction_type?.name || data?.raw_transaction_type}-${data?.id}-${data?.transaction_status}-${data?.amount}`,
    );

    return this.nats!.publish(channel, JSON.stringify(message));
  }
}
