import { Feature } from '@/modules/iam/domain/entities/feature.entity';
import { Slug } from '@/modules/iam/domain/vo/slug.vo';
import { Attributes } from '@/modules/iam/domain/vo/attributes.vo';
import { IEntityID } from '@/shared/domain/entities/base.entity';
import { Prisma } from '@internal/rbac/client';
import { FeatureResponseDto } from '@/modules/iam/presentation/dtos/res/feature-response.dto';
import { AccessControlStatus } from '@/common/enum';

export class FeatureMapper {
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
      created_by: prismaFeature.created_by || undefined,
      updated_by: prismaFeature.updated_by || undefined,
      attributes: Attributes.create(prismaFeature.attributes),
    });
  }

  static toPrisma(feature: Feature): Prisma.FeatureGetPayload<{}> {
    return {
      id: feature.id.value,
      name: feature.name,
      slug: feature.slug.value,
      description: feature.description || null,
      status: feature.status as AccessControlStatus,
      created_at: feature.created_at,
      updated_at: feature.updated_at,
      project_id: feature.project_id,
      created_by: feature.created_by || null,
      updated_by: feature.updated_by || null,
      attributes: feature.attributes.value as Prisma.JsonObject,
    };
  }

  static toPrismaCreate(feature: Feature): Prisma.FeatureCreateInput {
    return {
      id: feature.id.value,
      name: feature.name,
      slug: feature.slug.value,
      description: feature.description || null,
      status: feature.status as AccessControlStatus,
      created_at: new Date(),
      updated_at: new Date(),
      project: {
        connect: {
          id: feature.project_id,
        },
      },
      created_by_user: feature.created_by
        ? {
            connect: { id: feature.created_by },
          }
        : undefined,
      updated_by: feature.updated_by,
      attributes: feature.attributes.value as Prisma.JsonObject,
    };
  }

  static toPrismaUpdate(feature: Feature): Prisma.FeatureUpdateInput {
    return {
      name: feature.name,
      slug: feature.slug.value,
      description: feature.description || null,
      status: feature.status as AccessControlStatus,
      updated_at: new Date(),
      updated_by: feature.updated_by || '',
      attributes: feature.attributes.value as Prisma.JsonObject,
    };
  }

  static toResponseDto(feature: Feature): FeatureResponseDto {
    return {
      id: feature.id.value,
      name: feature.name,
      slug: feature.slug.value,
      description: feature.description,
      status: feature.status as AccessControlStatus,
      created_at: feature.created_at,
      updated_at: feature.updated_at,
      project_id: feature.project_id,
      created_by: feature.created_by ?? undefined,
      updated_by: feature.updated_by ?? undefined,
    };
  }
}
