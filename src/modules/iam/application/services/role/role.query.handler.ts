import { Inject, Injectable } from '@nestjs/common';
import { IRoleRepository } from '@/modules/iam/domain/repositories/role.repository';
import { RoleEntity } from '@/modules/iam/domain/entities/role.entity';
import { CursorRolesQuery, GetRoleByIdQuery, GetRoleBySlugQuery, PaginateRolesQuery } from '../../dtos/queries/role-query.dto';
import { ROLE_REPO } from '@/modules/iam/domain/repositories/role.repository';
import { LogExecutionTime } from '@/common/decorators/log-execution.decorator';

@Injectable()
export class RoleQueryHandler {
    constructor(@Inject(ROLE_REPO) private readonly roleRepository: IRoleRepository) { }

    @LogExecutionTime()
    async handleGetRoleById(query: GetRoleByIdQuery): Promise<RoleEntity | null> {
        const result = await this.roleRepository.findById(query.id);
        return result;
    }

    @LogExecutionTime()
    async handleGetRoleBySlug(query: GetRoleBySlugQuery): Promise<RoleEntity | null> {
        return await this.roleRepository.findBySlug(query.slug);
    }

    @LogExecutionTime()
    async handlePaginate(query: PaginateRolesQuery) {
        return await this.roleRepository.paginate(query);
    }

    @LogExecutionTime()
    async handleCursorPaginate(query: CursorRolesQuery) {
        return await this.roleRepository.cursorPagination(query);
    }
}
