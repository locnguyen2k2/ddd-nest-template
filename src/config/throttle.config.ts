import { ConfigType, registerAs } from '@nestjs/config';
import { env } from '@/utils/env';
import { seconds } from '@nestjs/throttler';
import Redis from 'ioredis';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { createRedisClient } from './redis.config';

export const throttlerConfigKey = 'throttler';

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
