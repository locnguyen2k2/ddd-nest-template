import { databaseConfigKey, IJwtConfig } from '@/config';
import { BusinessException } from '@/common/http/business-exception';
import { ErrorEnum } from '@/common/exception.enum';
import {
  TokenResponseDto,
  UserResponseDto,
} from '../../presentation/dtos/res/user-response.dto';
import { UserEntity } from '../entities/user.entity';
import { JwtAdapter } from '@/shared/infrastructure/adapters/jwt.adapter';
import { UserRepository } from '../../infrastructure/persistence/repositories/user.repository';
import {
  SessionCacheRepository,
  TokenBlacklistCacheRepository,
  CaptchaCacheRepository,
} from '../../infrastructure/persistence/repositories/auth-cache.repository';
import { BcryptAdapter } from '@/shared/infrastructure/adapters/bcrypt.adapter';
import { IAttemptPolicy, REGEX, SETTING_KEYS, SETTINGS } from '@/common/constant';
import { CacheAdapter } from '@/shared/infrastructure/adapters/cache.adapter';
import { PASSWORD_SECURITY_THROTTLE } from '../../presentation/guards/passsword-security.guard';

export interface IPayload {
  sub: string;
  email: string;
  username: string;
}

export class AuthDomainService {
  constructor(
    private readonly jwtConfigs: IJwtConfig,
    private readonly jwtPort: JwtAdapter,
    private readonly userRepo: UserRepository,
    private readonly sessionRepo: SessionCacheRepository,
    private readonly blacklistRepo: TokenBlacklistCacheRepository,
    private readonly bcryptAdapter: BcryptAdapter,
    private readonly captchaRepo: CaptchaCacheRepository,
    private readonly cache: CacheAdapter,
  ) { }

  async reCaptcha(): Promise<{ captchaId: string; captcha: string }> {
    return await this.captchaRepo.getCaptcha();
  }

  async validateCaptcha(captchaId: string, captcha: string): Promise<boolean> {
    return await this.captchaRepo.confirmedCaptcha({ captchaId, captcha });
  }

