import { Inject, Injectable } from '@nestjs/common';
import { IFeatureRepository } from '@/modules/iam/domain/repositories/feature.repository';
import { Feature } from '@/modules/iam/domain/entities/feature.entity';
import {
  GetFeatureByIdQuery,
  GetFeatureBySlugQuery,
  ListFeaturesQuery,
  PaginateFeaturesQuery,
  CursorFeaturesQuery,
} from '../../dtos/queries/feature-query.dto';
import { FEATURE_REPO } from '@/modules/iam/domain/repositories/feature.repository';
import { LogExecutionTime } from '@/common/decorators/log-execution.decorator';
import { AccessControlStatus } from '@/common/enum';

@Injectable()
export class FeatureQueryHandler {
  constructor(
    @Inject(FEATURE_REPO)
    private readonly featureRepository: IFeatureRepository,
  ) { }

  @LogExecutionTime()
  async handleGetFeatureRoles(prj_id: string, slug: string) {
  }

  @LogExecutionTime()
  async handleGetFeatureById(
    query: GetFeatureByIdQuery,
  ): Promise<Feature | null> {
    return await this.featureRepository.findOneById(query.id);
  }

  @LogExecutionTime()
  async handleGetFeatureBySlug(
    query: GetFeatureBySlugQuery,
  ): Promise<Feature | null> {
    return await this.featureRepository.findOneBySlug(
      query.slug,
      query.organization_id,
    );
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
