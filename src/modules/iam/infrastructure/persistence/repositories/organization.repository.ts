import { Inject, Injectable } from '@nestjs/common';
import { IOrganizationRepository } from '../../../domain/repositories/organization.repository';
import { Organization } from '../../../domain/entities/organization.entity';
import { OrganizationMapper } from '../mappers/organization.mapper';
import { PostgresAdapter } from '@/shared/infrastructure/adapters/postgres.adapter';
import { LogExecutionTime } from '@/common/decorators/log-execution.decorator';
import { BusinessException } from '@/common/http/business-exception';
import { ErrorEnum } from '@/common/exception.enum';
import { CacheRepository } from '@/shared/infrastructure/presistence/cache.repository';
import { ConfigKeyPaths } from '@/config';
import { CACHE_PORT, CachePort } from '@/shared/application/ports/cache.port';
import { ConfigService } from '@nestjs/config';
import {
  cursorHelper,
  paginateHelper,
  SortableFieldEnum,
  SortedEnum,
} from '@/common/pagination';
import {
  CursorOrganizationsQuery,
  PaginateOrganizationsQuery,
} from '@/modules/iam/presentation/dtos/req/organization.dto';
import { Prisma } from '@internal/rbac/client';
import { Period } from '@/common/enum';
import { StatsGrowInfo } from '@/common/interfaces/stats.interface';

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
    private readonly rbacDBService: PostgresAdapter,
    redisConfig: ConfigService<ConfigKeyPaths>,
    @Inject(CACHE_PORT) cachePort: CachePort,
  ) {
    super(redisConfig, cachePort);
  }

  async percentByMonth(user_id: string): Promise<number> {
    try {
      const [beforeCount, currentCount] = await Promise.all([
        this.countBeforeByMonth(user_id),
        this.countByMonth(user_id),
      ]);
      if (beforeCount === 0) {
        return 100;
      }
      console.log('beforeCount', beforeCount, 'currentCount', currentCount);
      return (currentCount - beforeCount) / beforeCount;
    } catch (error) {
      console.error(error);
      return 0;
    }
  }

  async countBeforeByMonth(user_id: string): Promise<number> {
    try {
      const result = await this.rbacDBService.$queryRaw<{ count: number }[]>`
      WITH month_info AS (
          SELECT
              DATE_TRUNC('month', CURRENT_DATE)::date AS month_start,
              (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::date AS month_end
      ),
          month_days AS (
              SELECT (month_end - month_start + 1) AS days_in_month
              FROM month_info
          )
      SELECT COUNT(*)::int
      FROM "Organization"
      WHERE created_at < CURRENT_DATE - (SELECT days_in_month - 1 FROM month_days) * INTERVAL '1 day' AND created_by = ${user_id};
      `;
      return result[0].count;
    } catch (e: any) {
      throw new BusinessException(ErrorEnum.REQUEST_FAILED_TO_QUERY);
    }
  }

  async countByMonth(user_id: string): Promise<number> {
    try {
      const result = await this.rbacDBService.$queryRaw<{ count: number }[]>`
      WITH month_info AS (
          SELECT
              DATE_TRUNC('month', CURRENT_DATE)::date AS month_start,
              (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::date AS month_end
      ),
          month_days AS (
              SELECT (month_end - month_start + 1) AS days_in_month
              FROM month_info
          ),
          range_start AS (
              SELECT CURRENT_DATE - (days_in_month - 1) * INTERVAL '1 day' AS start_date
      FROM month_days
          )
      SELECT
          COUNT(*)::int AS count
      FROM "Organization" org
          JOIN range_start r
      ON org.created_at >= r.start_date
      WHERE DATE(org.created_at) <= CURRENT_DATE AND org.created_by = ${user_id};
              `;
      return result[0].count;
    } catch (e: any) {
      throw new BusinessException(
        ErrorEnum.REQUEST_FAILED_TO_EXECUTE,
        e.message,
      );
    }
  }

  @LogExecutionTime()
  async paginate(pageOptions: PaginateOrganizationsQuery) {
    const filterOptions: any[] = [];

    if (pageOptions.userId) {
      filterOptions.push({
        staffs: {
          some: {
            user_id: pageOptions.userId,
          },
        },
      });
    }
    const { data = [], paginated } = await paginateHelper<
      Prisma.OrganizationGetPayload<{}>
    >({
      query: this.rbacDBService.organization,
      pageOptions,
      ...(filterOptions.length > 0 && {
        filterOptions,
        include: {
          staffs: {
            select: {
              user_id: true,
            },
          },
        },
      }),
    });

    return {
      data: data.map((item) => OrganizationMapper.toDomain(item)),
      paginated,
    };
  }

  @LogExecutionTime()
  async cursorPagination(pageOptions: CursorOrganizationsQuery) {
    const filterOptions: any[] = [];

    if (pageOptions.userId) {
      filterOptions.push({
        staffs: {
          some: {
            user_id: pageOptions.userId,
          },
        },
      });
    }

    const { data = [], paginated } = await cursorHelper<
      Prisma.OrganizationGetPayload<{}>
    >({
      query: this.rbacDBService.organization,
      pageOptions,
      cursorField: SortableFieldEnum.CREATED_AT,
      orderDirection: SortedEnum.DESC,
      ...(filterOptions.length > 0 && {
        filterOptions,
        include: {
          staffs: {
            select: {
              user_id: true,
            },
          },
        },
      }),
    });

    return {
      data: data.map((item) => OrganizationMapper.toDomain(item)),
      paginated,
    };
  }

  @LogExecutionTime()
  async cursorPaginationByJoiner(
    query: CursorOrganizationsQuery,
    joinerId: string,
  ) {
    try {
      const { data = [], paginated } = await cursorHelper<
        Prisma.OrganizationGetPayload<{}>
      >({
        query: this.rbacDBService.organization,
        pageOptions: query,
        cursorField: SortableFieldEnum.CREATED_AT,
        orderDirection: SortedEnum.DESC,
        filterOptions: [
          {
            users: {
              some: {
                user_id: joinerId,
              },
            },
          },
        ],
      });

      return {
        data: data.map((item) => OrganizationMapper.toDomain(item)),
        paginated,
      };
    } catch (error) {
      throw error;
    }
  }

  @LogExecutionTime()
  async handleListOrganizationsByJoiner(
    query: PaginateOrganizationsQuery,
    joinerId: string,
  ) {
    try {
      const filterOptions: any[] = [];

      if (query.userId) {
        filterOptions.push({
          users: {
            some: {
              user_id: query.userId,
            },
          },
        });
      }

      const { data = [], paginated } = await paginateHelper<
        Prisma.OrganizationGetPayload<{}>
      >({
        query: this.rbacDBService.organization,
        pageOptions: query,
        filterOptions: [
          ...filterOptions,
          {
            staffs: { some: { user_id: joinerId } },
          },
        ],
      });

      return {
        data: data.map((item) => OrganizationMapper.toDomain(item)),
        paginated,
      };
    } catch (e: any) {
      console.log(e);
      throw new BusinessException(ErrorEnum.REQUEST_FAILED_TO_QUERY);
    }
  }

  @LogExecutionTime()
  async findStaffs(userId: string): Promise<Organization[]> {
    try {
      const items = await this.getWithCache<
        Prisma.OrganizationGetPayload<{}>[]
      >(`user:${userId}:organizations`, async () => {
        return await this.rbacDBService.organization.findMany({
          where: { staffs: { some: { user_id: userId } } },
        });
      });
      if (!items) {
        return [];
      }
      return items.map((org) => OrganizationMapper.toDomain(org));
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
                staffs: { some: { user_id: userId } },
              },
            });
          },
        )) || 0;
      return count > 0;
    } catch (e: any) {
      console.log(e);
      throw new BusinessException(ErrorEnum.REQUEST_FAILED_TO_QUERY);
    }
  }

  @LogExecutionTime()
  async userJoinedAnyOrganization(userId: string): Promise<boolean> {
    try {
      const count =
        (await this.getWithCache<number>(`user:${userId}:joined`, async () => {
          return await this.rbacDBService.staff.count({
            where: { user_id: userId },
          });
        })) || 0;
      return count > 0;
    } catch (e: any) {
      throw new BusinessException(ErrorEnum.REQUEST_FAILED_TO_QUERY);
    }
  }

  @LogExecutionTime()
  async assignUser(organization_id: string, user_id: string): Promise<void> {
    try {
      await this.rbacDBService.staff.create({
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
      await this.rbacDBService.staff.delete({
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
  async updateUserAttributes(
    organization_id: string,
    user_id: string,
    attributes: any,
  ): Promise<void> {
    try {
      await this.rbacDBService.staff.update({
        where: {
          user_id_organization_id: {
            user_id,
            organization_id,
          },
        },
        data: {
          context_attributes: attributes,
        },
      });
      await this.invalidateCache(`user:${user_id}:organizations`);
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
    const items = await this.getWithManyKeysCache(
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
      (org) => org.id,
    );
    return items.map((org) => OrganizationMapper.toDomain(org));
  }

  @LogExecutionTime()
  async create(organization: Organization): Promise<Organization> {
    const prismaData = OrganizationMapper.toPrismaCreate(organization);
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
