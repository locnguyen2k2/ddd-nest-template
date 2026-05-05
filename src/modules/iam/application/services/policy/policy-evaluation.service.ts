import { Inject, Injectable } from '@nestjs/common';
import { JsonLogicEngineAdapter as JsonLogicEngine } from '@/shared/infrastructure/adapters/json-logic.adapter';
import { Effect } from '@/modules/iam/domain/entities/policy.entity';
import { POLICY_REPO, IPolicyRepository } from '@/modules/iam/domain/repositories/policy.repository';
import { PolicyEvaluateDto } from '@/modules/iam/presentation/dtos/req/policy.dto';
import { EvaluationResponseDto, EvaluatedPolicyDto, PolicyResponseDto } from '@/modules/iam/presentation/dtos/res/policy-response.dto';
import { USER_REPO, IUserRepository } from '@/modules/iam/domain/repositories/user.repository';
import { IProjectRepository, PROJECT_REPO } from '@/modules/iam/domain/repositories/project.repository';
import { IOrganizationRepository, ORGANIZATION_REPO } from '@/modules/iam/domain/repositories/organization.repository';
import { FEATURE_REPO, IFeatureRepository } from '@/modules/iam/domain/repositories/feature.repository';
import { PolicyQueryService } from './policy-query.service';
import { FeatureMapper } from '@/modules/iam/infrastructure/persistence/mappers/feature.mapper';
import { OrganizationMapper } from '@/modules/iam/infrastructure/persistence/mappers/organization.mapper';
import { ProjectMapper } from '@/modules/iam/infrastructure/persistence/mappers/project.mapper';
import { UserMapper } from '@/modules/iam/infrastructure/persistence/mappers/user.mapper';

export enum EvaluateStatus {
  APPLIED = 'APPLIED',
  NOT_MATCHED = 'NOT_MATCHED',
  MATCHED = 'MATCHED',
}

@Injectable()
export class PolicyEvaluationService {
  constructor(
    private readonly pdp: PolicyQueryService,
    @Inject(POLICY_REPO)
    private readonly policyRepo: IPolicyRepository,
    @Inject(USER_REPO)
    private readonly userRepo: IUserRepository,
    private readonly ruleEvaluator: JsonLogicEngine,
    @Inject(PROJECT_REPO) private readonly projectRepo: IProjectRepository,
    @Inject(ORGANIZATION_REPO) private readonly organizationRepo: IOrganizationRepository,
    @Inject(FEATURE_REPO) private readonly featureRepo: IFeatureRepository,
  ) { }

  async evaluate(dto: PolicyEvaluateDto): Promise<EvaluationResponseDto> {
    const { action, resource, subject, context, organization_id } = dto;
    const user = await this.userRepo.findByIdWithOrganizations(resource.user_id);
    let decision: Effect = Effect.ALLOW;
    let evaluationContext: any = {};
    const evaluatedPolicies: EvaluatedPolicyDto[] = [];
    if (user) {
      const policies = await this.policyRepo.findMany({
        action,
        resource: resource.type,
        organization_id,
      });

      const resourceData = await this.fetchResource(resource.type, resource.id);


      evaluationContext = {
        subject: UserMapper.toPrisma(user),
        resource: resourceData,
        env: {
          ...(context || {}),
          time: new Date().toISOString(),
        },
        action,
      };

      let appliedPolicyId: string | null = null;

      const denyPolicies = policies.filter(p => p.effect === Effect.DENY);
      for (const policy of denyPolicies) {
        const isMatched = this.ruleEvaluator.evaluate(policy.condition, evaluationContext);

        evaluatedPolicies.push({
          ...PolicyResponseDto.fromDomain(policy),
          status: isMatched ? EvaluateStatus.APPLIED : EvaluateStatus.NOT_MATCHED,
          priority: 'P50',
        });

        if (isMatched) {
          decision = Effect.DENY;
          appliedPolicyId = policy.id.value;
        }
      }

      if (decision !== Effect.DENY) {
        const allowPolicies = policies.filter(p => p.effect === Effect.ALLOW);
        for (const policy of allowPolicies) {
          const isMatched = this.ruleEvaluator.evaluate(policy.condition, evaluationContext);

          const status = isMatched
            ? (appliedPolicyId ? EvaluateStatus.MATCHED : EvaluateStatus.APPLIED)
            : EvaluateStatus.NOT_MATCHED;

          if (isMatched && !appliedPolicyId) {
            decision = Effect.ALLOW;
            appliedPolicyId = policy.id.value;
          }

          evaluatedPolicies.push({
            ...PolicyResponseDto.fromDomain(policy),
            status,
            priority: 'P50',
          });
        }
      } else {
        const allowPolicies = policies.filter(p => p.effect === Effect.ALLOW);
        for (const policy of allowPolicies) {
          const isMatched = this.ruleEvaluator.evaluate(policy.condition, evaluationContext);
          evaluatedPolicies.push({
            ...PolicyResponseDto.fromDomain(policy),
            status: isMatched ? EvaluateStatus.MATCHED : EvaluateStatus.NOT_MATCHED,
            priority: 'P50',
          });
        }
      }
    }

    return {
      decision,
      evaluated_policies: evaluatedPolicies,
      context: evaluationContext,
    };
  }

  private async fetchResource(resourceName: string, id: string): Promise<any> {
    switch (resourceName.toLowerCase()) {
      case 'project':
        const projectItem = await this.projectRepo.findById(id);
        return projectItem ? ProjectMapper.toPrisma(projectItem) : null;
      case 'organization':
        const orgItem = await this.organizationRepo.findById(id);
        return orgItem ? OrganizationMapper.toPrisma(orgItem) : null;
      case 'feature':
        const featureItem = await this.featureRepo.findOneById(id);
        return featureItem ? FeatureMapper.toPrisma(featureItem) : null;
      default:
        return null;
    }
  }
}
