import { LogExecutionTime } from '@/common/decorators/log-execution.decorator';
import { ConfigKeyPaths } from '@/config';
import { CACHE_PORT, CachePort } from '@/shared/application/ports/cache.port';
import { PostgresAdapter } from '@/shared/infrastructure/adapters/postgres.adapter';
import { CacheRepository } from '@/shared/infrastructure/presistence/cache.repository';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@internal/rbac/client';
import {
  cursorHelper,
  paginateHelper,
  SortableFieldEnum,
  SortedEnum,
} from '@/common/pagination';
import { IDepartmentRepository } from '@/modules/iam/domain/repositories/department.repository';
import { DepartmentMapper } from '../mappers/department.mapper';
import { Department } from '@/modules/iam/domain/entities/department.entity';
import {
  CursorDepartmentsQuery,
  PaginateDepartmentsQuery,
} from '@/modules/iam/presentation/dtos/req/department.dto';
import { Injectable } from '@nestjs/common';
import { BusinessException } from '@/common/http/business-exception';

@Injectable()
export class DepartmentRepository
  extends CacheRepository
  implements IDepartmentRepository {
  protected readonly boundedContext: string = 'iam';
  protected readonly aggregateType: string = 'departments';
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

  @LogExecutionTime()
  async paginate(pageOptions: PaginateDepartmentsQuery) {
    try {
      const { data = [], paginated } = await paginateHelper<
        Prisma.DepartmentGetPayload<{}>
      >({
        query: this.rbacDBService.department,
        pageOptions,
      });

      return {
        data: data.map((item) => DepartmentMapper.toDomain(item)),
        paginated,
      };
    } catch (e: any) {
      throw new BusinessException(`400|${e?.message}`);
    }
  }

  @LogExecutionTime()
  async cursorPagination(pageOptions: CursorDepartmentsQuery) {
    try {
      const { data = [], paginated } = await cursorHelper<
        Prisma.DepartmentGetPayload<{}>
      >({
        query: this.rbacDBService.department,
        pageOptions,
        cursorField: SortableFieldEnum.CREATED_AT,
        orderDirection: SortedEnum.DESC,
      });

      return {
        data: data.map((item) => DepartmentMapper.toDomain(item)),
        paginated,
      };
    } catch (e: any) {
      throw new BusinessException(`400|${e?.message}`);
    }
  }

  async findById(id: string): Promise<Department | null> {
    try {
      const item = await this.getWithCache(`departments:${id}`, async () => {
        return this.rbacDBService.department.findUnique({ where: { id } });
      });
      if (!item) return null;
      return DepartmentMapper.toDomain(item);
    } catch (e: any) {
      throw new BusinessException(`400|${e?.message}`);
    }
  }
  async findBySlug(slug: string, orgId: string): Promise<Department | null> {
    try {
      const item = await this.getWithCache(
        `department:org:${orgId}:slug:${slug}`,
        async () => {
          return this.rbacDBService.department.findUnique({
            where: {
              organization_id_slug: { organization_id: orgId, slug: slug },
            },
          });
        },
      );
      if (!item) return null;
      return DepartmentMapper.toDomain(item);
    } catch (e: any) {
      throw new BusinessException(`400|${e?.message}`);
    }
  }
  async findByOrgId(orgId: string): Promise<Department[]> {
    try {
      const items = await this.getWithCache(
        `departments:org:${orgId}`,
        async () => {
          return this.rbacDBService.department.findMany({
            where: { organization_id: orgId },
          });
        },
      );
      if (!items) return [];
      return items.map((item) => DepartmentMapper.toDomain(item));
    } catch (e: any) {
      throw new BusinessException(`400|${e?.message}`);
    }
  }
  async create(data: any): Promise<Department> {
    try {
      const item = await this.rbacDBService.department.create({ data });
      await this.invalidateCache(`departments:${item.id}`);
      return DepartmentMapper.toDomain(item);
    } catch (e: any) {
      throw new BusinessException(`400|${e?.message}`);
    }
  }
  async update(data: any): Promise<Department> {
    try {
      const item = await this.rbacDBService.department.update({
        where: { id: data.id },
        data,
      });
      await this.invalidateCache(`departments:${item.id}`);
      return DepartmentMapper.toDomain(item);
    } catch (e: any) {
      throw new BusinessException(`400|${e?.message}`);
    }
  }
  async delete(id: string) {
    try {
      await this.rbacDBService.department.delete({ where: { id } });
      await this.invalidateCache(`departments:${id}`);
    } catch (e: any) {
      throw new BusinessException(`400|${e?.message}`);
    }
  }
  async deleteByOrgId(orgId: string) {
    try {
      await this.rbacDBService.department.deleteMany({
        where: { organization_id: orgId },
      });
      await this.invalidateCache(`departments:org:${orgId}`);
    } catch (e: any) {
      throw new BusinessException(`400|${e?.message}`);
    }
  }
}
