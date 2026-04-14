import { Inject, Injectable } from '@nestjs/common';
import { IPolicyRepository, POLICY_REPO } from '@/modules/iam/domain/repositories/policy.repository';
import { GetPoliciesArgs } from '../../dtos/queries/policy-query.dto';
import { PolicyEntity } from '@/modules/iam/domain/entities/policy.entity';

@Injectable()
export class PolicyQueryHandler {
  constructor(
    @Inject(POLICY_REPO)
    private readonly policyRepo: IPolicyRepository,
  ) { }

  async handleGetPolicies(query: GetPoliciesArgs): Promise<PolicyEntity[]> {
    return await this.policyRepo.findMany({
      organization_id: query.organizationId,
    });
  }
}
