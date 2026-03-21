import { BaseDomainEvent } from "@/shared/domain/events/base.domain-event";

export interface IRoleCreatedEvent {
    id: string;
    name: string;
    slug: string;
    description?: string;
    createdAt: Date;
}

export interface IRoleUpdatedEvent {
    id: string;
    name: string;
    slug: string;
    description?: string;
    oldName: string;
    oldSlug: string;
    oldDescription?: string;
    updatedAt: Date;
}

export interface IRoleDeletedEvent {
    id: string;
    name: string;
    slug: string;
    description?: string;
    isDeleted: boolean;
    updatedAt: Date;
}

export enum RoleEventType {
    CREATED = 'role.created',
    UPDATED = 'role.updated',
    DELETED = 'role.deleted',
}

export class RoleCreatedEvent extends BaseDomainEvent<string> {
    constructor(public readonly event: IRoleCreatedEvent) {
        super(event.id);
    }

    get eventName(): string {
        return RoleEventType.CREATED;
    }

    get eventData(): Record<string, unknown> {
        return {
            id: this.event.id,
            name: this.event.name,
            slug: this.event.slug,
            description: this.event.description,
            createdAt: this.event.createdAt,
        };
    }
}

export class RoleUpdatedEvent extends BaseDomainEvent<string> {
    constructor(public readonly event: IRoleUpdatedEvent) {
        super(event.id);
    }

    get eventName(): string {
        return RoleEventType.UPDATED;
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

export class RoleDeletedEvent extends BaseDomainEvent<string> {
    constructor(public readonly event: IRoleDeletedEvent) {
        super(event.id);
    }

    get eventName(): string {
        return RoleEventType.DELETED;
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
