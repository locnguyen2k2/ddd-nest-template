import { UserEntity } from '@/modules/iam/domain/entities/user.entity';
import { Password } from '@/modules/iam/domain/vo/password.vo';
import { Attributes } from '@/modules/iam/domain/vo/attributes.vo';
import { UserResponseDto } from '@/modules/iam/presentation/dtos/res/user-response.dto';
import { IEntityID } from '@/shared/domain/entities/base.entity';
import { Member, Organization, Prisma, Staff, User } from '@internal/rbac/client';
import { AccessControlStatus } from '@/common/enum';

export type UserWithOrganizations = User & {
  organizations?: Staff[];
};

export class UserMapper {

  static toDomain(props: UserWithOrganizations): UserEntity {
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
      attributes: Attributes.create(props.attributes),
      organizations: props.organizations ? props.organizations.map((org) => ({
        organization_id: org.organization_id,
        status: org.status as AccessControlStatus,
        context_attributes: Attributes.create(org.context_attributes),
        department_id: org.department_id ?? undefined,
        id: org.id,
      })) : [],
    });
  }

  static toDomainWithMembers(props: UserWithOrganizations & { members: Member[] }): UserEntity {
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
      attributes: Attributes.create(props.attributes),
      organizations: props.organizations ? props.organizations.map((org) => ({
        organization_id: org.organization_id,
        status: org.status as AccessControlStatus,
        context_attributes: Attributes.create(org.context_attributes),
        department_id: org.department_id ?? undefined,
        id: org.id,
      })) : [],
      members: props.members ? props.members.map((member) => ({
        project_id: member.project_id,
        staff_id: member.staff_id,
        id: member.id,
      })) : [],
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
      attributes: props.attributes.value as Prisma.JsonObject,
    };
  }

  static toPrismaWithOrganizations(props: UserEntity): UserWithOrganizations {
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
      attributes: props.attributes.value as Prisma.JsonObject,
      organizations: props.organizations.map((org) => ({
        organization_id: org.organization_id,
        status: org.status as AccessControlStatus,
        context_attributes: org.context_attributes?.value ?? {},
        department_id: org.department_id ?? null,
        id: org.id,
        created_at: new Date(),
        updated_at: new Date(),
        user_id: props.id.value,
        created_by: null,
        updated_by: null,
      })),
    };
  }

  static toPrismaCreate(user: UserEntity): Prisma.UserCreateInput {
    return {
      id: user.id.value,
      email: user.email,
      username: user.username,
      password: user.password.value,
      first_name: user.first_name,
      last_name: user.last_name,
      status: user.status,
      created_at: new Date(),
      updated_at: new Date(),
      attributes: user.attributes.value as Prisma.JsonObject,
    };
  }

  static toPrismaUpdate(user: UserEntity): Prisma.UserUpdateInput {
    return {
      first_name: user.first_name,
      last_name: user.last_name,
      password: user.password.value,
      attributes: user.attributes.value as Prisma.JsonObject,
      updated_at: new Date(),
    };
  }

  static toResponseDto(user: UserEntity, orgs: Organization[]): UserResponseDto {
    const orgMapper: Map<string, Organization> = new Map(orgs.map((org) => [org.id, org]));
    const staffs = user.organizations.map((userOrg) => ({
      ...orgMapper.get(userOrg.organization_id)!,
      status: userOrg.status,
      context_attributes: userOrg.context_attributes?.value,
      id: userOrg.organization_id,
      staff_id: userOrg.id,
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
      organizations: staffs as any,
    };
  }
}
