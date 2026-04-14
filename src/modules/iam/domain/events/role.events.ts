import { BaseDomainEvent } from '@/shared/domain/events/base.domain-event';
import { AccessControlStatus } from '@/common/enum';

interface RoleBaseData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status?: AccessControlStatus;
  organization_id: string;
}

export interface RoleCreatedEventData extends RoleBaseData {
  createdAt: Date;
  updatedAt: Date;
}

export enum RoleEventName {
  ROLE_CREATED = 'role.created',
  ROLE_DELETED = 'role.deleted',
  ROLE_UPDATED = 'role.updated',
}

export class RoleCreatedEvent extends BaseDomainEvent<string> {
  constructor(public readonly data: RoleCreatedEventData) {
    super(data.id);
  }

  get eventName(): string {
    return RoleEventName.ROLE_CREATED;
  }

  get eventData(): Record<string, unknown> {
    return {
      id: this.data.id,
      name: this.data.name,
      slug: this.data.slug,
      description: this.data.description,
      status: this.data.status,
      organization_id: this.data.organization_id,
      createdAt: this.data.createdAt,
      updatedAt: this.data.updatedAt,
    };
  }
}

export interface RoleUpdatedEventData extends Omit<
  RoleCreatedEventData,
  'createdAt'
> {
  oldName: string;
  oldSlug: string;
  oldDescription?: string;
  oldStatus?: AccessControlStatus;
  updatedAt: Date;
}

export class RoleUpdatedEvent extends BaseDomainEvent<string> {
  constructor(public readonly data: RoleUpdatedEventData) {
    super(data.id);
  }

  get eventName(): string {
    return RoleEventName.ROLE_UPDATED;
  }

  get eventData(): Record<string, unknown> {
    return {
      id: this.data.id,
      name: this.data.name,
      slug: this.data.slug,
      description: this.data.description,
      status: this.data.status,
      organization_id: this.data.organization_id,
      oldName: this.data.oldName,
      oldSlug: this.data.oldSlug,
      oldDescription: this.data.oldDescription,
      oldStatus: this.data.oldStatus,
      updatedAt: this.data.updatedAt,
    };
  }
}

export interface RoleDeletedEventData extends RoleBaseData {
  updatedAt: Date;
  status: AccessControlStatus;
}

export class RoleDeletedEvent extends BaseDomainEvent<string> {
  constructor(public readonly data: RoleDeletedEventData) {
    super(data.id);
  }

  get eventName(): string {
    return RoleEventName.ROLE_DELETED;
  }

  get eventData(): Record<string, unknown> {
    return {
      id: this.data.id,
      name: this.data.name,
      slug: this.data.slug,
      description: this.data.description,
      status: this.data.status,
      organization_id: this.data.organization_id,
      updatedAt: this.data.updatedAt,
    };
  }
}
