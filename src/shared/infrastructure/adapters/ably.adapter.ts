import { ablyConfigKey, ConfigKeyPaths, IAblyConfig } from '@/config';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Ably from 'ably';
import { Message } from 'ably';

@Injectable()
export class AblyAdapter {
  private readonly logger = new Logger(AblyAdapter.name);
  private readonly ably: Ably.Realtime;

  constructor(readonly configService: ConfigService<ConfigKeyPaths>) {
    const configs = configService.get<IAblyConfig>(ablyConfigKey);
    this.ably = new Ably.Realtime({
      key: configs?.key,
      clientId: configs?.id,
    });
  }

  getClient(): Ably.Realtime {
    return this.ably;
  }

  async publish(channel: string, event: string, data: any) {
    // console.log('🚀 ~ AblyService ~ publish ~ data:', data);
    const message: Message = {
      name: event,
      data: { ...data },
    };

    this.logger.fatal(
      `Notification ${event} [channel:${channel}] [from:${data?.from_address}] [to:${data?.to_address}] ${data?.transaction_type?.name || data?.raw_transaction_type}-${data?.id}-${data?.transaction_status}-${data?.amount}`,
    );

    return this.ably.channels.get(channel).publish(message);
  }
}
