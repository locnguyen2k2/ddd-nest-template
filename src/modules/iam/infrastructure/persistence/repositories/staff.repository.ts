import { LogExecutionTime } from '@/common/decorators/log-execution.decorator';
import { ConfigKeyPaths } from '@/config';
import { Staffs } from '@/modules/iam/domain/entities/staffs.entity';
import { IStaffRepository } from '@/modules/iam/domain/repositories/staff.repository';
import {
  CursorStaffsQuery,
  PaginateStaffsQuery,
} from '@/modules/iam/presentation/dtos/req/staff.dto';
import { CACHE_PORT, CachePort } from '@/shared/application/ports/cache.port';
import { PostgresAdapter } from '@/shared/infrastructure/adapters/postgres.adapter';
import { CacheRepository } from '@/shared/infrastructure/presistence/cache.repository';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StaffMapper } from '../mappers/staff.mapper';
import {
  cursorHelper,
  paginateHelper,
  SortableFieldEnum,
  SortedEnum,
} from '@/common/pagination';
import { Prisma } from '@internal/rbac/client';
import { BusinessException } from '@/common/http/business-exception';
import { ErrorEnum } from '@/common/exception.enum';
import { StatsGrowInfo } from '@/common/interfaces/stats.interface';

@Injectable()
export class StaffRepository
  extends CacheRepository
  implements IStaffRepository {
  protected readonly boundedContext: string = 'iam';
  protected readonly aggregateType: string = 'staffs';
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

  async countBeforeByMonth(org_id: string): Promise<number> {
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
            FROM "Staff"
            WHERE created_at < CURRENT_DATE - (SELECT days_in_month - 1 FROM month_days) * INTERVAL '1 day' AND organization_id = ${org_id};
            `;
      return result[0].count;
    } catch (e: any) {
      throw new BusinessException(ErrorEnum.REQUEST_FAILED_TO_QUERY);
    }
  }

  async countByMonth(org_id: string): Promise<number> {
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
            FROM "Staff" prj
                JOIN range_start r
            ON prj.created_at >= r.start_date
            WHERE DATE(prj.created_at) <= CURRENT_DATE AND prj.organization_id = ${org_id};
              `;
      return result[0].count;
    } catch (e: any) {
      throw new BusinessException(
        ErrorEnum.REQUEST_FAILED_TO_EXECUTE,
        e.message,
      );
    }
  }

  async orgStaffGrowthByMonth(orgId: string): Promise<StatsGrowInfo> {
    try {
      const result: StatsGrowInfo = {
        data: {
          labels: [],
          values: [],
        },
        title: '',
        from: '',
        to: '',
      };
      const data = await this.rbacDBService.$queryRaw<
        { date: Date; count: number }[]
      >`
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
                    DATE(u.created_at) AS date,
                    COUNT(*)::int AS count
                FROM "Staff" u 
                    JOIN range_start r
                        ON u.created_at >= r.start_date 
                WHERE DATE(u.created_at) <= CURRENT_DATE 
                    AND u.organization_id = ${orgId}
                GROUP BY DATE(u.created_at)
                ORDER BY DATE(u.created_at);
            `;
      if (data.length === 0) {
        return result;
      }
      return {
        data: {
          labels: data.map((item) => item.date.toISOString()),
          values: data.map((item) => item.count),
        },
        title: '',
        from: data[0].date.toISOString(),
        to: data[data.length - 1].date.toISOString(),
      };
    } catch (e: any) {
      throw new BusinessException(
        ErrorEnum.REQUEST_FAILED_TO_EXECUTE,
        e.message,
      );
    }
  }

  async orgStaffGrowthByYear(orgId: string): Promise<StatsGrowInfo> {
    try {
      const result: StatsGrowInfo = {
        data: {
          labels: [],
          values: [],
        },
        title: '',
        from: '',
        to: '',
      };
      const data = await this.rbacDBService.$queryRaw<
        { date: Date; count: number }[]
      >`
            SELECT
                TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS date,
                COUNT(*)::int AS count
            FROM "Staff"
            WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '11 months'
            AND created_at < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
            AND organization_id = ${orgId}
            GROUP BY DATE_TRUNC('month', created_at)
            ORDER BY DATE_TRUNC('month', created_at);
            `;
      if (data.length === 0) {
        return result;
      }
      return {
        data: {
          labels: data.map((item) => item.date.toISOString()),
          values: data.map((item) => item.count),
        },
        title: 'Year Growth',
        from: data[0].date.toISOString(),
        to: data[data.length - 1].date.toISOString(),
      };
    } catch (e: any) {
      throw new BusinessException(
        ErrorEnum.REQUEST_FAILED_TO_EXECUTE,
        e.message,
      );
    }
  }

  async orgStaffGrowthByWeek(orgId: string): Promise<StatsGrowInfo> {
    try {
      const result: StatsGrowInfo = {
        data: {
          labels: [],
          values: [],
        },
        title: 'Week Growth',
        from: '',
        to: '',
      };
      const data = await this.rbacDBService.$queryRaw<
        { date: Date; count: number }[]
      >`
            SELECT
                DATE(created_at) AS date,
                COUNT(*)::int AS count
            FROM "Staff"
            WHERE created_at >= CURRENT_DATE - INTERVAL '6 days'
            AND created_at < CURRENT_DATE + INTERVAL '1 day'
            AND organization_id = ${orgId}
            GROUP BY DATE(created_at)
            ORDER BY DATE(created_at);
            `;
      if (data.length === 0) {
        return result;
      }
      return {
        data: {
          labels: data.map((item) => item.date.toISOString()),
          values: data.map((item) => item.count),
        },
        title: 'Week Growth',
        from: data[0].date.toISOString(),
        to: data[data.length - 1].date.toISOString(),
      };
    } catch (e: any) {
      throw new BusinessException(
        ErrorEnum.REQUEST_FAILED_TO_EXECUTE,
        e.message,
      );
    }
  }

  async orgStaffGrowthByDay(orgId: string): Promise<StatsGrowInfo> {
    try {
      const result: StatsGrowInfo = {
        data: {
          labels: [],
          values: [],
        },
        title: 'Day Growth',
        from: '',
        to: '',
      };
      const data = await this.rbacDBService.$queryRaw<
        { date: Date; count: number }[]
      >`
            SELECT
                date_trunc('hour', created_at) AS date,
                COUNT(*)::int AS count
            FROM "Staff"
            WHERE created_at >= date_trunc('hour', CURRENT_TIMESTAMP) - INTERVAL '23 hours'
            AND created_at < date_trunc('hour', CURRENT_TIMESTAMP)
            AND organization_id = ${orgId}
            GROUP BY date_trunc('hour', created_at)
            ORDER BY date_trunc('hour', created_at);
            `;

      if (data.length === 0) {
        return result;
      }
      return {
        data: {
          labels: data.map((item) => item.date.toISOString()),
          values: data.map((item) => item.count),
        },
        title: 'Day Growth',
        from: data[0].date.toISOString(),
        to: data[data.length - 1].date.toISOString(),
      };
    } catch (e: any) {
      throw new BusinessException(
        ErrorEnum.REQUEST_FAILED_TO_EXECUTE,
        e.message,
      );
    }
  }

  @LogExecutionTime()
  async paginate(pageOptions: PaginateStaffsQuery) {
    const { data = [], paginated } = await paginateHelper<
      Prisma.StaffGetPayload<{}>
    >({
      query: this.rbacDBService.staff,
      pageOptions,
    });

    return {
      data: data.map((item) => StaffMapper.toDomain(item)),
      paginated,
    };
  }

  @LogExecutionTime()
  async cursorPagination(pageOptions: CursorStaffsQuery) {
    const { data = [], paginated } = await cursorHelper<
      Prisma.StaffGetPayload<{}>
    >({
      query: this.rbacDBService.staff,
      pageOptions,
      cursorField: SortableFieldEnum.CREATED_AT,
      orderDirection: SortedEnum.DESC,
    });

    return {
      data: data.map((item) => StaffMapper.toDomain(item)),
      paginated,
    };
  }

  async findOneById(id: string): Promise<Staffs | null> {
    const item = await this.getWithCache(`staffs:${id}`, async () => {
      return this.rbacDBService.staff.findUnique({ where: { id } });
    });
    if (!item) return null;
    return StaffMapper.toDomain(item);
  }
  async findOneUser(userId: string, orgId: string): Promise<Staffs | null> {
    const item = await this.getWithCache(
      `staffs:user:${userId}:org:${orgId}`,
      async () => {
        return this.rbacDBService.staff.findUnique({
          where: {
            user_id_organization_id: {
              user_id: userId,
              organization_id: orgId,
            },
          },
        });
      },
    );
    if (!item) return null;
    return StaffMapper.toDomain(item);
  }
  async findByUserId(userId: string): Promise<Staffs[]> {
    const items = await this.getWithCache(`staffs:user:${userId}`, async () => {
      return this.rbacDBService.staff.findMany({ where: { user_id: userId } });
    });
    if (!items) return [];
    return items.map((item) => StaffMapper.toDomain(item));
  }
  async findByUserIdAndOrgId(
    userId: string,
    orgId: string,
  ): Promise<Staffs | null> {
    const items = await this.getWithCache(
      `staffs:user:${userId}:org:${orgId}`,
      async () => {
        return this.rbacDBService.staff.findUnique({
          where: {
            user_id_organization_id: {
              user_id: userId,
              organization_id: orgId,
            },
          },
        });
      },
    );
    if (!items) return null;
    return StaffMapper.toDomain(items);
  }
  async findByOrgId(orgId: string): Promise<Staffs[]> {
    const items = await this.getWithCache(`staffs:org:${orgId}`, async () => {
      return this.rbacDBService.staff.findMany({
        where: { organization_id: orgId },
      });
    });
    if (!items) return [];
    return items.map((item) => StaffMapper.toDomain(item));
  }
  async create(data: any): Promise<Staffs> {
    const item = await this.rbacDBService.staff.create({ data });
    await this.invalidateCache(`staffs:${item.id}`);
    return StaffMapper.toDomain(item);
  }
  async update(data: any): Promise<Staffs> {
    const item = await this.rbacDBService.staff.update({
      where: { id: data.id },
      data,
    });
    await this.invalidateCache(`staffs:${item.id}`);
    return StaffMapper.toDomain(item);
  }
  async delete(id: string) {
    await this.rbacDBService.staff.delete({ where: { id } });
    await this.invalidateCache(`staffs:${id}`);
  }
  async deleteByUserId(userId: string) {
    await this.rbacDBService.staff.deleteMany({ where: { user_id: userId } });
    await this.invalidateCache(`staffs:user:${userId}`);
  }
}
