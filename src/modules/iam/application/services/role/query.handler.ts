// import { Inject, Injectable } from '@nestjs/common';
// import { IRoleRepository } from '@/modules/iam/domain/repositories/role.repository';
// import { Role } from '@/modules/iam/domain/entities/role.entity';
// import {
//   GetRoleByIdQuery,
//   GetRoleBySlugQuery,
//   ListRolesQuery,
//   PaginateRolesQuery,
//   CursorRolesQuery,
// } from '../../dtos/queries/role-query.dto';
// import { ROLE_REPO } from '@/modules/iam/domain/repositories/role.repository';
// import { LogExecutionTime } from '@/common/decorators/log-execution.decorator';
// import { AccessControlStatus } from '@/common/enum';

// @Injectable()
// export class RoleQueryHandler {
//   constructor(
//     @Inject(ROLE_REPO)
//     private readonly roleRepository: IRoleRepository,
//   ) { }

//   @LogExecutionTime()
//   async handleGetRoleById(
//     query: GetRoleByIdQuery,
//   ): Promise<Role | null> {
//     return await this.roleRepository.findOneById(query.id, query.organization_id);
//   }

//   @LogExecutionTime()
//   async handleGetRoleBySlug(
//     query: GetRoleBySlugQuery,
//   ): Promise<Role | null> {
//     return await this.roleRepository.findOneBySlug(
//       query.slug,
//       query.organization_id,
//     );
//   }

//   @LogExecutionTime()
//   async handlePaginate(query: PaginateRolesQuery) {
//     return await this.roleRepository.paginate(query);
//   }

//   @LogExecutionTime()
//   async handleCursorPaginate(query: CursorRolesQuery) {
//     return await this.roleRepository.cursorPagination(query);
//   }
// }
