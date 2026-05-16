import { UserEntity } from '@/modules/iam/domain/entities/user.entity';
import { IUserRepository } from '@/modules/iam/domain/repositories/user.repository';
import { UserMapper } from '../mappers/user.mapper';
import { PrismaAdapter } from '@/shared/infrastructure/adapters/prisma.adapter';
import { Inject, Injectable } from '@nestjs/common';
import { CacheRepository } from '@/shared/infrastructure/presistence/cache.repository';
import { ConfigKeyPaths } from '@/config';
import { CACHE_PORT, CachePort } from '@/shared/application/ports/cache.port';
import { ConfigService } from '@nestjs/config';
import { StaffMapper } from '../mappers/staff.mapper';
import {
  IStaffRepository,
  STAFF_REPO,
} from '@/modules/iam/domain/repositories/staff.repository';
import { IConfirmationCode } from '@/modules/iam/domain/services/user.service';
import { countdown } from '@/utils/date';
import { IAttemptPolicy, SETTINGS, SETTING_KEYS } from '@/common/constant';
import { BusinessException } from '@/common/http/business-exception';
import { MailType } from '@/shared/application/ports/mailer.port';
import { uuidv7 } from 'uuidv7';
import { MailerAdapter } from '@/shared/infrastructure/adapters/mailer.adapter';

@Injectable()
export class UserRepository extends CacheRepository implements IUserRepository {
  protected readonly boundedContext: string = 'iam';
  protected readonly aggregateType: string = 'user';
  protected readonly ttlConfig: { [key: string]: number } = {
    default: 3600,
  };
  constructor(
    private readonly rbacDBService: PrismaAdapter,
    @Inject(STAFF_REPO) private readonly staffRepo: IStaffRepository,
    redisConfig: ConfigService<ConfigKeyPaths>,
    @Inject(CACHE_PORT) private readonly cache: CachePort,
    private readonly mailer: MailerAdapter,
  ) {
    super(redisConfig, cache);
  }

  async create(props: UserEntity): Promise<UserEntity> {
    const toPrisma = UserMapper.toPrismaCreate(props);
    const result = await this.rbacDBService.user.create({ data: toPrisma });
    return UserMapper.toDomain(result);
  }

  async update(props: UserEntity): Promise<UserEntity> {
    const toPrisma = UserMapper.toPrismaUpdate(props);
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

  async findByIdWithOrganizations(userId: string): Promise<UserEntity | null> {
    try {
      const [user, staffs] = await Promise.all([
        this.findById(userId),
        this.staffRepo.findByUserId(userId),
      ]);

      if (!user) return null;
      const prismaUser = UserMapper.toPrisma(user);
      const prismaOrgs = staffs.map((staff) => StaffMapper.toPrisma(staff));

      const item = UserMapper.toDomain({
        ...prismaUser,
        organizations: prismaOrgs,
      });
      return item;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async findByIdWithOrganization(
    userId: string,
    orgId: string,
  ): Promise<UserEntity | null> {
    try {
      const [user, staffs] = await Promise.all([
        this.findById(userId),
        this.staffRepo.findByUserIdAndOrgId(userId, orgId),
      ]);

      if (!user || !staffs) return null;
      const prismaUser = UserMapper.toPrisma(user);
      const prismaOrgs = StaffMapper.toPrisma(staffs);

      const item = UserMapper.toDomain({
        ...prismaUser,
        organizations: [prismaOrgs],
      });
      return item;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async findById(id: string): Promise<UserEntity | null> {
    const item = await this.getWithCache(
      id,
      async () =>
        await this.rbacDBService.user.findUnique({
          where: {
            id: id,
          },
        }),
    );
    if (!item) return null;
    return UserMapper.toDomain(item);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const item = await this.getWithCache(
      email,
      async () =>
        await this.rbacDBService.user.findUnique({ where: { email } }),
    );
    if (!item) return null;
    return UserMapper.toDomain(item);
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    const item = await this.getWithCache(
      username,
      async () =>
        await this.rbacDBService.user.findUnique({ where: { username } }),
    );
    if (!item) return null;
    return UserMapper.toDomain(item);
  }

  public async warningPasswordSecurity(user: UserEntity, policy: IAttemptPolicy): Promise<void> {
    await this.mailer.sendEmail({
      to: user.email,
      subject: 'Password Security Warning',
      template: './password-warning',
      context: {
        attempts: `${policy.failed_attempts}`,
        time: `${policy.lock_duration}`,
        ipAddress: "",
      },
    });
  }

  public async requestConfirmationCode(user: UserEntity): Promise<IConfirmationCode> {
    try {
      const existingCode: IConfirmationCode | null = await this.cache.get(`user_${user.username}_${user.email}`);
      if (existingCode) {
        const timeLeft = countdown(1, existingCode.expires_at);
        if (timeLeft > 0) {
          return existingCode;
        }
      }
      const code = await this.generateConfirmationCode(user);
      await this.cache.set(
        `user_${user.username}_${user.email}`,
        code,
        SETTINGS[SETTING_KEYS.CODE_EXPIRE].mail_confirmation,
      );
      await this.mailer.sendSecretCode(user.email, code.code, MailType.CONFIRMED);
      return code;
    } catch (e: any) {
      throw new BusinessException(e?.message);
    }
  }

  private async generateConfirmationCode(user: UserEntity): Promise<IConfirmationCode> {
    return {
      code: uuidv7().slice(0, 6).toUpperCase(),
      expires_at: new Date(Date.now() + SETTINGS[SETTING_KEYS.CODE_EXPIRE].mail_confirmation),
      user_id: user.id.value,
    };
  }
}
