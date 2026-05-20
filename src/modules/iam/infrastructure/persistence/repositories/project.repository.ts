import { ProjectEntity } from '@/modules/iam/domain/entities/project.entity';
import { IProjectRepository } from '@/modules/iam/domain/repositories/project.repository';
import { PostgresAdapter } from '@/shared/infrastructure/adapters/postgres.adapter';
import { ProjectMapper } from '../mappers/project.mapper';
import { Inject, Injectable } from '@nestjs/common';
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
import { CacheRepository } from '@/shared/infrastructure/presistence/cache.repository';
import { ConfigService } from '@nestjs/config';
import { ConfigKeyPaths } from '@/config';
import { CACHE_PORT, CachePort } from '@/shared/application/ports/cache.port';

@Injectable()
export class ProjectRepository
  extends CacheRepository
  implements IProjectRepository {
  private readonly logger = new Logger(ProjectRepository.name);
  protected readonly boundedContext: string = 'iam';
  protected readonly aggregateType: string = 'project';
  protected readonly ttlConfig: { [key: string]: number } = {
    default: 3600,
  };
  constructor(
    private readonly rbacDBService: PostgresAdapter,
    redisConfig: ConfigService<ConfigKeyPaths>,
    @Inject(CACHE_PORT) cachePort: CachePort,
  ) {
    super(redisConfig, cachePort);
  }

  async countBeforeByMonth(org_id: string): Promise<number> {
    try {
      const result = await this.rbacDBService.$queryRaw<{ count: number }[]>`
      WITH month_info AS (
          SELECT
              DATE_TRUNC('month', CURRENT_DATE)::date AS month_start,
              (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::date AS month_end
      ),
          month_days AS (
              SELECT (month_end - month_start + 1) AS days_in_month
              FROM month_info
          )
      SELECT COUNT(*)::int
      FROM "Project"
      WHERE created_at < CURRENT_DATE - (SELECT days_in_month - 1 FROM month_days) * INTERVAL '1 day' AND organization_id = ${org_id};
      `;
      return result[0].count;
    } catch (e: any) {
      throw new BusinessException(ErrorEnum.REQUEST_FAILED_TO_QUERY);
    }
  }

  async countByMonth(org_id: string): Promise<number> {
    try {
      const result = await this.rbacDBService.$queryRaw<{ count: number }[]>`
      WITH month_info AS (
          SELECT
              DATE_TRUNC('month', CURRENT_DATE)::date AS month_start,
              (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::date AS month_end
      ),
          month_days AS (
              SELECT (month_end - month_start + 1) AS days_in_month
              FROM month_info
          ),
          range_start AS (
              SELECT CURRENT_DATE - (days_in_month - 1) * INTERVAL '1 day' AS start_date
      FROM month_days
          )
      SELECT
          COUNT(*)::int AS count
      FROM "Project" prj
          JOIN range_start r
      ON prj.created_at >= r.start_date
      WHERE DATE(prj.created_at) <= CURRENT_DATE AND prj.organization_id = ${org_id};
              `;
      return result[0].count;
    } catch (e: any) {
      throw new BusinessException(
        ErrorEnum.REQUEST_FAILED_TO_EXECUTE,
        e.message,
      );
    }
  }

  async create(project: ProjectEntity): Promise<ProjectEntity> {
    const toPrisma = ProjectMapper.toPrismaCreate(project);
    const prj = await this.rbacDBService.project.create({
      data: {
        ...toPrisma,
        id: project.id.value,
      },
    });
    return ProjectMapper.toDomain(prj);
  }

  async findById(id: string): Promise<ProjectEntity | null> {
    const prj = await this.getWithCache(
      id,
      async () =>
        await this.rbacDBService.project.findFirst({
          where: { id },
          include: { department: true },
        }),
    );
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
      include: { department: true },
    });

    if (!prj) return null;
    return ProjectMapper.toDomain(prj);
  }

  async update(id: string, project: ProjectEntity): Promise<ProjectEntity> {
    const toPrisma = ProjectMapper.toPrismaUpdate(project);
    const prj = await this.rbacDBService.project.update({
      where: { id },
      data: toPrisma,
    });
    await this.invalidateCache(id);
    return ProjectMapper.toDomain(prj);
  }

  async delete(id: string): Promise<void> {
    await this.rbacDBService.project.delete({ where: { id } });
    await this.invalidateCache(id);
  }

  @LogExecutionTime()
  async paginate(pageOptions: PaginateProjectsQuery) {
    try {
      const { data = [], paginated } = await paginateHelper<ProjectResponseDto>(
        {
          query: this.rbacDBService.project,
          pageOptions,
          filterOptions: [
            {
              organization_id: pageOptions.organization_id,
            },
          ],
        },
      );

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
      const { data = [], paginated } = await cursorHelper<ProjectResponseDto>({
        query: this.rbacDBService.project,
        pageOptions,
        cursorField: SortableFieldEnum.CREATED_AT,
        orderDirection: SortedEnum.DESC,
        filterOptions: [
          {
            organization_id: pageOptions.organization_id,
          },
        ],
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
