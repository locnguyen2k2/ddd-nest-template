import { NotificationChannel } from '../../domain/value-objects/notification.enum';
import { NotificationContent, RecipientInfo } from '../../domain/value-objects/notification.vo';

export const NOTIFICATION_PROVIDER = 'NOTIFICATION_PROVIDER';

export interface INotificationProvider {
  channel: NotificationChannel;
  send(recipient: RecipientInfo, content: NotificationContent): Promise<void>;
}
