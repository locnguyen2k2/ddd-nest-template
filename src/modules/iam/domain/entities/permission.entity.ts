import { AggregateRoot, IEntityID } from "@/shared/domain/entities/base.entity";
import { PermissionCreateEvent } from "../events/permission.event";
import { PermissionAction } from "@/common/enum";

export interface IBasePermission {
    action: PermissionAction;
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
    private readonly _action: PermissionAction;
    private readonly _description: string;
    private readonly _created_at: Date;
    private readonly _updated_at: Date;

    private constructor(id: IEntityID<string>, name: string, action: PermissionAction, description: string, created_at?: Date, updated_at?: Date) {
        super(id);
        this._name = name;
        this._action = action;
        this._description = description;
        this._created_at = created_at ?? new Date();
        this._updated_at = updated_at ?? new Date();
    }

    static create(props: ICreatePermission) {
        const now = new Date();
        const permission = new PermissionEntity(props.id, props.name, props.action, props.description || '', props.created_at ?? now, props.updated_at ?? now);
        permission.addDomainEvent(new PermissionCreateEvent(props.id.value, props.name, props.action, props.description));
        return permission;
    }

    update(props: IUpdatePermission) {
    }

    get name() {
        return this._name;
    }

    get action() {
        return this._action;
    }

    get description() {
        return this._description;
    }

    createdAt(): Date {
        return this._created_at;
    }

    updatedAt(): Date {
        return this._updated_at;
    }
}
