import { AggregateRoot, IEntityID } from '@/shared/domain/entities/base.entity';

export interface IClearanceBaseInfo {
  id: IEntityID<string>;
  name: string;
  level: number;
  description?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export class ClearanceEntity extends AggregateRoot<ClearanceEntity, string> {
  private readonly _name: string;
  private readonly _level: number;
  private readonly _description: string | null;
  private readonly _created_at: Date | null;
  private readonly _updated_at: Date | null;

  private constructor(props: IClearanceBaseInfo) {
    super(props.id);
    this._name = props.name;
    this._level = props.level;
    this._description = props.description ?? null;
    this._created_at = props.created_at ?? null;
    this._updated_at = props.updated_at ?? null;
  }

  static create(props: IClearanceBaseInfo): ClearanceEntity {
    return new ClearanceEntity(props);
  }

  get name(): string {
    return this._name;
  }

  get level(): number {
    return this._level;
  }

  get description(): string | null {
    return this._description;
  }

  get created_at(): Date | null {
    return this._created_at;
  }

  get updated_at(): Date | null {
    return this._updated_at;
  }
}
