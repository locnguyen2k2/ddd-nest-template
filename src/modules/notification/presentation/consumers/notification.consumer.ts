import { Inject, Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { MESSAGE_BROKER, IMessageBroker } from '../../application/ports/message-broker.port';
import { SendNotificationCommand } from '../../application/commands/send-notification.command';
import { RABBITMQ_QUEUE } from '@/common/constant';
import { BusinessException } from '@/common/http/business-exception';

@Injectable()
export class NotificationConsumer implements OnModuleInit {
  private readonly logger = new Logger(NotificationConsumer.name);

  constructor(
    @Inject(MESSAGE_BROKER)
    private readonly messageBroker: IMessageBroker,
    private readonly commandBus: CommandBus,
  ) {}

  async onModuleInit() {
    this.logger.log(`Starting Notification Consumer on queue: ${RABBITMQ_QUEUE.NOTIFICATIONS}`);
    await this.messageBroker.subscribe(RABBITMQ_QUEUE.NOTIFICATIONS, async (message) => {
      await this.handleMessage(message);
    });
  }

  private async handleMessage(message: any) {
    try {
      this.logger.log(`Received notification message: ${JSON.stringify(message)}`);
      
      const command = new SendNotificationCommand(
        message.recipient,
        message.channel,
        message.content,
      );

      await this.commandBus.execute(command);
    } catch (error: any) {
      this.logger.error(`Error processing notification message: ${error.message}`, error.stack);
      throw new BusinessException('400|Failed to process notification message');
    }
  }
}
