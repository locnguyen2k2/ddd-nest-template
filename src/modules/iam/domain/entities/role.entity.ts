import { AggregateRoot, IEntityID } from "@/shared/domain/entities/base.entity";
import { Slug } from "../vo/slug.vo";
import { RoleCreatedEvent, RoleUpdatedEvent, RoleDeletedEvent, PermissionAssignedEvent } from "../events/role.events";

export interface IRoleProps {
    name: string;
    slug: Slug;
    description?: string;
    created_at?: Date;
    updated_at?: Date;
    organization_id: string;
}

export interface CreateRoleProps extends IRoleProps {
    id: IEntityID<string>;
}

export interface UpdateRoleProps {
    name?: string;
    slug?: Slug;
    description?: string;
}

export class RoleEntity extends AggregateRoot<RoleEntity, string> {
    private _name: string;
    private _slug: Slug;
    private _description?: string;
    private _created_at: Date;
    private _updated_at: Date;
    private _organization_id: string;

    private constructor(readonly id: IEntityID<string>, props: IRoleProps) {
        super(id);
        this._name = props.name;
        this._slug = props.slug;
        this._description = props.description;
        this._created_at = props.created_at ?? new Date();
        this._updated_at = props.updated_at ?? new Date();
        this._organization_id = props.organization_id;
    }

    static create(props: CreateRoleProps): RoleEntity {
        const now = new Date();
        const role = new RoleEntity(props.id, {
            name: props.name,
            slug: props.slug,
            description: props.description,
            created_at: now,
            updated_at: now,
            organization_id: props.organization_id,
        });
        role.addDomainEvent(new RoleCreatedEvent({
            id: props.id.value,
            name: props.name,
            slug: props.slug.value,
            description: props.description,
            createdAt: props.created_at || now,
            updatedAt: props.updated_at || now,
            organizationId: props.organization_id,
        }));
        return role;
    }

    update(props: UpdateRoleProps) {
        const oldName = this._name;
        const oldSlug = this._slug;
        const oldDescription = this._description;

        if (props.name !== undefined) {
            this._name = props.name;
        }
        if (props.slug !== undefined) {
            this._slug = props.slug;
        }
        if (props.description !== undefined) {
            this._description = props.description;
        }

        this._updated_at = new Date();

        this.addDomainEvent(new RoleUpdatedEvent({
            id: this.id.value,
            name: this._name,
            slug: this._slug.value,
            description: this._description,
            oldName,
            oldSlug: oldSlug.value,
            oldDescription,
            updatedAt: this._updated_at,
            organizationId: this._organization_id,
        }));
    }

    delete() {
        const now = new Date();
        this.addDomainEvent(new RoleDeletedEvent({
            id: this.id.value,
            name: this._name,
            slug: this._slug.value,
            description: this._description,
            isDeleted: true,
            updatedAt: now,
            organizationId: this._organization_id,
        }));
    }

    assignPermission(permission_id: string) {
        if (!permission_id) {
            throw new Error('Permission ID is required');
        }

        this.addDomainEvent(new PermissionAssignedEvent({
            roleId: this.id.value,
            permissionId: permission_id,
            assignedAt: new Date(),
        }));
    }

    name(): string {
        return this._name;
    }

    slug(): Slug {
        return this._slug;
    }

    description(): string | undefined {
        return this._description;
    }

    createdAt(): Date {
        return this._created_at;
    }

    updatedAt(): Date {
        return this._updated_at;
    }

    organizationId(): string {
        return this._organization_id;
    }
}
