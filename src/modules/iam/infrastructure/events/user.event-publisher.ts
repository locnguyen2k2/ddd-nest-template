import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { IDomainEvent } from '@/shared/domain/events/base.domain-event';
import { RABBITMQ_EXCHANGE, RABBITMQ_QUEUE, RABBITMQ_ROUTING_KEY } from '@/common/constant';
import { LogExecutionTime } from '@/common/decorators/log-execution.decorator';
import { IUserRepository, USER_REPO } from '../../domain/repositories/user.repository';
import { RabbitMQAdapter } from '@/shared/infrastructure/adapters/rabbitmq.service';
import { NotificationChannel } from '@/modules/notification/domain/value-objects/notification.enum';
import { env } from '@/utils/env';

@Injectable()
export class UserEventPublisher implements OnModuleInit {
  constructor(@Inject(USER_REPO) private readonly userService: IUserRepository, private readonly rabbitmq: RabbitMQAdapter) { }

  private eventHandlers: Map<
    string,
    ((event: IDomainEvent<string>) => Promise<void>)[]
  > = new Map();

  registerHandler(
    eventName: string,
    handler: (event: IDomainEvent<string>) => Promise<void>,
  ): void {
    if (!this.eventHandlers.has(eventName)) {
      this.eventHandlers.set(eventName, []);
    }
    this.eventHandlers.get(eventName)!.push(handler);
  }

  @LogExecutionTime()
  async publish(event: IDomainEvent<string>): Promise<void> {
    // Publish to local handlers
    const handlers = this.eventHandlers.get(event.eventName) || [];
    await Promise.all(handlers.map((handler) => handler(event)));

    switch (event.eventName) {
      case RABBITMQ_ROUTING_KEY.USER_CREATED:
        await this.handleUserCreated(event);
        break;
      case RABBITMQ_ROUTING_KEY.USER_NOTIFIED:
        await this.handleUserNotified(event);
        break;
      default:
        break;
    }
  }

  private async handleUserCreated(event: IDomainEvent<string>) {
    const user = await this.userService.findById(event.eventData.id as string);
    if (user) {
      const confirmation = await this.userService.requestConfirmationCode(user);

      const notificationPayload = {
        recipient: {
          email: user.email,
          username: user.username,
        },
        channel: NotificationChannel.MAIL,
        content: {
          subject: 'Confirm your registration',
          body: `Your confirmation code is: ${confirmation.code}`,
          template: './confirmation',
          data: { content: confirmation.code, ...confirmation },
        },
      };

      await this.rabbitmq.publish(
        RABBITMQ_EXCHANGE.NOTIFICATIONS,
        `${RABBITMQ_ROUTING_KEY.USER_CREATED}.${user.id.value}`,
        notificationPayload,
      );
    }
  }

  private async handleUserNotified(event: IDomainEvent<string>) {
    const user = await this.userService.findById(event.eventData.id as string);
    if (user) {
      const notificationPayload = {
        recipient: {
          email: user.email,
          username: user.username,
          telegram_id: env.str('TELEGRAM_BOT_CHAT_ROOM')
        },
        channel: NotificationChannel.TELEGRAM,
        content: {
          subject: 'User notified',
          body: `User ${user.username} has been notified`,
          template: './user-notified',
          data: { user: user.username },
        },
      };

      await this.rabbitmq.publish(
        RABBITMQ_EXCHANGE.NOTIFICATIONS,
        `${RABBITMQ_ROUTING_KEY.USER_NOTIFIED}.${user.id.value}`,
        notificationPayload,
      );
    }
  }

  async publishEvents(events: IDomainEvent<string>[]): Promise<void> {
    await Promise.all(events.map((event) => this.publish(event)));
  }

  async onModuleInit() {
  }
}
