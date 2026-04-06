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

  protected async getManyWithCache<T>(
    ids: string[],
    fetchFromDb: (missingIds: string[]) => Promise<T[]>,
    idGetter: (item: T) => string,
    version?: number | string,
  ): Promise<T[]> {
    if (ids.length === 0) {
      return [];
    }

    const keyToId = new Map<string, string>();
    const keys = ids.map((id) => {
      const key = this.buildKey(id, version);
      keyToId.set(key, id);
      return key;
    });

    const cachedResults = await this.cachePort.mget<T>(keys);

    const result: T[] = [];
    const missingIds: string[] = [];

    cachedResults.forEach((cached, index) => {
      if (cached !== null) {
        result.push(cached);
      } else {
        const key = keys[index];
        const id = keyToId.get(key);

        if (id) {
          missingIds.push(id);
        }
      }
    });

    if (missingIds.length === 0) {
      return result;
    }

    const missingEntities = await fetchFromDb(missingIds);

    if (missingEntities.length > 0) {
      const ttl = this.ttlConfig['default'] ?? 3600;
      const msetEntries: Record<string, { value: T; ttl?: number }> = {};

      missingEntities.forEach((entity) => {
        const id = idGetter(entity);
        const key = this.buildKey(id, version);
        msetEntries[key] = { value: entity, ttl };
        result.push(entity);
      });

      await this.cachePort.mset(msetEntries);
    }

    return result;
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

  protected async getWithReference<T>(
    key: string,
    idGetter: (item: T) => string,
    fetchFromDb: () => Promise<T | null>,
    version?: number | string,
  ): Promise<T | null> {
    const referenceCacheKey = this.buildKey(key, version);
    const cachedId = await this.cachePort.get<string>(referenceCacheKey);

    if (cachedId) {
      return await this.getWithCache(cachedId, () => fetchFromDb(), version);
    }

    const entity = await fetchFromDb();

    if (entity) {
      const ttl = this.ttlConfig['default'] ?? 3600;
      const id = idGetter(entity);
      await Promise.all([
        this.cachePort.set(referenceCacheKey, id, ttl),
        this.cachePort.set(this.buildKey(id, version), entity, ttl),
      ]);
    }

    return entity;
  }
}
