import { Injectable } from '@nestjs/common';
import { INotificationProvider } from '../../application/ports/notification-provider.port';
import { NotificationChannel } from '../../domain/value-objects/notification.enum';
import { NotificationContent, RecipientInfo } from '../../domain/value-objects/notification.vo';
import { MailerAdapter } from '@/shared/infrastructure/adapters/mailer.adapter';
import { MailType } from '@/shared/application/ports/mailer.port';

@Injectable()
export class MailNotificationProvider implements INotificationProvider {
  public readonly channel = NotificationChannel.MAIL;

  constructor(
    private readonly mailerAdapter: MailerAdapter,
  ) { }

  async send(recipient: RecipientInfo, content: NotificationContent): Promise<void> {
    if (!recipient.email) {
      throw new Error('Email address is missing for MAIL channel');
    }

    switch (content.type) {
      case MailType.CONFIRMED:
      case MailType.PASSWORD:
        await this.mailerAdapter.sendSecretCode(recipient.email, content.body, content.type);
        break;
      default:
        await this.mailerAdapter.sendEmail({
          to: recipient.email,
          subject: content.subject!,
          template: content.template!,
          context: content.data!,
        });
        break;
    }
  }
}
