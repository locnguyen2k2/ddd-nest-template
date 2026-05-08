import { AggregateRoot, IEntityID } from '@/shared/domain/entities/base.entity';
import { UserEntity } from './user.entity';

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

export interface IRuleEvaluator {
  evaluate(condition: any, context: any): boolean;
}

export interface IEvaluationContext {
  subject: {
    id: string;
    email: string;
    username: string;
    attributes: any;
    context_attributes: any;
    department_id?: string;
    members?: any[];
  };
  resource: {
    type: string;
    attributes: any;
    [key: string]: any;
  };
  organization?: {
    id: string;
    attributes: any;
    [key: string]: any;
  };
  env: {
    time: string;
    ip?: string;
    [key: string]: any;
  };
  action: string;
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

  evaluate(context: IEvaluationContext, evaluator: IRuleEvaluator): boolean {
    return evaluator.evaluate(this._condition, context);
  }

  static buildContext(
    subject: UserEntity,
    resource: any,
    action: string,
    organization_id?: string,
    environment?: Record<string, any>,
    organization?: any,
  ): IEvaluationContext {
    let context_attributes: any = {};
    let department_id: string | undefined = undefined;

    if (organization_id) {
      const currentOrg = subject.organizations.find(
        (org) => org.organization_id === organization_id,
      );
      if (currentOrg) {
        context_attributes = currentOrg.context_attributes?.value || {};
        department_id = currentOrg.department_id;
      }
    }

    const resourceAttributes = resource?.attributes?.value !== undefined
      ? resource.attributes.value
      : (resource?.attributes || {});

    const resourceType = this.getResourceType(resource);

    return {
      subject: {
        id: subject.id.value,
        email: subject.email,
        username: subject.username,
        attributes: subject.attributes.value,
        context_attributes,
        members: subject.members,
        department_id,
      },
      resource: {
        type: resourceType,
        attributes: resourceAttributes,
        ...(typeof resource === 'object' ? resource : {}),
      },
      organization: organization ? {
        id: organization.id?.value || organization.id,
        attributes: organization.attributes?.value || organization.attributes || {},
        ...(typeof organization === 'object' ? organization : {}),
      } : undefined,
      env: {
        time: new Date().toISOString(),
        ...(environment || {}),
      },
      action,
    };
  }

  public static getResourceType(resource: any): string {
    if (typeof resource === 'string') return resource;
    return resource?.type || 'Unknown';
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
