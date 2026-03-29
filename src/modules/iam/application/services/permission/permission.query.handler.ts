import { Inject } from '@nestjs/common';
import {
  IPermissionRepository,
  PERMISSION_REPO,
} from '@/modules/iam/domain/repositories/permission.repository';
import { PermissionAction } from '@prisma/client';

export class PermissionQueryHandler {
  constructor(
    @Inject(PERMISSION_REPO)
    private readonly permissionRepository: IPermissionRepository,
  ) {}

  handleGetById(id: string) {
    return this.permissionRepository.findById(id);
  }

  handleGetByAction(action: PermissionAction, organizationId?: string) {
    return this.permissionRepository.findByAction(action, organizationId);
  }
}
