import { Inject, Injectable } from '@nestjs/common';
import { IFeatureRepository } from '@/modules/iam/domain/repositories/feature.repository';
import { Feature } from '@/modules/iam/domain/entities/feature.entity';
import { GetFeatureByIdQuery, GetFeatureBySlugQuery, ListFeaturesQuery, PaginateFeaturesQuery, CursorFeaturesQuery } from '../../dtos/queries/feature-query.dto';
import { FEATURE_REPO } from '@/modules/iam/domain/repositories/feature.repository';
import { LogExecutionTime } from '@/common/decorators/log-execution.decorator';

@Injectable()
export class FeatureQueryHandler {
    constructor(@Inject(FEATURE_REPO) private readonly featureRepository: IFeatureRepository) { }

    @LogExecutionTime()
    async handleGetFeatureById(query: GetFeatureByIdQuery): Promise<Feature | null> {
        return await this.featureRepository.findOneById(query.id);
    }

    @LogExecutionTime()
    async handleGetFeatureBySlug(query: GetFeatureBySlugQuery): Promise<Feature | null> {
        return await this.featureRepository.findOneBySlug(query.slug);
    }

    async handleListFeatures(query: ListFeaturesQuery): Promise<{
        features: Feature[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        const { page = 1, limit = 10, search } = query;
        const skip = (page - 1) * limit;

        // For now, we'll implement basic pagination. In a real implementation,
        // you might want to add search functionality to the repository
        const features = await this.featureRepository.findAll();

        let filteredFeatures = features;

        // Apply search filter if provided
        if (search) {
            const searchLower = search.toLowerCase();
            filteredFeatures = features.filter(feature =>
                feature.getName().toLowerCase().includes(searchLower) ||
                feature.getSlug().value.toLowerCase().includes(searchLower) ||
                (feature.getDescription()?.toLowerCase().includes(searchLower) ?? false)
            );
        }

        // Apply pagination
        const paginatedFeatures = filteredFeatures.slice(skip, skip + limit);
        const total = filteredFeatures.length;
        const totalPages = Math.ceil(total / limit);

        return {
            features: paginatedFeatures,
            total,
            page,
            limit,
            totalPages,
        };
    }

    @LogExecutionTime()
    async handlePaginate(query: PaginateFeaturesQuery) {
        return await this.featureRepository.paginate(query);
    }

    @LogExecutionTime()
    async handleCursorPaginate(query: CursorFeaturesQuery) {
        return await this.featureRepository.cursorPagination(query);
    }
}
