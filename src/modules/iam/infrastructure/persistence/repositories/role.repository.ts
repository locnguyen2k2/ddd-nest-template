import { Injectable } from '@nestjs/common';
import { IRoleRepository } from '@/modules/iam/domain/repositories/role.repository';
import { RoleMapper } from '../mappers/role.mapper';
import { PostgresAdapter } from '@/shared/infrastructure/adapters/postgres.adapter';
import { LogExecutionTime } from '@/common/decorators/log-execution.decorator';
import {
  cursorHelper,
  paginateHelper,
  SortableFieldEnum,
  SortedEnum,
} from '@/common/pagination';
import {
  CursorRolesQuery,
  PaginateRolesQuery,
} from '@/modules/iam/application/dtos/queries/role-query.dto';
import { Prisma } from '@internal/rbac/client';
import { CacheRepository } from '@/shared/infrastructure/presistence/cache.repository';
import { ConfigService } from '@nestjs/config';
import { Inject } from '@nestjs/common';
import { ConfigKeyPaths } from '@/config';
import { CACHE_PORT, CachePort } from '@/shared/application/ports/cache.port';
import { Role } from '@/modules/iam/domain/entities/role.entity';
import { BusinessException } from '@/common/http/business-exception';
import { ErrorEnum } from '@/common/exception.enum';

@Injectable()
export class RoleRepository extends CacheRepository implements IRoleRepository {
  protected readonly boundedContext: string = 'iam';
  protected readonly aggregateType: string = 'role';
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
  async paginate(pageOptions: PaginateRolesQuery) {
    const { data = [], paginated } = await paginateHelper<
      Prisma.RoleGetPayload<{}>
    >({
      query: this.rbacDBService.role,
      pageOptions,
      filterOptions: [
        {
          organization_id: pageOptions.organization_id,
        },
      ],
    });

    return {
      data: data.map((item) => RoleMapper.toDomain(item)),
      paginated,
    };
  }

  @LogExecutionTime()
  async cursorPagination(pageOptions: CursorRolesQuery) {
    const { data = [], paginated } = await cursorHelper<
      Prisma.RoleGetPayload<{}>
    >({
      query: this.rbacDBService.role,
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
      data: data.map((item) => RoleMapper.toDomain(item)),
      paginated,
    };
  }

  @LogExecutionTime()
  async findByOrganizationId(orgId: string): Promise<Role[]> {
    const items = await this.rbacDBService.role.findMany({
      where: {
        organization_id: orgId,
      },
    });
    return items.map((item) => RoleMapper.toDomain(item));
  }

  @LogExecutionTime()
  async findOneById(
    id: string,
    organization_id?: string,
  ): Promise<Role | null> {
    const item = await this.getWithCache(id, async () => {
      return await this.rbacDBService.role.findUnique({
        where: organization_id
          ? {
            id,
            organization_id,
          }
          : { id },
      });
    });

    return item ? RoleMapper.toDomain(item) : null;
  }

  @LogExecutionTime()
  async findOneBySlug(
    slug: string,
    organization_id: string,
  ): Promise<Role | null> {
    const referenceCachedKey = `slug:${slug}:${organization_id}`;
    const item = await this.getWithReference(
      referenceCachedKey,
      (role) => role.id,
      async () => {
        return await this.rbacDBService.role.findUnique({
          where: {
            organization_id_slug: {
              slug,
              organization_id,
            },
          },
        });
      },
    );
    return item ? RoleMapper.toDomain(item) : null;
  }

  @LogExecutionTime()
  async create(role: Role): Promise<Role> {
    const prismaData = RoleMapper.toPrismaCreate(role);

    const item = await this.rbacDBService.role.create({
      data: prismaData,
    });

    if (!item) {
      throw new BusinessException(ErrorEnum.RECORD_NOT_FOUND, 'Role');
    }

    return RoleMapper.toDomain(item);
  }

  @LogExecutionTime()
  async update(id: string, role: Role): Promise<Role> {
    const prismaData = RoleMapper.toPrismaUpdate(role);
    const updatedRole = await this.rbacDBService.role.update({
      where: { id },
      data: prismaData,
    });
    await this.invalidateCache(id);

    return RoleMapper.toDomain(updatedRole);
  }

  @LogExecutionTime()
  async delete(id: string): Promise<void> {
    await this.rbacDBService.role.delete({
      where: { id },
    });
    await this.invalidateCache(id);
  }
}
