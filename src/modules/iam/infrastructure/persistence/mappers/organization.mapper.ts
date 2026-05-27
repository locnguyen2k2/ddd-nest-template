import { ErrorEnum } from '@/common/exception.enum';
import { BusinessException } from '@/common/http/business-exception';
import { Organization } from '@/modules/iam/domain/entities/organization.entity';
import { Slug } from '@/modules/iam/domain/vo/slug.vo';
import { Attributes } from '@/modules/iam/domain/vo/attributes.vo';
import { IEntityID } from '@/shared/domain/entities/base.entity';
import { AccessControlStatus, Prisma } from '@internal/rbac/client';
import { connect } from 'http2';

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
        created_by: prismaOrganization.created_by || undefined,
        updated_by: prismaOrganization.updated_by || undefined,
        attributes: Attributes.create(prismaOrganization.attributes),
      });
    } catch (e: any) {
      throw new BusinessException(ErrorEnum.FAILED_TO_CONVERT_TO_PERSISTENCE);
    }
  }

  static toPrisma(
    organization: Organization,
  ): Prisma.OrganizationGetPayload<{}> {
    try {
      return {
        id: organization.id.value,
        name: organization.name(),
        slug: organization.slug().value,
        description: organization.description() || null,
        created_at: organization.created_at(),
        updated_at: organization.updated_at(),
        attributes: organization.attributes().value as Prisma.JsonObject,
        updated_by: organization.updated_by() || null,
        created_by: organization.created_by() || null,
      };
    } catch (e: any) {
      throw new BusinessException(ErrorEnum.FAILED_TO_CONVERT_TO_PERSISTENCE);
    }
  }

  static toPrismaUserOrgs(
    organization: Organization,
  ): Prisma.OrganizationUpdateInput {
    try {
      return {
        id: organization.id.value,
        name: organization.name(),
        slug: organization.slug().value,
        description: organization.description() || null,
        created_at: organization.created_at(),
        updated_at: organization.updated_at(),
        attributes: organization.attributes().value as Prisma.JsonObject,
        updated_by: organization.updated_by() || null,
      };
    } catch (e: any) {
      throw new BusinessException(ErrorEnum.FAILED_TO_CONVERT_TO_PERSISTENCE);
    }
  }

  static toPrismaCreate(
    organization: Organization,
  ): Prisma.OrganizationCreateInput {
    try {
      return {
        id: organization.id.value,
        name: organization.name(),
        slug: organization.slug().value,
        description: organization.description() || null,
        created_at: organization.created_at(),
        updated_at: organization.updated_at(),
        attributes: organization.attributes().value as Prisma.JsonObject,
        updated_by: organization.updated_by() || null,
        created_by_user: {
          connect: {
            id: organization.created_by() || undefined,
          },
        },
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
        attributes: organization.attributes().value as Prisma.JsonObject,
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
        created_at: organization.created_at(),
        updated_at: organization.updated_at(),
      };
    } catch (e: any) {
      throw new BusinessException(ErrorEnum.FAILED_TO_CONVERT_TO_PERSISTENCE);
    }
  }
}
