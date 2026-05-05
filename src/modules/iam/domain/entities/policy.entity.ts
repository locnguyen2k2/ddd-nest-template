import { AggregateRoot, IEntityID } from '@/shared/domain/entities/base.entity';

export enum Effect {
  ALLOW = 'ALLOW',
  DENY = 'DENY',
}

export interface IPolicyProps {
  name: string;
  description?: string;
  effect: Effect;
  action: string;
  resource: string;
  condition: any;
  organization_id?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface ICreatePolicyProps extends IPolicyProps {
  id: IEntityID<string>;
}

export class PolicyEntity extends AggregateRoot<PolicyEntity, string> {
  private _name: string;
  private _description?: string;
  private _effect: Effect;
  private _action: string;
  private _resource: string;
  private _condition: any;
  private _organization_id?: string;
  private _created_at: Date;
  private _updated_at: Date;

  private constructor(id: IEntityID<string>, props: IPolicyProps) {
    super(id);
    this._name = props.name;
    this._description = props.description;
    this._effect = props.effect;
    this._action = props.action;
    this._resource = props.resource;
    this._condition = props.condition;
    this._organization_id = props.organization_id;
    this._created_at = props.created_at ?? new Date();
    this._updated_at = props.updated_at ?? new Date();
  }

  static create(props: ICreatePolicyProps): PolicyEntity {
    return new PolicyEntity(props.id, props);
  }

  get name(): string {
    return this._name;
  }

  get description(): string | undefined {
    return this._description;
  }

  get effect(): Effect {
    return this._effect;
  }

  get action(): string {
    return this._action;
  }

  get resource(): string {
    return this._resource;
  }

  get condition(): any {
    return this._condition;
  }

  get organizationId(): string | undefined {
    return this._organization_id;
  }

  get createdAt(): Date {
    return this._created_at;
  }

  get updatedAt(): Date {
    return this._updated_at;
  }

  update(props: Partial<Omit<IPolicyProps, 'organization_id' | 'created_at' | 'updated_at'>>): void {
    if (props.name !== undefined) this._name = props.name;
    if (props.description !== undefined) this._description = props.description;
    if (props.effect !== undefined) this._effect = props.effect;
    if (props.action !== undefined) this._action = props.action;
    if (props.resource !== undefined) this._resource = props.resource;
    if (props.condition !== undefined) this._condition = props.condition;
    this._updated_at = new Date();
  }
}
