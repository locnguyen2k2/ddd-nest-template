import { Injectable, Logger } from '@nestjs/common';
import { INotificationProvider } from '../../application/ports/notification-provider.port';
import { NotificationChannel } from '../../domain/value-objects/notification.enum';
import { NotificationContent, RecipientInfo } from '../../domain/value-objects/notification.vo';
import { BusinessException } from '@/common/http/business-exception';

@Injectable()
export class SmsNotificationProvider implements INotificationProvider {
  public readonly channel = NotificationChannel.SMS;
  private readonly logger = new Logger(SmsNotificationProvider.name);

  async send(recipient: RecipientInfo, content: NotificationContent): Promise<void> {
    if (!recipient.phone_number) {
      throw new BusinessException('400|Phone number is missing for SMS channel');
    }

    this.logger.log(`Sending SMS to ${recipient.phone_number}: ${content.body}`);
  }
}
