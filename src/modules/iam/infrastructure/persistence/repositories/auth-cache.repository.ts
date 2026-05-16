import { Inject, Injectable } from '@nestjs/common';
import { CacheRepository } from '@/shared/infrastructure/presistence/cache.repository';
import { ConfigService } from '@nestjs/config';
import { ConfigKeyPaths } from '@/config';
import { CACHE_PORT, CachePort } from '@/shared/application/ports/cache.port';
import {
  ICaptchaRepository,
  ISessionRepository,
  ITokenBlacklistRepository,
} from '@/modules/iam/domain/repositories/auth.repository';
import { LogExecutionTime } from '@/common/decorators/log-execution.decorator';
import { BusinessException } from '@/common/http/business-exception';
import { uuidv7 } from 'uuidv7';
import * as svgCaptchaService from 'svg-captcha';

@Injectable()
export class SessionCacheRepository
  extends CacheRepository
  implements ISessionRepository
{
  protected readonly boundedContext: string = 'iam';
  protected readonly aggregateType: string = 'session';
  protected readonly ttlConfig: { [key: string]: number } = {
    default: 86400, // 1 day
  };

  constructor(
    configService: ConfigService<ConfigKeyPaths>,
    @Inject(CACHE_PORT) private readonly port: CachePort,
  ) {
    super(configService, port);
  }

  async createSession(userId: string, ttl: number): Promise<void> {
    const key = this.buildKey(userId);
    await this.port.set(key, true, ttl);
  }

  async deleteSession(userId: string): Promise<void> {
    await this.invalidateCache(userId);
  }

  async isSessionActive(userId: string): Promise<boolean> {
    const key = this.buildKey(userId);
    return await this.port.exists(key);
  }
}

@Injectable()
export class TokenBlacklistCacheRepository
  extends CacheRepository
  implements ITokenBlacklistRepository
{
  protected readonly boundedContext: string = 'iam';
  protected readonly aggregateType: string = 'blacklist';
  protected readonly ttlConfig: { [key: string]: number } = {
    default: 3600, // 1 hour
  };

  constructor(
    configService: ConfigService<ConfigKeyPaths>,
    @Inject(CACHE_PORT) private readonly port: CachePort,
  ) {
    super(configService, port);
  }

  @LogExecutionTime()
  async blacklistToken(token: string, ttl: number): Promise<void> {
    const key = this.buildKey(token);
    await this.port.set(key, true, ttl);
  }

  @LogExecutionTime()
  async isTokenBlacklisted(token: string): Promise<boolean> {
    const key = this.buildKey(token);
    return await this.port.exists(key);
  }
}

const width = 120;
const height = 56;
const alphaNumeric =
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
@Injectable()
export class CaptchaCacheRepository
  extends CacheRepository
  implements ICaptchaRepository
{
  protected readonly boundedContext: string = 'iam';
  protected readonly aggregateType: string = 'captcha';
  protected readonly ttlConfig: { [key: string]: number } = {
    default: 60, // 1 minute
  };

  constructor(
    configService: ConfigService<ConfigKeyPaths>,
    @Inject(CACHE_PORT) private readonly port: CachePort,
  ) {
    super(configService, port);
  }

  async getCaptcha(): Promise<{ captchaId: string; captcha: string }> {
    const captchaObj = svgCaptchaService.create({
      size: 4,
      color: true,
      noise: 4,
      width: width,
      height: height,
      charPreset: alphaNumeric,
    });

    const captchaId = uuidv7();
    const captcha = `data:image/svg+xml;base64,${Buffer.from(captchaObj.data).toString('base64')}`;

    const result = { captchaId, captcha };
    const key = this.buildKey(result.captchaId);
    await this.port.set(key, captchaObj.text, this.ttlConfig.default);
    return result;
  }

  async confirmedCaptcha(data: { captchaId: string; captcha: string }) {
    const captcha = await this.port.get(this.buildKey(data.captchaId));
    const inValid = !captcha || captcha !== data.captcha;
    if (inValid) throw new BusinessException('400|Captcha invalid!');
    await this.port.delete(this.buildKey(data.captchaId));
  }
}
