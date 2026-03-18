import { ConfigType, registerAs } from '@nestjs/config';
import { env } from '@/utils/env';

export const redisConfigKey = 'redis';

// Khởi tạo và đặt tên (registerAs) cho Redis configuration object
export const RedisConfig = registerAs(redisConfigKey, () => ({
    host: env.str('REDIS_HOST', '127.0.0.1'),
    port: env.numb('REDIS_PORT', 6379),
    password: env.str('REDIS_PASSWORD'),
    user: env.str('REDIS_USERNAME'),
    db: env.numb('REDIS_DB'),
    timeout: env.numb('REDIS_TIMEOUT', 300)
}));

export type IRedisConfig = ConfigType<typeof RedisConfig>;
