import { AggregateRoot, IEntityID } from '@/shared/domain/entities/base.entity';
import { Slug } from '../vo/slug.vo';
import {
  RoleCreatedEvent,
  RoleUpdatedEvent,
  RoleDeletedEvent,
  PermissionAssignedEvent,
} from '../events/role.events';
import { PermissionEntity } from './permission.entity';
import { AccessControlStatus } from '@/common/enum';

export interface IFeaturePermission {
  feature_id: string;
  permission_id: string;
  created_at: Date | undefined;
  updated_at: Date | undefined;
  created_by: string | undefined;
  updated_by: string | undefined;
  status: AccessControlStatus;
}

export interface IRoleProps {
  name: string;
  slug: Slug;
  description?: string;
  created_at?: Date;
  updated_at?: Date;
  organization_id: string;
  permissions?: PermissionEntity[];
  parent_role_id?: string;
  created_by?: string;
  updated_by?: string;
  status?: AccessControlStatus;
  feature_permissions?: IFeaturePermission[];
}

export interface CreateRoleProps extends IRoleProps {
  id: IEntityID<string>;
}

export interface UpdateRoleProps {
  name?: string;
  slug?: Slug;
  description?: string;
  parent_role_id?: string;
}

export class RoleEntity extends AggregateRoot<RoleEntity, string> {
  private _name: string;
  private _slug: Slug;
  private _description?: string;
  private _created_at: Date;
  private _updated_at: Date;
  private _organization_id: string;
  private _permissions: PermissionEntity[];
  private _parent_role_id?: string;
  private _created_by?: string;
  private _updated_by?: string;
  private _status: AccessControlStatus;
  private _feature_permissions: IFeaturePermission[];

  private constructor(
    readonly id: IEntityID<string>,
    props: IRoleProps,
  ) {
    super(id);
    this._name = props.name;
    this._slug = props.slug;
    this._description = props.description;
    this._created_at = props.created_at ?? new Date();
    this._updated_at = props.updated_at ?? new Date();
    this._organization_id = props.organization_id;
    this._permissions = props.permissions ?? [];
    this._parent_role_id = props.parent_role_id;
    this._created_by = props.created_by;
    this._updated_by = props.updated_by;
    this._status = props.status ?? AccessControlStatus.ACTIVE;
    this._feature_permissions = props.feature_permissions ?? [];
  }

  hasPermission(roleIds: string[], feature: string, action: string) {

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
      parent_role_id: props.parent_role_id,
      created_by: props.created_by,
      updated_by: props.updated_by,
      status: props.status ?? AccessControlStatus.ACTIVE,
      feature_permissions: props.feature_permissions ?? [],
    });
    role.addDomainEvent(
      new RoleCreatedEvent({
        id: props.id.value,
        name: props.name,
        slug: props.slug.value,
        description: props.description,
        createdAt: props.created_at || now,
        updatedAt: props.updated_at || now,
        organizationId: props.organization_id,
      }),
    );
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
    if (props.parent_role_id !== undefined) {
      this._parent_role_id = props.parent_role_id;
    }

    this._updated_at = new Date();

    this.addDomainEvent(
      new RoleUpdatedEvent({
        id: this.id.value,
        name: this._name,
        slug: this._slug.value,
        description: this._description,
        oldName,
        oldSlug: oldSlug.value,
        oldDescription,
        updatedAt: this._updated_at,
        organizationId: this._organization_id,
        parentRoleId: this._parent_role_id,
        createdBy: this._created_by,
        updatedBy: this._updated_by,
        status: this._status,
      }),
    );
  }

  delete() {
    const now = new Date();
    this.addDomainEvent(
      new RoleDeletedEvent({
        id: this.id.value,
        name: this._name,
        slug: this._slug.value,
        description: this._description,
        isDeleted: true,
        updatedAt: now,
        organizationId: this._organization_id,
      }),
    );
  }

  assignPermission(permission_id: string) {
    if (!permission_id) {
      throw new Error('Permission ID is required');
    }

    this.addDomainEvent(
      new PermissionAssignedEvent({
        roleId: this.id.value,
        permissionId: permission_id,
        assignedAt: new Date(),
      }),
    );
  }

  get name(): string {
    return this._name;
  }

  get slug(): Slug {
    return this._slug;
  }

  get permissions(): string[] {
    return this._permissions.map(p => p.action);
  }

  get description(): string | undefined {
    return this._description;
  }

  get createdAt(): Date {
    return this._created_at;
  }

  get updatedAt(): Date {
    return this._updated_at;
  }

  get organizationId(): string {
    return this._organization_id;
  }

  get parentRoleId(): string | undefined {
    return this._parent_role_id;
  }

  get createdBy(): string | undefined {
    return this._created_by;
  }

  get updatedBy(): string | undefined {
    return this._updated_by;
  }

  get status(): string {
    return this._status;
  }

  get RFPs(): IFeaturePermission[] {
    return this._feature_permissions;
  }

}
