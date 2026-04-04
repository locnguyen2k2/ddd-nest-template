import { Feature } from '@/modules/iam/domain/entities/feature.entity';
import { Slug } from '@/modules/iam/domain/vo/slug.vo';
import { IEntityID } from '@/shared/domain/entities/base.entity';
import { Prisma } from '@internal/rbac/client';
import { FeatureResponseDto, RolePermissionResponseDto } from '@/modules/iam/presentation/dtos/res/feature-response.dto';
import { AccessControlStatus } from '@/common/enum';

export class FeatureMapper {
  static toDomainWithRoles(prismaFeature: Prisma.FeatureGetPayload<{ include: { role_feature_permissions: true } }>): Feature {
    const featureId: IEntityID<string> = {
      value: prismaFeature.id,
      _id: prismaFeature.id,
      get: () => prismaFeature.id,
    };

    const slug = Slug.create(prismaFeature.slug);

    return Feature.create({
      id: featureId,
      name: prismaFeature.name,
      slug: slug,
      description: prismaFeature.description || undefined,
      status: prismaFeature.status as AccessControlStatus,
      created_at: prismaFeature.created_at,
      updated_at: prismaFeature.updated_at,
      project_id: prismaFeature.project_id,
      created_by: prismaFeature.created_by || undefined,
      updated_by: prismaFeature.updated_by || undefined,
      role_permissions: Array.isArray(prismaFeature.role_feature_permissions) ? prismaFeature.role_feature_permissions.map(fp => ({
        ...fp,
        feature_id: prismaFeature.id,
        created_at: fp.created_at || new Date(),
        updated_at: fp.updated_at || new Date(),
        created_by: fp.created_by || undefined,
        updated_by: fp.updated_by || undefined,
        status: fp.status as AccessControlStatus
      })) : [],
    });
  }

  static toPrismaWithPermissions(feature: Feature): Prisma.FeatureGetPayload<{ include: { role_feature_permissions: true } }> {
    return {
      id: feature.id.value,
      name: feature.name,
      slug: feature.slug.value,
      description: feature.description || null,
      created_at: new Date(),
      updated_at: new Date(),
      project_id: feature.projectId,
      status: feature.status as AccessControlStatus,
      created_by: feature.createdBy || null,
      updated_by: feature.updatedBy || null,
      role_feature_permissions: feature.RFPs.map(fp => ({
        ...fp,
        feature_id: feature.id.value,
        created_at: fp.created_at || new Date(),
        updated_at: fp.updated_at || new Date(),
        created_by: fp.created_by || null,
        updated_by: fp.updated_by || null,
        status: fp.status as AccessControlStatus
      })),
    };
  }
  static toResponseDtoWithPermissions(feature: Prisma.FeatureGetPayload<{ include: { role_feature_permissions: true } }>): FeatureResponseDto {
    let rolePermissions: RolePermissionResponseDto[] = [];
    if (feature.role_feature_permissions) {
      rolePermissions = feature.role_feature_permissions.map((rfp) => ({
        role_id: rfp.role_id,
        permission_id: rfp.permission_id,
        created_at: rfp.created_at as Date,
        updated_at: rfp.updated_at as Date,
        created_by: rfp.created_by || undefined,
        updated_by: rfp.updated_by || undefined,
        status: rfp.status as AccessControlStatus,
      }));
    }
    return {
      id: feature.id!,
      name: feature.name,
      slug: feature.slug,
      description: feature.description || undefined,
      created_at: feature.created_at as Date,
      updated_at: feature.updated_at as Date,
      project_id: feature.project_id,
      created_by: feature.created_by || undefined,
      updated_by: feature.updated_by || undefined,
      status: feature.status as AccessControlStatus,
      role_permission: rolePermissions
    };
  }


  static toDomain(prismaFeature: Prisma.FeatureGetPayload<{}>): Feature {
    const featureId: IEntityID<string> = {
      value: prismaFeature.id,
      _id: prismaFeature.id,
      get: () => prismaFeature.id,
    };

    const slug = Slug.create(prismaFeature.slug);

    return Feature.create({
      id: featureId,
      name: prismaFeature.name,
      slug: slug,
      description: prismaFeature.description || undefined,
      status: prismaFeature.status as AccessControlStatus,
      created_at: prismaFeature.created_at,
      updated_at: prismaFeature.updated_at,
      project_id: prismaFeature.project_id,
      created_by: undefined,
      updated_by: undefined,
    });
  }

  static toPrisma(feature: Feature): Prisma.FeatureGetPayload<{}> {
    return {
      id: feature.id.value,
      name: feature.name,
      slug: feature.slug.value,
      description: feature.description || null,
      status: feature.status,
      created_at: new Date(),
      updated_at: new Date(),
      project_id: feature.projectId,
      created_by: null,
      updated_by: null,
    };
  }

  static toPrismaUpdate(feature: Feature): Prisma.FeatureGetPayload<{}> {
    return {
      id: feature.id.value,
      name: feature.name,
      slug: feature.slug.value,
      description: feature.description || null,
      status: feature.status,
      updated_at: new Date(),
      project_id: feature.projectId,
      created_by: null,
      updated_by: null,
      created_at: new Date(),
    };
  }

  static toResponseDto(feature: Feature): FeatureResponseDto {
    return {
      id: feature.id.value,
      name: feature.name,
      slug: feature.slug.value,
      description: feature.description,
      status: feature.status as AccessControlStatus,
      created_at: feature.createdAt,
      updated_at: feature.updatedAt,
      project_id: feature.projectId,
      created_by: feature.createdBy ?? undefined,
      updated_by: feature.updatedBy ?? undefined,
    };
  }
}
