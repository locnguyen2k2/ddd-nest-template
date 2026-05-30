import { ConfigType, registerAs } from '@nestjs/config';
import { env } from '@/utils/env';
import Redis from 'ioredis';

export const redisConfigKey = 'redis';

// Khởi tạo và đặt tên (registerAs) cho Redis configuration object
export const RedisConfig = registerAs(redisConfigKey, () => ({
  host: env.str('REDIS_HOST', '127.0.0.1'),
  port: env.numb('REDIS_PORT', 6379),
  password: env.str('REDIS_PASSWORD'),
  user: env.str('REDIS_USERNAME'),
  keySeparator: env.str('REDIS_KEY_SEPARATOR', ':'),
  db: env.numb('REDIS_DB'),
  timeout: env.numb('REDIS_TIMEOUT', 300),
  defaultTTL: env.numb('REDIS_DEFAULT_TTL', 300),
  keyPrefix: env.str('REDIS_KEY_PREFIX', 'nest-template'),
}));

export const createRedisClient = () => {
  return new Redis({
    password: env.str('REDIS_PASSWORD'),
    username: env.str('REDIS_USERNAME'),
    db: env.numb('REDIS_DB'),
    host: env.str('REDIS_HOST'),
    port: env.numb('REDIS_PORT'),
    reconnectOnError: (err: any) => {
      console.log({ err: err.message }, 'redis.connection.error');
      const redisClient = createRedisClient();
      const restartRedisService = async () => {
        redisClient.disconnect();
        await redisClient.connect();
      };
      if (!err.code)
        setTimeout(restartRedisService, 1000 * env.numb('REDIS_TIMEOUT'));
      return true;
    },
  });
}


export type IRedisConfig = ConfigType<typeof RedisConfig>;
