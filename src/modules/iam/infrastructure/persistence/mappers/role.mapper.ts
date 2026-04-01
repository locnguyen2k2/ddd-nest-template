import { RoleEntity } from '@/modules/iam/domain/entities/role.entity';
import { Slug } from '@/modules/iam/domain/vo/slug.vo';
import { RoleResponseDto } from '@/modules/iam/presentation/dtos/res/role-response.dto';
import { IEntityID } from '@/shared/domain/entities/base.entity';
import { Prisma, Role } from '@internal/rbac/client';

export class RoleMapper {
  static toDomain(prismaRole: Role): RoleEntity {
    const roleId: IEntityID<string> = {
      value: prismaRole.id,
      _id: prismaRole.id,
      get: () => prismaRole.id,
    };

    const slug = Slug.create(prismaRole.slug);

    return RoleEntity.create({
      id: roleId,
      name: prismaRole.name,
      slug: slug,
      description: prismaRole.description || undefined,
      created_at: prismaRole.created_at,
      updated_at: prismaRole.updated_at,
      organization_id: prismaRole.organization_id,
    });
  }

  static toPrisma(role: RoleEntity): any {
    return {
      id: role.id.value,
      name: role.name(),
      slug: role.slug().value,
      description: role.description(),
      created_at: new Date(),
      updated_at: new Date(),
    };
  }

  static toPrismaUpdate(role: RoleEntity): Prisma.RoleUpdateInput {
    return {
      name: role.name(),
      slug: role.slug().value,
      description: role.description(),
      updated_at: new Date(),
    };
  }

  static toResponseDto(role: Prisma.RoleCreateInput): RoleResponseDto {
    return {
      id: role.id!,
      name: role.name,
      slug: role.slug,
      description: role.description || undefined,
      created_at: role.created_at as Date,
      updated_at: role.updated_at as Date,
    };
  }
}
