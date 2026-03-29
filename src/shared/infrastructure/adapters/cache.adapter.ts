import { Injectable } from '@nestjs/common';
import { CachePort } from '@/shared/application/ports/cache.port';
import { ConfigService } from '@nestjs/config';
import { ConfigKeyPaths, IRedisConfig, redisConfigKey } from '@/config';
import IORedis from 'ioredis';

export type TCacheKey = string;
export type TCacheResult<T> = Promise<T | undefined>;

@Injectable()
export class CacheAdapter implements CachePort {
  private readonly client: IORedis;
  private readonly cacheConfigs: IRedisConfig;

  constructor(configService: ConfigService<ConfigKeyPaths>) {
    this.cacheConfigs = configService.get<IRedisConfig>(
      redisConfigKey,
    ) as IRedisConfig;
    this.client = new IORedis({
      host: this.cacheConfigs.host,
      port: this.cacheConfigs.port,
      password: this.cacheConfigs.password,
      db: this.cacheConfigs.db,
      keyPrefix: this.cacheConfigs.keyPrefix,
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.client.get(key);

    if (!data) {
      return null;
    }

    try {
      return JSON.parse(data) as T;
    } catch {
      return data as unknown as T;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    const effectiveTtl = ttl ?? this.cacheConfigs.defaultTTL;

    await this.client.setex(key, effectiveTtl, serialized);
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  async deleteByPattern(pattern: string): Promise<void> {
    const keys = await this.scanKeys(pattern);

    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  async getTtl(key: string): Promise<number> {
    return await this.client.ttl(key);
  }

  async refreshTtl(key: string, ttl: number): Promise<void> {
    await this.client.expire(key, ttl);
  }

  private async scanKeys(pattern: string): Promise<string[]> {
    const keys: string[] = [];
    let cursor = '0';

    do {
      const result = await this.client.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        100,
      );
      cursor = result[0];
      keys.push(...result[1]);
    } while (cursor !== '0');

    return keys;
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}
