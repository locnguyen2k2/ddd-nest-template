import { IPermissionRepository } from "@/modules/iam/domain/repositories/permission.repository";
import { Inject } from "@nestjs/common";
import { PERMISSION_REPO } from "@/modules/iam/domain/repositories/permission.repository";
import { CreatePermissionArgs, UpdatePermissionArgs } from "../../dtos/commands/permission-cmd.dto";
import { PermissionEntity } from "@/modules/iam/domain/entities/permission.entity";
import { IEntityID } from "@/shared/domain/entities/base.entity";
import { Logger } from "@nestjs/common";
import { LogExecutionTime } from "@/common/decorators/log-execution.decorator";


export class PermissionCmdHandler {
    private readonly logger = new Logger(PermissionCmdHandler.name);
    constructor(@Inject(PERMISSION_REPO) private readonly permissionRepo: IPermissionRepository) { }

    @LogExecutionTime()
    async handleCreatePermission(permission: CreatePermissionArgs) {
        const isExist = await this.permissionRepo.findBySlug(permission.slug);
        if (isExist) {
            throw new Error(`Permission with slug '${permission.slug}' already exists`);
        }
        const id: IEntityID<string> = {
            value: crypto.randomUUID(),
            _id: crypto.randomUUID(),
            get: () => crypto.randomUUID()
        }

        const permissionEntity = PermissionEntity.create({
            id,
            slug: permission.slug,
            name: permission.name,
            description: permission.description,
        });

        return await this.permissionRepo.create(permissionEntity);
    }

    @LogExecutionTime()
    async handleUpdatePermission(permission: UpdatePermissionArgs) {
        const isExist = await this.permissionRepo.findById(permission.id);
        if (!isExist) {
            throw new Error(`Permission with id '${permission.id}' not found`);
        }

        const id: IEntityID<string> = {
            value: permission.id,
            _id: permission.id,
            get: () => permission.id
        }


        const permissionEntity = PermissionEntity.create({
            id,
            slug: permission.slug,
            name: permission.name,
            description: permission.description,
        });

        return await this.permissionRepo.update(permission.id, permissionEntity);
    }
}
