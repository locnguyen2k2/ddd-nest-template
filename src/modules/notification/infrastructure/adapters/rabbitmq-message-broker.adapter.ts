import { Injectable } from '@nestjs/common';
import { IMessageBroker } from '../../application/ports/message-broker.port';
import { RabbitMQAdapter } from '@/shared/infrastructure/adapters/rabbitmq.service';

@Injectable()
export class RabbitMQMessageBrokerAdapter implements IMessageBroker {
  constructor(private readonly rabbitMQAdapter: RabbitMQAdapter) {}

  async publish(queue: string, message: any): Promise<void> {
    await this.rabbitMQAdapter.sendToQueue(queue, message);
  }

  async subscribe(queue: string, callback: (message: any) => Promise<void>): Promise<void> {
    await this.rabbitMQAdapter.consume(queue, callback);
  }
}
