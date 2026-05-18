import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { SendNotificationHandler } from "./application/handlers/send-notification.handler";
import { NOTIFICATION_REPOSITORY } from "./domain/repositories/notification.repository";
import { PrismaNotificationRepository } from "./infrastructure/persistence/notification.repository";
import { MESSAGE_BROKER } from "./application/ports/message-broker.port";
import { RabbitMQMessageBrokerAdapter } from "./infrastructure/adapters/rabbitmq-message-broker.adapter";
import { NOTIFICATION_PROVIDER } from "./application/ports/notification-provider.port";
import { MailNotificationProvider } from "./infrastructure/providers/mail-notification.provider";
import { TelegramNotificationProvider } from "./infrastructure/providers/telegram-notification.provider";
import { SmsNotificationProvider } from "./infrastructure/providers/sms-notification.provider";
import { NotificationProviderFactory } from "./application/providers/notification-provider.factory";
import { NotificationConsumer } from "./presentation/consumers/notification.consumer";
import { NotificationController } from "./presentation/controllers/notification.controller";

const CommandHandlers = [SendNotificationHandler];
const Providers = [
  MailNotificationProvider,
  TelegramNotificationProvider,
  SmsNotificationProvider,
  NotificationProviderFactory,
  NotificationConsumer,
  {
    provide: NOTIFICATION_PROVIDER,
    useFactory: (...providers) => providers,
    inject: [MailNotificationProvider, TelegramNotificationProvider, SmsNotificationProvider],
  },
];

@Module({
  imports: [CqrsModule],
  controllers: [NotificationController],
  providers: [
    ...CommandHandlers,
    ...Providers,
    {
      provide: NOTIFICATION_REPOSITORY,
      useClass: PrismaNotificationRepository,
    },
    {
      provide: MESSAGE_BROKER,
      useClass: RabbitMQMessageBrokerAdapter,
    },
  ],
  exports: [MESSAGE_BROKER],
})
export class NotificationModule { }
