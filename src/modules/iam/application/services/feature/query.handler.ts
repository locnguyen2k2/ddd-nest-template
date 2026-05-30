import { Inject, Injectable } from '@nestjs/common';
import { IFeatureRepository } from '@/modules/iam/domain/repositories/feature.repository';
import { Feature } from '@/modules/iam/domain/entities/feature.entity';
import {
  GetFeatureByIdQuery,
  GetFeatureBySlugQuery,
  PaginateFeaturesQuery,
  CursorFeaturesQuery,
} from '../../dtos/queries/feature-query.dto';
import { FEATURE_REPO } from '@/modules/iam/domain/repositories/feature.repository';
import { LogExecutionTime } from '@/common/decorators/log-execution.decorator';
import { Period } from '@/common/enum';
import {
  StatsGrowInfo,
  StatsPercentInfo,
} from '@/common/interfaces/stats.interface';

@Injectable()
export class FeatureQueryHandler {
  constructor(
    @Inject(FEATURE_REPO)
    private readonly featureRepository: IFeatureRepository,
  ) { }

  private readonly percentGrowthCalc = {
    [Period.MONTH]: async (org_id: string) => this.handlePercentByMonth(org_id),
  };

  private readonly statsGrowth = {
    [Period.WEEK]: async (organization_id: string) =>
      this.featureRepository.growthByWeek(organization_id),
    [Period.MONTH]: async (organization_id: string) =>
      this.featureRepository.growthByMonth(organization_id),
    [Period.DAY]: async (organization_id: string) =>
      this.featureRepository.growthByDay(organization_id),
    [Period.YEAR]: async (organization_id: string) =>
      this.featureRepository.growthByYear(organization_id),
  };

  async growth(
    organization_id: string,
    period?: string,
  ): Promise<StatsGrowInfo> {
    const data = await this.statsGrowth[period || Period.MONTH](organization_id);
    if (data.length === 0) {
      return {
        data: {
          labels: [],
          values: [],
        },
        title: 'Feature Growth',
        from: new Date().toISOString(),
        to: new Date().toISOString(),
        max: { label: '', value: 0 },
        min: { label: '', value: 0 },
      };
    }
    let max = { label: '', value: 0 };
    let min = { label: '', value: 0 };
    data.forEach((item) => {
      if (item.count > max.value) {
        max = { label: new Date(item.date).toISOString(), value: item.count };
      }
      if (item.count < min.value) {
        min = { label: new Date(item.date).toISOString(), value: item.count };
      }
    });
    return {
      data: {
        labels: data.map((item) => new Date(item.date).toISOString()),
        values: data.map((item) => item.count),
      },
      title: 'Feature Growth',
      from: new Date(data[0].date).toISOString(),
      to: new Date(data[data.length - 1].date).toISOString(),
      max,
      min,
    };
  }

  async percentGrowth(
    org_id: string,
    period?: string,
  ): Promise<StatsPercentInfo> {
    return await this.percentGrowthCalc[period || Period.MONTH](org_id);
  }

  @LogExecutionTime()
  async handlePercentByMonth(orgId: string): Promise<StatsPercentInfo> {
    let result: StatsPercentInfo = {
      percent_growth: 0,
      total: 0,
      current: 0,
      title: 'Feature Growth',
    };
    try {
      const [beforeCount, currentCount] = await Promise.all([
        this.featureRepository.countBeforeByMonth(orgId),
        this.featureRepository.countByMonth(orgId),
      ]);

      if (beforeCount === 0) {
        result.percent_growth = 100;
      } else {
        result.percent_growth = (currentCount - beforeCount) / beforeCount;
      }
      result.total = beforeCount + currentCount;
      result.current = currentCount;
    } catch (error) {
      console.error(error);
    }
    return result;
  }

  @LogExecutionTime()
  async handleGetFeatureGrowth(organization_id: string, period?: string) {
    return await this.growth(organization_id, period);
  }

  @LogExecutionTime()
  async handleGetFeatureRoles(prj_id: string, slug: string) { }

  @LogExecutionTime()
  async handleGetById(
    query: GetFeatureByIdQuery,
  ): Promise<Feature | null> {
    return await this.featureRepository.findOneById(
      query.id,
      query.organization_id,
    );
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
