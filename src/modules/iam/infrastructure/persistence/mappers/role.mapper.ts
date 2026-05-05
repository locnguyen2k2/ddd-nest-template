// import { Role } from '@/modules/iam/domain/entities/role.entity';
// import { Slug } from '@/modules/iam/domain/vo/slug.vo';
// import { Attributes } from '@/modules/iam/domain/vo/attributes.vo';
// import { IEntityID } from '@/shared/domain/entities/base.entity';
// import { Prisma } from '@internal/rbac/client';
// import { AccessControlStatus } from '@/common/enum';
// import { RoleResponseDto } from '@/modules/iam/presentation/dtos/res/role-response.dto';

// export class RoleMapper {
//   static toDomain(prismaRole: Prisma.RoleGetPayload<{}>): Role {
//     const roleId: IEntityID<string> = {
//       value: prismaRole.id,
//       _id: prismaRole.id,
//       get: () => prismaRole.id,
//     };

//     const slug = Slug.create(prismaRole.slug);

//     return Role.create({
//       id: roleId,
//       name: prismaRole.name,
//       slug: slug,
//       description: undefined,
//       status: AccessControlStatus.ACTIVE,
//       created_at: new Date(),
//       updated_at: new Date(),
//       organization_id: prismaRole.organization_id,
//       created_by: undefined,
//       updated_by: undefined,
//       attributes: Attributes.create(prismaRole.attributes),
//     });
//   }

//   static toPrisma(role: Role): Prisma.RoleGetPayload<{}> {
//     return {
//       id: role.id.value,
//       name: role.name,
//       slug: role.slug.value,
//       organization_id: role.organization_id,
//       attributes: role.attributes.value as Prisma.JsonObject,
//       created_at: role.created_at,
//       updated_at: role.updated_at,
//       created_by: role.created_by || null,
//       updated_by: role.updated_by || null,
//       status: role.status,
//     };
//   }

//   static toPrismaCreate(role: Role): Prisma.RoleCreateInput {
//     return {
//       id: role.id.value,
//       name: role.name,
//       slug: role.slug.value,
//       organization: {
//         connect: {
//           id: role.organization_id,
//         },
//       },
//       attributes: role.attributes.value as Prisma.JsonObject,
//       updated_by: role.updated_by || null,
//       status: role.status,
//     };
//   }

//   static toPrismaUpdate(role: Role): Prisma.RoleUpdateInput {
//     return {
//       name: role.name,
//       slug: role.slug.value,
//       attributes: role.attributes.value as Prisma.JsonObject,
//       updated_by: role.updated_by || null,
//       status: role.status,
//     };
//   }

//   static toResponseDto(role: Role): RoleResponseDto {
//     return {
//       id: role.id.value,
//       name: role.name,
//       slug: role.slug.value,
//       description: role.description,
//       status: role.status as AccessControlStatus,
//       created_at: role.created_at,
//       updated_at: role.updated_at,
//       organization_id: role.organization_id,
//       created_by: role.created_by ?? undefined,
//       updated_by: role.updated_by ?? undefined,
//     };
//   }
// }
