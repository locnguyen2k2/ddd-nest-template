import { Organization } from '@/modules/iam/domain/entities/organization.entity';
import { Slug } from '@/modules/iam/domain/vo/slug.vo';
import { IEntityID } from '@/shared/domain/entities/base.entity';

export class OrganizationMapper {
    static toDomain(prismaOrganization: any): Organization {
        const organizationId: IEntityID<string> = {
            value: prismaOrganization.id,
            _id: prismaOrganization.id,
            get: () => prismaOrganization.id,
        };

        const slug = Slug.create(prismaOrganization.slug);

        return Organization.create({
            id: organizationId,
            name: prismaOrganization.name,
            slug: slug,
            description: prismaOrganization.description || undefined,
            created_at: prismaOrganization.created_at,
            updated_at: prismaOrganization.updated_at,
        });
    }

    static toPrisma(organization: Organization): any {
        return {
            id: organization.id.value,
            name: organization.getName(),
            slug: organization.getSlug().value,
            description: organization.getDescription(),
            created_at: new Date(),
            updated_at: new Date(),
        };
    }

    static toPrismaUpdate(organization: Organization): any {
        return {
            name: organization.getName(),
            slug: organization.getSlug().value,
            description: organization.getDescription(),
            updated_at: new Date(),
        };
    }

    static toResponseDto(organization: Organization): any {
        return {
            id: organization.id.value,
            name: organization.getName(),
            slug: organization.getSlug().value,
            description: organization.getDescription(),
            created_at: organization.getCreatedAt(),
            updated_at: organization.getUpdatedAt(),
        };
    }
}
