import { BaseDomainEvent } from '@/shared/domain/events/base.domain-event';

export enum UserEventType {
  CREATED = 'user.created',
  UPDATED = 'user.updated',
  DELETED = 'user.deleted',
}

export interface ICreateUserEvent {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
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
      first_name: this.props.first_name,
      last_name: this.props.last_name,
      username: this.props.username,
      email: this.props.email,
      organizationId: this.props.organizationId,
    };
  }
}
