import { LogExecutionTime } from '@/common/decorators/log-execution.decorator';
import { ConfigKeyPaths } from '@/config';
import { Member } from '@/modules/iam/domain/entities/member.entity';
import { IMemberRepository } from '@/modules/iam/domain/repositories/member.repository';
import { CACHE_PORT, CachePort } from '@/shared/application/ports/cache.port';
import { PostgresAdapter } from '@/shared/infrastructure/adapters/postgres.adapter';
import { CacheRepository } from '@/shared/infrastructure/presistence/cache.repository';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@internal/rbac/client';
import {
  CursorMembersQuery,
  PaginateMembersQuery,
} from '@/modules/iam/presentation/dtos/req/member.dto';
import {
  cursorHelper,
  paginateHelper,
  SortableFieldEnum,
  SortedEnum,
} from '@/common/pagination';
import { MemberMapper } from '../mappers/member.mapper';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MemberRepository
  extends CacheRepository
  implements IMemberRepository {
  protected readonly boundedContext: string = 'iam';
  protected readonly aggregateType: string = 'members';
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
  async paginate(pageOptions: PaginateMembersQuery) {
    const { data = [], paginated } = await paginateHelper<
      Prisma.MemberGetPayload<{}>
    >({
      query: this.rbacDBService.member,
      pageOptions,
    });

    return {
      data: data.map((item) => MemberMapper.toDomain(item)),
      paginated,
    };
  }

  @LogExecutionTime()
  async cursorPagination(pageOptions: CursorMembersQuery) {
    const { data = [], paginated } = await cursorHelper<
      Prisma.MemberGetPayload<{}>
    >({
      query: this.rbacDBService.member,
      pageOptions,
      cursorField: SortableFieldEnum.CREATED_AT,
      orderDirection: SortedEnum.DESC,
    });

    return {
      data: data.map((item) => MemberMapper.toDomain(item)),
      paginated,
    };
  }

  async findById(id: string): Promise<Member | null> {
    const item = await this.getWithCache(`members:${id}`, async () => {
      return this.rbacDBService.member.findUnique({ where: { id } });
    });
    if (!item) return null;
    return MemberMapper.toDomain(item);
  }
  async findStaff(staffId: string, projectId: string): Promise<Member | null> {
    const item = await this.getWithCache(
      `members:staff:${staffId}:project:${projectId}`,
      async () => {
        return this.rbacDBService.member.findUnique({
          where: {
            staff_id_project_id: { staff_id: staffId, project_id: projectId },
          },
        });
      },
    );
    if (!item) return null;
    return MemberMapper.toDomain(item);
  }
  async findByStaffId(staffId: string): Promise<Member[]> {
    const items = await this.getWithCache(
      `members:staff:${staffId}`,
      async () => {
        return this.rbacDBService.member.findMany({
          where: { staff_id: staffId },
        });
      },
    );
    if (!items || items.length === 0) return [];
    return items.map((item) => MemberMapper.toDomain(item));
  }
  async findByProjectId(projectId: string): Promise<Member[]> {
    const items = await this.getWithCache(
      `members:project:${projectId}`,
      async () => {
        return this.rbacDBService.member.findMany({
          where: { project_id: projectId },
        });
      },
    );
    if (!items) return [];
    return items.map((item) => MemberMapper.toDomain(item));
  }
  async create(data: any): Promise<Member> {
    const item = await this.rbacDBService.member.create({ data });
    await this.invalidateCache(`members:${item.id}`);
    return MemberMapper.toDomain(item);
  }
  async update(data: any): Promise<Member> {
    const item = await this.rbacDBService.member.update({
      where: { id: data.id },
      data,
    });
    await this.invalidateCache(`members:${item.id}`);
    return MemberMapper.toDomain(item);
  }
  async delete(id: string) {
    await this.rbacDBService.member.delete({ where: { id } });
    await this.invalidateCache(`members:${id}`);
  }
  async deleteByUserId(userId: string) {
    await this.rbacDBService.member.deleteMany({ where: { staff_id: userId } });
    await this.invalidateCache(`members:user:${userId}`);
  }
}
