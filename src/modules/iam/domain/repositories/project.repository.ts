import { ProjectEntity } from '../entities/project.entity';
import { ProjectResponseDto } from '../../presentation/dtos/res/project-response.dto';
import {
  IPaginate,
  ICursor,
} from '@/shared/domain/repositories/base.repository';

export const PROJECT_REPO = 'PROJECT_REPOSITORY';
export interface IProjectRepository
  extends IPaginate<ProjectResponseDto>, ICursor<ProjectResponseDto> {
  create(project: ProjectEntity): Promise<ProjectEntity>;
  findById(id: string): Promise<ProjectEntity | null>;
  findOneByFeatureId(featureId: string): Promise<ProjectEntity | null>;
  findBySlug(
    slug: string,
    organization_id: string,
  ): Promise<ProjectEntity | null>;
  update(id: string, project: ProjectEntity): Promise<ProjectEntity>;
  delete(id: string): Promise<void>;
}
