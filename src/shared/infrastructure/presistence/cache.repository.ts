import { ConfigKeyPaths, IRedisConfig, redisConfigKey } from '@/config';
import { CACHE_PORT, CachePort } from '@/shared/application/ports/cache.port';
import { CacheKeyBuilder } from '@/shared/application/services/cache-key.builder';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export abstract class CacheRepository {
  private readonly cacheKeyConfigs: {
    keySeparator: string;
    keyPrefix: string;
  };
  protected abstract readonly boundedContext: string;
  protected abstract readonly aggregateType: string;
  protected abstract readonly ttlConfig: { [key: string]: number };

  constructor(
    redisConfig: ConfigService<ConfigKeyPaths>,
    @Inject(CACHE_PORT) private readonly cachePort: CachePort,
  ) {
    const redisConfigs = redisConfig.get<IRedisConfig>(redisConfigKey)!;
    this.cacheKeyConfigs = {
      keySeparator: redisConfigs.keySeparator,
      keyPrefix: redisConfigs.keyPrefix,
    };
  }

  protected buildKey(id: string, version?: string | number): string {
    const builder = new CacheKeyBuilder(this.cacheKeyConfigs)
      .withBoundedContext(this.boundedContext)
      .withAggregate(this.aggregateType)
      .withId(id);

    if (version !== undefined) {
      builder.withVersion(version);
    }

    return builder.build();
  }

  protected buildPatternForAggregate(): string {
    return new CacheKeyBuilder(this.cacheKeyConfigs)
      .withBoundedContext(this.boundedContext)
      .withAggregate(this.aggregateType)
      .buildPattern();
  }

  protected async getWithCache<T>(
    id: string,
    fetchFromDb: () => Promise<T | null>,
    version?: number | string,
  ): Promise<T | null> {
    const cacheKey = this.buildKey(id, version);

    const cached = await this.cachePort.get<T>(cacheKey);

    if (cached) {
      return cached;
    }

    const entity = await fetchFromDb();

    if (entity) {
      const ttl = this.ttlConfig['default'] ?? 3600;
      await this.cachePort.set(cacheKey, entity, ttl);
    }

    return entity;
  }

  protected async invalidateCache(
    id: string,
    version?: number | string,
  ): Promise<void> {
    const cacheKey = this.buildKey(id, version);
    await this.cachePort.delete(cacheKey);
  }

  protected async invalidateAllCache(): Promise<void> {
    const pattern = this.buildPatternForAggregate();
    await this.cachePort.deleteByPattern(pattern);
  }
}
