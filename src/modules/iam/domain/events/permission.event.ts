
import { BaseDomainEvent } from "@/shared/domain/events/base.domain-event";

export enum PermissionEventType {
    CREATED = 'permission.created',
    UPDATED = 'permission.updated',
    DELETED = 'permission.deleted',
}

export class PermissionCreateEvent extends BaseDomainEvent<string> {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly slug: string,
        public readonly description?: string,
    ) {
        super(id);
    }

    get eventName(): string {
        return PermissionEventType.CREATED;
    }

    get eventData(): Record<string, unknown> {
        return {
            id: this.id,
            name: this.name,
            slug: this.slug,
            description: this.description,
        };
    }
}

export class PermissionUpdatedEvent extends BaseDomainEvent<string> {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly slug: string,
        public readonly description?: string,
    ) {
        super(id);
    }

    get eventName(): string {
        return PermissionEventType.UPDATED;
    }

    get eventData(): Record<string, unknown> {
        return {
            id: this.id,
            name: this.name,
            slug: this.slug,
            description: this.description,
        };
    }
}

export class PermissionDeletedEvent extends BaseDomainEvent<string> {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly slug: string,
        public readonly description?: string,
    ) {
        super(id);
    }

    get eventName(): string {
        return PermissionEventType.DELETED;
    }

    get eventData(): Record<string, unknown> {
        return {
            id: this.id,
            name: this.name,
            slug: this.slug,
            description: this.description,
        };
    }
}