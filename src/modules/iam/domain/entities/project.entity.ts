import { AggregateRoot, IEntityID } from '@/shared/domain/entities/base.entity';
import { uuidv7 } from 'uuidv7';

export interface IProjectProps {
  name: string;
  slug: string;
  description?: string;
  organization_id: string;
  created_by?: string;
  created_at: Date | string | null;
  updated_at: Date | string | null;
  updated_by?: string;
  id: IEntityID<string>;
}

export interface ICreateProject extends IProjectProps { }

export interface IUpdateProject extends Pick<IProjectProps, 'updated_by'> {
  name?: string;
  slug?: string;
  description?: string;
}

export class ProjectEntity extends AggregateRoot<ProjectEntity, string> {
  private _name: string;
  private _slug: string;
  private _description?: string;
  private _organization_id: string;
  private _created_at: Date | string | null;
  private _updated_at: Date | string | null;
  private _created_by?: string;
  private _updated_by?: string;

  private constructor(id: IEntityID<string>, props: IProjectProps) {
    super(id);

    this._name = props.name;
    this._slug = props.slug;
    this._description = props.description;
    this._organization_id = props.organization_id;
    this._created_at = props.created_at;
    this._updated_at = props.updated_at;
    this._created_by = props.created_by;
    this._updated_by = props.updated_by;
  }

  static create(props: ICreateProject): ProjectEntity {
    const now = new Date();
    const project = new ProjectEntity(props.id, {
      id: props.id,
      name: props.name,
      slug: props.slug,
      description: props.description,
      organization_id: props.organization_id,
      created_by: props.created_by,
      created_at: now,
      updated_at: now,
      updated_by: props.created_by,
    });
    return project;
  }

  update(props: IUpdateProject) {
    if (props.name !== undefined) {
      this._name = props.name;
    }
    if (props.description !== undefined) {
      this._description = props.description;
    }
    if (props.slug !== undefined) {
      this._slug = props.slug;
    }

    return;
  }

  get name() {
    return this._name;
  }

  get slug() {
    return this._slug;
  }

  get organizationID(): string {
    return this._organization_id;
  }

  get description(): string | null {
    return this._description || null;
  }
  get createdAt(): Date {
    return this?._created_at ? new Date(this._created_at) : new Date();
  }
  get updatedAt(): Date {
    return this?._updated_at ? new Date(this._updated_at) : new Date();
  }
  get createdBy(): string | null {
    return this._created_by || null;
  }
  get updatedBy(): string | null {
    return this._updated_by || null;
  }
}
