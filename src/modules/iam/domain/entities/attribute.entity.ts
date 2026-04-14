import { AggregateRoot, IEntityID } from '@/shared/domain/entities/base.entity';

export interface IAttributeBaseInfo {
  id: IEntityID<string>;
  entity_type: string;
  key: string;
  data_type: string;
  description?: string | null;
}

export class AttributeEntity extends AggregateRoot<AttributeEntity, string> {
  private readonly _entity_type: string;
  private readonly _key: string;
  private readonly _data_type: string;
  private readonly _description: string | null;

  private constructor(props: IAttributeBaseInfo) {
    super(props.id);
    this._entity_type = props.entity_type;
    this._key = props.key;
    this._data_type = props.data_type;
    this._description = props.description ?? null;
  }

  static create(props: IAttributeBaseInfo): AttributeEntity {
    return new AttributeEntity(props);
  }

  get entity_type(): string {
    return this._entity_type;
  }

  get key(): string {
    return this._key;
  }

  get data_type(): string {
    return this._data_type;
  }

  get description(): string | null {
    return this._description;
  }
}
