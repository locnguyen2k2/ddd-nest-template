import { BaseDomainEvent } from "@/shared/domain/events/base.domain-event";

export interface IRoleCreatedEvent {
    id: string;
    name: string;
    slug: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
    organizationId: string;
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
    organizationId: string;
}

export interface IRoleDeletedEvent {
    id: string;
    name: string;
    slug: string;
    description?: string;
    isDeleted: boolean;
    updatedAt: Date;
    organizationId: string;
}

export enum RoleEventType {
    CREATED = 'role.created',
    UPDATED = 'role.updated',
    DELETED = 'role.deleted',
    PERMISSION_ASSIGNED = 'role.permission_assigned',
    PERMISSION_ASSIGN_FAILED = 'role.permission_assign_failed',
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
            updatedAt: this.event.updatedAt,
            organizationId: this.event.organizationId,
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
            organizationId: this.event.organizationId,
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
            organizationId: this.event.organizationId,
        };
    }
}

export class PermissionAssignedEvent extends BaseDomainEvent<string> {
    constructor(public readonly data: {
        roleId: string;
        permissionId: string;
        assignedAt: Date;
    }) {
        super(data.roleId);
    }

    get eventName(): string {
        return RoleEventType.PERMISSION_ASSIGNED;
    }

    get eventData(): Record<string, unknown> {
        return {
            roleId: this.data.roleId,
            permissionId: this.data.permissionId,
            assignedAt: this.data.assignedAt,
        };
    }
}

export class PermissionAssignFailedEvent extends BaseDomainEvent<string> {
    constructor(public readonly data: {
        roleId: string;
        permissionId: string;
        featureId: string;
        reason: string;
        failedAt: Date;
    }) {
        super(data.roleId);
    }

    get eventName(): string {
        return RoleEventType.PERMISSION_ASSIGNED;
    }

    get eventData(): Record<string, unknown> {
        return {
            roleId: this.data.roleId,
            permissionId: this.data.permissionId,
            featureId: this.data.featureId,
            reason: this.data.reason,
            failedAt: this.data.failedAt,
        };
    }
}