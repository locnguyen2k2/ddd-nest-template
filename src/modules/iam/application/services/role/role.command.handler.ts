import { Inject, Injectable } from "@nestjs/common";
import { ROLE_REPO } from "@/modules/iam/domain/repositories/role.repository";
import { CreateRoleArgs, UpdateRoleArgs, DeleteRoleArgs, AssignPermissionToRoleArgs } from "../../dtos/commands/role-cmd.dto";
import { RoleEntity } from "@/modules/iam/domain/entities/role.entity";
import { Slug } from "@/modules/iam/domain/vo/slug.vo";
import { IRoleRepository } from "@/modules/iam/domain/repositories/role.repository";
import { LogExecutionTime } from "@/common/decorators/log-execution.decorator";
import { uuidv7 } from 'uuidv7';
import { RoleDomainService } from "@/modules/iam/domain/services/role.service";
import { FEATURE_REPO, IFeatureRepository } from "@/modules/iam/domain/repositories/feature.repository";
import { IPermissionRepository, PERMISSION_REPO } from "@/modules/iam/domain/repositories/permission.repository";
import { PROJECT_REPO, IProjectRepository } from "@/modules/iam/domain/repositories/project.repository";

@Injectable()
export class RoleCommandHandler {
    constructor(
        @Inject(ROLE_REPO) private readonly roleRepo: IRoleRepository,
        private readonly roleService: RoleDomainService,
        @Inject(FEATURE_REPO) private readonly featureRepo: IFeatureRepository,
        @Inject(PERMISSION_REPO) private readonly permissionRepo: IPermissionRepository,
        @Inject(PROJECT_REPO) private readonly projectRepo: IProjectRepository,
    ) { }

    @LogExecutionTime()
    async handleCreateRole(command: CreateRoleArgs): Promise<RoleEntity> {
        const existingRole = await this.roleRepo.findBySlug(command.slug, command.organization_id);
        if (existingRole) {
            throw new Error(`Role with slug '${command.slug}' already exists`);
        }

        const id = uuidv7();
        const roleId = {
            value: id,
            _id: id,
            get: () => id
        };
        const slug = Slug.create(command.slug);

        const role = RoleEntity.create({
            id: roleId,
            name: command.name,
            slug: slug,
            description: command.description,
            organization_id: command.organization_id,
        });

        return await this.roleRepo.create(role);
    }

    @LogExecutionTime()
    async handleUpdateRole(command: UpdateRoleArgs): Promise<RoleEntity> {
        const existingRole = await this.roleRepo.findById(command.id);
        if (!existingRole) {
            throw new Error(`Role with id '${command.id}' not found`);
        }

        if (command.slug && command.slug !== existingRole.slug().value) {
            const slugConflict = await this.roleRepo.findBySlug(command.slug, command.organization_id);
            if (slugConflict) {
                throw new Error(`Role with slug '${command.slug}' already exists`);
            }
        }

        const updateProps: any = {};
        if (command.name !== undefined) updateProps.name = command.name;
        if (command.slug !== undefined) updateProps.slug = Slug.create(command.slug);
        if (command.description !== undefined) updateProps.description = command.description;

        existingRole.update(updateProps);

        return await this.roleRepo.update(command.id, existingRole);
    }

    @LogExecutionTime()
    async handleDeleteRole(command: DeleteRoleArgs): Promise<void> {
        const existingRole = await this.roleRepo.findById(command.id);
        if (!existingRole) {
            throw new Error(`Role with id '${command.id}' not found`);
        }

        existingRole.delete();

        await this.roleRepo.delete(command.id);
    }

    @LogExecutionTime()
    async handleAssignPermissionToRole(command: AssignPermissionToRoleArgs): Promise<void> {
        const [existingRole, existingFeature, existingPermission, existingProject] = await Promise.all([
            this.roleRepo.findById(command.role_id),
            this.featureRepo.findOneById(command.feature_id),
            this.permissionRepo.findById(command.permission_id),
            this.projectRepo.findOneByFeatureId(command.feature_id)
        ]);

        switch (true) {
            case !existingRole:
                throw new Error(`Role with id '${command.role_id}' not found`);
            case !existingFeature:
                throw new Error(`Feature with id '${command.feature_id}' not found`);
            case !existingPermission:
                throw new Error(`Permission with id '${command.permission_id}' not found`);
            case !existingProject:
                throw new Error(`Project with feature id '${command.feature_id}' not found`);
        }

        if (existingRole.organizationId() !== existingProject.organizationID()) {
            throw new Error(`Role organization does not match project organization`);
        }


        await this.roleService.validatePermissionAssignment(
            command.role_id,
            command.feature_id,
            command.permission_id
        );

        existingRole.assignPermission(command.permission_id);
        await this.roleRepo.createRFP(command.role_id, command.feature_id, command.permission_id);
        return;
    }
}
