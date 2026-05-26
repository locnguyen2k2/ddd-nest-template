import { Inject, Injectable } from '@nestjs/common';
import { NOTIFICATION_PROVIDER, INotificationProvider } from '../ports/notification-provider.port';
import { NotificationChannel } from '../../domain/value-objects/notification.enum';

@Injectable()
export class NotificationProviderFactory {
  constructor(
    @Inject(NOTIFICATION_PROVIDER)
    private readonly providers: INotificationProvider[],
  ) {}

  getProvider(channel: NotificationChannel): INotificationProvider {
    const provider = this.providers.find(p => p.channel === channel);
    if (!provider) {
      throw new Error(`No notification provider found for channel: ${channel}`);
    }
    return provider;
  }
}