  async prepareTokens(user: UserEntity): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
  }> {
    const tokens = await this.generateTokens({
      sub: user.id.value,
      email: user.email,
      username: user.username,
    });

    const ttl = this.convertExpiresInToSeconds(
      this.jwtConfigs.refreshExpiresIn,
    );
    await this.sessionRepo.createSession(user.id.value, ttl);

    return {
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      expires_in: this.convertExpiresInToSeconds(this.jwtConfigs.expiresIn),
      token_type: 'Bearer',
    };
  }

  async logout(
    userId: string,
    accessToken: string,
    refreshToken: string,
  ): Promise<void> {
    await this.sessionRepo.deleteSession(userId);

    const accessTtl = this.convertExpiresInToSeconds(this.jwtConfigs.expiresIn);
    const refreshTtl = this.convertExpiresInToSeconds(
      this.jwtConfigs.refreshExpiresIn,
    );

    await Promise.all([
      this.blacklistRepo.blacklistToken(accessToken, accessTtl),
      this.blacklistRepo.blacklistToken(refreshToken, refreshTtl),
    ]);
  }

  async refreshToken(refreshToken: string): Promise<TokenResponseDto> {
    try {
      const payload = this.jwtPort.verify<{
        sub: string;
        email: string;
        username: string;
      }>(refreshToken, {
        secret: this.jwtConfigs.refreshSecret,
      });

      const isActive = await this.sessionRepo.isSessionActive(payload.sub);
      if (!isActive) {
        throw new BusinessException(ErrorEnum.UNAUTHORIZED);
      }

      const isBlacklisted =
        await this.blacklistRepo.isTokenBlacklisted(refreshToken);
      if (isBlacklisted) {
        throw new BusinessException(ErrorEnum.UNAUTHORIZED);
      }

      const tokens = await this.generateTokens({
        sub: payload.sub,
        email: payload.email,
        username: payload.username,
      });

      // Blacklist the old refresh token
      const refreshTtl = this.convertExpiresInToSeconds(
        this.jwtConfigs.refreshExpiresIn,
      );
      await this.blacklistRepo.blacklistToken(refreshToken, refreshTtl);

      return new TokenResponseDto(
        tokens.accessToken,
        tokens.refreshToken,
        this.convertExpiresInToSeconds(this.jwtConfigs.expiresIn),
        'Bearer',
      );
    } catch (error) {
      console.log(error);
      throw new BusinessException(ErrorEnum.UNAUTHORIZED);
    }
  }

  async verifyAccessToken(accessToken: string): Promise<UserResponseDto> {
    try {
      const payload = this.jwtPort.verify<{
        sub: string;
        email: string;
        username: string;
      }>(accessToken, {
        secret: this.jwtConfigs.secret,
      });

      const [isBlacklisted, user] = await Promise.all([
        this.blacklistRepo.isTokenBlacklisted(accessToken),
        this.userRepo.findByIdWithOrganizations(payload.sub),
      ]);

      switch (true) {
        case isBlacklisted:
          throw new BusinessException(ErrorEnum.UNAUTHORIZED);
        case !user:
          throw new BusinessException(ErrorEnum.RECORD_NOT_FOUND);
        default:
          break;
      }

      return new UserResponseDto(
        user.id.value,
        user.email,
        user.username,
        user.first_name,
        user.last_name,
        user.status,
        user.created_at,
        user.updated_at,
        user.organizations,
      );
    } catch (error) {
      console.log(error);
      throw new BusinessException(ErrorEnum.TOKEN_IS_INVALID);
    }
  }

  private async generateTokens(payload: IPayload) {
    const accessToken = this.jwtPort.sign(payload, {
      secret: this.jwtConfigs.secret,
      expiresIn: this.jwtConfigs.expiresIn,
    });

    const refreshToken = this.jwtPort.sign(payload, {
      secret: this.jwtConfigs.refreshSecret,
      expiresIn: this.jwtConfigs.refreshExpiresIn,
    });

    return { accessToken, refreshToken };
  }

  private convertExpiresInToSeconds(expiresIn: string | number): number {
    if (typeof expiresIn === 'number') return expiresIn;

    const unit = expiresIn.slice(-1);
    const value = parseInt(expiresIn.slice(0, -1));

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return value;
    }
  }

  async validateUser(username: string, password: string): Promise<UserEntity> {
    const user = await this.userRepo.findByEmailOrUsername(username);
    const key = `${PASSWORD_SECURITY_THROTTLE}:${user?.id.value}`;

    switch (true) {
      case !user:
        throw new BusinessException(ErrorEnum.RECORD_NOT_FOUND);
      case user && !this.validateCredentials(user, password):
        throw new BusinessException(ErrorEnum.PASSWORD_INVALID);
      default:
        break;
    }

    const userWithOrgs = await this.userRepo.findByIdWithOrganizations(
      user!.id.value,
    );
    if (!userWithOrgs) {
      throw new BusinessException(ErrorEnum.RECORD_NOT_FOUND);
    }
    await this.cache.delete(key);
    return userWithOrgs;
  }
  hash(password: string): string {
    this.validatePassword(password);
    return this.bcryptAdapter.hashPassword(password);
  }

  match(plainPassword: string, hashedPassword: string): boolean {
    return this.bcryptAdapter.comparePassword(plainPassword, hashedPassword);
  }

  private validatePassword(password: string): boolean {
    const validate = (value: string) => {
      return typeof value === 'string' && REGEX.regValidPassword.test(value);
    };
    const isValid = validate(password);
    if (!isValid) {
      throw new BusinessException('400|Invalid password');
    }
    return true;
  }

  validateCredentials(user: UserEntity, password: string): boolean {
    if (!this.match(password, user.password.value)) {
      this.checkUserAttempts(user.id.value);
      return false;
    }
    return user.canAuthenticate();
  }

  async checkUserAttempts(uid: string): Promise<void> {
    try {
      const key = `${PASSWORD_SECURITY_THROTTLE}:${uid}`;
      const info: any = await this.cache.get(key);

      let currentPolicy = info;
      let nextPolicy = info?.nextPolicy;
      const counter = info?.value || 1;
      const policies = SETTINGS[SETTING_KEYS.PASSWORD_SECURITY].attempts;
      const policiesArray: IAttemptPolicy[] = Array.isArray(policies) ? policies : [policies];
      const sortedPolicies = policiesArray
        .slice()
        .sort((a: IAttemptPolicy, b: IAttemptPolicy) => a.failed_attempts - b.failed_attempts);
      if (!info || !info.lock_duration) {
        currentPolicy = sortedPolicies[0];
        nextPolicy = sortedPolicies[1];

        for (let i = 0; i < sortedPolicies.length; i++) {
          if (counter <= sortedPolicies[i].failed_attempts) {
            currentPolicy = sortedPolicies[i];
            nextPolicy = info?.nextPolicy || sortedPolicies[i + 1];
            break;
          }
          if (i === sortedPolicies.length - 1) {
            currentPolicy = sortedPolicies[i];
          }
        }
      }

      if (counter < currentPolicy.failed_attempts) {
        const dateVal = new Date().valueOf();
        const expired = dateVal + currentPolicy.lock_duration * 1000;
        await this.cache.set(
          key,
          {
            nextPolicy,
            value: counter + 1,
            failed_attempts: currentPolicy.failed_attempts,
            lock_duration: currentPolicy.lock_duration,
            expired: expired,
            is_last_one: counter + 1 === currentPolicy.failed_attempts,
          },
          SETTINGS[SETTING_KEYS.PASSWORD_SECURITY].cooldown_period,
        );
      }
      if (counter === currentPolicy.failed_attempts) {
        for (let i = 0; i < sortedPolicies.length; i++) {
          if (counter <= sortedPolicies[i].failed_attempts) {
            currentPolicy = sortedPolicies[i];
            nextPolicy = sortedPolicies[i + 1];
            break;
          }
          if (i === sortedPolicies.length - 1) {
            currentPolicy = sortedPolicies[i];
          }
        }
        await this.cache.set(
          key,
          {
            ...info,
            nextPolicy,
            value: counter + 1,
            is_last_one: false,
          },
          SETTINGS[SETTING_KEYS.PASSWORD_SECURITY].cooldown_period,
        );
      }
    } catch (error: any) {
      throw new BusinessException(`400|${error.message}`);
    }
  }
}
