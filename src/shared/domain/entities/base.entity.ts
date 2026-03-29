import { IDomainEvent } from '@/shared/domain/events/base.domain-event';

/**
 * Entity identifier interface for Domain-Driven Design (DDD)
 */
export interface IEntityID<T> {
  value: any;
  _id: T;

  get(): T;
}

/**
 * Base entity class implementing Domain-Driven Design (DDD) patterns
 */
export abstract class BaseEntity<E, ID> {
  private readonly _id: IEntityID<ID>;

  constructor(public readonly id: IEntityID<ID>) {
    this._id = id;
  }

  get getId() {
    return this._id;
  }

  equals(other: BaseEntity<E, ID>): boolean {
    return this._id === other._id;
  }
}

/**
 * Aggregate Root class - the top-level entity in an aggregate
 */
export class AggregateRoot<E, ID> extends BaseEntity<E, ID> {
  private _version: number = 0;
  private _events: IDomainEvent<ID>[] = [];

  constructor(public readonly id: IEntityID<ID>) {
    super(id);
  }

  public get version() {
    return this._version;
  }

  protected incrementVersion() {
    this._version++;
  }

  protected addDomainEvent(event: IDomainEvent<ID>): void {
    this._events.push(event);
  }

  public getEvents(): ReadonlyArray<IDomainEvent<ID>> {
    return this._events;
  }

  public clearEvents(): void {
    this._events = [];
  }
}
