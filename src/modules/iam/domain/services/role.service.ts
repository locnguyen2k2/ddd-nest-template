import { Injectable, Inject } from '@nestjs/common';
import { ROLE_REPO, IRoleRepository } from '../repositories/role.repository';
import { BusinessException } from '@/common/http/business-exception';

@Injectable()
export class RoleDomainService {
  constructor(@Inject(ROLE_REPO) private readonly roleRepo: IRoleRepository) {}

  async validatePermissionAssignment(
    roleId: string,
    featureId: string,
    permissionId: string,
  ): Promise<void> {
    const roleChain = await this.roleRepo.getRoleChain(roleId);

    const wouldCreateCircularReference = await this.roleRepo.hasPermission(
      roleChain,
      featureId,
      permissionId,
    );

    if (wouldCreateCircularReference) {
      throw new BusinessException(
        `400|Circular reference detected: Role ${roleId} already has permission ${permissionId} for feature ${featureId} through role chain`,
      );
    }
  }
}
