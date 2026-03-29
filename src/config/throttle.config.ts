import { ConfigType, registerAs } from '@nestjs/config';
import { env } from '@/utils/env';

export const throttlerConfigKey = 'throttler';

// Khởi tạo và đặt tên (registerAs) cho Redis configuration object
export const ThrottlerConfig = registerAs(throttlerConfigKey, () => ({
  throttlers: [
    {
      limit: env.numb('THROTTLE_DEFAULT_LIMIT'),
      ttl: env.numb('THROTTLE_DEFAULT_TTL'),
    },
  ],
  errorMessage: 'Too many requests, please try again later.',
}));

export type IThrottlerConfig = ConfigType<typeof ThrottlerConfig>;
