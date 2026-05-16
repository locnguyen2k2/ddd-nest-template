import { AggregateRoot, IEntityID } from '@/shared/domain/entities/base.entity';
import { AccessControlStatus } from '@/common/enum';
import { Attributes } from '../vo/attributes.vo';

export interface DepartmentBaseProps {
  name: string;
  slug: string;
  organization_id: string;
  created_at?: Date;
  updated_at?: Date;
  attributes: Attributes;
}

export interface CreateDepartmentProps extends DepartmentBaseProps {
  id: IEntityID<string>;
}

export interface UpdateDepartmentProps {
  name?: string;
  slug?: string;
}

export class Department extends AggregateRoot<Department, string> {
  private _status?: AccessControlStatus;
  private _created_at?: Date;
  private _updated_at?: Date;
  private _name: string;
  private _slug: string;
  private _organization_id: string;
  private _attributes: Attributes;

  private constructor(props: CreateDepartmentProps) {
    super(props.id);
    this._created_at = props.created_at ?? new Date();
    this._updated_at = props.updated_at ?? new Date();
    this._name = props.name;
    this._slug = props.slug;
    this._organization_id = props.organization_id;
    this._attributes = props.attributes;
  }

  static create(props: CreateDepartmentProps) {
    const department = new Department(props);

    return department;
  }

  update(props: UpdateDepartmentProps) {
    this._name = props.name || this._name;
    this._slug = props.slug || this._slug;
    this._updated_at = new Date();
  }

  delete() {}

  get created_at(): Date {
    return this._created_at!;
  }

  get updated_at(): Date {
    return this._updated_at!;
  }

  get name(): string {
    return this._name!;
  }

  get slug(): string {
    return this._slug!;
  }

  get org_id(): string {
    return this._organization_id!;
  }

  get attributes(): Attributes {
    return this._attributes;
  }
}
