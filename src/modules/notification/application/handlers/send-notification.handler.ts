import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { SendNotificationCommand } from '../commands/send-notification.command';
import { Inject } from '@nestjs/common';
import { NOTIFICATION_REPOSITORY, INotificationRepository } from '../../domain/repositories/notification.repository';
import { Notification } from '../../domain/entities/notification.entity';
import { NotificationProviderFactory } from '../providers/notification-provider.factory';
import { uuidv7 } from 'uuidv7';
import { BusinessException } from '@/common/http/business-exception';

@CommandHandler(SendNotificationCommand)
export class SendNotificationHandler implements ICommandHandler<SendNotificationCommand> {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: INotificationRepository,
    private readonly providerFactory: NotificationProviderFactory,
    private readonly eventPublisher: EventPublisher,
  ) { }

  async execute(command: SendNotificationCommand): Promise<void> {
    const { recipient, channel, content } = command;

    const notificationId = uuidv7();
    const notification = Notification.create(notificationId, recipient, channel, content);

    await this.notificationRepository.save(notification);

    const notificationContext = this.eventPublisher.mergeObjectContext(notification);
    notificationContext.commit();

    try {
      const provider = this.providerFactory.getProvider(channel);
      await provider.send(recipient, content);

      notificationContext.markAsSent();
      await this.notificationRepository.save(notificationContext);
      notificationContext.commit();
    } catch (error: any) {
      notificationContext.markAsFailed(error.message);
      await this.notificationRepository.save(notificationContext);
      notificationContext.commit();
      throw new BusinessException(`400|Failed to send notification: ${error.message}`);
    }
  }
}
