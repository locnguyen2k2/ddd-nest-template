// Base domain event interface
export interface IDomainEvent<T> {
  eventName: string;
  aggregateId: T;
  occurredOn: Date;
  eventData: Record<string, unknown>;
}

// Base domain event class
export abstract class BaseDomainEvent<T> implements IDomainEvent<T> {
  public readonly occurredOn: Date;

  constructor(
    public readonly aggregateId: T,
    occurredOn?: Date,
  ) {
    this.occurredOn = occurredOn ?? new Date();
  }

  abstract get eventName(): string;

  abstract get eventData(): Record<string, unknown>;
}
