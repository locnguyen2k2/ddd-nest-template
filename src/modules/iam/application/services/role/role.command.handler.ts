import { Inject, Injectable } from '@nestjs/common';
import { ROLE_REPO } from '@/modules/iam/domain/repositories/role.repository';
import {
  CreateRoleArgs,
  UpdateRoleArgs,
  DeleteRoleArgs,
  AssignPermissionToRoleArgs,
} from '../../dtos/commands/role-cmd.dto';
import { RoleEntity } from '@/modules/iam/domain/entities/role.entity';
import { Slug } from '@/modules/iam/domain/vo/slug.vo';
import { IRoleRepository } from '@/modules/iam/domain/repositories/role.repository';
import { LogExecutionTime } from '@/common/decorators/log-execution.decorator';
import { uuidv7 } from 'uuidv7';
import { RoleDomainService } from '@/modules/iam/domain/services/role.service';
import {
  FEATURE_REPO,
  IFeatureRepository,
} from '@/modules/iam/domain/repositories/feature.repository';
import {
  IPermissionRepository,
  PERMISSION_REPO,
} from '@/modules/iam/domain/repositories/permission.repository';
import {
  PROJECT_REPO,
  IProjectRepository,
} from '@/modules/iam/domain/repositories/project.repository';
import { BusinessException } from '@/common/http/business-exception';
import { ORGANIZATION_REPO, IOrganizationRepository } from '@/modules/iam/domain/repositories/organization.repository';
import { ErrorEnum } from '@/common/exception.enum';

@Injectable()
export class RoleCommandHandler {
  constructor(
    @Inject(ROLE_REPO) private readonly roleRepo: IRoleRepository,
    private readonly roleService: RoleDomainService,
    @Inject(FEATURE_REPO) private readonly featureRepo: IFeatureRepository,
    @Inject(PERMISSION_REPO)
    private readonly permissionRepo: IPermissionRepository,
    @Inject(PROJECT_REPO) private readonly projectRepo: IProjectRepository,
    @Inject(ORGANIZATION_REPO) private readonly organizationRepo: IOrganizationRepository,
  ) { }

  @LogExecutionTime()
  async handleCreateRole(command: CreateRoleArgs): Promise<RoleEntity> {
    const [existingRole, organization, parentRole] = await Promise.all([
      this.roleRepo.findBySlug(command.slug, command.organization_id),
      this.organizationRepo.findById(command.organization_id),
      ...(command.parent_role_id ? [this.roleRepo.findById(command.parent_role_id)] : [null]),
    ]);

    switch (true) {
      case !!existingRole:
        throw new BusinessException(`404|Role with slug '${command.slug}' already exists`);
      case command.parent_role_id && !parentRole:
        throw new BusinessException(`404|Parent role with id '${command.parent_role_id}' not found`);
      case !organization:
        throw new BusinessException(`404|Organization with id '${command.organization_id}' not found`);
    }

    const id = uuidv7();
    const roleId = {
      value: id,
      _id: id,
      get: () => id,
    };
    const slug = Slug.create(command.slug);

    const role = RoleEntity.create({
      id: roleId,
      name: command.name,
      slug: slug,
      description: command.description,
      organization_id: command.organization_id,
      parent_role_id: command.parent_role_id,
    });

    return await this.roleRepo.create(role);
  }

  @LogExecutionTime()
  async handleUpdateRole(command: UpdateRoleArgs): Promise<RoleEntity> {
    const existingRole = await this.roleRepo.findById(command.id);
    if (!existingRole) {
      throw new BusinessException(`404|Role with id '${command.id}' not found`);
    }

    if (command.slug && command.slug !== existingRole.slug.value) {
      const slugConflict = await this.roleRepo.findBySlug(
        command.slug,
        command.organization_id,
      );
      if (slugConflict) {
        throw new BusinessException(`404|Role with slug '${command.slug}' already exists`);
      }
    }

    const updateProps: any = {};
    if (command.name !== undefined) updateProps.name = command.name;
    if (command.slug !== undefined)
      updateProps.slug = Slug.create(command.slug);
    if (command.description !== undefined)
      updateProps.description = command.description;

    if (command.parent_id !== undefined) {
      if (command.parent_id) {
        await this.roleService.validateParentAssignment(command.id, command.parent_id);
      }
      updateProps.parent_role_id = command.parent_id;
    }

    existingRole.update(updateProps);

    return await this.roleRepo.update(command.id, existingRole);
  }

  @LogExecutionTime()
  async handleDeleteRole(command: DeleteRoleArgs): Promise<void> {
    const existingRole = await this.roleRepo.findById(command.id);
    if (!existingRole) {
      throw new BusinessException(`404|Role with id '${command.id}' not found`);
    }

    existingRole.delete();

    await this.roleRepo.delete(command.id);
  }

  @LogExecutionTime()
  async handleAssignPermissionToRole(
    command: AssignPermissionToRoleArgs,
  ): Promise<void> {
    const [existingRole, existingFeature, existingPermission, existingProject] =
      await Promise.all([
        this.roleRepo.findById(command.role_id),
        this.featureRepo.findOneById(command.feature_id),
        this.permissionRepo.findById(command.permission_id),
        this.projectRepo.findOneByFeatureId(command.feature_id),
      ]);

    switch (true) {
      case !existingRole:
        throw new BusinessException(ErrorEnum.RECORD_NOT_FOUND, `Role with id '${command.role_id}' not found`);
      case !existingFeature:
        throw new BusinessException(ErrorEnum.RECORD_NOT_FOUND, `Feature with id '${command.feature_id}' not found`);
      case !existingPermission:
        throw new BusinessException(ErrorEnum.RECORD_NOT_FOUND, `Permission with id '${command.permission_id}' not found`);
      case !existingProject:
        throw new BusinessException(ErrorEnum.RECORD_NOT_FOUND, `Project with feature id '${command.feature_id}' not found`);
    }

    if (existingRole.organizationId !== existingProject.organizationID) {
      throw new BusinessException(ErrorEnum.RECORD_ALREADY_EXISTS, `Role organization does not match project organization`);
    }

    await this.roleService.validatePermissionAssignment(
      command.role_id,
      command.feature_id,
      command.permission_id,
    );

    existingRole.assignPermission(command.permission_id);
    await this.roleRepo.createRFP(
      command.role_id,
      command.feature_id,
      command.permission_id,
    );
    return;
  }
}
