import { Injectable } from '@nestjs/common';
import { INotificationPublisher } from '../../domain/ports/notification-publisher.port';
import { RabbitMQAdapter } from '@/shared/infrastructure/adapters/rabbitmq.service';
import { RABBITMQ_EXCHANGE } from '@/common/constant';

@Injectable()
export class RabbitNotificationPublisher implements INotificationPublisher {
  constructor(private readonly rabbitMQService: RabbitMQAdapter) { }

  async publish(routing: string, message: any): Promise<void> {
    const exchange = RABBITMQ_EXCHANGE.NOTIFICATIONS;
    await this.rabbitMQService.publish(exchange, routing, message);
  }

  async consume(queue: string, handler: (message: any) => Promise<void>): Promise<void> {
    await this.rabbitMQService.consume(queue, handler);
  }
}
