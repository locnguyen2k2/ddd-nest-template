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
import { Period } from '@/common/enum';
import { StatsPercentInfo } from '@/common/interfaces/stats.interface';

@Injectable()
export class ProjectQueryHandler {
  constructor(
    @Inject(PROJECT_REPO) private readonly projectRepo: IProjectRepository,
  ) { }

  private readonly percentGrowthCalc = {
    [Period.MONTH]: async (user_id: string) => this.percentByMonth(user_id),
  };

  async percentGrowth(user_id: string, period?: string): Promise<number> {
    return await this.percentGrowthCalc[period || Period.MONTH](user_id);
  }

  async percentByMonth(user_id: string): Promise<StatsPercentInfo> {
    let result: StatsPercentInfo = {
      percent_growth: 0,
      total: 0,
      current: 0,
      title: '',
    }
    try {
      const [beforeCount, currentCount] = await Promise.all([
        this.projectRepo.countBeforeByMonth(user_id),
        this.projectRepo.countByMonth(user_id),
      ]);
      if (beforeCount === 0) {
        result.percent_growth = 100;
      } else {
        result.percent_growth = (currentCount - beforeCount) / beforeCount;
      }
      result.total = currentCount + beforeCount;
      result.current = currentCount;
      return result;
    } catch (error) {
      console.error(error);
      return result;
    }
  }
  
  @LogExecutionTime()
  async handlerGetByID(query: GetProjectByIdQuery): Promise<ProjectEntity | null> {
    const item = await this.projectRepo.findById(query.id);
    if (!item) throw new BusinessException(ErrorEnum.RECORD_NOT_FOUND);

    if (query.organization_id && item.organizationID !== query.organization_id) {
      throw new BusinessException(ErrorEnum.ACCESS_DENIED, 'Project does not belong to your organization');
    }

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
