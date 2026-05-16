import { Injectable } from '@nestjs/common';
import { INotificationPublisher } from '../../domain/ports/notification-publisher.port';
import { RabbitMQService } from '@/shared/infrastructure/rabbitmq/rabbitmq.service';
import { RABBITMQ_EXCHANGE } from '@/common/constant';

@Injectable()
export class RabbitNotificationPublisher implements INotificationPublisher {
  constructor(private readonly rabbitMQService: RabbitMQService) { }

  async publish(routing: string, message: any): Promise<void> {
    const exchange = RABBITMQ_EXCHANGE.NOTIFICATIONS;
    await this.rabbitMQService.publish(exchange, routing, message);
  }

  async consume(queue: string, handler: (message: any) => Promise<void>): Promise<void> {
    await this.rabbitMQService.consume(queue, handler);
  }
}
