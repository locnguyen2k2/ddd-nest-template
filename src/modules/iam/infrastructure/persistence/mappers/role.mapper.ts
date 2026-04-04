import { IFeaturePermission, RoleEntity } from '@/modules/iam/domain/entities/role.entity';
import { Slug } from '@/modules/iam/domain/vo/slug.vo';
import { FeaturePermissionResponseDto, RoleResponseDto } from '@/modules/iam/presentation/dtos/res/role-response.dto';
import { IEntityID } from '@/shared/domain/entities/base.entity';
import { AccessControlStatus, Prisma } from '@internal/rbac/client';
import { AccessControlStatus as AccessControlStatusDomain } from '@/common/enum';

export type RolePermissions = Prisma.RoleGetPayload<{ include: { role_feature_permissions: true } }>;

export class RoleMapper {
  static toDomainWithPermissions(prismaRole: RolePermissions): RoleEntity {
    const roleId: IEntityID<string> = {
      value: prismaRole.id,
      _id: prismaRole.id,
      get: () => prismaRole.id,
    };
    let featurePermissions: IFeaturePermission[] = [];
    if (prismaRole.role_feature_permissions) {
      featurePermissions = prismaRole.role_feature_permissions.map((rfp) => ({
        feature_id: rfp.feature_id,
        permission_id: rfp.permission_id,
        created_at: rfp.created_at as Date,
        updated_at: rfp.updated_at as Date,
        created_by: rfp.created_by as string | undefined,
        updated_by: rfp.updated_by as string | undefined,
        status: rfp.status as AccessControlStatusDomain,
        role_id: prismaRole.id,
      }));
    }

    const slug = Slug.create(prismaRole.slug);

    return RoleEntity.create({
      id: roleId,
      name: prismaRole.name,
      slug: slug,
      description: prismaRole.description || undefined,
      created_at: prismaRole.created_at,
      updated_at: prismaRole.updated_at,
      organization_id: prismaRole.organization_id,
      parent_role_id: prismaRole.parent_role_id || undefined,
      created_by: prismaRole.created_by || undefined,
      updated_by: prismaRole.updated_by || undefined,
      status: prismaRole.status as AccessControlStatusDomain,
      feature_permissions: featurePermissions,
    });
  }


  static toDomain(prismaRole: Prisma.RoleGetPayload<{}>): RoleEntity {
    const roleId: IEntityID<string> = {
      value: prismaRole.id,
      _id: prismaRole.id,
      get: () => prismaRole.id,
    };

    const slug = Slug.create(prismaRole.slug);

    return RoleEntity.create({
      id: roleId,
      name: prismaRole.name,
      slug: slug,
      description: prismaRole.description || undefined,
      created_at: prismaRole.created_at,
      updated_at: prismaRole.updated_at,
      organization_id: prismaRole.organization_id,
      parent_role_id: prismaRole.parent_role_id || undefined,
      created_by: prismaRole.created_by || undefined,
      updated_by: prismaRole.updated_by || undefined,
      status: prismaRole.status as AccessControlStatusDomain
    });
  }

  static toPrisma(role: RoleEntity): Prisma.RoleGetPayload<{}> {
    return {
      id: role.id.value,
      name: role.name,
      slug: role.slug.value,
      description: role.description || null,
      created_at: role.createdAt,
      updated_at: role.updatedAt,
      organization_id: role.organizationId,
      parent_role_id: role.parentRoleId || null,
      created_by: role.createdBy || null,
      updated_by: role.updatedBy || null,
      status: role.status as AccessControlStatus,
    };
  }

  static toPrismaWithPermissions(role: RoleEntity): Prisma.RoleGetPayload<{ include: { role_feature_permissions: true } }> {
    return {
      id: role.id.value,
      name: role.name,
      slug: role.slug.value,
      description: role.description || null,
      created_at: role.createdAt,
      updated_at: role.updatedAt,
      organization_id: role.organizationId,
      parent_role_id: role.parentRoleId || null,
      created_by: role.createdBy || null,
      updated_by: role.updatedBy || null,
      status: role.status as AccessControlStatus,
      role_feature_permissions: role.RFPs.map(fp => ({
        ...fp,
        role_id: role.id.value,
        created_at: fp.created_at || new Date(),
        updated_at: fp.updated_at || new Date(),
        created_by: fp.created_by || null,
        updated_by: fp.updated_by || null,
        status: fp.status as AccessControlStatus
      })),
    };
  }

  static toPrismaUpdate(role: RoleEntity): Prisma.RoleGetPayload<{}> {
    return {
      name: role.name,
      slug: role.slug.value,
      description: role.description || null,
      parent_role_id: role.parentRoleId || null,
      updated_at: new Date(),
      id: role.id.value,
      organization_id: role.organizationId,
      created_at: role.createdAt,
      created_by: role.createdBy || null,
      updated_by: role.updatedBy || null,
      status: role.status as AccessControlStatus,
    };
  }

  static toResponseDtoWithPermissions(role: Prisma.RoleGetPayload<{ include: { role_feature_permissions: true } }>): RoleResponseDto {
    let featurePermissions: FeaturePermissionResponseDto[] = [];
    if (role.role_feature_permissions) {
      featurePermissions = role.role_feature_permissions.map((rfp) => ({
        feature_id: rfp.feature_id,
        permission_id: rfp.permission_id,
        created_at: rfp.created_at as Date,
        updated_at: rfp.updated_at as Date,
        created_by: rfp.created_by || undefined,
        updated_by: rfp.updated_by || undefined,
        status: rfp.status as AccessControlStatusDomain,
      }));
    }
    return {
      id: role.id!,
      name: role.name,
      slug: role.slug,
      description: role.description || undefined,
      created_at: role.created_at as Date,
      updated_at: role.updated_at as Date,
      parent_role_id: role.parent_role_id || undefined,
      created_by: role.created_by || undefined,
      updated_by: role.updated_by || undefined,
      status: role.status as AccessControlStatus,
      feature_permission: featurePermissions
    };
  }

  static toResponseDto(role: Prisma.RoleGetPayload<{}>): RoleResponseDto {
    return {
      id: role.id!,
      name: role.name,
      slug: role.slug,
      description: role.description || undefined,
      created_at: role.created_at as Date,
      updated_at: role.updated_at as Date,
      parent_role_id: role.parent_role_id || undefined,
      created_by: role.created_by || undefined,
      updated_by: role.updated_by || undefined,
      status: role.status as AccessControlStatus,
      feature_permission: []
    };
  }
}
