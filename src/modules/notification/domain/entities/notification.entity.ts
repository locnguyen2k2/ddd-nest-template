import { AggregateRoot } from '@nestjs/cqrs';
import { NotificationChannel, NotificationStatus } from '../value-objects/notification.enum';
import { NotificationContent, RecipientInfo } from '../value-objects/notification.vo';
import { NotificationCreatedEvent, NotificationSentEvent, NotificationFailedEvent } from '../events/notification.events';

export class Notification extends AggregateRoot {
  constructor(
    public readonly id: string,
    public recipient: RecipientInfo,
    public channel: NotificationChannel,
    public content: NotificationContent,
    public status: NotificationStatus = NotificationStatus.PENDING,
    public errorMessage?: string,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {
    super();
  }

  markAsSent() {
    this.status = NotificationStatus.SENT;
    this.updatedAt = new Date();
    this.errorMessage = undefined;
    this.apply(new NotificationSentEvent(this.id));
  }

  markAsFailed(error: string) {
    this.status = NotificationStatus.FAILED;
    this.errorMessage = error;
    this.updatedAt = new Date();
    this.apply(new NotificationFailedEvent(this.id, error));
  }

  static create(id: string, recipient: RecipientInfo, channel: NotificationChannel, content: NotificationContent): Notification {
    const notification = new Notification(id, recipient, channel, content);
    notification.apply(new NotificationCreatedEvent(id, recipient, channel, content));
    return notification;
  }
}
