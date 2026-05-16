import { Injectable } from '@nestjs/common';
import {
  IEnvironmentRepository,
  ENVIRONMENT_REPO,
} from '@/modules/iam/domain/repositories/evironment.repository';
import { EnvironmentEntity } from '@/modules/iam/domain/entities/environment.entity';
import { PrismaAdapter } from '@/shared/infrastructure/adapters/prisma.adapter';
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

@Injectable()
export class EnvironmentRepository implements IEnvironmentRepository {
  constructor(private readonly prisma: PrismaAdapter) {}

  async cursorPagination(pageOptions: CursorEnvironmentsQuery) {
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
  }

  async paginate(pageOptions: PaginateEnvironmentsQuery) {
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
  }

  async create(environment: EnvironmentEntity): Promise<EnvironmentEntity> {
    const toPrisma = EnvironmentMapper.toPrismaCreate(environment);
    const result = await this.prisma.environment.create({ data: toPrisma });
    return EnvironmentMapper.toDomain(result);
  }

  async update(environment: EnvironmentEntity): Promise<EnvironmentEntity> {
    const toPrisma = EnvironmentMapper.toPrismaUpdate(environment);
    const result = await this.prisma.environment.update({
      where: { id: environment.id.value },
      data: toPrisma,
    });
    return EnvironmentMapper.toDomain(result);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.environment.delete({ where: { id } });
  }

  async findById(id: string): Promise<EnvironmentEntity | null> {
    const result = await this.prisma.environment.findUnique({ where: { id } });
    if (!result) return null;
    return EnvironmentMapper.toDomain(result);
  }

  async findBySlug(slug: string): Promise<EnvironmentEntity | null> {
    const result = await this.prisma.environment.findUnique({
      where: { slug },
    });
    if (!result) return null;
    return EnvironmentMapper.toDomain(result);
  }

  async findAll(): Promise<EnvironmentEntity[]> {
    const results = await this.prisma.environment.findMany();
    return results.map((result) => EnvironmentMapper.toDomain(result));
  }
}
