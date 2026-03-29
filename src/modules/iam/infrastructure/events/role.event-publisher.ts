import { Injectable } from '@nestjs/common';
import { IDomainEvent } from '@/shared/domain/events/base.domain-event';

@Injectable()
export class RoleEventPublisher {
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

  async publish(event: IDomainEvent<string>): Promise<void> {
    const handlers = this.eventHandlers.get(event.eventName) || [];
    await Promise.all(handlers.map((handler) => handler(event)));
  }

  async publishEvents(events: IDomainEvent<string>[]): Promise<void> {
    await Promise.all(events.map((event) => this.publish(event)));
  }
}
