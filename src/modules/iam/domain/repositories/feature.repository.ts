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
  create(data: any): Promise<Feature>;
  update(id: string, data: any): Promise<Feature>;
  delete(id: string): Promise<void>;
}
