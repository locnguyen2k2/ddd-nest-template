import { Injectable, Logger } from '@nestjs/common';
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
import { Prisma, Role } from '@internal/rbac/client';
import { CacheRepository } from '@/shared/infrastructure/presistence/cache.repository';
import { ConfigService } from '@nestjs/config';
import { Inject } from '@nestjs/common';
import { ConfigKeyPaths } from '@/config';
import { CACHE_PORT, CachePort } from '@/shared/application/ports/cache.port';
import { Feature } from '@/modules/iam/domain/entities/feature.entity';
import { BusinessException } from '@/common/http/business-exception';
import { ErrorEnum } from '@/common/exception.enum';

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

    @LogExecutionTime()
    async paginate(pageOptions: PaginateFeaturesQuery) {
        const { data = [], paginated } =
            await paginateHelper<Prisma.FeatureGetPayload<{}>>({
                query: this.rbacDBService.feature,
                pageOptions,
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
            });

        return {
            data: data.map((item) => FeatureMapper.toDomain(item)),
            paginated,
        };
    }

    @LogExecutionTime()
    async findOneById(
        id: string,
    ): Promise<Feature | null> {
        const item = await this.getWithCache(id, async () => {
            return await this.rbacDBService.feature.findUnique({
                where: { id },
                include: {
                    role_feature_permissions: true,
                },
            });
        });

        return item ? FeatureMapper.toDomainWithRoles(item) : null;
    }

    @LogExecutionTime()
    async findOneBySlug(
        slug: string,
        project_id: string,
    ): Promise<Feature | null> {
        // const item = await this.getWithCache(`${slug}:${project_id}`, async () => {
        //     return await this.rbacDBService.feature.findUnique({
        //         where: {
        //             project_id_slug: {
        //                 slug,
        //                 project_id,
        //             },
        //         },
        //         include: {
        //             role_feature_permissions: true,
        //         },
        //     });
        // });
        const item = await this.rbacDBService.feature.findUnique({
            where: {
                project_id_slug: {
                    slug,
                    project_id,
                },
            },
            include: {
                role_feature_permissions: true,
            },
        });
        return item ? FeatureMapper.toDomainWithRoles(item) : null;
    }

    @LogExecutionTime()
    async create(feature: Feature): Promise<Feature> {
        const prismaData = FeatureMapper.toPrisma(feature);

        const item = await this.getWithCache('', async () => {
            return await this.rbacDBService.feature.create({
                data: prismaData,
            });
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
