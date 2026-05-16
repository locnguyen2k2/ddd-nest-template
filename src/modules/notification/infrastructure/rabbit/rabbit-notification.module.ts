import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@/shared/infrastructure/rabbitmq/rabbitmq.module';
import { NOTIFICATION_PUBLISHER_PORT } from '../../domain/ports/notification-publisher.port';
import { RabbitNotificationPublisher } from './rabbit-notification.publisher';

@Module({
  imports: [RabbitMQModule],
  providers: [
    {
      provide: NOTIFICATION_PUBLISHER_PORT,
      useClass: RabbitNotificationPublisher,
    },
  ],
  exports: [NOTIFICATION_PUBLISHER_PORT],
})
export class RabbitNotificationModule { }
