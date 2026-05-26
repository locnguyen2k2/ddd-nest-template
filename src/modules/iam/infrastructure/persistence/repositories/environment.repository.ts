import { Injectable } from '@nestjs/common';
import {
  IEnvironmentRepository,
  ENVIRONMENT_REPO,
} from '@/modules/iam/domain/repositories/evironment.repository';
import { EnvironmentEntity } from '@/modules/iam/domain/entities/environment.entity';
import { PostgresAdapter } from '@/shared/infrastructure/adapters/postgres.adapter';
import { EnvironmentMapper } from '../mappers/environment.mapper';
import {
  cursorHelper,
  paginateHelper,
  SortableFieldEnum,
  SortedEnum,
} from '@/common/pagination';
import {
  CursorEnvironmentsQuery,
  PaginateEnvironmentsQuery,
} from '@/modules/iam/presentation/dtos/req/environment-request.dto';
import { Prisma } from '@internal/rbac/client';
import { BusinessException } from '@/common/http/business-exception';

@Injectable()
export class EnvironmentRepository implements IEnvironmentRepository {
  constructor(private readonly prisma: PostgresAdapter) { }

  async cursorPagination(pageOptions: CursorEnvironmentsQuery) {
    try {
      const { data = [], paginated } = await cursorHelper<
        Prisma.EnvironmentGetPayload<{}>
      >({
        query: this.prisma.environment,
        pageOptions,
        cursorField: SortableFieldEnum.CREATED_AT,
        orderDirection: SortedEnum.DESC,
      });

      return {
        data: data.map((item) => EnvironmentMapper.toDomain(item)),
        paginated,
      };
    } catch (e: any) { throw new BusinessException(`400|${e?.message}`); }
  }

  async paginate(pageOptions: PaginateEnvironmentsQuery) {
    try {
      const { data = [], paginated } = await paginateHelper<
        Prisma.EnvironmentGetPayload<{}>
      >({
        query: this.prisma.environment,
        pageOptions,
      });

      return {
        data: data.map((item) => EnvironmentMapper.toDomain(item)),
        paginated,
      };
    } catch (e: any) { throw new BusinessException(`400|${e?.message}`); }
  }

  async create(environment: EnvironmentEntity): Promise<EnvironmentEntity> {
    try {
      const toPrisma = EnvironmentMapper.toPrismaCreate(environment);
      const result = await this.prisma.environment.create({ data: toPrisma });
      return EnvironmentMapper.toDomain(result);
    } catch (e: any) { throw new BusinessException(`400|${e?.message}`); }
  }

  async update(environment: EnvironmentEntity): Promise<EnvironmentEntity> {
    try {
      const toPrisma = EnvironmentMapper.toPrismaUpdate(environment);
      const result = await this.prisma.environment.update({
        where: { id: environment.id.value },
        data: toPrisma,
      });
      return EnvironmentMapper.toDomain(result);
    } catch (e: any) { throw new BusinessException(`400|${e?.message}`); }
  }

  async delete(id: string): Promise<void> {
    try { await this.prisma.environment.delete({ where: { id } }); } catch (e: any) { throw new BusinessException(`400|${e?.message}`); }
  }

  async findById(id: string): Promise<EnvironmentEntity | null> {
    try {
      const result = await this.prisma.environment.findUnique({ where: { id } });
      if (!result) return null;
      return EnvironmentMapper.toDomain(result);
    } catch (e: any) { throw new BusinessException(`400|${e?.message}`); }
  }

  async findBySlug(slug: string): Promise<EnvironmentEntity | null> {
    try {
      const result = await this.prisma.environment.findUnique({
        where: { slug },
      });
      if (!result) return null;
      return EnvironmentMapper.toDomain(result);
    } catch (e: any) { throw new BusinessException(`400|${e?.message}`); }
  }

  async findAll(): Promise<EnvironmentEntity[]> {
    try {
      const results = await this.prisma.environment.findMany();
      return results.map((result) => EnvironmentMapper.toDomain(result));
    } catch (e: any) { throw new BusinessException(`400|${e?.message}`); }
  }
}
