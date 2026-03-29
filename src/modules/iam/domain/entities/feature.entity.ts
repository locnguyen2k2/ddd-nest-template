import { AggregateRoot, IEntityID } from '@/shared/domain/entities/base.entity';
import { Slug } from '../vo/slug.vo';
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

// Feature Aggregate Root
export class Feature extends AggregateRoot<Feature, string> {
  private constructor(
    public readonly id: IEntityID<string>,
    private _name: string,
    private _slug: Slug,
    private _description?: string,
    private _status: AccessControlStatus = AccessControlStatus.ACTIVE,
    private _created_at: Date = new Date(),
    private _updated_at: Date = new Date(),
  ) {
    super(id);
  }

  static create(props: CreateFeatureProps) {
    const feature = new Feature(
      props.id,
      props.name,
      props.slug,
      props.description,
      props.status ?? AccessControlStatus.ACTIVE,
      props.created_at ?? new Date(),
      props.updated_at ?? new Date(),
    );
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
  name(): string {
    return this._name;
  }

  slug(): Slug {
    return this._slug;
  }

  description(): string | undefined {
    return this._description;
  }

  status(): AccessControlStatus {
    return this._status;
  }

  createdAt(): Date {
    return this._created_at;
  }

  updatedAt(): Date {
    return this._updated_at;
  }
}
