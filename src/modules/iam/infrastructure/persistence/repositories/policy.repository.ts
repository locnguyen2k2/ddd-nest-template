import { Injectable } from '@nestjs/common';
import { IAccessRequest, IPolicyRepository } from '@/modules/iam/domain/repositories/policy.repository';
import { Effect, PolicyEntity } from '@/modules/iam/domain/entities/policy.entity';
import { PrismaAdapter } from '@/shared/infrastructure/adapters/prisma.adapter';
import { PolicyMapper } from '../mappers/policy.mapper';
import { JsonLogicEngineAdapter } from '@/shared/infrastructure/adapters/json-logic.adapter';
import { cursorHelper, paginateHelper, SortableFieldEnum, SortedEnum } from '@/common/pagination';
import { CursorPoliciesQuery, PaginatePoliciesQuery } from '@/modules/iam/presentation/dtos/req/policy.dto';
import { Prisma } from "@internal/rbac/client"
import { LogExecutionTime } from '@/common/decorators/log-execution.decorator';

@Injectable()
export class PrismaPolicyRepository implements IPolicyRepository {
  constructor(
    private readonly prisma: PrismaAdapter,
    private readonly ruleEvaluator: JsonLogicEngineAdapter
  ) { }

  @LogExecutionTime()
  async cursorPagination(pageOptions: CursorPoliciesQuery) {
    const filterOptions: any[] = [];

    if (pageOptions.action || pageOptions.resource) {
      filterOptions.push({
        OR: [
          { action: pageOptions.action || '*', resource: pageOptions.resource || '*' },
          { action: '*', resource: pageOptions.resource || '*' },
          { action: pageOptions.action || '*', resource: '*' },
          { action: '*', resource: '*' },
        ]
      });
    }

    if (pageOptions.organization_id) {
      filterOptions.push({
        OR: [
          { organization_id: pageOptions.organization_id },
          { organization_id: null },
        ]
      });
    }


    const { data = [], paginated } =
      await cursorHelper<Prisma.PolicyGetPayload<{}>>({
        query: this.prisma.policy,
        pageOptions,
        filterOptions,
        cursorField: SortableFieldEnum.CREATED_AT,
        orderDirection: SortedEnum.DESC,
      });

    return {
      data: data.map((item) => PolicyMapper.toDomain(item)),
      paginated,
    };
  }

  @LogExecutionTime()
  async paginate(pageOptions: PaginatePoliciesQuery) {
    const filterOptions: any[] = [];

    if (pageOptions.action || pageOptions.resource) {
      filterOptions.push({
        OR: [
          { action: pageOptions.action || '*', resource: pageOptions.resource || '*' },
          { action: '*', resource: pageOptions.resource || '*' },
          { action: pageOptions.action || '*', resource: '*' },
          { action: '*', resource: '*' },
        ]
      });
    }

    if (pageOptions.organization_id) {
      filterOptions.push({
        OR: [
          { organization_id: pageOptions.organization_id },
          { organization_id: null },
        ]
      });
    }

    const { data = [], paginated } =
      await paginateHelper<Prisma.PolicyGetPayload<{}>>({
        query: this.prisma.policy,
        pageOptions,
        filterOptions,
      });

    return {
      data: data.map((item) => PolicyMapper.toDomain(item)),
      paginated,
    };
  }

  async decide(request: IAccessRequest): Promise<boolean> {
    const { action, resource, organization_id, subject, environment } = request;

    const resourceType = PolicyEntity.getResourceType(resource);
    const policies = await this.findMany({
      action,
      resource: resourceType,
      organization_id,
    });

    if (policies.length === 0) {
      return false;
    }

    let organization = request.organization;
    if (!organization && organization_id) {
      organization = await this.prisma.organization.findUnique({
        where: { id: organization_id },
      });
    }

    const context = PolicyEntity.buildContext(
      subject,
      resource,
      action,
      organization_id,
      environment,
      organization,
    );

    const denyPolicies = policies.filter((p) => p.effect === Effect.DENY);
    for (const policy of denyPolicies) {
      if (policy.evaluate(context, this.ruleEvaluator)) {
        return false;
      }
    }

    const allowPolicies = policies.filter((p) => p.effect === Effect.ALLOW);
    for (const policy of allowPolicies) {
      if (policy.evaluate(context, this.ruleEvaluator)) {
        return true;
      }
    }

    return false;
  }

  async findMany(filter: { action?: string; resource?: string; organization_id?: string }): Promise<PolicyEntity[]> {
    const where: any = {};

    if (filter.action || filter.resource) {
      where.OR = [
        { action: filter.action || '*', resource: filter.resource || '*' },
        { action: '*', resource: filter.resource || '*' },
        { action: filter.action || '*', resource: '*' },
        { action: '*', resource: '*' },
      ];
    }

    if (filter.organization_id) {
      where.AND = {
        OR: [
          { organization_id: filter.organization_id },
          { organization_id: null },
        ]
      };
    }

    const policies = await this.prisma.policy.findMany({
      where,
    });

    return policies.map(p => PolicyMapper.toDomain(p));
  }

  async create(policy: PolicyEntity): Promise<PolicyEntity> {
    const toPrisma = PolicyMapper.toPrismaCreate(policy);
    const created = await this.prisma.policy.create({
      data: {
        ...toPrisma,
        id: policy.id.value,
      },
    });
    return PolicyMapper.toDomain(created);
  }

  async update(id: string, policy: PolicyEntity): Promise<PolicyEntity> {
    const toPrisma = PolicyMapper.toPrismaUpdate(policy);
    const updated = await this.prisma.policy.update({
      where: { id },
      data: toPrisma,
    });
    return PolicyMapper.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.policy.delete({
      where: { id },
    });
  }

  async findById(id: string): Promise<PolicyEntity | null> {
    const policy = await this.prisma.policy.findUnique({
      where: { id },
    });
    if (!policy) return null;
    return PolicyMapper.toDomain(policy);
  }
}
