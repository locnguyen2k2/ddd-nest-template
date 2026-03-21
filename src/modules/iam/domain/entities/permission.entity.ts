import { AggregateRoot, IEntityID } from "@/shared/domain/entities/base.entity";
import { PermissionCreateEvent } from "../events/permission.event";

export interface IBasePermission {
    slug: string;
    name: string;
    description?: string;
}

export interface ICreatePermission extends IBasePermission {
    id: IEntityID<string>;
}

export interface IUpdatePermission extends IBasePermission { }

export class PermissionEntity extends AggregateRoot<PermissionEntity, string> {
    private readonly _name: string;
    private readonly _slug: string;
    private readonly _description: string;

    private constructor(id: IEntityID<string>, name: string, slug: string, description: string) {
        super(id);
        this._name = name;
        this._slug = slug;
        this._description = description;
    }

    static create(props: ICreatePermission) {
        const permission = new PermissionEntity(props.id, props.name, props.slug, props.description || '');
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
}
