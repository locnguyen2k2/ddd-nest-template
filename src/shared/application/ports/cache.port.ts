export const CACHE_PORT = 'CACHE_PORT';

export interface CachePort {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  deleteByPattern(pattern: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  getTtl(key: string): Promise<number>;
  refreshTtl(key: string, ttl: number): Promise<void>;
}
