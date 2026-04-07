import { UserEntity } from '@/modules/iam/domain/entities/user.entity';
import { Password } from '@/modules/iam/domain/vo/password.vo';
import { OrgRolesResDto } from '@/modules/iam/presentation/dtos/res/organization-response.dto';
import { UserResponseDto } from '@/modules/iam/presentation/dtos/res/user-response.dto';
import { IEntityID } from '@/shared/domain/entities/base.entity';
import { AccessControlStatus, Organization, Prisma, Role, User } from '@internal/rbac/client';

export class UserMapper {
  static toDomainWithOrgRoles(props: User, orgs: Organization[], userOrgRoles: Map<string, string[]>): UserEntity {
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
      organization_roles: orgs ? orgs.map((org) => ({ organization_id: org.id, role_ids: userOrgRoles.get(org.id) || [] })) : [],
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

  static toResponseDto(user: UserEntity, orgs: Organization[], roles: Role[]): UserResponseDto {
    const orgMapper: Map<string, Organization> = new Map(orgs.map((org) => [org.id, org]));
    const roleMapper: Map<string, Role> = new Map(roles.map((role) => [role.id, role]));
    const userOrgRoles: OrgRolesResDto[] = user.org_roles.map((orgRole) => ({
      roles: orgRole.role_ids.map((roleId) => roleMapper.get(roleId)!),
      ...orgMapper.get(orgRole.organization_id)!,
    }));
    return {
      id: user.id.value,
      email: user.email,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      status: user.status || AccessControlStatus.ACTIVE,
      created_at: user.created_at as Date,
      updated_at: user.updated_at as Date,
      organization_roles: userOrgRoles,
    };
  }
}
