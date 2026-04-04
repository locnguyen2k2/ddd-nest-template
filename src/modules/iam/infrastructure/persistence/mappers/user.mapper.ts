import { UserEntity } from '@/modules/iam/domain/entities/user.entity';
import { Password } from '@/modules/iam/domain/vo/password.vo';
import { UserResponseDto } from '@/modules/iam/presentation/dtos/res/user-response.dto';
import { IEntityID } from '@/shared/domain/entities/base.entity';
import { AccessControlStatus, Prisma, User } from '@internal/rbac/client';

export class UserMapper {
  static toDomainWithOrgRoles(props: Prisma.UserGetPayload<{
    include: {
      organizations: {
        include: {
          user_organization_roles: true
        },
      }
    }
  }>): UserEntity {
    const id: IEntityID<string> = {
      value: props.id,
      _id: props.id,
      get: () => props.id,
    };
    const mappedOrgRoles: Map<string, string[]> = new Map();

    if (props.organizations) {
      for (const org of props.organizations) {
        const roleIds = org.user_organization_roles.map((role) => role.role_id);
        mappedOrgRoles.set(org.organization_id, roleIds);
      }
    }

    return UserEntity.create({
      id: id,
      email: props.email,
      username: props.username,
      password: Password.create(props.password),
      first_name: props.first_name,
      last_name: props.last_name,
      created_at: props.created_at,
      updated_at: props.updated_at,
      organization_roles: props.organizations ? Array.from(mappedOrgRoles.entries()).map(([orgId, roleIds]) => ({ organization_id: orgId, role_ids: roleIds })) : [],
    });
  }

  static toDomain(props: User): UserEntity {
    const id: IEntityID<string> = {
      value: props.id,
      _id: props.id,
      get: () => props.id,
    };

    return UserEntity.create({
      id: id,
      email: props.email,
      username: props.username,
      password: Password.create(props.password),
      first_name: props.first_name,
      last_name: props.last_name,
      created_at: props.created_at,
      updated_at: props.updated_at,
      organization_roles: [],
    });
  }

  static toPrisma(props: UserEntity): User {
    return {
      id: props.id.value,
      email: props.email,
      username: props.username,
      password: props.password.value,
      first_name: props.first_name,
      last_name: props.last_name,
      status: props.status,
      created_at: props.created_at,
      updated_at: props.updated_at,
    };
  }

  static toPrismaUpdate(user: UserEntity): Prisma.UserUpdateInput {
    return {
      first_name: user.first_name,
      last_name: user.last_name,
      password: user.password.value,
      updated_at: new Date(),
    };
  }

  static toResponseDto(user: Prisma.UserCreateInput): UserResponseDto {
    return {
      id: user.id!,
      email: user.email,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      status: user.status || AccessControlStatus.ACTIVE,
      created_at: user.created_at as Date,
      updated_at: user.updated_at as Date,
    };
  }
}
