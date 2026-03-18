import { AppConfig, appConfigKey, IAppConfig } from '@/config/app.config'
import { IRedisConfig, RedisConfig, redisConfigKey } from '@/config/redis.config'
import { ISwaggerConfig, SwaggerConfig, swaggerConfigKey } from '@/config/swagger.config'
import { IThrottlerConfig, ThrottlerConfig, throttlerConfigKey } from '@/config/throttle.config'
import { DatabaseConfig, databaseConfigKey, IDatabaseConfig } from '@/config/database.config'
import { ablyConfigKey, AblyConfig, IAblyConfig } from '@/config/ably.config'

export * from '@/config/redis.config'
export * from '@/config/throttle.config'
export * from '@/config/app.config'
export * from '@/config/swagger.config'
export * from '@/config/database.config'
export * from '@/config/ably.config'

export interface AllConfigTypes {
    [redisConfigKey]: IRedisConfig
    [throttlerConfigKey]: IThrottlerConfig
    [appConfigKey]: IAppConfig
    [swaggerConfigKey]: ISwaggerConfig
    [databaseConfigKey]: IDatabaseConfig
    [ablyConfigKey]: IAblyConfig
}

export type ConfigKeyPaths = RecordNamePaths<AllConfigTypes>;

export default {
    RedisConfig,
    ThrottlerConfig,
    AppConfig,
    SwaggerConfig,
    DatabaseConfig,
    AblyConfig
}
