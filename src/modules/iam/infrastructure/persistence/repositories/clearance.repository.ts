import { Injectable } from '@nestjs/common';
import {
  IClearanceRepository,
  CLEARANCE_REPO,
} from '@/modules/iam/domain/repositories/clearance.repository';
import { ClearanceEntity } from '@/modules/iam/domain/entities/clearance.entity';
import { PostgresAdapter } from '@/shared/infrastructure/adapters/postgres.adapter';
import { ClearanceMapper } from '../mappers/clearance.mapper';
import {
  cursorHelper,
  paginateHelper,
  SortableFieldEnum,
  SortedEnum,
} from '@/common/pagination';
import {
  CursorClearancesQuery,
  PaginateClearancesQuery,
} from '@/modules/iam/presentation/dtos/req/clearance-request.dto';
import { Prisma } from '@internal/rbac/client';

@Injectable()
export class ClearanceRepository implements IClearanceRepository {
  constructor(private readonly prisma: PostgresAdapter) { }

  async cursorPagination(pageOptions: CursorClearancesQuery) {
    const { data = [], paginated } = await cursorHelper<
      Prisma.ClearanceGetPayload<{}>
    >({
      query: this.prisma.clearance,
      pageOptions,
      cursorField: SortableFieldEnum.CREATED_AT,
      orderDirection: SortedEnum.DESC,
    });

    return {
      data: data.map((item) => ClearanceMapper.toDomain(item)),
      paginated,
    };
  }

  async paginate(pageOptions: PaginateClearancesQuery) {
    const { data = [], paginated } = await paginateHelper<
      Prisma.ClearanceGetPayload<{}>
    >({
      query: this.prisma.clearance,
      pageOptions,
    });

    return {
      data: data.map((item) => ClearanceMapper.toDomain(item)),
      paginated,
    };
  }

  async create(clearance: ClearanceEntity): Promise<ClearanceEntity> {
    const toPrisma = ClearanceMapper.toPrismaCreate(clearance);
    const result = await this.prisma.clearance.create({ data: toPrisma });
    return ClearanceMapper.toDomain(result);
  }

  async update(clearance: ClearanceEntity): Promise<ClearanceEntity> {
    const toPrisma = ClearanceMapper.toPrismaUpdate(clearance);
    const result = await this.prisma.clearance.update({
      where: { id: clearance.id.value },
      data: toPrisma,
    });
    return ClearanceMapper.toDomain(result);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.clearance.delete({ where: { id } });
  }

  async findById(id: string): Promise<ClearanceEntity | null> {
    const result = await this.prisma.clearance.findUnique({ where: { id } });
    if (!result) return null;
    return ClearanceMapper.toDomain(result);
  }

  async findByLevel(level: number): Promise<ClearanceEntity | null> {
    const result = await this.prisma.clearance.findUnique({ where: { level } });
    if (!result) return null;
    return ClearanceMapper.toDomain(result);
  }

  async findAll(): Promise<ClearanceEntity[]> {
    const results = await this.prisma.clearance.findMany();
    return results.map((result) => ClearanceMapper.toDomain(result));
  }
}
