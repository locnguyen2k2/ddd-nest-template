import { ErrorEnum } from '@/common/exception.enum';
import { BusinessException } from '@/common/http/business-exception';
import {
  IProjectRepository,
  PROJECT_REPO,
} from '@/modules/iam/domain/repositories/project.repository';
import { Inject, Injectable } from '@nestjs/common';
import {
  CursorProjectsQuery,
  GetProjectByIdQuery,
  GetProjectBySlugQuery,
  PaginateProjectsQuery,
} from '../../dtos/queries/project-query.dto';
import { LogExecutionTime } from '@/common/decorators/log-execution.decorator';
import { ProjectEntity } from '@/modules/iam/domain/entities/project.entity';

@Injectable()
export class ProjectQueryHandler {
  constructor(
    @Inject(PROJECT_REPO) private readonly projectRepo: IProjectRepository,
  ) { }

  @LogExecutionTime()
  async handlerGetByID(query: GetProjectByIdQuery): Promise<ProjectEntity | null> {
    const item = await this.projectRepo.findById(query.id);
    if (!item) throw new BusinessException(ErrorEnum.RECORD_NOT_FOUND);
    return item;
  }

  @LogExecutionTime()
  async handlerGetProjectBySlug(
    query: GetProjectBySlugQuery,
  ): Promise<ProjectEntity | null> {
    const item = await this.projectRepo.findBySlug(
      query.slug,
      query.organization_id,
    );
    if (!item) throw new BusinessException(ErrorEnum.RECORD_NOT_FOUND);
    return item;
  }

  @LogExecutionTime()
  async handlerGetProjectByFeatureId(featureId: string) {
    const item = await this.projectRepo.findOneByFeatureId(featureId);
    if (!item) throw new BusinessException(ErrorEnum.RECORD_NOT_FOUND);
    return item;
  }

  @LogExecutionTime()
  async handlePaginate(query: PaginateProjectsQuery) {
    return await this.projectRepo.paginate(query);
  }

  @LogExecutionTime()
  async handleCursorPaginate(query: CursorProjectsQuery) {
    return await this.projectRepo.cursorPagination(query);
  }
}
