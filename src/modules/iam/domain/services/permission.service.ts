import { Inject, Injectable } from '@nestjs/common';
import { PERMISSION_REPO } from '../repositories/permission.repository';
import { IPermissionRepository } from '../repositories/permission.repository';
import { BusinessException } from '@/common/http/business-exception';
import { PermissionAction } from '@/common/enum';

@Injectable()
export class PermissionDomainService {
  constructor(
    @Inject(PERMISSION_REPO)
    private readonly permissionRepo: IPermissionRepository,
  ) {}

  async validateUniqueness(action: PermissionAction, excludeId?: string): Promise<void> {
    const existing = await this.permissionRepo.findByAction(action);
    if (existing && existing.id.value !== excludeId) {
      throw new BusinessException(
        `Permission with action '${action}' already exists`,
      );
    }
  }
}
