import { IPermissionRepository } from '@/modules/iam/domain/repositories/permission.repository';
import { PermissionEntity } from '@/modules/iam/domain/entities/permission.entity';
import { PrismaAdapter } from '@/shared/infrastructure/adapters/prisma.adapter';
import { PermissionMapper } from '../mappers/permission.mapper';
import { Injectable, Logger } from '@nestjs/common';
import { LogExecutionTime } from '@/common/decorators/log-execution.decorator';
import { PermissionAction } from '@internal/rbac/client';
import { BusinessException } from '@/common/http/business-exception';
import { ErrorEnum } from '@/common/exception.enum';
import { CursorPermissionQuery, PaginatePermissionQuery } from '@/modules/iam/application/dtos/queries/permission-query.dto';
import { PermissionResponseDto } from '@/modules/iam/presentation/dtos/res/permission-response.dto';
import { cursorHelper, paginateHelper, SortableFieldEnum, SortedEnum } from '@/common/pagination';

@Injectable()
export class PermissionRepository implements IPermissionRepository {
  private readonly logger = new Logger(PermissionRepository.name);
  constructor(private readonly rbacDBService: PrismaAdapter) { }

  @LogExecutionTime()
  async create(permission: PermissionEntity): Promise<PermissionEntity | null> {
    const toPrisma = PermissionMapper.toPrisma(permission);
    const permissionPrisma = await this.rbacDBService.permission.create({
      data: toPrisma,
    });
    return permissionPrisma
      ? PermissionMapper.toDomain(permissionPrisma)
      : null;
  }
  @LogExecutionTime()
  async findById(id: string): Promise<PermissionEntity | null> {
    const found = await this.rbacDBService.permission.findUnique({
      where: { id },
      include: {
        role_feature_permissions: true,
      },
    });
    if (!found) return null;
    return PermissionMapper.toDomain(found);
  }
  @LogExecutionTime()
  async findByAction(action: PermissionAction): Promise<PermissionEntity | null> {
    const where = { action };
    const found = await this.rbacDBService.permission.findFirst({
      where,
    });
    if (!found) return null;
    return PermissionMapper.toDomain(found);
  }
  @LogExecutionTime()
  async findByActionWithRFPs(action: PermissionAction): Promise<PermissionEntity | null> {
    const where = { action };
    const found = await this.rbacDBService.permission.findFirst({
      where,
      include: {
        role_feature_permissions: true,
      },
    });
    if (!found) return null;
    return PermissionMapper.toDomainWithRFPs(found);
  }
  @LogExecutionTime()
  async findAll(): Promise<PermissionEntity[]> {
    const found = await this.rbacDBService.permission.findMany();
    return found.map(PermissionMapper.toDomain);
  }
  @LogExecutionTime()
  async update(
    id: string,
    permission: PermissionEntity,
  ): Promise<PermissionEntity> {
    const updated = await this.rbacDBService.permission.update({
      where: { id },
      data: {
        name: permission.name,
        action: permission.action,
        description: permission.description,
      },
    });
    return PermissionMapper.toDomain(updated);
  }
  @LogExecutionTime()
  async delete(id: string): Promise<void> {
    await this.rbacDBService.permission.delete({
      where: { id },
    });
  }

  @LogExecutionTime()
  async paginate(pageOptions: PaginatePermissionQuery) {
    try {
      const { data = [], paginated } =
        await paginateHelper<PermissionResponseDto>({
          query: this.rbacDBService.permission,
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
  async cursorPagination(pageOptions: CursorPermissionQuery) {
    try {
      const { data = [], paginated } =
        await cursorHelper<PermissionResponseDto>({
          query: this.rbacDBService.permission,
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

}
