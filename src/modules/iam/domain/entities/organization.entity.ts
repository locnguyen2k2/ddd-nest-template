import { AggregateRoot, IEntityID } from '@/shared/domain/entities/base.entity';
import { Slug } from '../vo/slug.vo';
import {
  OrganizationCreatedEvent,
  OrganizationUpdatedEvent,
  OrganizationDeletedEvent,
} from '../events/organization.events';

export interface IOrganizationProps {
  name: string;
  slug: Slug;
  description?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface ICreateOrganizationProps extends IOrganizationProps {
  id: IEntityID<string>;
}

export interface IUpdateOrganizationProps {
  name?: string;
  slug?: Slug;
  description?: string;
}

export class Organization extends AggregateRoot<Organization, string> {
  private _name: string;
  private _slug: Slug;
  private _description?: string;
  private _created_at: Date;
  private _updated_at: Date;

  private constructor(id: IEntityID<string>, props: IOrganizationProps) {
    super(id);
    this._name = props.name;
    this._slug = props.slug;
    this._description = props.description;
    this._created_at = props.created_at ?? new Date();
    this._updated_at = props.updated_at ?? new Date();
  }

  static create(props: ICreateOrganizationProps): Organization {
    const now = new Date();
    const organization = new Organization(props.id, {
      name: props.name,
      slug: props.slug,
      description: props.description,
      created_at: now,
      updated_at: now,
    });
    organization.addDomainEvent(
      new OrganizationCreatedEvent({
        id: props.id.value,
        name: props.name,
        slug: props.slug.value,
        description: props.description,
        createdAt: now,
        updatedAt: now,
      }),
    );

    return organization;
  }

  update(props: IUpdateOrganizationProps) {
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

    this.addDomainEvent(
      new OrganizationUpdatedEvent({
        id: this.id.value,
        name: this._name,
        slug: this._slug.value,
        description: this._description,
        oldName,
        oldSlug: oldSlug.value,
        oldDescription,
        updatedAt: this._updated_at,
      }),
    );
  }

  delete() {
    const now = new Date();
    this.addDomainEvent(
      new OrganizationDeletedEvent({
        id: this.id.value,
        name: this._name,
        slug: this._slug.value,
        description: this._description,
        isDeleted: true,
        updatedAt: now,
      }),
    );
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
}
