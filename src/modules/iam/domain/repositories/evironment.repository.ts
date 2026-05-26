import {
  IPaginate,
  ICursor,
} from '@/shared/domain/repositories/base.repository';
import { EnvironmentEntity } from '../entities/environment.entity';

export const ENVIRONMENT_REPO = 'ENVIRONMENT_REPOSITORY';

export interface IEnvironmentRepository
  extends IPaginate<EnvironmentEntity>, ICursor<EnvironmentEntity> {
  create(environment: EnvironmentEntity): Promise<EnvironmentEntity>;
  update(environment: EnvironmentEntity): Promise<EnvironmentEntity>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<EnvironmentEntity | null>;
  findBySlug(slug: string): Promise<EnvironmentEntity | null>;
  findAll(): Promise<EnvironmentEntity[]>;
}
