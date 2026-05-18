import { NotificationChannel } from '../../domain/value-objects/notification.enum';
import { NotificationContent, RecipientInfo } from '../../domain/value-objects/notification.vo';

export class SendNotificationCommand {
  constructor(
    public readonly recipient: RecipientInfo,
    public readonly channel: NotificationChannel,
    public readonly content: NotificationContent,
  ) {}
}
