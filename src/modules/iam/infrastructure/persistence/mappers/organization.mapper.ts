import { ErrorEnum } from '@/common/exception.enum';
import { BusinessException } from '@/common/http/business-exception';
import { Organization } from '@/modules/iam/domain/entities/organization.entity';
import { Slug } from '@/modules/iam/domain/vo/slug.vo';
import { IEntityID } from '@/shared/domain/entities/base.entity';

export class OrganizationMapper {
  static toDomain(prismaOrganization: any): Organization {
    try {
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
    } catch (e: any) {
      throw new BusinessException(ErrorEnum.FAILED_TO_CONVERT_TO_PERSISTENCE);
    }
  }

  static toPrisma(organization: Organization): any {
    try {
      return {
        id: organization.id.value,
        name: organization.name(),
        slug: organization.slug().value,
        description: organization.description(),
        created_at: new Date(),
        updated_at: new Date(),
      };
    } catch (e: any) {
      throw new BusinessException(ErrorEnum.FAILED_TO_CONVERT_TO_PERSISTENCE);
    }
  }

  static toPrismaUpdate(organization: Organization): any {
    try {
      return {
        name: organization.name(),
        slug: organization.slug().value,
        description: organization.description(),
        updated_at: new Date(),
      };
    } catch (e: any) {
      throw new BusinessException(ErrorEnum.FAILED_TO_CONVERT_TO_PERSISTENCE);
    }
  }

  static toResponseDto(organization: Organization): any {
    try {
      return {
        id: organization.id.value,
        name: organization.name(),
        slug: organization.slug().value,
        description: organization.description(),
        created_at: organization.createdAt(),
        updated_at: organization.updatedAt(),
      };
    } catch (e: any) {
      throw new BusinessException(ErrorEnum.FAILED_TO_CONVERT_TO_PERSISTENCE);
    }
  }
}
