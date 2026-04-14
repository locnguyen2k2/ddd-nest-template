import { PolicyEntity, Effect } from '@/modules/iam/domain/entities/policy.entity';
import { IEntityID } from '@/shared/domain/entities/base.entity';
import { Prisma, Policy } from '@internal/rbac/client';

export class PolicyMapper {
  static toDomain(props: Policy): PolicyEntity {
    const id: IEntityID<string> = {
      value: props.id,
      _id: props.id,
      get: () => props.id,
    };

    return PolicyEntity.create({
      id,
      name: props.name,
      description: props.description || undefined,
      effect: props.effect as Effect,
      action: props.action,
      resource: props.resource,
      condition: props.condition,
      organization_id: props.organization_id || undefined,
      created_at: props.created_at,
      updated_at: props.updated_at,
    });
  }

  static toPrisma(props: PolicyEntity): Policy {
    return {
      id: props.id.value,
      name: props.name,
      description: props.description || null,
      effect: props.effect as any,
      action: props.action,
      resource: props.resource,
      condition: props.condition as Prisma.JsonValue,
      organization_id: props.organizationId || null,
      created_at: props.createdAt,
      updated_at: props.updatedAt,
    };
  }

  static toPrismaCreate(props: PolicyEntity): Prisma.PolicyCreateInput {
    return {
      name: props.name,
      description: props.description || null,
      effect: props.effect as any,
      action: props.action,
      resource: props.resource,
      condition: props.condition || Prisma.JsonNull,
      organization: props.organizationId ? { connect: { id: props.organizationId } } : undefined,
      created_at: props.createdAt,
      updated_at: props.updatedAt,
    };
  }

  static toPrismaUpdate(props: PolicyEntity): Prisma.PolicyUpdateInput {
    return {
      name: props.name,
      description: props.description || null,
      effect: props.effect as any,
      action: props.action,
      resource: props.resource,
      condition: props.condition || Prisma.JsonNull,
      updated_at: props.updatedAt,
    };
  }
}
