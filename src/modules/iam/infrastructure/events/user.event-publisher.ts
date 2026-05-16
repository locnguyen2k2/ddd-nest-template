import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { IDomainEvent } from '@/shared/domain/events/base.domain-event';
import { RABBITMQ_QUEUE, RABBITMQ_ROUTING_KEY } from '@/common/constant';
import { LogExecutionTime } from '@/common/decorators/log-execution.decorator';
import { RabbitNotificationPublisher } from '@/modules/notification/infrastructure/rabbit/rabbit-notification.publisher';
import { MailerAdapter } from '@/shared/infrastructure/adapters/mailer.adapter';
import { IUserRepository, USER_REPO } from '../../domain/repositories/user.repository';

@Injectable()
export class UserEventPublisher implements OnModuleInit {
  constructor(private readonly rabbitMqService: RabbitNotificationPublisher, @Inject(USER_REPO) private readonly userService: IUserRepository) { }

  private eventHandlers: Map<
    string,
    ((event: IDomainEvent<string>) => Promise<void>)[]
  > = new Map();

  @LogExecutionTime()
  private async userCreatedConsumer() {
    try {
      await this.rabbitMqService.consume(
        RABBITMQ_QUEUE.NOTIFICATIONS,
        async (message: any) => {
          const payload: any = message
          await this.userService.requestConfirmationCode(payload);
        },
      );
    } catch (error) {
      console.error('Error setting up UserCreatedConsumer:', error);
    }
  }

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

    // Publish to RabbitMQ
    await this.rabbitMqService.publish(
      String(`${RABBITMQ_ROUTING_KEY.USER_CREATED}.${event.eventData.id}`),
      event.eventData,
    );
  }

  async publishEvents(events: IDomainEvent<string>[]): Promise<void> {
    await Promise.all(events.map((event) => this.publish(event)));
  }

  async onModuleInit() {
    await this.userCreatedConsumer();
  }
}
