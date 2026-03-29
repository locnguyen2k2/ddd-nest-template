import { KEYS } from '@/common/constant';
import { env } from '@/utils/env';
import { ConfigType, registerAs } from '@nestjs/config';

export const ablyConfigKey = 'ably';
export const AblyConfig = registerAs(ablyConfigKey, () => ({
  key: env.str('ABLY_KEY', ''),
  id: `${KEYS.ABLY}:${env.str('NODE_ENV', 'development')}`,
}));
export type IAblyConfig = ConfigType<typeof AblyConfig>;
