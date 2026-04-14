import { AggregateRoot, IEntityID } from '@/shared/domain/entities/base.entity';
import { Slug } from '../vo/slug.vo';
import { Attributes } from '../vo/attributes.vo';
import {
  FeatureCreatedEvent,
  FeatureUpdatedEvent,
  FeatureDeletedEvent,
} from '../events/feature.events';
import { AccessControlStatus } from '@/common/enum';

export interface FeatureBaseProps {
  name: string;
  slug: Slug;
  description?: string;
  status?: AccessControlStatus;
  created_at?: Date;
  updated_at?: Date;
  project_id: string;
  created_by: string | undefined;
  updated_by: string | undefined;
  attributes?: Attributes;
}

export interface CreateFeatureProps extends FeatureBaseProps {
  id: IEntityID<string>;
}

export interface UpdateFeatureProps {
  name?: string;
  slug?: Slug;
  description?: string;
  status?: AccessControlStatus;
}

export class Feature extends AggregateRoot<Feature, string> {
  private _name: string;
  private _slug: Slug;
  private _description?: string;
  private _status: AccessControlStatus;
  private _created_at: Date;
  private _updated_at: Date;
  private _project_id: string;
  private _created_by: string | undefined;
  private _updated_by: string | undefined;
  private _attributes: Attributes;

  private constructor(
    props: CreateFeatureProps,
  ) {
    super(props.id);
    this._name = props.name;
    this._slug = props.slug;
    this._description = props.description;
    this._status = props.status ?? AccessControlStatus.ACTIVE;
    this._created_at = props.created_at ?? new Date();
    this._updated_at = props.updated_at ?? new Date();
    this._project_id = props.project_id;
    this._created_by = props.created_by;
    this._updated_by = props.updated_by;
    this._attributes = props.attributes ?? Attributes.create({});
  }

  static create(props: CreateFeatureProps) {
    const feature = new Feature(props);
    feature.addDomainEvent(
      new FeatureCreatedEvent({
        id: props.id.value,
        name: props.name,
        slug: props.slug.value,
        description: props.description,
        status: props.status ?? AccessControlStatus.ACTIVE,
        createdAt: props.created_at ?? new Date(),
        updatedAt: props.updated_at ?? new Date(),
      }),
    );
    return feature;
  }

  update(props: UpdateFeatureProps) {
    const oldName = this._name;
    const oldSlug = this._slug;
    const oldDescription = this._description;
    const oldStatus = this._status;

    if (props.name !== undefined) {
      this._name = props.name;
    }
    if (props.slug !== undefined) {
      this._slug = props.slug;
    }
    if (props.description !== undefined) {
      this._description = props.description;
    }
    if (props.status !== undefined) {
      this._status = props.status;
    }

    this._updated_at = new Date();

    this.addDomainEvent(
      new FeatureUpdatedEvent({
        id: this.id.value,
        name: this._name,
        slug: this._slug.value,
        description: this._description,
        status: this._status,
        oldName,
        oldSlug: oldSlug.value,
        oldDescription,
        oldStatus,
        updatedAt: this._updated_at,
      }),
    );
  }

  delete() {
    this.addDomainEvent(
      new FeatureDeletedEvent({
        id: this.id.value,
        name: this._name,
        slug: this._slug.value,
        description: this._description,
        status: AccessControlStatus.INACTIVE,
        updatedAt: new Date(),
      }),
    );
  }

  // Getters
  get name(): string {
    return this._name;
  }

  get slug(): Slug {
    return this._slug;
  }

  get description(): string | undefined {
    return this._description;
  }

  get status(): AccessControlStatus {
    return this._status;
  }

  get created_at(): Date {
    return this._created_at;
  }

  get updated_at(): Date {
    return this._updated_at;
  }

  get project_id(): string {
    return this._project_id;
  }

  get created_by(): string | undefined {
    return this._created_by;
  }

  get updated_by(): string | undefined {
    return this._updated_by;
  }

  get attributes(): Attributes {
    return this._attributes;
  }
}
