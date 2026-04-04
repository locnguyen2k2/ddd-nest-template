import { Inject, Injectable } from '@nestjs/common';
import {
  IPermissionRepository,
  PERMISSION_REPO,
} from '@/modules/iam/domain/repositories/permission.repository';
import { LogExecutionTime } from '@/common/decorators/log-execution.decorator';
import {
  CursorPermissionQuery,
  GetPermissionByActionQuery,
  GetPermissionByIdQuery,
  PaginatePermissionQuery,
} from '../../dtos/queries/permission-query.dto';
import { PermissionEntity } from '@/modules/iam/domain/entities/permission.entity';

@Injectable()
export class PermissionQueryHandler {
  constructor(
    @Inject(PERMISSION_REPO)
    private readonly permissionRepository: IPermissionRepository,
  ) { }

  @LogExecutionTime()
  async handleGetById(query: GetPermissionByIdQuery): Promise<PermissionEntity | null> {
    return this.permissionRepository.findById(query.id);
  }

  @LogExecutionTime()
  async handleGetByAction(query: GetPermissionByActionQuery): Promise<PermissionEntity | null> {
    return this.permissionRepository.findByAction(query.action);
  }

  @LogExecutionTime()
  async handlePaginate(query: PaginatePermissionQuery) {
    return await this.permissionRepository.paginate(query);
  }

  @LogExecutionTime()
  async handleCursorPaginate(query: CursorPermissionQuery) {
    return await this.permissionRepository.cursorPagination(query);
  }
}
