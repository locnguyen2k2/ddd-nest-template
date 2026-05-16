import { Module } from '@nestjs/common';
import { RabbitNotificationModule } from './infrastructure/rabbit/rabbit-notification.module';
import { RabbitNotificationPublisher } from './infrastructure/rabbit/rabbit-notification.publisher';

@Module({
  imports: [RabbitNotificationModule],
  providers: [
    RabbitNotificationPublisher
  ],
  exports: [RabbitNotificationPublisher],
})
export class NotificationModule { }
