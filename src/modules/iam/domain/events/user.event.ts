import { BaseDomainEvent } from '@/shared/domain/events/base.domain-event';

export enum UserEventType {
  CREATED = 'user.created',
  UPDATED = 'user.updated',
  DELETED = 'user.deleted',
}

export interface ICreateUserEvent {
  id: string;
  name: string;
  email: string;
  password: string;
  organizationId: string;
}

export class UserCreatedEvent extends BaseDomainEvent<string> {
  constructor(private readonly props: ICreateUserEvent) {
    super(props.id);
  }

  get eventName(): string {
    return UserEventType.CREATED;
  }

  get eventData(): Record<string, unknown> {
    return {
      id: this.props.id,
      name: this.props.name,
      email: this.props.email,
      password: this.props.password,
      organizationId: this.props.organizationId,
    };
  }
}
