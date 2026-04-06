import { Inject, Injectable } from '@nestjs/common';
import { IOrganizationRepository } from '../../../domain/repositories/organization.repository';
import { Organization } from '../../../domain/entities/organization.entity';
import { OrganizationMapper } from '../mappers/organization.mapper';
import { PrismaAdapter } from '@/shared/infrastructure/adapters/prisma.adapter';
import { LogExecutionTime } from '@/common/decorators/log-execution.decorator';
import { BusinessException } from '@/common/http/business-exception';
import { ErrorEnum } from '@/common/exception.enum';
import { CacheRepository } from '@/shared/infrastructure/presistence/cache.repository';
import { ConfigKeyPaths } from '@/config';
import { CACHE_PORT, CachePort } from '@/shared/application/ports/cache.port';
import { ConfigService } from '@nestjs/config';
import { cursorHelper, paginateHelper, SortableFieldEnum, SortedEnum } from '@/common/pagination';
import { CursorOrganizationsQuery, PaginateOrganizationsQuery } from '@/modules/iam/presentation/dtos/req/organization.dto';
import { Prisma } from "@internal/rbac/client"

@Injectable()
export class OrganizationRepository
  extends CacheRepository
  implements IOrganizationRepository {
  protected readonly boundedContext: string = 'iam';
  protected readonly aggregateType: string = 'organization';
  protected readonly ttlConfig: { [key: string]: number } = {
    default: 3600,
  };

  constructor(
    private readonly rbacDBService: PrismaAdapter,
    redisConfig: ConfigService<ConfigKeyPaths>,
    @Inject(CACHE_PORT) cachePort: CachePort,
  ) {
    super(redisConfig, cachePort);
  }

  @LogExecutionTime()
  async paginate(pageOptions: PaginateOrganizationsQuery) {
    const { data = [], paginated } =
      await paginateHelper<Prisma.OrganizationGetPayload<{}>>({
        query: this.rbacDBService.organization,
        pageOptions,
      });

    return {
      data: data.map((item) => OrganizationMapper.toDomain(item)),
      paginated,
    };
  }

  @LogExecutionTime()
  async cursorPagination(pageOptions: CursorOrganizationsQuery) {
    const { data = [], paginated } =
      await cursorHelper<Prisma.OrganizationGetPayload<{}>>({
        query: this.rbacDBService.organization,
        pageOptions,
        cursorField: SortableFieldEnum.CREATED_AT,
        orderDirection: SortedEnum.DESC,
      });

    return {
      data: data.map((item) => OrganizationMapper.toDomain(item)),
      paginated,
    };
  }

  @LogExecutionTime()
  async findUserRoles(organizationId: string, userId: string): Promise<string[]> {
    try {
      const userOrgRoels = await this.getWithCache(
        `org:${organizationId}:user:${userId}:roles`,
        async () => {
          const userRoles = await this.rbacDBService.userOrganizationRole.findMany({
            where: { organization_id: organizationId, user_id: userId },
            select: { role_id: true },
          });
          return userRoles.map((ur) => ur.role_id);
        },
      );
      return userOrgRoels || [];
    } catch (e: any) {
      throw new BusinessException(ErrorEnum.REQUEST_FAILED_TO_QUERY);
    }
  }

  @LogExecutionTime()
  async assignRoleToUser(organizationId: string, userId: string, roleId: string): Promise<void> {
    try {
      await this.rbacDBService.userOrganizationRole.create({
        data: {
          organization_id: organizationId,
          user_id: userId,
          role_id: roleId,
        },
      });
      await this.invalidateCache(`org:${organizationId}:user:${userId}:roles`);
    } catch (e: any) {
      throw new BusinessException(ErrorEnum.REQUEST_FAILED_TO_QUERY);
    }
  }

  @LogExecutionTime()
  async unassignRoleFromUser(organizationId: string, userId: string, roleId: string): Promise<void> {
    try {
      await this.rbacDBService.userOrganizationRole.delete({
        where: {
          user_id_organization_id_role_id: {
            organization_id: organizationId,
            user_id: userId,
            role_id: roleId,
          },
        },
      });
      await this.invalidateCache(`org:${organizationId}:user:${userId}:roles`);
    } catch (e: any) {
      throw new BusinessException(ErrorEnum.REQUEST_FAILED_TO_QUERY);
    }
  }

  @LogExecutionTime()
  async handleListOrganizationsByJoiner(joinerId: string): Promise<Organization[]> {
    try {
      const organizations = await this.rbacDBService.organization.findMany({
        where: { users: { some: { user_id: joinerId } } },
      });
      return organizations.map(OrganizationMapper.toDomain);
    } catch (e: any) {
      throw new BusinessException(ErrorEnum.REQUEST_FAILED_TO_QUERY);
    }
  }

  @LogExecutionTime()
  async organizationHasRole(
    organizationId: string,
    roleId: string,
  ): Promise<boolean> {
    try {
      const count =
        (await this.getWithCache<number>(
          `organization:${organizationId}:role:${roleId}`,
          async () => {
            return await this.rbacDBService.organization.count({
              where: { id: organizationId, roles: { some: { id: roleId } } },
            });
          },
        )) || 0;
      return count > 0;
    } catch (e: any) {
      throw new BusinessException(ErrorEnum.REQUEST_FAILED_TO_QUERY);
    }
  }

  @LogExecutionTime()
  async organizationHasUser(
    organizationId: string,
    userId: string,
  ): Promise<boolean> {
    try {
      const count =
        (await this.getWithCache<number>(
          `organization:${organizationId}:user:${userId}`,
          async () => {
            return await this.rbacDBService.organization.count({
              where: {
                id: organizationId,
                users: { some: { user_id: userId } },
              },
            });
          },
        )) || 0;
      return count > 0;
    } catch (e: any) {
      throw new BusinessException(ErrorEnum.REQUEST_FAILED_TO_QUERY);
    }
  }

  @LogExecutionTime()
  async assignUser(organization_id: string, user_id: string): Promise<void> {
    try {
      await this.rbacDBService.userOrganization.create({
        data: {
          organization_id,
          user_id,
        },
      });
      await this.invalidateCache(
        `organization:${organization_id}:user:${user_id}`,
      );
    } catch (e: any) {
      throw new BusinessException(ErrorEnum.REQUEST_FAILED_TO_EXECUTE);
    }
  }

  @LogExecutionTime()
  async unassignUser(organization_id: string, user_id: string): Promise<void> {
    try {
      await this.rbacDBService.userOrganization.delete({
        where: {
          user_id_organization_id: {
            user_id,
            organization_id,
          },
        },
      });
      await this.invalidateCache(
        `organization:${organization_id}:user:${user_id}`,
      );
    } catch (e: any) {
      throw new BusinessException(ErrorEnum.REQUEST_FAILED_TO_EXECUTE);
    }
  }

  @LogExecutionTime()
  async findById(id: string): Promise<Organization | null> {
    const item = await this.getWithCache(id, async () => {
      return await this.rbacDBService.organization.findUnique({
        where: { id },
      });
    });

    return item ? OrganizationMapper.toDomain(item) : null;
  }

  @LogExecutionTime()
  async findBySlug(slug: string): Promise<Organization | null> {
    const item = await this.getWithCache(slug, async () => {
      return await this.rbacDBService.organization.findUnique({
        where: { slug },
      });
    });

    return item ? OrganizationMapper.toDomain(item) : null;
  }

  @LogExecutionTime()
  async findByIds(ids: string[]): Promise<Organization[]> {
    const items = await this.getManyWithCache(
      ids,
      async (ids) => {
        return await this.rbacDBService.organization.findMany({
          where: {
            id: {
              in: ids,
            },
          },
        });
      },
      (org) => org.id);
    return items.map((org) => OrganizationMapper.toDomain(org));
  }

  @LogExecutionTime()
  async create(organization: Organization): Promise<Organization> {
    const prismaData = OrganizationMapper.toPrisma(organization);
    try {
      const createdOrganization = await this.rbacDBService.organization.create({
        data: prismaData,
      });

      return OrganizationMapper.toDomain(createdOrganization);
    } catch (e: any) {
      throw new BusinessException(ErrorEnum.REQUEST_FAILED_TO_EXECUTE);
    }
  }

  @LogExecutionTime()
  async update(id: string, organization: Organization): Promise<Organization> {
    try {
      const prismaData = OrganizationMapper.toPrismaUpdate(organization);
      const updatedOrganization = await this.rbacDBService.organization.update({
        where: { id },
        data: prismaData,
      });

      return OrganizationMapper.toDomain(updatedOrganization);
    } catch (e: any) {
      throw new BusinessException(ErrorEnum.REQUEST_FAILED_TO_EXECUTE);
    }
  }

  @LogExecutionTime()
  async delete(id: string): Promise<void> {
    try {
      await this.rbacDBService.organization.delete({
        where: { id },
      });
      await this.invalidateAllCache();
    } catch (e: any) {
      throw new BusinessException(ErrorEnum.REQUEST_FAILED_TO_EXECUTE);
    }
  }
}
