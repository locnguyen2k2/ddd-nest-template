import { BaseDomainEvent } from '@/shared/domain/events/base.domain-event';
import { AccessControlStatus } from '@prisma/client';

interface FeatureBaseData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status?: AccessControlStatus;
}

// Feature Created Event
export interface FeatureCreatedEventData extends FeatureBaseData {
  createdAt: Date;
  updatedAt: Date;
}

export enum FeatureEventName {
  FEATURE_CREATED = 'feature.created',
  FEATURE_DELETED = 'feature.deleted',
  FEATURE_UPDATED = 'feature.updated',
}

export class FeatureCreatedEvent extends BaseDomainEvent<string> {
  constructor(public readonly data: FeatureCreatedEventData) {
    super(data.id);
  }

  get eventName(): string {
    return FeatureEventName.FEATURE_CREATED;
  }

  get eventData(): Record<string, unknown> {
    return {
      id: this.data.id,
      name: this.data.name,
      slug: this.data.slug,
      description: this.data.description,
      status: this.data.status,
      createdAt: this.data.createdAt,
      updatedAt: this.data.updatedAt,
    };
  }
}

// Feature Updated Event
export interface FeatureUpdatedEventData extends Omit<
  FeatureCreatedEventData,
  'createdAt'
> {
  oldName: string;
  oldSlug: string;
  oldDescription?: string;
  oldStatus?: AccessControlStatus;
  updatedAt: Date;
}

export class FeatureUpdatedEvent extends BaseDomainEvent<string> {
  constructor(public readonly data: FeatureUpdatedEventData) {
    super(data.id);
  }

  get eventName(): string {
    return FeatureEventName.FEATURE_UPDATED;
  }

  get eventData(): Record<string, unknown> {
    return {
      id: this.data.id,
      name: this.data.name,
      slug: this.data.slug,
      description: this.data.description,
      status: this.data.status,
      oldName: this.data.oldName,
      oldSlug: this.data.oldSlug,
      oldDescription: this.data.oldDescription,
      oldStatus: this.data.oldStatus,
      updatedAt: this.data.updatedAt,
    };
  }
}

// Feature Deleted Event
export interface FeatureDeletedEventData extends FeatureBaseData {
  updatedAt: Date;
  status: AccessControlStatus;
}

export class FeatureDeletedEvent extends BaseDomainEvent<string> {
  constructor(public readonly data: FeatureDeletedEventData) {
    super(data.id);
  }

  get eventName(): string {
    return FeatureEventName.FEATURE_DELETED;
  }

  get eventData(): Record<string, unknown> {
    return {
      id: this.data.id,
      name: this.data.name,
      slug: this.data.slug,
      description: this.data.description,
      status: this.data.status,
      updatedAt: this.data.updatedAt,
    };
  }
}
