import { UserEntity } from '@/modules/iam/domain/entities/user.entity';
import { IUserRepository } from '@/modules/iam/domain/repositories/user.repository';
import { UserMapper } from '../mappers/user.mapper';
import { PrismaAdapter } from '@/shared/infrastructure/adapters/prisma.adapter';
import { Inject, Injectable } from '@nestjs/common';
import { BusinessException } from '@/common/http/business-exception';
import { IOrganizationRepository, ORGANIZATION_REPO } from '@/modules/iam/domain/repositories/organization.repository';
import { ErrorEnum } from '@/common/exception.enum';
import { CacheRepository } from '@/shared/infrastructure/presistence/cache.repository';
import { ConfigKeyPaths } from '@/config';
import { CACHE_PORT, CachePort } from '@/shared/application/ports/cache.port';
import { ConfigService } from '@nestjs/config';
import { OrganizationMapper } from '../mappers/organization.mapper';

@Injectable()
export class UserRepository extends CacheRepository implements IUserRepository {
  protected readonly boundedContext: string = 'iam';
  protected readonly aggregateType: string = 'user';
  protected readonly ttlConfig: { [key: string]: number } = {
    default: 3600,
  };
  constructor(
    private readonly rbacDBService: PrismaAdapter,
    @Inject(ORGANIZATION_REPO) private readonly orgRepo: IOrganizationRepository,
    redisConfig: ConfigService<ConfigKeyPaths>,
    @Inject(CACHE_PORT) cachePort: CachePort,) {
    super(redisConfig, cachePort);
  }

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
    await this.invalidateCache(props.id.value);
    return UserMapper.toDomain(result);
  }

  async delete(id: string) {
    await this.rbacDBService.user.delete({ where: { id } });
    await this.invalidateCache(id);
  }

  async findOrgRoles(userId: string): Promise<UserEntity | null> {
    const [user, org, userOrgRoles] = await Promise.all([
      this.findById(userId),
      this.orgRepo.findUserOrganizations(userId),
      this.orgRepo.findOrgRoles(userId),
    ]);

    switch (true) {
      case !user:
        throw new BusinessException(ErrorEnum.RECORD_NOT_FOUND, 'User not found');
      case !org || org.length === 0:
        throw new BusinessException(ErrorEnum.RECORD_NOT_FOUND, 'Organization not found');
    }

    return UserMapper.toDomainWithOrgRoles(UserMapper.toPrisma(user), org.map(item => OrganizationMapper.toPrisma(item)), userOrgRoles);
  }

  async findByIDWithOrgRoles(userId: string, organization_id: string): Promise<UserEntity | null> {
    const [user, org, userOrgRoles, hasUser] = await Promise.all([
      this.findById(userId),
      this.orgRepo.findById(organization_id),
      this.orgRepo.findUserOrgRoles(organization_id, userId),
      this.orgRepo.organizationHasUser(organization_id, userId),
    ]);

    switch (true) {
      case !user:
        throw new BusinessException(ErrorEnum.RECORD_NOT_FOUND, 'User not found');
      case !org:
        throw new BusinessException(ErrorEnum.RECORD_NOT_FOUND, 'Organization not found');
      case !hasUser:
        throw new BusinessException(ErrorEnum.RECORD_NOT_FOUND, 'User not found in organization');
    }

    return UserMapper.toDomainWithOrgRoles(UserMapper.toPrisma(user), [OrganizationMapper.toPrisma(org)], new Map<string, string[]>([[organization_id, userOrgRoles]]));
  }

  async findById(id: string): Promise<UserEntity | null> {
    const item = await this.getWithCache(id, async () => await this.rbacDBService.user.findUnique({
      where: {
        id: id,
      },
    }));
    if (!item) return null;
    return UserMapper.toDomain(item);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const item = await this.getWithCache(email, async () => await this.rbacDBService.user.findUnique({ where: { email } }));
    if (!item) return null;
    return UserMapper.toDomain(item);
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    const item = await this.getWithCache(username, async () => await this.rbacDBService.user.findUnique({ where: { username } }));
    if (!item) return null;
    return UserMapper.toDomain(item);
  }
}
