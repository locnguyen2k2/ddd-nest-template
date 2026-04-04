import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository, USER_REPO } from '../repositories/user.repository';
import { REGEX } from '@/common/constant';
import { BusinessException } from '@/common/http/business-exception';
import { FEATURE_REPO, IFeatureRepository } from '../repositories/feature.repository';
import { IPermissionRepository, PERMISSION_REPO } from '../repositories/permission.repository';
import { PermissionAction } from '@/common/enum';
import { IRoleRepository, ROLE_REPO } from '../repositories/role.repository';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPO) private readonly userRepository: IUserRepository,
    @Inject(FEATURE_REPO) private readonly featureRepository: IFeatureRepository,
    @Inject(PERMISSION_REPO) private readonly permissionRepository: IPermissionRepository,
    @Inject(ROLE_REPO) private readonly roleRepository: IRoleRepository
  ) { }

  async canAccess(userRoleIDs: string[], feature: string, action: PermissionAction, projectId: string): Promise<boolean> {
    try {
      const [featureEntity, permission] = await Promise.all([
        this.featureRepository.findOneBySlug(feature, projectId),
        this.permissionRepository.findByAction(action)
      ]);

      switch (true) {
        case !featureEntity:
          return false;
        case !permission:
          return false;
      }

      // Filter RFPs by permission ID
      const listRFPs = featureEntity.RFPs.filter(rfp => rfp.permission_id === permission.id.value);

      let isValid = false;
      for (const rfp of listRFPs) {
        const roleChain = await this.roleRepository.getRoleChain(rfp.role_id);
        // const role = await this.roleRepository.findById(rfp.role_id);
        // console.log(role?.name, rfp.role_id, roleChain, featureEntity.slug, action, );
        isValid = await this.roleRepository.hasPermission(roleChain, featureEntity.id.value, permission.id.value);
        if (isValid) {
          break;
        }
      }

      return isValid;
    } catch (e: any) {
      console.dir(e?.message);
      return false;
    }
  }

  private isEmail(value: string): boolean {
    return typeof value === 'string' && REGEX.regValidEmail.test(value);
  }

  private isUsername(value: string): boolean {
    return typeof value === 'string' && REGEX.regValidUsername.test(value);
  }

  async usernameIsExisted(username: string): Promise<boolean> {
    if (!this.isUsername(username) && !this.isEmail(username)) {
      throw new BusinessException('400|Invalid username');
    }
    const user = await this.userRepository.findByUsernameOrEmail(username);
    return user !== null;
  }
}
