import { NotificationChannel } from '../value-objects/notification.enum';
import { NotificationContent, RecipientInfo } from '../value-objects/notification.vo';

export abstract class NotificationEvent {
  constructor(public readonly notificationId: string, public readonly occurredAt: Date = new Date()) {}
}

export class NotificationCreatedEvent extends NotificationEvent {
  constructor(
    notificationId: string,
    public readonly recipient: RecipientInfo,
    public readonly channel: NotificationChannel,
    public readonly content: NotificationContent,
  ) {
    super(notificationId);
  }
}

export class NotificationSentEvent extends NotificationEvent {
  constructor(notificationId: string) {
    super(notificationId);
  }
}

export class NotificationFailedEvent extends NotificationEvent {
  constructor(notificationId: string, public readonly error: string) {
    super(notificationId);
  }
}
