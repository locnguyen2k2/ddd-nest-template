import { Injectable } from '@nestjs/common';
import { IFeatureRepository } from '@/modules/iam/domain/repositories/feature.repository';
import { FeatureMapper } from '../mappers/feature.mapper';
import { PrismaAdapter } from '@/shared/infrastructure/adapters/prisma.adapter';
import { LogExecutionTime } from '@/common/decorators/log-execution.decorator';
import {
    cursorHelper,
    paginateHelper,
    SortableFieldEnum,
    SortedEnum,
} from '@/common/pagination';
import {
    CursorFeaturesQuery,
    PaginateFeaturesQuery,
} from '@/modules/iam/application/dtos/queries/feature-query.dto';
import { Prisma } from '@internal/rbac/client';
import { CacheRepository } from '@/shared/infrastructure/presistence/cache.repository';
import { ConfigService } from '@nestjs/config';
import { Inject } from '@nestjs/common';
import { ConfigKeyPaths } from '@/config';
import { CACHE_PORT, CachePort } from '@/shared/application/ports/cache.port';
import { Feature } from '@/modules/iam/domain/entities/feature.entity';
import { BusinessException } from '@/common/http/business-exception';
import { ErrorEnum } from '@/common/exception.enum';
import { StatsGrowInfo } from '@/common/interfaces/stats.interface';
import { Period } from '@/common/enum';

