import { Inject, Injectable } from '@nestjs/common';
import { CacheRepository } from '@/shared/infrastructure/presistence/cache.repository';
import { ConfigService } from '@nestjs/config';
import { ConfigKeyPaths } from '@/config';
import { CACHE_PORT, CachePort } from '@/shared/application/ports/cache.port';
import {
  ISessionRepository,
  ITokenBlacklistRepository,
} from '@/modules/iam/domain/repositories/auth.repository';

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

  async blacklistToken(token: string, ttl: number): Promise<void> {
    const key = this.buildKey(token);
    await this.port.set(key, true, ttl);
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const key = this.buildKey(token);
    return await this.port.exists(key);
  }
}
