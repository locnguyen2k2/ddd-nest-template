import { ConfigType, registerAs } from '@nestjs/config';
import { env } from '@/utils/env';
import { seconds } from '@nestjs/throttler';
import Redis from 'ioredis';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';

export const throttlerConfigKey = 'throttler';

function createRedisClient() {
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
        await redisClient.disconnect();
        await redisClient.connect();
      };
      if (!err.code)
        setTimeout(restartRedisService, 1000 * env.numb('REDIS_TIMEOUT'));
      return true;
    },
  });
}

export const ThrottlerConfig = registerAs(throttlerConfigKey, () => ({
  throttlers: [
    {
      limit: env.numb('THROTTLE_DEFAULT_LIMIT'),
      ttl: seconds(env.numb('THROTTLE_DEFAULT_TTL')),
    },
  ],
  errorMessage: 'Too many requests, please try again later.',
  storage: new ThrottlerStorageRedisService(createRedisClient()),
}));

export type IThrottlerConfig = ConfigType<typeof ThrottlerConfig>;
