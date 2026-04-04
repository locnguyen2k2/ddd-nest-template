import { UserEntity } from '@/modules/iam/domain/entities/user.entity';
import { IUserRepository } from '@/modules/iam/domain/repositories/user.repository';
import { UserMapper } from '../mappers/user.mapper';
import { PrismaAdapter } from '@/shared/infrastructure/adapters/prisma.adapter';
import { Injectable } from '@nestjs/common';
import { BusinessException } from '@/common/http/business-exception';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly rbacDBService: PrismaAdapter) { }

  async create(props: UserEntity): Promise<UserEntity> {
    const toPrisma = UserMapper.toPrisma(props);
    const result = await this.rbacDBService.user.create({ data: toPrisma });
    return UserMapper.toDomain(result);
  }

  async update(props: UserEntity): Promise<UserEntity> {
    const toPrisma = UserMapper.toPrisma(props);
    const result = await this.rbacDBService.user.update({
      where: { id: props.id.value },
      data: toPrisma,
    });
    return UserMapper.toDomain(result);
  }

  async delete(id: string) {
    await this.rbacDBService.user.delete({ where: { id } });
  }

  async findByIDWithOrgRoles(id: string, organization_id: string): Promise<UserEntity | null> {
    const result = await this.rbacDBService.user.findFirst({
      where: {
        id,
        organizations: {
          some: {
            organization: {
              id: organization_id
            },
          }
        }
      },
      include: {
        organizations: {
          include: {
            user_organization_roles: true
          },
        }
      },
    });
    if (!result) return null;
    return UserMapper.toDomainWithOrgRoles(result);
  }

  async findByID(id: string): Promise<UserEntity | null> {
    const result = await this.rbacDBService.user.findFirst({
      where: {
        id,
      },
    });
    if (!result) return null;
    return UserMapper.toDomain(result);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const result = await this.rbacDBService.user.findUnique({ where: { email } });
    if (!result) return null;
    return UserMapper.toDomain(result);
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    const result = await this.rbacDBService.user.findUnique({
      where: { username },
    });
    if (!result) return null;
    return UserMapper.toDomain(result);
  }

  async findByUsernameOrEmail(
    usernameOrEmail: string,
    organization_id?: string,
  ): Promise<UserEntity | null> {
    try {
      const result = await this.rbacDBService.user.findFirst({
        where: {
          OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
          ...(organization_id && {
            organizations: {
              some: {
                organization: {
                  id: organization_id
                }
              }
            }
          })
        },
        include: {
          organizations: {
            include: {
              user_organization_roles: true
            },
          }
        },
      });
      if (!result) return null;
      return UserMapper.toDomainWithOrgRoles(result);
    } catch (error) {
      console.dir(error);
      throw new BusinessException('400|Failed to find user by username or email');
    }
  }
}
