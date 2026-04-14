import { Injectable } from '@nestjs/common';
import { IAccessRequest, IPolicyRepository } from '@/modules/iam/domain/repositories/policy.repository';
import { Effect, PolicyEntity } from '@/modules/iam/domain/entities/policy.entity';
import { PrismaAdapter } from '@/shared/infrastructure/adapters/prisma.adapter';
import { PolicyMapper } from '../mappers/policy.mapper';
import { JsonLogicEngineAdapter } from '@/shared/infrastructure/adapters/json-logic.adapter';

@Injectable()
export class PrismaPolicyRepository implements IPolicyRepository {
  constructor(
    private readonly prisma: PrismaAdapter,
    private readonly ruleEvaluator: JsonLogicEngineAdapter
  ) { }

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
    const { subject, resource, environment } = request;
    let context_attributes: {} = {}
    if (request.organization_id) {
      context_attributes = subject.organizations[0].context_attributes?.value || {}
    }
    return {
      user: {
        id: subject.id.value,
        email: subject.email,
        username: subject.username,
        attributes: subject.attributes.value,
        context_attributes,
        organizations: subject.organizations.map(org => ({
          organization_id: org.organization_id,
          status: org.status,
          context_attributes: org.context_attributes?.value || {},
        })),
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
