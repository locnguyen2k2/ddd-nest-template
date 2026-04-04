import { IPermissionRepository } from '@/modules/iam/domain/repositories/permission.repository';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { PERMISSION_REPO } from '@/modules/iam/domain/repositories/permission.repository';
import {
  CreatePermissionArgs,
  UpdatePermissionArgs,
  DeletePermissionArgs,
} from '../../dtos/commands/permission-cmd.dto';
import { PermissionEntity } from '@/modules/iam/domain/entities/permission.entity';
import { IEntityID } from '@/shared/domain/entities/base.entity';
import { LogExecutionTime } from '@/common/decorators/log-execution.decorator';
import { uuidv7 } from 'uuidv7';
import { PermissionAction } from '@/common/enum';
import { PermissionDomainService } from '@/modules/iam/domain/services/permission.service';
import { BusinessException } from '@/common/http/business-exception';

@Injectable()
export class PermissionCmdHandler {
  private readonly logger = new Logger(PermissionCmdHandler.name);
  constructor(
    @Inject(PERMISSION_REPO)
    private readonly permissionRepo: IPermissionRepository,
    private readonly permissionDomainService: PermissionDomainService,
  ) { }

  @LogExecutionTime()
  async handleCreatePermission(command: CreatePermissionArgs): Promise<PermissionEntity> {
    const isExist = await this.permissionRepo.findByAction(
      command.action,
    );
    if (isExist) {
      throw new BusinessException(
        `409|Permission with slug '${command.action}' already exists`,
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
      action: command.action as PermissionAction,
      name: command.name,
      description: command.description,
    });

    const result = await this.permissionRepo.create(permissionEntity);
    if (!result) {
      throw new BusinessException(`500|Failed to create permission`);
    }
    return result;
  }

  @LogExecutionTime()
  async handleUpdatePermission(command: UpdatePermissionArgs): Promise<PermissionEntity> {
    const existingPermission = await this.permissionRepo.findById(command.id);

    if (!existingPermission) {
      throw new BusinessException(`404|Permission with id '${command.id}' not found`);
    }

    if (command.action && command.action !== existingPermission.action) {
      await this.permissionDomainService.validateUniqueness(command.action);
    }

    existingPermission.update({
      action: command.action as PermissionAction,
      name: command.name,
      description: command.description,
    });

    const result = await this.permissionRepo.update(command.id, existingPermission);
    if (!result) {
      throw new BusinessException(`500|Failed to update permission`);
    }
    return result;
  }

  @LogExecutionTime()
  async handleDeletePermission(command: DeletePermissionArgs): Promise<void> {
    const existingPermission = await this.permissionRepo.findById(command.id);
    if (!existingPermission) {
      throw new BusinessException(`404|Permission with id '${command.id}' not found`);
    }

    await this.permissionRepo.delete(command.id);
  }
}
