import { ConfigKeyPaths, IJwtConfig, jwtConfigKey } from '@/config';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtAdapter } from '@/shared/infrastructure/adapters/jwt.adapter';
import { UserRepository } from '@/modules/iam/infrastructure/persistence/repositories/user.repository';
import {
  SessionCacheRepository,
  TokenBlacklistCacheRepository,
  CaptchaCacheRepository,
} from '@/modules/iam/infrastructure/persistence/repositories/auth-cache.repository';
import { AuthDomainService, IPayload } from '@/modules/iam/domain/services/auth.service';
import { UserEntity } from '@/modules/iam/domain/entities/user.entity';
import {
  CaptchaResponseDto,
  TokenResponseDto,
} from '@/modules/iam/presentation/dtos/res/user-response.dto';
import { BcryptAdapter } from '@/shared/infrastructure/adapters/bcrypt.adapter';
import { CacheAdapter } from '@/shared/infrastructure/adapters/cache.adapter';
import { IConfirmationCode } from '@/modules/iam/domain/services/user.service';
import { BusinessException } from '@/common/http/business-exception';
import { ErrorEnum } from '@/common/exception.enum';
import { AccessControlStatus } from '@/common/enum';
import { CaptchaArgs } from '../../dtos/commands/auth-cmd.dto';
import { UserEventPublisher } from '@/modules/iam/infrastructure/events/user.event-publisher';

export const AUTH_WRAPPER_CMD_HANDLER = 'AUTH_WRAPPER_CMD_HANDLER';
@Injectable()
export class AuthWrapperCmdHandler {
  private readonly domainService: AuthDomainService;
  private readonly jwtConfigs: IJwtConfig;

  constructor(
    private readonly configService: ConfigService<ConfigKeyPaths>,
    private readonly jwtPort: JwtAdapter,
    private readonly userRepo: UserRepository,
    private readonly sessionRepo: SessionCacheRepository,
    private readonly blacklistRepo: TokenBlacklistCacheRepository,
    private readonly bcryptAdapter: BcryptAdapter,
    private readonly captchaRepo: CaptchaCacheRepository,
    private readonly cache: CacheAdapter,
    private readonly userEventPublisher: UserEventPublisher,
  ) {
    this.jwtConfigs = this.configService.get<IJwtConfig>(jwtConfigKey)!;
    this.domainService = new AuthDomainService(
      this.jwtConfigs,
      this.jwtPort,
      this.userRepo,
      this.sessionRepo,
      this.blacklistRepo,
      this.bcryptAdapter,
      this.captchaRepo,
      this.cache,
    );
  }

  async reCaptcha(): Promise<CaptchaResponseDto> {
    const result = await this.domainService.reCaptcha();
    return {
      captcha_id: result.captchaId,
      captcha: result.captcha,
    };
  }

  async verifyCaptcha(args: CaptchaArgs): Promise<boolean> {
    return await this.domainService.validateCaptcha(args.captchaId, args.captcha);
  }

  async validateUser(username: string, password: string): Promise<UserEntity> {
    return await this.domainService.validateUser(username, password);
  }

  async prepareTokens(user: UserEntity): Promise<TokenResponseDto> {
    return this.domainService.prepareTokens(user);
  }

  async verifyAccessToken(token: string): Promise<any> {
    return this.domainService.verifyAccessToken(token);
  }

  async refreshToken(refreshToken: string): Promise<any> {
    return this.domainService.refreshToken(refreshToken);
  }

  async logout(
    userId: string,
    accessToken: string,
    refreshToken: string,
  ): Promise<void> {
    return this.domainService.logout(userId, accessToken, refreshToken);
  }

  hash(password: string): string {
    return this.domainService.hash(password);
  }

  match(plainPassword: string, hashedPassword: string): boolean {
    return this.bcryptAdapter.comparePassword(plainPassword, hashedPassword);
  }

  validateCredentials(user: UserEntity, password: string) {
    return this.domainService.validateCredentials(user, password);
  }

  async verifyEmail(payload: IPayload, code: string, captchaArgs: CaptchaArgs): Promise<UserEntity> {
    const [user, verifyCaptcha] = await Promise.all([
      this.userRepo.findByEmailOrUsername(payload?.email || payload?.username),
      this.verifyCaptcha(captchaArgs),
    ]);
    if (!user) {
      throw new BusinessException(ErrorEnum.RECORD_NOT_FOUND);
    }
    if (!verifyCaptcha) {
      throw new BusinessException(`400|Invalid captcha`);
    }
    const isValid = await this.userRepo.verifyConfirmationCode(user, code);
    if (!isValid) {
      throw new BusinessException(`400|Invalid confirmation code`);
    }
    user.update({
      status: AccessControlStatus.ACTIVE,
    });
    return await this.userRepo.update(user);
  }

  async resendEmail(payload: IPayload, captchaArgs: CaptchaArgs): Promise<void> {
    const [user, verifyCaptcha] = await Promise.all([
      this.userRepo.findByEmailOrUsername(payload?.email || payload?.username),
      this.verifyCaptcha(captchaArgs),
    ]);
    if (!user) {
      throw new BusinessException(ErrorEnum.RECORD_NOT_FOUND);
    }
    if (!verifyCaptcha) {
      throw new BusinessException(`400|Invalid captcha`);
    }
    const userDomain = UserEntity.create({
      id: user.id,
      email: user.email,
      password: user.password,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      status: AccessControlStatus.INACTIVE,
      organizations: [],
    });
    await this.userEventPublisher.publishEvents([...userDomain.getEvents()]);
    userDomain.clearEvents();
  }
}
