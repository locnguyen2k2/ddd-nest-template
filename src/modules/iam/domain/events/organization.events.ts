import { BaseDomainEvent } from '@/shared/domain/events/base.domain-event';

export interface IOrganizationCreatedEvent {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrganizationUpdatedEvent {
  id: string;
  name: string;
  slug: string;
  description?: string;
  oldName: string;
  oldSlug: string;
  oldDescription?: string;
  updatedAt: Date;
}

export interface IOrganizationDeletedEvent {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isDeleted: boolean;
  updatedAt: Date;
}

export enum OrganizationEventType {
  CREATED = 'organization.created',
  UPDATED = 'organization.updated',
  DELETED = 'organization.deleted',
}

export class OrganizationCreatedEvent extends BaseDomainEvent<string> {
  constructor(public readonly event: IOrganizationCreatedEvent) {
    super(event.id);
  }

  get eventName(): string {
    return OrganizationEventType.CREATED;
  }

  get eventData(): Record<string, unknown> {
    return {
      id: this.event.id,
      name: this.event.name,
      slug: this.event.slug,
      description: this.event.description,
      createdAt: this.event.createdAt,
      updatedAt: this.event.updatedAt,
    };
  }
}

export class OrganizationUpdatedEvent extends BaseDomainEvent<string> {
  constructor(public readonly event: IOrganizationUpdatedEvent) {
    super(event.id);
  }

  get eventName(): string {
    return OrganizationEventType.UPDATED;
  }

  get eventData(): Record<string, unknown> {
    return {
      id: this.event.id,
      name: this.event.name,
      slug: this.event.slug,
      description: this.event.description,
      oldName: this.event.oldName,
      oldSlug: this.event.oldSlug,
      oldDescription: this.event.oldDescription,
      updatedAt: this.event.updatedAt,
    };
  }
}

export class OrganizationDeletedEvent extends BaseDomainEvent<string> {
  constructor(public readonly event: IOrganizationDeletedEvent) {
    super(event.id);
  }

  get eventName(): string {
    return OrganizationEventType.DELETED;
  }

  get eventData(): Record<string, unknown> {
    return {
      id: this.event.id,
      name: this.event.name,
      slug: this.event.slug,
      description: this.event.description,
      isDeleted: this.event.isDeleted,
      updatedAt: this.event.updatedAt,
    };
  }
}
