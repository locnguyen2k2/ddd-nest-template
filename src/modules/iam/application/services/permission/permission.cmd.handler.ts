import { IPermissionRepository } from '@/modules/iam/domain/repositories/permission.repository';
import { Inject } from '@nestjs/common';
import { PERMISSION_REPO } from '@/modules/iam/domain/repositories/permission.repository';
import {
  CreatePermissionArgs,
  UpdatePermissionArgs,
} from '../../dtos/commands/permission-cmd.dto';
import { PermissionEntity } from '@/modules/iam/domain/entities/permission.entity';
import { IEntityID } from '@/shared/domain/entities/base.entity';
import { Logger } from '@nestjs/common';
import { LogExecutionTime } from '@/common/decorators/log-execution.decorator';
import { uuidv7 } from 'uuidv7';
import { PermissionAction } from '@/common/enum';
import { PermissionDomainService } from '@/modules/iam/domain/services/permission.service';

export class PermissionCmdHandler {
  private readonly logger = new Logger(PermissionCmdHandler.name);
  constructor(
    @Inject(PERMISSION_REPO)
    private readonly permissionRepo: IPermissionRepository,
    private readonly permissionDomainService: PermissionDomainService,
  ) {}

  @LogExecutionTime()
  async handleCreatePermission(permission: CreatePermissionArgs) {
    const isExist = await this.permissionRepo.findByAction(
      permission.action,
      permission.organizationId,
    );
    if (isExist) {
      throw new Error(
        `Permission with slug '${permission.action}' already exists`,
      );
    }
    const id = uuidv7();
    const permissionId: IEntityID<string> = {
      value: id,
      _id: id,
      get: () => id,
    };

    const permissionEntity = PermissionEntity.create({
      id: permissionId,
      action: permission.action as PermissionAction,
      name: permission.name,
      description: permission.description,
    });

    return await this.permissionRepo.create(permissionEntity);
  }

  @LogExecutionTime()
  async handleUpdatePermission(permission: UpdatePermissionArgs) {
    const [isExist] = await Promise.all([
      this.permissionRepo.findById(permission.id),
      this.permissionDomainService.validateUniqueness(permission.action),
    ]);

    if (!isExist) {
      throw new Error(`Permission with id '${permission.id}' not found`);
    }

    isExist.update({
      action: permission.action as PermissionAction,
      name: permission.name,
      description: permission.description,
    });

    return await this.permissionRepo.update(permission.id, isExist);
  }
}
