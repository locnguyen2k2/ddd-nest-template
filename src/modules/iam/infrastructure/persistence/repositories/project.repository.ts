import { ProjectEntity } from '@/modules/iam/domain/entities/project.entity';
import { IProjectRepository } from '@/modules/iam/domain/repositories/project.repository';
import { PrismaAdapter } from '@/shared/infrastructure/adapters/prisma.adapter';
import { ProjectMapper } from '../mappers/project.mapper';
import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { LogExecutionTime } from '@/common/decorators/log-execution.decorator';
import {
  cursorHelper,
  paginateHelper,
  SortableFieldEnum,
  SortedEnum,
} from '@/common/pagination';
import {
  CursorProjectsQuery,
  PaginateProjectsQuery,
} from '@/modules/iam/application/dtos/queries/project-query.dto';
import { BusinessException } from '@/common/http/business-exception';
import { ErrorEnum } from '@/common/exception.enum';
import { ProjectResponseDto } from '@/modules/iam/presentation/dtos/res/project-response.dto';

@Injectable()
export class ProjectRepository implements IProjectRepository {
  private readonly logger = new Logger(ProjectRepository.name);
  constructor(private readonly rbacDBService: PrismaAdapter) { }

  async create(project: ProjectEntity): Promise<ProjectEntity> {
    const toPrisma = ProjectMapper.toPrisma(project);
    const prj = await this.rbacDBService.project.create({
      data: toPrisma,
    });
    return ProjectMapper.toDomain(prj);
  }

  async findById(id: string): Promise<ProjectEntity | null> {
    const prj = await this.rbacDBService.project.findFirst({
      where: { id },
    });
    if (!prj) {
      return null;
    }
    return ProjectMapper.toDomain(prj);
  }

  async findBySlug(
    slug: string,
    organization_id: string,
  ): Promise<ProjectEntity | null> {
    const prj = await this.rbacDBService.project.findUnique({
      where: { slug, organization_id },
    });

    if (!prj) return null;
    return ProjectMapper.toDomain(prj);
  }

  async update(id: string, project: ProjectEntity): Promise<ProjectEntity> {
    const toPrisma = ProjectMapper.toPrisma(project);
    const prj = await this.rbacDBService.project.update({
      where: { id },
      data: toPrisma,
    });
    return ProjectMapper.toDomain(prj);
  }

  async delete(id: string): Promise<void> {
    await this.rbacDBService.project.delete({ where: { id } });
  }

  @LogExecutionTime()
  async paginate(pageOptions: PaginateProjectsQuery) {
    try {
      const { data = [], paginated } =
        await paginateHelper<ProjectResponseDto>({
          query: this.rbacDBService.project,
          pageOptions,
        });

      return {
        data: data,
        paginated,
      };
    } catch (e: any) {
      this.logger.debug(e);
      throw new BusinessException(ErrorEnum.REQUEST_FAILED_TO_QUERY);
    }
  }

  @LogExecutionTime()
  async cursorPagination(pageOptions: CursorProjectsQuery) {
    try {
      const { data = [], paginated } =
        await cursorHelper<ProjectResponseDto>({
          query: this.rbacDBService.project,
          pageOptions,
          cursorField: SortableFieldEnum.CREATED_AT,
          orderDirection: SortedEnum.DESC,
        });

      return {
        data: data,
        paginated,
      };
    } catch (e: any) {
      this.logger.debug(e);
      throw new BusinessException(ErrorEnum.REQUEST_FAILED_TO_QUERY);
    }
  }

  async findOneByFeatureId(featureId: string): Promise<ProjectEntity | null> {
    const prj = await this.rbacDBService.project.findFirst({
      where: { features: { some: { id: featureId } } },
    });
    if (!prj) {
      return null;
    }
    return ProjectMapper.toDomain(prj);
  }
}