@Injectable()
export class FeatureRepository
    extends CacheRepository
    implements IFeatureRepository {
    protected readonly boundedContext: string = 'iam';
    protected readonly aggregateType: string = 'feature';
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

    private readonly statsGrowth = {
        [Period.WEEK]: async (organization_id: string) => this.growthByWeek(organization_id),
        [Period.MONTH]: async (organization_id: string) => this.growthByMonth(organization_id),
        [Period.DAY]: async (organization_id: string) => this.growthByDay(organization_id),
        [Period.YEAR]: async (organization_id: string) => this.growthByYear(organization_id),
    };

    async growth(organization_id: string, period?: string): Promise<StatsGrowInfo> {
        return await this.statsGrowth[period || Period.MONTH](organization_id);
    }

    async growthByMonth(organization_id: string,): Promise<StatsGrowInfo> {
        try {
            const result: StatsGrowInfo = {
                data: {
                    labels: [],
                    values: [],
                },
                title: '',
                from: '',
                to: '',
            }
            const data = await this.rbacDBService.$queryRaw<{ date: Date, count: number }[]>`
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
                    COUNT(*)::int AS count,
                     "Project"."organization_id" as "organization_id"
                FROM "Feature" u 
                    JOIN range_start r
                        ON u.created_at >= r.start_date AND
                    left join "Project" on "Project"."id" = "Feature"."project_id" 
                WHERE DATE(u.created_at) <= CURRENT_DATE 
                    AND "organization_id" = ${organization_id}
                GROUP BY DATE(u.created_at), "organization_id"
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
            throw new BusinessException(ErrorEnum.REQUEST_FAILED_TO_EXECUTE, e.message);
        }
    }

    async growthByYear(organization_id: string,): Promise<StatsGrowInfo> {
        try {
            const result: StatsGrowInfo = {
                data: {
                    labels: [],
                    values: [],
                },
                title: '',
                from: '',
                to: '',
            }
            const data = await this.rbacDBService.$queryRaw<{ date: Date, count: number }[]>`
            SELECT
                TO_CHAR(DATE_TRUNC('month', "Feature"."created_at"), 'YYYY-MM') AS date,
                "Project"."organization_id" as "organization_id",
                COUNT(*)::int AS count
            FROM "Feature" LEFT JOIN "Project" ON "Project"."id" = "Feature"."project_id"
            WHERE "Feature"."created_at" >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '11 months'
            AND "Feature"."created_at" < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
            AND "organization_id" = ${organization_id}
            GROUP BY DATE_TRUNC('month', "Feature"."created_at"), "organization_id"
            ORDER BY DATE_TRUNC('month', "Feature"."created_at");
            `;
            if (data.length === 0) {
                return result;
            }
            return {
                data: {
                    labels: data.map((item) => new Date(item.date).toISOString()),
                    values: data.map((item) => item.count),
                },
                title: 'Year Growth',
                from: new Date(data[0].date).toISOString(),
                to: new Date(data[data.length - 1].date).toISOString(),
            };
        } catch (e: any) {
            throw new BusinessException(ErrorEnum.REQUEST_FAILED_TO_EXECUTE, e.message);
        }
    }

    async growthByWeek(organization_id: string,): Promise<StatsGrowInfo> {
        try {
            const result: StatsGrowInfo = {
                data: {
                    labels: [],
                    values: [],
                },
                title: 'Week Growth',
                from: '',
                to: '',
            }
            const data = await this.rbacDBService.$queryRaw<{ date: Date, count: number }[]>`
            SELECT
                DATE("Feature"."created_at") AS date,
                COUNT(*)::int AS count,
                "Project"."organization_id" as "organization_id"
            FROM "Feature" LEFT JOIN "Project" ON "Project"."id" = "Feature"."project_id"
            WHERE "Feature"."created_at" >= CURRENT_DATE - INTERVAL '6 days'
            AND "Feature"."created_at" < CURRENT_DATE + INTERVAL '1 day'
            AND "organization_id" = ${organization_id}
            GROUP BY DATE("Feature"."created_at"), "organization_id"
            ORDER BY DATE("Feature"."created_at");
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
            throw new BusinessException(ErrorEnum.REQUEST_FAILED_TO_EXECUTE, e.message);
        }
    }

    async growthByDay(organization_id: string,): Promise<StatsGrowInfo> {
        try {
            const result: StatsGrowInfo = {
                data: {
                    labels: [],
                    values: [],
                },
                title: 'Day Growth',
                from: '',
                to: '',
            }
            const data = await this.rbacDBService.$queryRaw<{ date: Date, count: number }[]>`
            SELECT
                date_trunc('hour', "Feature"."created_at") AS date,
                COUNT(*)::int AS count,
                "Project"."organization_id" as "organization_id"
            FROM "Feature" LEFT JOIN "Project" ON "Project"."id" = "Feature"."project_id"
            WHERE "Feature"."created_at" >= date_trunc('hour', CURRENT_TIMESTAMP) - INTERVAL '23 hours'
            AND "Feature"."created_at" < date_trunc('hour', CURRENT_TIMESTAMP)+ INTERVAL '1 hour'
            AND "organization_id" = ${organization_id}
            GROUP BY date_trunc('hour', "Feature"."created_at"), "organization_id"
            ORDER BY date_trunc('hour', "Feature"."created_at");
            `;

            console.log(data);

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
            throw new BusinessException(ErrorEnum.REQUEST_FAILED_TO_EXECUTE, e.message);
        }
    }

    @LogExecutionTime()
    async paginate(pageOptions: PaginateFeaturesQuery) {
        const { data = [], paginated } =
            await paginateHelper<Prisma.FeatureGetPayload<{}>>({
                query: this.rbacDBService.feature,
                pageOptions,
                filterOptions: [
                    {
                        project_id: pageOptions.project_id,
                    }
                ]
            });

        return {
            data: data.map((item) => FeatureMapper.toDomain(item)),
            paginated,
        };
    }

    @LogExecutionTime()
    async cursorPagination(pageOptions: CursorFeaturesQuery) {
        const { data = [], paginated } =
            await cursorHelper<Prisma.FeatureGetPayload<{}>>({
                query: this.rbacDBService.feature,
                pageOptions,
                cursorField: SortableFieldEnum.CREATED_AT,
                orderDirection: SortedEnum.DESC,
                filterOptions: [
                    {
                        project_id: pageOptions.project_id,
                    }
                ]
            });

        return {
            data: data.map((item) => FeatureMapper.toDomain(item)),
            paginated,
        };
    }

    @LogExecutionTime()
    async findByProjectId(prjId: string): Promise<Feature[]> {
        const items = await this.rbacDBService.feature.findMany({
            where: {
                project_id: prjId,
            },
        });
        return items.map((item) => FeatureMapper.toDomain(item));
    }

    @LogExecutionTime()
    async findOneById(
        id: string,
        organization_id?: string,
    ): Promise<Feature | null> {
        const item = await this.getWithCache(id, async () => {
            return await this.rbacDBService.feature.findUnique({
                where: organization_id ? {
                    id,
                    project: {
                        organization_id,
                    },
                } : { id },
            });
        });

        return item ? FeatureMapper.toDomain(item) : null;
    }

    @LogExecutionTime()
    async findOneBySlug(
        slug: string,
        project_id: string,
    ): Promise<Feature | null> {
        const referenceCachedKey = `slug:${slug}:${project_id}`;
        const item = await this.getWithReference(referenceCachedKey,
            (feature) => feature.id,
            async () => {
                return await this.rbacDBService.feature.findUnique({
                    where: {
                        project_id_slug: {
                            slug,
                            project_id,
                        },
                    },
                });
            });
        return item ? FeatureMapper.toDomain(item) : null;
    }

    @LogExecutionTime()
    async create(feature: Feature): Promise<Feature> {
        const prismaData = FeatureMapper.toPrismaCreate(feature);

        const item = await this.rbacDBService.feature.create({
            data: prismaData,
        });

        if (!item) {
            throw new BusinessException(ErrorEnum.RECORD_NOT_FOUND, 'Feature');
        }

        return FeatureMapper.toDomain(item);
    }

    @LogExecutionTime()
    async update(id: string, feature: Feature): Promise<Feature> {
        const prismaData = FeatureMapper.toPrismaUpdate(feature);
        const updatedFeature = await this.rbacDBService.feature.update({
            where: { id },
            data: prismaData,
        });
        await this.invalidateCache(id);

        return FeatureMapper.toDomain(updatedFeature);
    }

    @LogExecutionTime()
    async delete(id: string): Promise<void> {
        await this.rbacDBService.feature.delete({
            where: { id },
        });
        await this.invalidateCache(id);
    }
}
