import { PolicyEntity } from '../entities/policy.entity';
import { UserEntity } from '../entities/user.entity';

export const POLICY_REPO = 'POLICY_REPOSITORY';

export interface IAccessRequest {
  subject: UserEntity;
  action: string;
  resource: any;
  organization_id?: string;
  environment?: Record<string, any>;
}

export interface IPolicyRepository {
  findMany(filter: { action?: string; resource?: string; organization_id?: string }): Promise<PolicyEntity[]>;
  create(policy: PolicyEntity): Promise<PolicyEntity>;
  update(id: string, policy: PolicyEntity): Promise<PolicyEntity>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<PolicyEntity | null>;
  decide(request: IAccessRequest): Promise<boolean>;
}
