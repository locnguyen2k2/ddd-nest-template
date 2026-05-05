// import { Injectable, Inject } from '@nestjs/common';
// import { IRoleRepository } from '@/modules/iam/domain/repositories/role.repository';
// import { Role } from '@/modules/iam/domain/entities/role.entity';
// import { Slug } from '@/modules/iam/domain/vo/slug.vo';
// import {
//   CreateRoleArgs,
//   UpdateRoleArgs,
//   DeleteRoleArgs,
// } from '@/modules/iam/application/dtos/commands/role-cmd.dto';
// import { ROLE_REPO } from '@/modules/iam/domain/repositories/role.repository';
// import { uuidv7 } from 'uuidv7';
// import { BusinessException } from '@/common/http/business-exception';
// import { ErrorEnum } from '@/common/exception.enum';
// import { IOrganizationRepository } from '@/modules/iam/domain/repositories/organization.repository';
// import { ORGANIZATION_REPO } from '@/modules/iam/domain/repositories/organization.repository';
// import { Attributes } from '@/modules/iam/domain/vo/attributes.vo';

// @Injectable()
// export class RoleCommandHandler {
//   constructor(
//     @Inject(ROLE_REPO)
//     private readonly roleRepository: IRoleRepository,
//     @Inject(ORGANIZATION_REPO)
//     private readonly organizationRepository: IOrganizationRepository,
//   ) { }

//   async handleCreateRole(command: CreateRoleArgs): Promise<Role> {
//     const [existingRole, existingOrganization] = await Promise.all([
//       this.roleRepository.findOneBySlug(
//         command.slug,
//         command.organization_id,
//       ),
//       this.organizationRepository.findById(command.organization_id),
//     ]);

//     if (!existingOrganization) {
//       throw new BusinessException(ErrorEnum.RECORD_NOT_FOUND, 'Organization');
//     }

//     if (existingRole) {
//       throw new BusinessException(ErrorEnum.RECORD_ALREADY_EXISTS, 'Role');
//     }

//     const id = uuidv7();
//     const roleId = {
//       value: id,
//       _id: id,
//       get: () => id,
//     };
//     const slug = Slug.create(command.slug);

//     const role = Role.create({
//       id: roleId,
//       name: command.name,
//       slug: slug,
//       description: command.description,
//       organization_id: command.organization_id,
//       attributes: Attributes.create(command.attributes)  || {},
//       created_by: undefined,
//       updated_by: undefined,
//     });

//     return await this.roleRepository.create(role);
//   }

//   async handleUpdateRole(command: UpdateRoleArgs): Promise<Role> {
//     const existingRole = await this.roleRepository.findOneById(
//       command.id,
//       command.organization_id,
//     );
//     if (!existingRole) {
//       throw new BusinessException(ErrorEnum.RECORD_NOT_FOUND, 'Role');
//     }

//     if (command.slug && command.slug !== existingRole.slug.value) {
//       const slugConflict = await this.roleRepository.findOneBySlug(
//         command.slug,
//         command.organization_id,
//       );
//       if (slugConflict) {
//         throw new BusinessException(ErrorEnum.RECORD_ALREADY_EXISTS, 'Role');
//       }
//     }

//     const updateProps: any = {};
//     if (command.name !== undefined) updateProps.name = command.name;
//     if (command.slug !== undefined)
//       updateProps.slug = Slug.create(command.slug);
//     if (command.description !== undefined)
//       updateProps.description = command.description;
//     if (command.attributes !== undefined)
//       updateProps.attributes = Attributes.create(command.attributes);

//     existingRole.update(updateProps);

//     return await this.roleRepository.update(command.id, existingRole);
//   }

//   async handleDeleteRole(command: DeleteRoleArgs): Promise<void> {
//     const existingRole = await this.roleRepository.findOneById(
//       command.id,
//       command.organization_id,
//     );
//     if (!existingRole) {
//       throw new BusinessException(ErrorEnum.RECORD_NOT_FOUND, 'Role');
//     }

//     existingRole.delete();

//     await this.roleRepository.delete(command.id);
//   }
// }
