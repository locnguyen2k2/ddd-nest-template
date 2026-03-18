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
        });
    }

    static toPrisma(organization: Organization): any {
        return {
            id: organization.id.value,
            name: organization.getName(),
            slug: organization.getSlug().value,
            description: organization.getDescription(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }

    static toPrismaUpdate(organization: Organization): any {
        return {
            name: organization.getName(),
            slug: organization.getSlug().value,
            description: organization.getDescription(),
            updatedAt: new Date(),
        };
    }

    static toResponseDto(organization: Organization): any {
        return {
            id: organization.id.value,
            name: organization.getName(),
            slug: organization.getSlug().value,
            description: organization.getDescription(),
        };
    }
}
