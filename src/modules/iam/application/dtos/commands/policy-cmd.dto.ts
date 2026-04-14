import { Effect } from '../../../domain/entities/policy.entity';

export interface CreatePolicyArgs {
  name: string;
  description?: string;
  effect: Effect;
  action: string;
  resource: string;
  condition: any;
  organizationId: string;
}

export interface UpdatePolicyArgs {
  id: string;
  name?: string;
  description?: string;
  effect?: Effect;
  action?: string;
  resource?: string;
  condition?: any;
  organizationId: string;
}

export interface DeletePolicyArgs {
  id: string;
  organizationId: string;
}
