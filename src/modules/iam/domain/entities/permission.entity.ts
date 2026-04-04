import { AggregateRoot, IEntityID } from '@/shared/domain/entities/base.entity';
import { PermissionCreateEvent } from '../events/permission.event';
import { PermissionAction } from '@/common/enum';
import { IFeaturePermission } from './role.entity';

export interface IRoleFeatures extends Omit<IFeaturePermission, 'permission_id'> {
  role_id: string;
}

export interface IBasePermission {
  action: PermissionAction;
  name: string;
  description?: string;
  created_at?: Date;
  updated_at?: Date;
  created_by?: string | null;
  updated_by?: string | null;
  rfps?: IRoleFeatures[];
}

export interface ICreatePermission extends IBasePermission {
  id: IEntityID<string>;
}

export interface IUpdatePermission extends IBasePermission { }

export class PermissionEntity extends AggregateRoot<PermissionEntity, string> {
  private _name: string;
  private _action: PermissionAction;
  private _description: string;
  private _created_at: Date;
  private _updated_at: Date;
  private _created_by: string | null;
  private _updated_by: string | null;
  private _rfps: IRoleFeatures[];

  private constructor(
    id: IEntityID<string>,
    name: string,
    action: PermissionAction,
    description: string,
    created_at?: Date,
    updated_at?: Date,
    created_by?: string | null,
    updated_by?: string | null,
    rfps?: IRoleFeatures[],
  ) {
    super(id);
    this._name = name;
    this._action = action;
    this._description = description;
    this._created_at = created_at ?? new Date();
    this._updated_at = updated_at ?? new Date();
    this._created_by = created_by ?? null;
    this._updated_by = updated_by ?? null;
    this._rfps = rfps ?? [];
  }

  static create(props: ICreatePermission) {
    const now = new Date();
    const permission = new PermissionEntity(
      props.id,
      props.name,
      props.action,
      props.description || '',
      props.created_at ?? now,
      props.updated_at ?? now,
      props.created_by ?? null,
      props.updated_by ?? null,
      props.rfps ?? [],
    );
    permission.addDomainEvent(
      new PermissionCreateEvent(
        props.id.value,
        props.name,
        props.action,
        props.description,
      ),
    );
    return permission;
  }

  update(props: IUpdatePermission) {
    this._name = props.name;
    this._action = props.action;
    this._description = props.description || '';
    this._updated_at = new Date();
    this._updated_by = props.updated_by ?? null;
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

  get createdAt(): Date {
    return this._created_at;
  }

  get updatedAt(): Date {
    return this._updated_at;
  }

  get createdBy(): string | null {
    return this._created_by;
  }

  get updatedBy(): string | null {
    return this._updated_by;
  }

  get rfps(): IRoleFeatures[] {
    return this._rfps;
  }
}
