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
    const { action, resource, organization_id } = request;

    const resourceType = this.getResourceType(resource);
    const policies = await this.findMany({
      action,
      resource: resourceType,
      organization_id,
    });

    if (policies.length === 0) {
      return false;
    }

    const context = this.buildContext(request);
    console.log(context, organization_id);

    const denyPolicies = policies.filter(p => p.effect === Effect.DENY);
    for (const policy of denyPolicies) {
      if (this.ruleEvaluator.evaluate(policy.condition, context)) {
        return false;
      }
    }

    const allowPolicies = policies.filter(p => p.effect === Effect.ALLOW);
    for (const policy of allowPolicies) {
      if (this.ruleEvaluator.evaluate(policy.condition, context)) {
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

  private buildContext(request: IAccessRequest) {
    const { subject, resource, environment, organization_id } = request;
    let context_attributes: any = {};
    let department_id: string | undefined = undefined;

    if (organization_id) {
      const currentOrg = subject.organizations.find(org => org.organization_id === organization_id);
      if (currentOrg) {
        context_attributes = currentOrg.context_attributes?.value || {};
        department_id = currentOrg.department_id;
      }
    }

    return {
      subject: {
        id: subject.id.value,
        email: subject.email,
        username: subject.username,
        attributes: subject.attributes.value,
        context_attributes,
        department_id,
      },
      resource: {
        type: this.getResourceType(resource),
        attributes: resource.attributes?.value || resource,
      },
      env: environment || { time: new Date().toISOString() },
    };
  }

  private getResourceType(resource: any): string {
    if (typeof resource === 'string') return resource;
    if (resource.constructor && resource.constructor.name !== 'Object') {
      return resource.constructor.name;
    }
    return resource.type || 'Unknown';
  }
}
