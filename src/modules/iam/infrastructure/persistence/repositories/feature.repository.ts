import { Injectable, Logger } from "@nestjs/common";
import { IFeatureRepository } from "@/modules/iam/domain/repositories/feature.repository";
import { Feature } from "@/modules/iam/domain/entities/feature.entity";
import { FeatureMapper } from "../mappers/feature.mapper";
import { PrismaService } from "@/shared/infrastructure/database/prisma.service";
import { LogExecutionTime } from "@/common/decorators/log-execution.decorator";
import { cursorHelper, paginateHelper, SortableFieldEnum, SortedEnum } from "@/common/pagination";
import { CursorFeaturesQuery, PaginateFeaturesQuery } from "@/modules/iam/application/dtos/queries/feature-query.dto";
import { Prisma } from "@prisma/client";

@Injectable()
export class FeatureRepository implements IFeatureRepository {
    private readonly logger = new Logger(FeatureRepository.name);

    constructor(private readonly rbacDBService: PrismaService) { }

    @LogExecutionTime()
    async paginate(pageOptions: PaginateFeaturesQuery) {
        const { data = [], paginated } = await paginateHelper<Prisma.FeatureCreateInput>({
            query: this.rbacDBService.feature,
            pageOptions,
        });

        return {
            data: data.map(item => FeatureMapper.toDomain(item)),
            paginated
        };
    }

    @LogExecutionTime()
    async cursorPagination(pageOptions: CursorFeaturesQuery) {
        const { data = [], paginated } = await cursorHelper<Prisma.FeatureCreateInput>({
            query: this.rbacDBService.feature,
            pageOptions,
            cursorField: SortableFieldEnum.CREATED_AT,
            orderDirection: SortedEnum.DESC,
        });

        return {
            data: data.map(item => FeatureMapper.toDomain(item)),
            paginated
        };
    }

    @LogExecutionTime()
    async findOneById(id: string): Promise<Feature | null> {
        const prismaFeature = await this.rbacDBService.feature.findUnique({
            where: { id }
        });

        return prismaFeature ? FeatureMapper.toDomain(prismaFeature) : null;
    }

    @LogExecutionTime()
    async findOneBySlug(slug: string): Promise<Feature | null> {
        const prismaFeature = await this.rbacDBService.feature.findUnique({
            where: { slug }
        });

        return prismaFeature ? FeatureMapper.toDomain(prismaFeature) : null;
    }

    @LogExecutionTime()
    async findAll(): Promise<Feature[]> {
        const prismaFeatures = await this.rbacDBService.feature.findMany();
        return prismaFeatures.map(feature => FeatureMapper.toDomain(feature));
    }

    @LogExecutionTime()
    async create(feature: Feature): Promise<Feature> {
        const prismaData = FeatureMapper.toPrisma(feature);
        const createdFeature = await this.rbacDBService.feature.create({
            data: prismaData
        });

        return FeatureMapper.toDomain(createdFeature);
    }

    @LogExecutionTime()
    async update(id: string, feature: Feature): Promise<Feature> {
        const prismaData = FeatureMapper.toPrismaUpdate(feature);
        const updatedFeature = await this.rbacDBService.feature.update({
            where: { id },
            data: prismaData
        });

        return FeatureMapper.toDomain(updatedFeature);
    }

    @LogExecutionTime()
    async delete(id: string): Promise<void> {
        await this.rbacDBService.feature.delete({
            where: { id }
        });
    }
}