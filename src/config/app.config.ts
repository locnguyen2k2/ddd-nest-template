import { ConfigType, registerAs } from '@nestjs/config';
import { env } from '@/utils/env';

export const appConfigKey = 'app';

export const AppConfig = registerAs(appConfigKey, () => ({
  port: env.numb('PORT', 3000),
  host: env.str('HOST', 'localhost'),
  nodeEnv: env.str('NODE_ENV', 'development'),
  basicAuthUsername: env.str('BASIC_AUTH_USERNAME'),
  basicAuthPassword: env.str('BASIC_AUTH_PASSWORD'),
}));

export type IAppConfig = ConfigType<typeof AppConfig>;
