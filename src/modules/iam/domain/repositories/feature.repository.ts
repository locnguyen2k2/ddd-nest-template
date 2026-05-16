import { StatsGrowInfo } from '@/common/interfaces/stats.interface';
import { Feature } from '../entities/feature.entity';
import {
  IPaginate,
  ICursor,
} from '@/shared/domain/repositories/base.repository';

export const FEATURE_REPO = Symbol('FEATURE_REPO');
export interface IFeatureRepository
  extends IPaginate<Feature>, ICursor<Feature> {
  findOneById(id: string, organization_id?: string): Promise<Feature | null>;
  findOneBySlug(slug: string, prj_id: string): Promise<Feature | null>;
  create(data: Feature): Promise<Feature>;
  update(id: string, data: Feature): Promise<Feature>;
  delete(id: string): Promise<void>;
  findByProjectId(prjId: string): Promise<Feature[]>;

  growthByMonth(organization_id: string): Promise<StatsGrowInfo>;
  growthByYear(organization_id: string): Promise<StatsGrowInfo>;
  growthByWeek(organization_id: string): Promise<StatsGrowInfo>;
  growthByDay(organization_id: string): Promise<StatsGrowInfo>;

  countBeforeByMonth(org_id: string): Promise<number>;
  countByMonth(org_id: string): Promise<number>;
}
