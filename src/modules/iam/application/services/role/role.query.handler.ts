import { Inject, Injectable } from '@nestjs/common';
import { IRoleRepository } from '@/modules/iam/domain/repositories/role.entity';
import { RoleEntity } from '@/modules/iam/domain/entities/role.entity';
import { GetRoleByIdQuery, GetRoleBySlugQuery, ListRolesQuery } from '../../dtos/queries/role-query.dto';
import { ROLE_REPO } from '@/modules/iam/domain/repositories/role.entity';

@Injectable()
export class RoleQueryHandler {
    constructor(@Inject(ROLE_REPO) private readonly roleRepository: IRoleRepository) { }

    async handleGetRoleById(query: GetRoleByIdQuery): Promise<RoleEntity | null> {
        return await this.roleRepository.findById(query.id);
    }

    async handleGetRoleBySlug(query: GetRoleBySlugQuery): Promise<RoleEntity | null> {
        return await this.roleRepository.findBySlug(query.slug);
    }

    async handleListRoles(query: ListRolesQuery): Promise<{
        roles: RoleEntity[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        const { page = 1, limit = 10, search } = query;
        const skip = (page - 1) * limit;

        const roles = await this.roleRepository.findAll();

        let filteredRoles = roles;

        if (search) {
            const searchLower = search.toLowerCase();
            filteredRoles = roles.filter(role =>
                role.getName().toLowerCase().includes(searchLower) ||
                role.getSlug().value.toLowerCase().includes(searchLower) ||
                (role.getDescription()?.toLowerCase().includes(searchLower) ?? false)
            );
        }

        const paginatedRoles = filteredRoles.slice(skip, skip + limit);
        const total = filteredRoles.length;
        const totalPages = Math.ceil(total / limit);

        return {
            roles: paginatedRoles,
            total,
            page,
            limit,
            totalPages,
        };
    }
}
