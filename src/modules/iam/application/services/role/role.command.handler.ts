import { Inject, Injectable } from "@nestjs/common";
import { ROLE_REPO } from "@/modules/iam/domain/repositories/role.entity";
import { CreateRoleArgs, UpdateRoleArgs, DeleteRoleArgs } from "../../dtos/commands/role-cmd.dto";
import { RoleEntity } from "@/modules/iam/domain/entities/role.entity";
import { Slug } from "@/modules/iam/domain/vo/slug.vo";
import { IRoleRepository } from "@/modules/iam/domain/repositories/role.entity";

@Injectable()
export class RoleCommandHandler {
    constructor(@Inject(ROLE_REPO) private readonly roleRepo: IRoleRepository) { }

    async handleCreateRole(command: CreateRoleArgs): Promise<RoleEntity> {
        const existingRole = await this.roleRepo.findBySlug(command.slug);
        if (existingRole) {
            throw new Error(`Role with slug '${command.slug}' already exists`);
        }

        const roleId = {
            value: crypto.randomUUID(),
            _id: crypto.randomUUID(),
            get: () => crypto.randomUUID()
        };
        const slug = Slug.create(command.slug);

        const role = RoleEntity.create({
            id: roleId,
            name: command.name,
            slug: slug,
            description: command.description,
        });

        return await this.roleRepo.create(role);
    }

    async handleUpdateRole(command: UpdateRoleArgs): Promise<RoleEntity> {
        const existingRole = await this.roleRepo.findById(command.id);
        if (!existingRole) {
            throw new Error(`Role with id '${command.id}' not found`);
        }

        if (command.slug && command.slug !== existingRole.getSlug().value) {
            const slugConflict = await this.roleRepo.findBySlug(command.slug);
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

    async handleDeleteRole(command: DeleteRoleArgs): Promise<void> {
        const existingRole = await this.roleRepo.findById(command.id);
        if (!existingRole) {
            throw new Error(`Role with id '${command.id}' not found`);
        }

        existingRole.delete();

        await this.roleRepo.delete(command.id);
    }
}
