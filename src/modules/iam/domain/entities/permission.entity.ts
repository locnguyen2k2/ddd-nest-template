import { AggregateRoot, IEntityID } from "@/shared/domain/entities/base.entity";
import { PermissionCreateEvent } from "../events/permission.event";

export interface IBasePermission {
    slug: string;
    name: string;
    description?: string;
    created_at?: Date;
    updated_at?: Date;
}

export interface ICreatePermission extends IBasePermission {
    id: IEntityID<string>;
}

export interface IUpdatePermission extends IBasePermission { }

export class PermissionEntity extends AggregateRoot<PermissionEntity, string> {
    private readonly _name: string;
    private readonly _slug: string;
    private readonly _description: string;
    private _created_at: Date;
    private _updated_at: Date;

    private constructor(id: IEntityID<string>, name: string, slug: string, description: string, created_at?: Date, updated_at?: Date) {
        super(id);
        this._name = name;
        this._slug = slug;
        this._description = description;
        this._created_at = created_at ?? new Date();
        this._updated_at = updated_at ?? new Date();
    }

    static create(props: ICreatePermission) {
        const now = new Date();
        const permission = new PermissionEntity(props.id, props.name, props.slug, props.description || '', props.created_at ?? now, props.updated_at ?? now);
        permission.addDomainEvent(new PermissionCreateEvent(props.id.value, props.name, props.slug, props.description));
        return permission;
    }

    get name() {
        return this._name;
    }

    get slug() {
        return this._slug;
    }

    get description() {
        return this._description;
    }

    getCreatedAt(): Date {
        return this._created_at;
    }

    getUpdatedAt(): Date {
        return this._updated_at;
    }
}
