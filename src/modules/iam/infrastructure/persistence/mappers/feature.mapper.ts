import { Feature } from '@/modules/iam/domain/entities/feature.entity';
import { Slug } from '@/modules/iam/domain/vo/slug.vo';
import { IEntityID } from '@/shared/domain/entities/base.entity';

export class FeatureMapper {
    static toDomain(prismaFeature: any): Feature {
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
            is_enabled: prismaFeature.is_enabled,
            created_at: prismaFeature.created_at,
            updated_at: prismaFeature.updated_at,
        });
    }

    static toPrisma(feature: Feature): any {
        return {
            id: feature.id.value,
            name: feature.getName(),
            slug: feature.getSlug().value,
            description: feature.getDescription(),
            is_enabled: feature.getIsEnabled(),
            created_at: new Date(),
            updated_at: new Date(),
        };
    }

    static toPrismaUpdate(feature: Feature): any {
        return {
            name: feature.getName(),
            slug: feature.getSlug().value,
            description: feature.getDescription(),
            is_enabled: feature.getIsEnabled(),
            updated_at: new Date(),
        };
    }

    static toResponseDto(feature: Feature): any {
        return {
            id: feature.id.value,
            name: feature.getName(),
            slug: feature.getSlug().value,
            description: feature.getDescription(),
            is_enabled: feature.getIsEnabled(),
            created_at: feature.getCreatedAt(),
            updated_at: feature.getUpdatedAt(),
        };
    }
}
